const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');

test('server help opens local server only in file and IDE previews', () => {
  for (const url of ['file:///reports.html', 'http://localhost:63342/reports.html', 'https://greenkurdistan.dev/reports.html', 'http://localhost:3000/reports.html']) {
    const dom = new JSDOM('<main></main>', { url, runScripts: 'outside-only' });
    try {
      dom.window.eval(readFileSync('js/site-runtime.js', 'utf8'));
      dom.window.GreenRuntime.showHelp();
      dom.window.GreenRuntime.showHelp();
      const preview = url.startsWith('file:') || url.includes(':63342');
      assert.equal(dom.window.document.querySelectorAll('#server-help').length, preview ? 1 : 0, url);
      if (preview) assert.equal(dom.window.document.querySelector('#server-help a').href, 'http://localhost:3000/reports.html');
    } finally { dom.window.close(); }
  }
});
