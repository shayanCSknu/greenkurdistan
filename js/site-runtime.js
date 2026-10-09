(() => {
  const location = window.location;
  const page = location.pathname.split('/').pop();
  const supportedPages = ['index.html','weather.html','climate.html','actions.html','toolkit.html','impact.html','reports.html'];
  const localPage = supportedPages.includes(page) ? page : 'index.html';
  const localUrl = `http://localhost:3000/${localPage}${location.search}${location.hash}`;
  // These previews only serve files. Accounts and climate history need the Node server.
  const staticPreview = location.protocol === 'file:' ||
    (['localhost','127.0.0.1'].includes(location.hostname) && location.port === '63342');
  function showHelp() {
    if (document.getElementById('server-help')) return;
    const box = document.createElement('aside');
    box.id = 'server-help'; box.className = 'section-shell server-help'; box.setAttribute('role','status');
    const text = document.createElement('p');
    text.textContent = 'Climate history and Report & Resolve need the website server. Double-click Start Website.cmd in the project folder, or run npm.cmd start, then open the complete website.';
    const link = document.createElement('a'); link.className = 'button'; link.href = localUrl;
    link.textContent = 'Open complete website →';
    box.append(text, link);
    document.querySelector('main').prepend(box);
  }
  window.GreenRuntime = { showHelp };
  if (staticPreview) showHelp();
})();
