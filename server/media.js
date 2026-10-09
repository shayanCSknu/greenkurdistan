const MAX_VIDEO=15*1024*1024;
function attachments(values,photo,fail){
  if(values===undefined)return [];
  if(!Array.isArray(values)||values.length>3)fail(400,'invalid_attachments');
  return values.map(value=>{
    if(value?.mime?.startsWith('image/'))return photo(value);
    if(!value||!['video/mp4','video/webm'].includes(value.mime)||typeof value.data!=='string'||value.data.length>Math.ceil(MAX_VIDEO/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(value.data))fail(400,'invalid_attachments');
    const bytes=Buffer.from(value.data,'base64');
    if(bytes.length<16||bytes.length>MAX_VIDEO||bytes.toString('base64')!==value.data)fail(400,'invalid_attachments');
    const mp4=bytes.toString('ascii',4,8)==='ftyp'&&bytes.readUInt32BE(0)>=16&&bytes.readUInt32BE(0)<=bytes.length&&['isom','iso2','iso5','iso6','mp41','mp42','avc1','M4V '].includes(bytes.toString('ascii',8,12));
    const webm=bytes.subarray(0,4).equals(Buffer.from('1a45dfa3','hex'))&&bytes.subarray(4,256).includes(Buffer.from('webm'));
    if(!(value.mime==='video/mp4'?mp4:webm))fail(400,'invalid_attachments');
    return {mime:value.mime,bytes};
  });
}
function sendMedia(req,res,data,fail){
  const bytes=Buffer.from(data.bytes),headers={'Content-Type':data.mime,'Cache-Control':'no-store','Content-Disposition':'inline','Accept-Ranges':'bytes'};
  if(req.headers.range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    let start,end;
    if(match&&(match[1]||match[2])){start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2]));end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||start>=bytes.length){res.writeHead(416,{...headers,'Content-Range':`bytes */${bytes.length}`});return res.end();}
    res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});return res.end(bytes.subarray(start,end+1));
  }
  res.writeHead(200,{...headers,'Content-Length':bytes.length});return res.end(bytes);
}
module.exports={attachments,sendMedia};
