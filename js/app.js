const $ = selector => document.querySelector(selector);
const setText = (selector, value) => {
  const element = $(selector);
  if (element) element.textContent = value;
};
const readStoredValue = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

const savedTheme = readStoredValue('greenKurdistanTheme', 'light');
if (savedTheme === 'dark') document.body.classList.add('dark');

const themeToggle = $('#theme-toggle');
if (themeToggle) {
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀' : '☾';
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    writeStoredValue('greenKurdistanTheme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀' : '☾';
  });
}

const locations = window.KURDISTAN_CITIES || {
  erbil: { name: 'Hewlêr · Erbil', lat: 36.19, lon: 44.01 },
  sulaymaniyah: { name: 'Silêmanî · Sulaymaniyah', lat: 35.56, lon: 45.43 },
  duhok: { name: 'Dihok · Duhok', lat: 36.86, lon: 42.99 },
  halabja: { name: 'Helebçe · Halabja', lat: 35.18, lon: 45.98 },
  shaqlawa: { name: 'Şeqlawe · Shaqlawa', lat: 36.40, lon: 44.32 }
};
// U+FE0E asks for the plain symbol, so every forecast icon matches instead of mixing in colour emoji.
const weatherIcon = code => { const [icon, text] = baseWeatherIcon(code); return [icon + '︎', text]; };
const baseWeatherIcon = code => code === 0 ? ['☀', 'Clear skies'] : [1, 2].includes(code) ? ['⛅', 'Partly cloudy'] : code === 3 ? ['☁', 'Cloudy'] : [45, 48].includes(code) ? ['〰', 'Foggy'] : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? ['☂', 'Rainy'] : [71, 73, 75, 77, 85, 86].includes(code) ? ['❄', 'Snowy'] : [95, 96, 99].includes(code) ? ['ϟ', 'Stormy'] : ['?', 'Unknown conditions'];
const fetchLive = url => fetch(url, typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(15000) } : {});

let weatherRequest = 0;
async function loadWeather() {
  const select = $('#city-select');
  if (!select) return;
  const request = ++weatherRequest;
  const city = locations[select.value] || locations.erbil;
  ['#temperature', '#feels-like', '#humidity', '#wind', '#air-score'].forEach(selector => setText(selector, '--'));
  setText('#last-updated', 'updating now');
  setText('#weather-description', 'Loading live conditions...');
  setText('#air-message', 'Checking air quality...');
  setText('.status', 'LOADING');
  $('.status')?.classList.toggle('good', false);
  setText('#weather-icon', '…');
  $('#forecast-list')?.replaceChildren();
  if ($('#air-progress')) $('#air-progress').style.width = '0%';
  setText('#weather-city', city.name);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const airRequest = fetchLive(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi&timezone=auto`).then(response => {
      if (!response.ok) throw new Error('Air quality unavailable');
      return response.json();
    }).catch(() => null);
    const response = await fetchLive(url);
    if (!response.ok) throw new Error('Weather unavailable');
    const data = await response.json();
    const air = await airRequest;
    if (request !== weatherRequest) return;
    const current = data.current || {};
    if (!Number.isFinite(current.temperature_2m)) throw new Error('Missing weather');
    const [icon, description] = weatherIcon(current.weather_code);
    setText('#temperature', Math.round(current.temperature_2m ?? 0));
    setText('#feels-like', `${Number.isFinite(current.apparent_temperature) ? Math.round(current.apparent_temperature) : '--'}°`);
    setText('#humidity', `${Number.isFinite(current.relative_humidity_2m) ? current.relative_humidity_2m : '--'}%`);
    setText('#wind', `${Number.isFinite(current.wind_speed_10m) ? Math.round(current.wind_speed_10m) : '--'} km/h`);
    setText('#weather-icon', icon);
    setText('#weather-description', description);
    const rawAqi = air?.current?.us_aqi;
    const aqi = Number.isFinite(rawAqi) ? Math.max(0, Math.round(rawAqi)) : null;
    const category = aqi === null ? 'UNAVAILABLE' : aqi <= 50 ? 'GOOD' : aqi <= 100 ? 'MODERATE' : aqi <= 150 ? 'UNHEALTHY FOR SENSITIVE GROUPS' : aqi <= 200 ? 'UNHEALTHY' : aqi <= 300 ? 'VERY UNHEALTHY' : 'HAZARDOUS';
    setText('#air-score', aqi ?? '--');
    if ($('#air-progress')) $('#air-progress').style.width = `${aqi === null ? 0 : Math.min(aqi / 5, 100)}%`;
    setText('#air-message', aqi === null ? 'Air quality is temporarily unavailable.' : aqi <= 50 ? 'Clean air today. A beautiful day to be outside.' : aqi <= 100 ? 'Air quality is moderate. Sensitive groups should take care.' : 'Air pollution is elevated. Limit outdoor exertion.');
    setText('.status', category);
    $('.status')?.classList.toggle('good', aqi !== null && aqi <= 50);
    const forecastList = $('#forecast-list');
    if (forecastList && Array.isArray(data.daily?.time)) {
      forecastList.innerHTML = data.daily.time.map((date, i) => {
        const day = new Date(`${date}T12:00:00`).toLocaleDateString(window.I18N?.locale || 'en', { weekday: 'short' });
        const [dayIcon] = weatherIcon(data.daily.weather_code?.[i]);
        const low = data.daily.temperature_2m_min?.[i], high = data.daily.temperature_2m_max?.[i];
        return `<div class="forecast-row"><span class="day">${i === 0 ? 'Today' : day}</span><span class="forecast-icon">${dayIcon}</span><span class="condition">${Number.isFinite(low) ? Math.round(low) : '--'}° / ${Number.isFinite(high) ? Math.round(high) : '--'}°</span><span class="forecast-temp">${i === 0 ? 'Now' : ''}</span></div>`;
      }).join('');
    }
    setText('#last-updated', `updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  } catch {
    if (request !== weatherRequest) return;
    setText('#last-updated', 'update failed');
    setText('#air-message', 'Air quality is temporarily unavailable.');
    setText('.status', 'UNAVAILABLE');
    setText('#weather-description', 'Live data is temporarily unavailable');
    const forecastList = $('#forecast-list');
    if (forecastList) forecastList.innerHTML = '<p>Check your internet connection and try again.</p>';
  }
}
if ($('#city-select')) {
  $('#city-select').addEventListener('change', loadWeather);
  loadWeather();
}

const challengeButtons = document.querySelectorAll('.complete-button');
if (challengeButtons.length) {
  let challenges = [false, false, false];
  try {
    const storedChallenges = JSON.parse(readStoredValue('greenChallenges', '[false,false,false]'));
    if (Array.isArray(storedChallenges)) challenges = Array.from(challengeButtons, (_, index) => storedChallenges[index] === true);
  } catch {}
  const updateChallenges = () => {
    challengeButtons.forEach((button, index) => {
      button.classList.toggle('done', challenges[index]);
      button.innerHTML = challenges[index] ? 'Completed <span>✓</span>' : 'Mark complete <span>+</span>';
    });
    setText('#completed-count', challenges.filter(Boolean).length);
  };
  challengeButtons.forEach((button, index) => button.addEventListener('click', () => {
    challenges[index] = !challenges[index];
    writeStoredValue('greenChallenges', JSON.stringify(challenges));
    updateChallenges();
  }));
  updateChallenges();
}

const nonnegativeNumber = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const carbonKinds = ['car','bus','electricity','plastic'];
const carbonTips = {
  car: 'Driving is your biggest source. Sharing rides or taking the bus for one trip a week makes a real difference.',
  bus: 'The bus is your biggest source, and it is already one of the cleaner ways to travel. Walking short trips helps even more.',
  electricity: 'Electricity is your biggest source. Switching off air conditioning and lights in empty rooms is the quickest win.',
  plastic: 'Plastic is your biggest source. A refillable water bottle and a reusable bag cut it quickly.'
};
const calculateCarbon = () => {
  const inputs = carbonKinds.map(kind => $('#' + kind + '-input'));
  if (!inputs[0] || !inputs[1]) return;
  const factors = carbonKinds.map(kind => $('#factor-' + kind)?.value);
  if (factors.some(value => value === undefined || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) || !$('#factor-source')?.value.trim()) {
    setText('#carbon-value', '--');
    setText('#carbon-year', '');
    setText('#carbon-tip', '');
    setText('#carbon-message', 'Fill in every number to see your result.'); return;
  }
  const parts = inputs.map((input, index) => nonnegativeNumber(input?.value) * Number(factors[index]));
  const carbon = parts.reduce((sum, part) => sum + part, 0);
  setText('#carbon-value', carbon.toFixed(2));
  setText('#carbon-year', `About ${Math.round(carbon * 52)} kg per year`);
  const top = carbon > 0 ? carbonKinds[parts.indexOf(Math.max(...parts))] : null;
  carbonKinds.forEach((kind, index) => {
    const share = carbon > 0 ? Math.round(parts[index] / carbon * 100) : 0;
    setText('#share-' + kind, `${share}%`);
    const bar = $('#bar-' + kind);
    if (bar) bar.style.width = `${share}%`;
    document.querySelector?.(`.calc-bars li[data-kind="${kind}"]`)?.classList.toggle('top', kind === top);
  });
  setText('#carbon-tip', top ? carbonTips[top] : '');
  setText('#carbon-message', 'Based on published averages.');
};
if ($('#car-input')) {
  carbonKinds.forEach(kind => {
    $('#' + kind + '-input')?.addEventListener('input', calculateCarbon);
    $('#factor-' + kind)?.addEventListener('input', calculateCarbon);
  });
  $('#factor-source')?.addEventListener('input', calculateCarbon);
  $('#calculate-button')?.addEventListener('click', calculateCarbon);
  document.querySelectorAll('.step').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    if (!input) return;
    const step = Number(button.dataset.step);
    const next = Math.max(0, nonnegativeNumber(input.value) + step);
    input.value = String(Math.round(next * 10) / 10);
    calculateCarbon();
  }));
  calculateCarbon();
}

// Keep the copyright year current without editing every page each January.
document.querySelectorAll('.footer-year').forEach(element => { element.textContent = String(new Date().getFullYear()); });

const quizQuestions = [
  { question: 'Which action saves the most water at home?', answers: ['Boiling only the water you need', 'Taking shorter showers', 'Washing one item at a time'], correct: 1, explain: 'A shorter shower saves many litres every day. Boiling less water mainly saves energy, not water.' },
  { question: 'Which item belongs in a paper recycling bin?', answers: ['A clean newspaper', 'A used battery', 'A food-covered box'], correct: 0, explain: 'Clean paper can be recycled. Batteries need special collection, and food ruins paper recycling.' },
  { question: 'Which is a renewable energy source?', answers: ['Coal', 'Natural gas', 'Solar power'], correct: 2, explain: 'Solar power comes from the sun and will not run out. Coal and gas are fossil fuels.' },
  { question: 'Which light bulb uses the least electricity for the same light?', answers: ['Old-style (incandescent) bulb', 'Halogen bulb', 'LED bulb'], correct: 2, explain: 'LED bulbs use far less electricity than old-style bulbs for the same brightness, and last much longer.' },
  { question: 'Which way of getting to class usually produces the least CO₂?', answers: ['Driving alone', 'Taking the bus', 'Walking or cycling'], correct: 2, explain: 'Walking and cycling produce almost no emissions. The bus is the next best choice.' }
];
let questionIndex = 0, quizScore = 0;
function renderQuiz() {
  const quiz = quizQuestions[questionIndex];
  let answered = false;
  setText('#quiz-progress', `Question ${questionIndex + 1} of ${quizQuestions.length}`);
  setText('#quiz-question', quiz.question);
  setText('#quiz-feedback', '');
  setText('#quiz-explain', '');
  setText('#quiz-score', String(quizScore));
  if ($('#quiz-answer')) $('#quiz-answer').hidden = true;
  if ($('#quiz-play')) $('#quiz-play').hidden = false;
  if ($('#quiz-done')) $('#quiz-done').hidden = true;
  if ($('#quiz-bar')) $('#quiz-bar').style.width = `${questionIndex / quizQuestions.length * 100}%`;
  setText('#quiz-next', questionIndex === quizQuestions.length - 1 ? 'See my score' : 'Next question');
  $('#quiz-options').replaceChildren?.(...quiz.answers.map((answer, i) => {
    const option = document.createElement('button');
    option.type = 'button'; option.dataset.answer = String(i); option.textContent = answer;
    return option;
  }));
  document.querySelectorAll('#quiz-options button').forEach(button => button.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    const correct = Number(button.dataset.answer) === quiz.correct;
    if (correct) quizScore++;
    document.querySelectorAll('#quiz-options button').forEach(option => {
      option.disabled = true;
      if (Number(option.dataset.answer) === quiz.correct) option.classList?.add('is-right');
    });
    if (!correct) button.classList?.add('is-wrong');
    setText('#quiz-feedback', correct ? 'Correct!' : `Not quite — the answer is “${quiz.answers[quiz.correct]}”.`);
    setText('#quiz-explain', quiz.explain);
    setText('#quiz-score', String(quizScore));
    if ($('#quiz-bar')) $('#quiz-bar').style.width = `${(questionIndex + 1) / quizQuestions.length * 100}%`;
    if ($('#quiz-answer')) { $('#quiz-answer').hidden = false; $('#quiz-next')?.focus?.(); }
  }));
}
function nextQuestion() {
  if (questionIndex < quizQuestions.length - 1) { questionIndex++; renderQuiz(); return; }
  if ($('#quiz-play')) $('#quiz-play').hidden = true;
  if ($('#quiz-done')) $('#quiz-done').hidden = false;
  setText('#quiz-progress', 'Quiz complete');
  setText('#quiz-final', `You scored ${quizScore} out of ${quizQuestions.length}`);
  setText('#quiz-final-note', quizScore === quizQuestions.length ? 'Excellent! You really know your stuff.' : 'Good effort. Try again to get them all.');
}
$('#quiz-next')?.addEventListener('click', nextQuestion);
$('#quiz-restart')?.addEventListener('click', () => { questionIndex = 0; quizScore = 0; renderQuiz(); });
if ($('#quiz-options')) renderQuiz();

const normalizeImpactState = (state = {}) => ({
  points: Math.floor(nonnegativeNumber(state?.points)),
  reports: Math.floor(nonnegativeNumber(state?.reports)),
  actions: Math.floor(nonnegativeNumber(state?.actions)),
  badges: Math.floor(nonnegativeNumber(state?.badges))
});

const impactState = (() => {
  try {
    return normalizeImpactState(JSON.parse(readStoredValue('impactState', '{"points":0,"reports":0,"actions":0,"badges":0}')));
  } catch {
    return { points: 0, reports: 0, actions: 0, badges: 0 };
  }
})();
function saveImpact() {
  if (impactState.points >= 50) impactState.badges = Math.max(impactState.badges, 1);
  setText('#dashboard-target', impactState.points >= 100 ? 'Top level reached' : impactState.points >= 50 ? 'points to Climate Champion' : 'points to Community Guardian');
  try {
    localStorage.setItem('impactState', JSON.stringify(impactState));
  } catch {}
  if ($('#impact-score')) $('#impact-score').textContent = impactState.points;
  if ($('#dashboard-actions')) $('#dashboard-actions').textContent = impactState.actions;
  if ($('#dashboard-reports')) $('#dashboard-reports').textContent = impactState.reports;
  if ($('#dashboard-badges')) $('#dashboard-badges').textContent = impactState.badges;
  if ($('#report-total')) $('#report-total').textContent = impactState.reports;
  if ($('#score-bar-fill')) $('#score-bar-fill').style.width = `${Math.min(Math.max(impactState.points, 0), 100)}%`;
  if ($('#dashboard-level')) $('#dashboard-level').textContent = impactState.points >= 100 ? 'Climate Champion' : impactState.points >= 50 ? 'Community Guardian' : 'New explorer';
  if ($('#dashboard-next')) $('#dashboard-next').textContent = Math.max(impactState.points >= 100 ? 0 : impactState.points >= 50 ? 100 - impactState.points : 50 - impactState.points, 0);
  if ($('#leader-points')) $('#leader-points').textContent = `${impactState.points} pts`;
}
saveImpact();

const calculateWaterSavings = () => {
  const minutes = Math.min(Math.max(Number($('#water-minutes')?.value) || 0, 0), 120);
  const showers = Math.min(Math.max(Number($('#water-showers')?.value) || 0, 0), 30);
  const flow = $('#water-flow')?.value, showerMinutes = $('#water-shower-minutes')?.value;
  if (flow === undefined || showerMinutes === undefined || flow === '' || showerMinutes === '' || !Number.isFinite(Number(flow)) || !Number.isFinite(Number(showerMinutes)) || Number(flow) < 0 || Number(showerMinutes) < 0) { setText('#water-result', '--'); setText('#water-message', 'Enter your measured flow and minutes saved per shower to calculate savings.'); return; }
  const litres = Math.round(minutes * 7 * Number(flow) + showers * Number(showerMinutes) * Number(flow));
  setText('#water-result', litres);
  setText('#water-message', 'Estimated from your measured flow and time savings.');
};
if ($('#water-calculate')) {
  $('#water-calculate').addEventListener('click', () => {
    calculateWaterSavings();
  });
  $('#water-minutes')?.addEventListener('input', calculateWaterSavings);
  $('#water-showers')?.addEventListener('input', calculateWaterSavings);
  $('#water-flow')?.addEventListener('input', calculateWaterSavings);
  $('#water-shower-minutes')?.addEventListener('input', calculateWaterSavings);
  calculateWaterSavings();
}

const habitState = (() => {
  try {
    const stored = JSON.parse(readStoredValue('greenHabitState', '{}'));
    return { streak: Math.floor(nonnegativeNumber(stored?.streak)), lastDate: typeof stored?.lastDate === 'string' ? stored.lastDate : '', completed: stored?.completed === true };
  } catch {
    return { streak: 0, lastDate: '', completed: false };
  }
})();
const localDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayKey = localDateKey(new Date());
const previousDay = new Date();
previousDay.setDate(previousDay.getDate() - 1);
if (![todayKey, localDateKey(previousDay)].includes(habitState.lastDate)) habitState.streak = 0;
if (habitState.lastDate !== todayKey) habitState.completed = false;
setText('#habit-streak', habitState.streak || 0);
if ($('#habit-complete')) {
  $('#habit-complete').addEventListener('click', () => {
    const todayKey = localDateKey(new Date());
    const checkedHabits = document.querySelectorAll('[data-habit]:checked').length;
    if (!checkedHabits) {
      setText('#habit-message', 'Choose at least one habit before saving today.');
      return;
    }
    if (habitState.completed && habitState.lastDate === todayKey) {
      setText('#habit-message', 'Today is already saved. Come back tomorrow to extend your streak.');
      return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);
    habitState.streak = habitState.lastDate === yesterdayKey ? (habitState.streak || 0) + 1 : 1;
    habitState.lastDate = todayKey;
    habitState.completed = true;
    impactState.points += checkedHabits * 3;
    impactState.actions += 1;
    if (habitState.streak >= 7) impactState.badges = Math.max(impactState.badges, 2);
    writeStoredValue('greenHabitState', JSON.stringify(habitState));
    setText('#habit-streak', habitState.streak);
    setText('#habit-message', `Saved! You earned ${checkedHabits * 3} impact points.`);
    saveImpact();
  });
}

const missions = [
  ['River reset', 'Spend 15 minutes collecting litter near a stream, canal or drain.'],
  ['Shade the street', 'Find a safe place for a native tree or plant and share the idea with a neighbour.'],
  ['Clean-air trip', 'Replace one car journey this week with walking, cycling or a shared ride.'],
  ['Repair, do not replace', 'Fix, reuse or donate one item that might otherwise become waste.'],
  ['Water watch', 'Check one tap or pipe at home for leaks and report any public leak you notice.']
];
let currentMission = -1;
let missionCompleted = false;
if ($('#new-mission')) {
  $('#new-mission').addEventListener('click', () => {
    missionCompleted = false;
    currentMission = (currentMission + 1) % missions.length;
    const [title, description] = missions[currentMission];
    const missionResult = $('#mission-result');
    if (missionResult) missionResult.innerHTML = `<strong>${title}</strong><p>${description}</p>`;
    setText('#mission-message', '');
  });
}
if ($('#mission-done')) {
  $('#mission-done').addEventListener('click', () => {
    if (currentMission < 0) {
      setText('#mission-message', 'Choose a mission first.');
      return;
    }
    if (missionCompleted) {
      setText('#mission-message', 'This mission is already complete. Choose another one.');
      return;
    }
    impactState.points += 8;
    impactState.actions += 1;
    missionCompleted = true;
    setText('#mission-message', 'Mission complete — thank you for taking action.');
    saveImpact();
  });
}

if ($('#compare-slider')) $('#compare-slider').addEventListener('input', event => {
  const value = event.target.value;
  $('.scene-dirty').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  $('.slider-handle').style.left = `${value}%`;
  $('#compare-label').textContent = value < 50 ? 'A greener city' : value > 50 ? 'A city needing care' : 'Compare both futures';
});

const gameItems = [
  { icon: '🧴', name: 'Plastic bottle', bin: 'plastic' },
  { icon: '📰', name: 'Newspaper', bin: 'paper' },
  { icon: '🔋', name: 'Old battery', bin: 'special' },
  { icon: '🥫', name: 'Metal can', bin: 'metal' },
  { icon: '📦', name: 'Cardboard box', bin: 'paper' }
];
let gameIndex = 0;
if ($('#game-item')) document.querySelectorAll('.bin-options button').forEach(button => button.addEventListener('click', () => {
  const item = gameItems[gameIndex];
  if (!item) return;
  if (button.dataset.bin === item.bin) {
    const isLastItem = gameIndex === gameItems.length - 1;
    impactState.points += 5;
    if (isLastItem) {
      impactState.actions += 1;
      impactState.badges = Math.max(impactState.badges, 1);
      $('#game-message').textContent = 'Perfect round! You are a recycling champion.';
      $('#game-score').textContent = `${gameItems.length} / ${gameItems.length}`;
      gameIndex = 0;
    } else {
      gameIndex += 1;
      $('#game-message').textContent = 'Correct! Next item...';
      $('#game-score').textContent = `${gameIndex} / ${gameItems.length}`;
    }
    const nextItem = gameItems[gameIndex];
    if (nextItem && $('#game-item')) $('#game-item').innerHTML = `${nextItem.icon}<strong>${nextItem.name}</strong>`;
    saveImpact();
  } else {
    $('#game-message').textContent = 'Try again — think about the material.';
  }
}));
// Home page: live conditions for Erbil in the hero card, plus the five-day strip.
async function loadHomeWeather() {
  if (!$('#home-temp')) return;
  const city = locations.erbil;
  try {
    const airRequest = fetchLive(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi&timezone=auto`).then(response => response.ok ? response.json() : null).catch(() => null);
    const response = await fetchLive(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);
    if (!response.ok) throw new Error('Weather unavailable');
    const data = await response.json(), air = await airRequest, current = data.current || {};
    if (!Number.isFinite(current.temperature_2m)) throw new Error('Missing weather');
    const [icon, description] = weatherIcon(current.weather_code);
    const whole = (value, unit) => Number.isFinite(value) ? `${Math.round(value)}${unit}` : '--';
    setText('#home-temp', Math.round(current.temperature_2m));
    setText('#home-icon', icon);
    setText('#home-desc', description);
    setText('#home-feels', whole(current.apparent_temperature, '°'));
    setText('#home-humidity', whole(current.relative_humidity_2m, '%'));
    setText('#home-wind', whole(current.wind_speed_10m, ' km/h'));
    const aqi = Number.isFinite(air?.current?.us_aqi) ? Math.max(0, Math.round(air.current.us_aqi)) : null;
    setText('#home-aqi', aqi ?? '--');
    setText('#home-aqi-label', aqi === null ? '' : aqi <= 50 ? 'GOOD' : aqi <= 100 ? 'MODERATE' : 'UNHEALTHY');
    const strip = $('#home-forecast');
    if (strip && Array.isArray(data.daily?.time)) {
      strip.replaceChildren(...data.daily.time.map((date, i) => {
        const cell = document.createElement('span');
        const part = (tag, value) => { const node = document.createElement(tag); node.textContent = value; return node; };
        const day = i === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString(window.I18N?.locale || 'en', { weekday: 'short' });
        cell.append(part('span', day), part('b', whole(data.daily.temperature_2m_max?.[i], '°')), part('span', whole(data.daily.temperature_2m_min?.[i], '°')));
        return cell;
      }));
    }
  } catch {
    setText('#home-desc', 'Live data is temporarily unavailable');
  }
}
// Home page: draw the real global temperature series when the climate API is reachable; the sketch stays otherwise.
async function loadHomeTrend() {
  const line = $('#home-spark-line');
  if (!line || !window.GreenRuntime?.apiUrl) return;
  try {
    const response = await fetchLive(window.GreenRuntime.apiUrl(`/api/climate/history?dataset=global&start=1900&end=${new Date().getUTCFullYear()}`));
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
    const rows = ((await response.json()).rows || []).filter(row => typeof row.anomaly === 'number');
    if (rows.length < 10) return;
    const values = rows.map(row => row.anomaly), min = Math.min(...values), max = Math.max(...values);
    line.setAttribute('points', rows.map((row, i) => `${(i / (rows.length - 1) * 300).toFixed(1)},${(90 - (row.anomaly - min) / (max - min || 1) * 84).toFixed(1)}`).join(' '));
    setText('#home-spark-start', rows[0].time);
    setText('#home-spark-end', rows.at(-1).time);
  } catch { /* keep the static sketch */ }
}
loadHomeWeather();
loadHomeTrend();

window.addEventListener?.('site:language', loadHomeWeather);

// Smooth scroll reveals: content below the fold fades up as it comes into view.
// Skipped when the visitor prefers reduced motion or the browser lacks IntersectionObserver.
(() => {
  if (typeof IntersectionObserver === 'undefined' || !document.querySelectorAll) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const selectors = ['.home-facts-inner > div', '.home-paths-head', '.home-path', '.home-report-card', '.home-steps li', '.home-more-section h2', '.home-more', '.section-heading', '.glass-card', '.rr-journey article', '.rr-stat', '.action-grid > *', '.history-coverage > *', '.site-footer > *'];
  const seen = new Set();
  const items = [];
  for (const selector of selectors) document.querySelectorAll(selector).forEach(element => {
    if (seen.has(element) || element.closest('.reveal') || element.closest('.home-hero')) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    seen.add(element); items.push(element);
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(element => {
    const siblings = [...(element.parentElement?.children || [])].filter(node => seen.has(node));
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 4) * 0.08}s`);
    element.classList.add('reveal');
    observer.observe(element);
  });
})();
