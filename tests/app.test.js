const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('js/app.js', 'utf8');
function boot(values = {}, selectors = [], fetch = async () => { throw Error('offline'); }) {
  const nodes = new Map(selectors.map(id => [id, { value: '', textContent: '', innerHTML: '', style: {}, dataset: {}, classList: { toggle() {}, add() {}, contains() { return false; } }, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } }]));
  const storage = new Map(Object.entries(values));
  const timers = [];
  const groups = new Map();
  const context = vm.createContext({ document: { querySelector: id => nodes.get(id) || null, querySelectorAll: id => groups.get(id) || [], body: { classList: { add() {}, contains() { return false; } } } }, navigator: {}, window: { location: { protocol: 'file:' } }, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }, setTimeout: fn => timers.push(fn), fetch, Date, console });
  vm.runInContext(source, context);
  return { nodes, storage, timers, groups, run: code => vm.runInContext(code, context) };
}
test('malformed saved state never crashes and invalid impact counters become zero', () => {
  for (const value of ['null', '[]', '5', '"text"', '{broken']) boot({ greenHabitState: value, impactState: value });
  const app = boot({ impactState: '{"points":-10,"actions":"Infinity"}', greenHabitState: '{"streak":"4"}' });
  assert.equal(app.run('impactState.points'), 0);
  assert.equal(app.run('impactState.actions'), 0);
});
test('carbon calculator requires sourced factors and rejects negative or nonfinite input', () => {
  const app = boot({}, ['#car-input', '#bus-input', '#electricity-input', '#plastic-input', '#calculate-button', '#carbon-value', '#factor-car', '#factor-bus', '#factor-electricity', '#factor-plastic', '#factor-source']);
  assert.equal(app.nodes.get('#carbon-value').textContent, '--');
  for (const key of ['car','bus','electricity','plastic']) app.nodes.get('#factor-' + key).value = '0.45';
  app.nodes.get('#factor-source').value = 'Test fixture factors';
  app.nodes.get('#car-input').value = '-20';
  app.nodes.get('#electricity-input').value = 'Infinity';
  app.nodes.get('#bus-input').value = '2';
  app.run('calculateCarbon()');
  assert.equal(app.nodes.get('#carbon-value').textContent, '0.90');
  app.nodes.get('#factor-bus').value = '0.5';
  app.nodes.get('#factor-bus').listeners.input();
  assert.equal(app.nodes.get('#carbon-value').textContent, '1.00');
});
test('new missions can be completed once each', () => {
  const app = boot({}, ['#new-mission', '#mission-done']);
  for (let i = 0; i < 2; i++) {
    app.nodes.get('#new-mission').listeners.click();
    app.nodes.get('#mission-done').listeners.click();
    app.nodes.get('#mission-done').listeners.click();
  }
  assert.equal(app.run('impactState.points'), 16);
  assert.equal(app.run('impactState.actions'), 2);
});
test('the sorting game keeps a separate bin for metal', () => {
  const app = boot();
  assert.equal(app.run('gameItems.find(item => item.name === "Metal can").bin'), 'metal');
});
test('quiz advances after wrong answers and rapid clicks schedule only one advance', () => {
  const app = boot({}, ['#quiz-options', '#quiz-progress', '#quiz-question', '#quiz-feedback']);
  const button = { dataset: { answer: '0' }, addEventListener(type, fn) { this.click = fn; } };
  app.groups.set('#quiz-options button', [button]);
  app.run('renderQuiz()');
  button.click(); button.click();
  assert.equal(app.timers.length, 1);
  app.timers[0]();
  assert.equal(app.run('questionIndex'), 1);
});
test('weather and current AQI use separate endpoints and missing AQI stays unavailable', async () => {
  const urls = [];
  const app = boot({}, ['#city-select', '#temperature', '#air-score', '.status'], async url => {
    urls.push(url);
    return { ok: true, json: async () => url.includes('air-quality') ? { current: { us_aqi: null } } : { current: { temperature_2m: 24 }, daily: {} } };
  });
  await app.run('loadWeather()');
  assert.ok(urls.some(url => url.includes('air-quality-api.open-meteo.com')));
  assert.ok(urls.filter(url => url.includes('/forecast?')).every(url => !url.includes('us_aqi')));
  assert.equal(app.nodes.get('#air-score').textContent, '--');
  assert.equal(app.nodes.get('.status').textContent, 'UNAVAILABLE');
});
test('stale city responses cannot overwrite newer conditions', async () => {
  const pending = [];
  const app = boot({}, ['#city-select', '#temperature', '#weather-city'], url => url.includes('air-quality') ? Promise.resolve({ ok: true, json: async () => ({ current: { us_aqi: 30 } }) }) : new Promise(resolve => pending.push(resolve)));
  app.nodes.get('#city-select').value = 'duhok';
  const latest = app.run('loadWeather()');
  pending[1]({ ok: true, json: async () => ({ current: { temperature_2m: 18 } }) });
  await latest;
  pending[0]({ ok: true, json: async () => ({ current: { temperature_2m: 40 } }) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.nodes.get('#temperature').textContent, 18);
  assert.equal(app.nodes.get('#weather-city').textContent, 'Dihok · Duhok');
});
test('production homepage loads application exactly once', () => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  assert.equal((html.match(/<script[^>]*src=["']?(?:\.\/)?js\/app.js["']?/g) || []).length, 1);
});
