import { firebaseConfig } from './config.js';

const { UNITS, TOPICS, questions: BANK } = window.DAY1_BANK;
const TOPIC = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/* ==========================================================================
   Utilities
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Escapes text, renders `inline code` and keeps line breaks.
const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');

function h(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

function seededRandom(seedText) {
  let h1 = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h1 = Math.imul(h1 ^ seedText.charCodeAt(i), 3432918353);
    h1 = (h1 << 13) | (h1 >>> 19);
  }
  let a = h1 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ==========================================================================
   Mascot, icons, avatars
   ========================================================================== */
function mascot(mood = 'happy') {
  const mouths = {
    happy: '<path class="m-line" d="M48 71q12 12 24 0" fill="none" stroke-width="4.5" stroke-linecap="round"/>',
    wow: '<ellipse class="m-ink" cx="60" cy="74" rx="6.5" ry="7.5"/>',
    sad: '<path class="m-line" d="M49 78q11-9 22 0" fill="none" stroke-width="4.5" stroke-linecap="round"/>',
  };
  const pins = [40, 60, 80].map((p) => `
    <rect x="${p - 4}" y="8" width="8" height="14" rx="3"/><rect x="${p - 4}" y="98" width="8" height="14" rx="3"/>
    <rect x="8" y="${p - 4}" width="14" height="8" rx="3"/><rect x="98" y="${p - 4}" width="14" height="8" rx="3"/>`).join('');
  const brows = mood === 'sad'
    ? '<path class="m-line" d="M40 46l12-4M80 46l-12-4" stroke-width="3.5" stroke-linecap="round"/>'
    : '';
  return `<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true">
    <g class="m-pins">${pins}</g>
    <rect class="m-body" x="20" y="20" width="80" height="80" rx="20"/>
    <rect class="m-face" x="29" y="29" width="62" height="62" rx="15"/>
    ${brows}
    <g class="m-eyes">
      <ellipse class="m-ink" cx="47" cy="56" rx="6" ry="8"/><ellipse class="m-ink" cx="73" cy="56" rx="6" ry="8"/>
      <circle fill="#fff" cx="49" cy="53" r="2.2"/><circle fill="#fff" cx="75" cy="53" r="2.2"/>
    </g>
    <circle class="m-cheek" cx="38" cy="69" r="5"/><circle class="m-cheek" cx="82" cy="69" r="5"/>
    ${mouths[mood] || mouths.happy}
  </svg>`;
}

function paintMascots(root = document) {
  $$('[data-mascot]', root).forEach((el) => {
    el.innerHTML = `<div class="mascot-bob" style="width:100%;height:100%">${mascot(el.dataset.mascot)}</div>`;
  });
}

const ICON_CHECK = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const FLAME = '<svg class="flame" viewBox="0 0 24 24" aria-hidden="true"><path class="flame-outer" d="M12.6 1.8c.4 2.9-1.1 4.9-2.7 6.7C8 10.6 6.2 12.6 6.2 15.6a5.8 5.8 0 0 0 11.6 0c0-2.3-1-4.3-2.4-5.9-.2 1.3-.9 2.4-2 3 .5-3.6-.1-7.3-.8-10.9z"/><path class="flame-inner" d="M12.2 12.4c-.3 1.5-1.8 2.4-1.8 4.1a2.3 2.3 0 0 0 4.6 0c0-1.5-1.1-2.6-2.8-4.1z"/></svg>';

const AVATARS = [
  { id: 'robot', emoji: '🤖', color: '#1cb0f6' },
  { id: 'fox', emoji: '🦊', color: '#ff9600' },
  { id: 'owl', emoji: '🦉', color: '#58cc02' },
  { id: 'cat', emoji: '🐱', color: '#ce82ff' },
  { id: 'panda', emoji: '🐼', color: '#8a9bb5' },
  { id: 'alien', emoji: '👾', color: '#ff4b4b' },
  { id: 'rocket', emoji: '🚀', color: '#2b70c9' },
  { id: 'penguin', emoji: '🐧', color: '#00b9a0' },
  { id: 'unicorn', emoji: '🦄', color: '#ff86d0' },
  { id: 'frog', emoji: '🐸', color: '#89e219' },
  { id: 'tiger', emoji: '🐯', color: '#ffc800' },
  { id: 'octopus', emoji: '🐙', color: '#a568cc' },
];

function renderAvatar(el, avatar) {
  el.style.removeProperty('--av');
  if (avatar.kind === 'upload' && avatar.value) {
    el.innerHTML = `<img src="${esc(avatar.value)}" alt="">`;
  } else if (avatar.kind === 'google' && user && user.photoURL) {
    el.innerHTML = `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`;
  } else {
    const preset = AVATARS.find((a) => a.id === avatar.value) || AVATARS[0];
    el.style.setProperty('--av', preset.color);
    el.textContent = preset.emoji;
  }
}

/* ==========================================================================
   State and persistence
   ========================================================================== */
const SESSION_KEY = 'day1:session';
const THEME_KEY = 'day1:theme';

const defaults = () => ({
  v: 1,
  name: 'Student',
  avatar: { kind: 'preset', value: 'robot' },
  theme: 'system',
  level: 'HL',
  sound: true,
  xp: 0,
  lessons: 0,
  answered: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  days: [],
  daily: null,
  stats: {},
  recent: [],
  custom: { topics: TOPICS.map((t) => t.id), count: 10 },
  updatedAt: 0,
});

function normalize(raw) {
  const d = defaults();
  if (!raw || typeof raw !== 'object') return d;
  const s = { ...d, ...raw };
  s.avatar = raw.avatar && raw.avatar.kind ? raw.avatar : d.avatar;
  s.custom = { ...d.custom, ...(raw.custom || {}) };
  s.stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  s.days = Array.isArray(raw.days) ? raw.days : [];
  s.recent = Array.isArray(raw.recent) ? raw.recent : [];
  return s;
}

let state = null;
let user = null;   // { uid, name, email, photoURL } when signed in with Google
let cloud = null;  // Firebase wrapper when configured

const stateKey = (id) => `day1:state:${id}`;
function loadLocal(id) {
  try {
    const raw = localStorage.getItem(stateKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function getSession() {
  try { return localStorage.getItem(SESSION_KEY); } catch (e) { return null; }
}
function setSession(v) {
  try { v ? localStorage.setItem(SESSION_KEY, v) : localStorage.removeItem(SESSION_KEY); } catch (e) { /* storage blocked */ }
}

// Saves locally right away; the cloud copy is debounced so a lesson doesn't hammer Firestore.
function save(toCloud = true) {
  if (!state) return;
  state.updatedAt = Date.now();
  try { localStorage.setItem(stateKey(user ? user.uid : 'guest'), JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  if (toCloud) scheduleCloudSave();
}

let cloudTimer = null;
function scheduleCloudSave() {
  if (!user || !cloud) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(flushCloud, 1500);
}
async function flushCloud() {
  clearTimeout(cloudTimer);
  if (!user || !cloud || !state) return;
  try {
    await cloud.save(user.uid, JSON.parse(JSON.stringify(state)));
    setSync('Synced with your Google account');
  } catch (e) {
    console.warn('Cloud save failed', e);
    setSync('Offline — progress saved on this device');
  }
}
function setSync(text) {
  $('#sync-status').textContent = text;
}

/* ==========================================================================
   Theme, sound, toast, confetti
   ========================================================================== */
const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function applyTheme() {
  const t = (state && state.theme) || 'system';
  try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* storage blocked */ }
  const dark = t === 'dark' || (t === 'system' && darkQuery && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('meta[name="theme-color"]').setAttribute('content', dark ? '#0a1530' : '#ffffff');
}
if (darkQuery) {
  darkQuery.addEventListener('change', () => {
    if (!state || state.theme === 'system') applyTheme();
  });
}

const Sound = (() => {
  let ctx = null;
  function tone(freq, start, dur, type = 'sine', gain = 0.16) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.05);
  }
  return {
    play(name) {
      if (!state || !state.sound) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) {
        return;
      }
      const t = ctx.currentTime;
      if (name === 'correct') {
        tone(783.99, t, 0.12, 'triangle');
        tone(1174.66, t + 0.09, 0.24, 'triangle');
      } else if (name === 'wrong') {
        tone(233, t, 0.16, 'square', 0.06);
        tone(175, t + 0.13, 0.28, 'square', 0.06);
      } else if (name === 'complete') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.1, 0.26, 'triangle'));
      } else if (name === 'match') {
        tone(987.77, t, 0.1, 'triangle', 0.1);
      } else if (name === 'tap') {
        tone(520, t, 0.05, 'sine', 0.05);
      }
    },
  };
})();

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function confetti() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti');
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  c.width = W * dpr;
  c.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ffc800', '#ff4b4b'];
  const parts = Array.from({ length: 150 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 160,
    y: H * 0.3,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 15 - 4,
    s: 6 + Math.random() * 7,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.35,
    c: pick(colors),
  }));
  const start = performance.now();
  const life = 2800;
  function frame(now) {
    const el = now - start;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - el / life);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      ctx.restore();
    }
    if (el < life) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  }
  requestAnimationFrame(frame);
}

function show(id) {
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}

/* ==========================================================================
   Streak
   ========================================================================== */
function isActiveToday() {
  return state.lastActive === dayKey();
}

// A streak survives until the end of the day after the last completed lesson.
function refreshStreak() {
  const today = dayKey();
  if (state.streak && state.lastActive !== today && state.lastActive !== addDays(today, -1)) {
    state.streak = 0;
  }
}

// Returns true when this is the first completed lesson today (streak extended or started).
function registerActivity() {
  const today = dayKey();
  if (state.lastActive === today) return false;
  state.streak = state.lastActive === addDays(today, -1) ? state.streak + 1 : 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.lastActive = today;
  state.days = [...state.days.filter((d) => d >= addDays(today, -62) && d !== today), today];
  return true;
}

/* ==========================================================================
   Question selection
   ========================================================================== */
const MODES = {
  quick: { count: 10, title: 'Quick practice' },
  standard: { count: 20, title: 'Standard practice' },
  marathon: { count: 50, title: 'Marathon' },
};
const DAILY_COUNT = 7;

const topicAllowed = (t) => !(t.hl && state.level === 'SL');
const allowedTopicIds = () => TOPICS.filter(topicAllowed).map((t) => t.id);

function poolFor(topicIds) {
  const set = new Set(topicIds);
  return BANK.filter((q) => set.has(q.topic) && (state.level === 'HL' || !q.hl));
}

// Spreads questions evenly across topics and prefers ones not seen recently.
function pickQuestions(topicIds, count) {
  const pool = poolFor(topicIds);
  const recent = new Set(state.recent);
  const groups = shuffle(topicIds)
    .map((t) => {
      const list = shuffle(pool.filter((q) => q.topic === t));
      return [...list.filter((q) => recent.has(q.id)), ...list.filter((q) => !recent.has(q.id))];
    })
    .filter((g) => g.length);
  const out = [];
  while (out.length < count && groups.some((g) => g.length)) {
    for (const g of groups) {
      if (g.length && out.length < count) out.push(g.pop());
    }
  }
  return shuffle(out);
}

// Same seven multiple-choice questions for everyone on a given date, one per topic.
function dailyQuestions(key = dayKey()) {
  const rnd = seededRandom('day1-daily-' + key);
  const byTopic = {};
  BANK.filter((q) => q.type === 'mc' && !q.hl).forEach((q) => {
    (byTopic[q.topic] = byTopic[q.topic] || []).push(q);
  });
  return shuffle(Object.keys(byTopic).sort(), rnd)
    .slice(0, DAILY_COUNT)
    .map((t) => byTopic[t][Math.floor(rnd() * byTopic[t].length)]);
}

/* ==========================================================================
   Home
   ========================================================================== */
function goHome() {
  renderHome();
  show('screen-home');
}

function renderTopbar() {
  renderAvatar($('#topbar-avatar'), state.avatar);
  $('#topbar-name').textContent = state.name;
  const active = isActiveToday();
  const chip = $('#streak-chip');
  chip.classList.toggle('off', !active);
  $('#streak-count').textContent = state.streak;
  chip.title = active
    ? `${state.streak}-day streak — you've practised today!`
    : state.streak
      ? `${state.streak}-day streak — complete a lesson today to keep it`
      : 'Complete any lesson to start a streak';
}

function renderHome() {
  refreshStreak();
  renderTopbar();

  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const first = state.name.split(' ')[0];
  $('#greeting').textContent = `${hello}, ${first}!`;
  $('#greeting-sub').textContent = isActiveToday()
    ? `You've practised today — ${state.streak}-day streak secured.`
    : state.streak
      ? `Complete any lesson to extend your ${state.streak}-day streak.`
      : 'Complete any lesson to start your streak.';

  renderDaily();
  renderStats();
  renderTopics();
}

let renderedDay = dayKey();
function renderDaily() {
  renderedDay = dayKey();
  const done = state.daily && state.daily.date === renderedDay;
  const card = $('#daily-card');
  card.classList.toggle('done', Boolean(done));
  $('#daily-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const btn = $('#daily-btn');
  if (done) {
    const { score, total } = state.daily;
    $('#daily-title').textContent = `Done! ${score}/${total} correct`;
    $('#daily-desc').textContent = score === total
      ? 'Perfect score! A brand-new set unlocks at midnight.'
      : 'Nice work. A brand-new set unlocks at midnight.';
    btn.textContent = 'Completed ✓';
    btn.disabled = true;
  } else {
    $('#daily-title').textContent = '7 questions. One shot a day.';
    $('#daily-desc').textContent = 'Multiple choice from across the syllabus — the same set for everyone today.';
    btn.textContent = 'Start challenge';
    btn.disabled = false;
  }
  tickDaily();
}

function tickDaily() {
  if (!state) return;
  if (dayKey() !== renderedDay && $('#screen-home').classList.contains('active')) {
    renderHome();
    return;
  }
  const done = state.daily && state.daily.date === dayKey();
  if (!done) {
    $('#daily-timer').textContent = '';
    return;
  }
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((next - now) / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  $('#daily-timer').textContent = `Next in ${hh}:${mm}:${ss}`;
}

function renderStats() {
  const acc = state.answered ? Math.round((state.correct / state.answered) * 100) + '%' : '—';
  const tiles = [
    { icon: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#ffc800" d="M13.5 2 4 13.5h6.5L9.5 22 20 9.8h-6.6z"/></svg>', value: state.xp, label: 'Total XP' },
    { icon: `<span style="color:var(--orange)">${FLAME}</span>`, value: state.bestStreak, label: 'Best streak' },
    { icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#58cc02" stroke-width="2.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>', value: acc, label: 'Accuracy' },
    { icon: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#1cb0f6" d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path fill="#1899d6" d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5A2.5 2.5 0 0 1 4 21.5z"/></svg>', value: state.lessons, label: 'Lessons' },
  ];
  $('#stats').innerHTML = tiles.map((t) => `
    <div class="stat">
      <span class="stat-icon">${t.icon}</span>
      <span><div class="stat-value">${esc(t.value)}</div><div class="stat-label">${t.label}</div></span>
    </div>`).join('');
}

function renderTopics() {
  const host = $('#topics');
  host.innerHTML = '';
  UNITS.forEach((u) => {
    const unit = h('div', 'unit');
    unit.append(h('div', 'unit-head', `<span class="unit-badge">${u.id}</span><span class="unit-name">${esc(u.name)}</span>`));
    const list = h('div', 'topic-list');
    TOPICS.filter((t) => t.unit === u.id).forEach((t) => {
      const st = state.stats[t.id] || { a: 0, c: 0 };
      const pct = st.a ? Math.round((st.c / st.a) * 100) : 0;
      const b = h('button', 'topic-row');
      b.type = 'button';
      b.disabled = !topicAllowed(t);
      b.title = !topicAllowed(t) ? 'HL only — switch to HL in settings' : st.a ? `${st.c} of ${st.a} answered correctly` : 'Not started yet';
      b.innerHTML = `
        <span class="topic-code">${t.id}</span>
        <span class="topic-info">
          <span class="topic-name">${esc(t.name)}${t.hl ? '<span class="tag-hl">HL</span>' : ''}</span>
          <span class="bar"><span style="width:${pct}%"></span></span>
        </span>
        <span class="topic-pct">${st.a ? pct + '%' : 'New'}</span>`;
      b.addEventListener('click', () => startLesson({ mode: 'topic', title: `${t.id} ${t.name}`, questions: pickQuestions([t.id], 10) }));
      list.append(b);
    });
    unit.append(list);
    host.append(unit);
  });
}

/* ==========================================================================
   Custom mode
   ========================================================================== */
const COUNT_OPTIONS = [5, 10, 15, 20, 30, 50];
let customSel = new Set();

function openCustom() {
  customSel = new Set(state.custom.topics.filter((id) => TOPIC[id]));
  renderCustom();
  show('screen-custom');
}

function makeSwitch(checked, label, onChange, { disabled = false, tag = 'label' } = {}) {
  const sw = h(tag, 'switch');
  sw.innerHTML = '<input type="checkbox"><span class="slider"></span>';
  const input = sw.querySelector('input');
  input.checked = checked;
  input.disabled = disabled;
  input.setAttribute('aria-label', label);
  input.addEventListener('change', () => onChange(input.checked));
  return sw;
}

function renderCustom() {
  const host = $('#custom-units');
  host.innerHTML = '';
  UNITS.forEach((u) => {
    const topics = TOPICS.filter((t) => t.unit === u.id);
    const usable = topics.filter(topicAllowed);
    const box = h('div', 'custom-unit');
    const head = h('div', 'custom-unit-head', `<div class="unit-head"><span class="unit-badge">${u.id}</span><span class="unit-name">${esc(u.name)}</span></div>`);
    head.append(makeSwitch(usable.length > 0 && usable.every((t) => customSel.has(t.id)), `All of ${u.name}`, (on) => {
      usable.forEach((t) => (on ? customSel.add(t.id) : customSel.delete(t.id)));
      renderCustom();
    }));
    box.append(head);
    topics.forEach((t) => {
      const locked = !topicAllowed(t);
      const n = poolFor([t.id]).length;
      const row = h('label', 'custom-topic' + (locked ? ' disabled' : ''), `
        <span class="custom-topic-text">
          <span class="custom-topic-name">${t.id} ${esc(t.name)}${t.hl ? '<span class="tag-hl">HL</span>' : ''}</span>
          <span class="custom-topic-meta">${locked ? 'HL only — switch to HL in settings' : n + ' questions'}</span>
        </span>`);
      row.append(makeSwitch(!locked && customSel.has(t.id), t.name, (on) => {
        on ? customSel.add(t.id) : customSel.delete(t.id);
        renderCustom();
      }, { disabled: locked, tag: 'span' }));
      box.append(row);
    });
    host.append(box);
  });

  const chips = $('#count-chips');
  chips.innerHTML = '';
  COUNT_OPTIONS.forEach((n) => {
    const c = h('button', 'chip' + (state.custom.count === n ? ' on' : ''), String(n));
    c.type = 'button';
    c.setAttribute('aria-pressed', state.custom.count === n);
    c.addEventListener('click', () => {
      state.custom.count = n;
      renderCustom();
    });
    chips.append(c);
  });

  const selected = [...customSel].filter((id) => topicAllowed(TOPIC[id]));
  const available = poolFor(selected).length;
  const note = $('#custom-note');
  if (!selected.length) note.textContent = 'Select at least one topic to start.';
  else if (available < state.custom.count) note.textContent = `Only ${available} questions match this selection — you'll get all of them.`;
  else note.textContent = `${available} questions available · ${selected.length} topic${selected.length === 1 ? '' : 's'} selected.`;
  $('#custom-start').disabled = !selected.length;

  state.custom.topics = [...customSel];
  save(false);
}

/* ==========================================================================
   Lesson engine
   ========================================================================== */
const KIND = {
  mc: 'Select the correct answer',
  tf: 'True or false?',
  fill: 'Complete the sentence',
  match: 'Tap the matching pairs',
  order: 'Put these in the correct order',
};
const PRAISE = ['Nice!', 'Great job!', 'Correct!', 'Excellent!', 'You got it!', 'Brilliant!', 'Spot on!'];
const XP_PER_CORRECT = 10;
const PERFECT_BONUS = 10;

let lesson = null;
let phase = 'answer'; // 'answer' | 'feedback'
let pendingStreak = false;

const current = () => lesson.items[lesson.index];

function prepare(q) {
  const item = { q };
  if (q.type === 'mc') item.options = shuffle(q.options.map((text, i) => ({ text, correct: i === 0 })));
  if (q.type === 'tf') item.options = [{ text: 'True', correct: q.answer === true }, { text: 'False', correct: q.answer === false }];
  if (q.type === 'fill') item.words = shuffle([q.answer, ...q.distractors]);
  if (q.type === 'match') {
    item.left = shuffle(q.pairs.map((p, i) => ({ text: p[0], id: i })));
    item.right = shuffle(q.pairs.map((p, i) => ({ text: p[1], id: i })));
  }
  if (q.type === 'order') {
    let bank;
    do {
      bank = shuffle(q.items.map((text, i) => ({ text, id: i })));
    } while (q.items.length > 1 && bank.every((b, i) => b.id === i));
    item.bank = bank;
  }
  return item;
}

function startLesson({ mode, title, questions }) {
  if (!questions.length) {
    toast('No questions available for that selection.');
    return;
  }
  lesson = {
    mode, title,
    items: questions.map(prepare),
    index: 0, correct: 0, xp: 0, combo: 0,
    mistakes: [],
    started: Date.now(),
  };
  show('screen-lesson');
  renderQuestion();
}

function updateProgress() {
  const total = lesson.items.length;
  const answered = lesson.index + (phase === 'feedback' ? 1 : 0);
  const pct = Math.round((answered / total) * 100);
  $('#progress-fill').style.width = `${Math.max(pct, answered ? 4 : 0)}%`;
  $('#progress').setAttribute('aria-valuenow', pct);
  $('#progress-count').textContent = `${answered}/${total}`;
  const hot = lesson.combo >= 3;
  $('#progress').classList.toggle('hot', hot);
  const tag = $('#combo-tag');
  tag.textContent = hot ? `${lesson.combo} in a row!` : '';
  tag.classList.toggle('show', hot);
}

function resetFooter() {
  const f = $('#lesson-footer');
  f.classList.remove('correct', 'wrong');
  const check = $('#check-btn');
  check.textContent = 'Check';
  check.className = 'btn btn-green';
  check.disabled = true;
  check.hidden = current().q.type === 'match';
  $('#skip-btn').hidden = false;
}

function setCanCheck(on) {
  $('#check-btn').disabled = !on;
}

function renderQuestion() {
  phase = 'answer';
  const item = current();
  const q = item.q;
  const t = TOPIC[q.topic];
  updateProgress();
  resetFooter();

  $('#q-kind').textContent = KIND[q.type];
  $('#q-topic').textContent = `${q.topic} · ${t.name}${q.hl ? ' · HL' : ''}`;
  const code = $('#q-code');
  code.hidden = !q.code;
  code.textContent = q.code || '';
  const body = $('#q-body');
  body.innerHTML = '';

  if (q.type === 'fill') renderFill(item, body);
  else $('#q-text').innerHTML = fmt(q.q);
  if (q.type === 'mc' || q.type === 'tf') renderChoices(item, body);
  if (q.type === 'match') renderMatch(item, body);
  if (q.type === 'order') renderOrder(item, body);

  const main = $('#lesson-main');
  main.classList.remove('enter');
  void main.offsetWidth; // restart the entrance animation
  main.classList.add('enter');
}

function renderChoices(item, body) {
  const wrap = h('div', 'choices' + (item.q.type === 'tf' ? ' tf' : ''));
  item.options.forEach((o, i) => {
    const b = h('button', 'choice', `<span class="key">${i + 1}</span><span class="txt">${fmt(o.text)}</span>`);
    b.type = 'button';
    b.dataset.key = i + 1;
    b.addEventListener('click', () => {
      if (phase !== 'answer') return;
      item.sel = i;
      $$('.choice', wrap).forEach((c, j) => c.classList.toggle('selected', j === i));
      Sound.play('tap');
      setCanCheck(true);
    });
    wrap.append(b);
  });
  body.append(wrap);
}

function renderFill(item, body) {
  const [before, after = ''] = item.q.q.split('___');
  const text = $('#q-text');
  text.innerHTML = `<span class="fill-sentence">${fmt(before)}<button type="button" class="blank" id="blank" aria-label="Blank"></button>${fmt(after)}</span>`;
  const blank = $('#blank');
  const bank = h('div', 'word-bank');
  item.pick = null;

  const refresh = () => {
    blank.innerHTML = item.pick == null ? '' : fmt(item.pick);
    blank.classList.toggle('filled', item.pick != null);
    $$('.word', bank).forEach((w) => w.classList.toggle('used', w.dataset.word === item.pick));
    setCanCheck(item.pick != null);
  };
  blank.addEventListener('click', () => {
    if (phase !== 'answer' || item.pick == null) return;
    item.pick = null;
    Sound.play('tap');
    refresh();
  });
  item.words.forEach((w, i) => {
    const b = h('button', 'word', fmt(w));
    b.type = 'button';
    b.dataset.word = w;
    b.dataset.key = i + 1;
    b.addEventListener('click', () => {
      if (phase !== 'answer') return;
      item.pick = w;
      Sound.play('tap');
      refresh();
    });
    bank.append(b);
  });
  body.append(bank);
}

function renderMatch(item, body) {
  item.done = new Set();
  item.misses = 0;
  item.sel = { left: null, right: null };
  const grid = h('div', 'match-grid');
  const cols = { left: h('div', 'match-col left'), right: h('div', 'match-col right') };

  const tryPair = () => {
    const { left, right } = item.sel;
    if (!left || !right) return;
    item.sel = { left: null, right: null };
    if (left.dataset.id === right.dataset.id) {
      item.done.add(left.dataset.id);
      [left, right].forEach((el) => {
        el.classList.remove('selected');
        el.classList.add('matched');
        el.disabled = true;
        setTimeout(() => el.classList.add('gone'), 450);
      });
      Sound.play('match');
      // One slip is forgiven; two or more wrong pairings count as a mistake.
      if (item.done.size === item.q.pairs.length) setTimeout(() => grade(item.misses <= 1), 380);
    } else {
      item.misses += 1;
      Sound.play('wrong');
      [left, right].forEach((el) => {
        el.classList.remove('selected');
        el.classList.add('wrong');
        setTimeout(() => el.classList.remove('wrong'), 450);
      });
    }
  };

  ['left', 'right'].forEach((side) => {
    item[side].forEach((entry) => {
      const b = h('button', 'tile', fmt(entry.text));
      b.type = 'button';
      b.dataset.id = entry.id;
      b.addEventListener('click', () => {
        if (phase !== 'answer' || b.disabled) return;
        const prev = item.sel[side];
        if (prev) prev.classList.remove('selected');
        if (prev === b) {
          item.sel[side] = null;
          return;
        }
        item.sel[side] = b;
        b.classList.add('selected');
        Sound.play('tap');
        tryPair();
      });
      cols[side].append(b);
    });
    grid.append(cols[side]);
  });
  body.append(grid);
}

function renderOrder(item, body) {
  item.placed = [];
  const line = h('div', 'order-line');
  const bank = h('div', 'order-bank');

  const refresh = () => {
    line.innerHTML = '';
    item.placed.forEach((entry, i) => {
      const t = h('button', 'tile', `<span class="order-num">${i + 1}</span><span>${fmt(entry.text)}</span>`);
      t.type = 'button';
      t.addEventListener('click', () => {
        if (phase !== 'answer') return;
        item.placed.splice(i, 1);
        Sound.play('tap');
        refresh();
      });
      line.append(t);
    });
    $$('.tile', bank).forEach((t) => t.classList.toggle('used', item.placed.some((p) => String(p.id) === t.dataset.id)));
    setCanCheck(item.placed.length === item.q.items.length);
  };

  item.bank.forEach((entry) => {
    const t = h('button', 'tile', fmt(entry.text));
    t.type = 'button';
    t.dataset.id = entry.id;
    t.addEventListener('click', () => {
      if (phase !== 'answer' || item.placed.includes(entry)) return;
      item.placed.push(entry);
      Sound.play('tap');
      refresh();
    });
    bank.append(t);
  });
  body.append(line, bank);
  refresh();
}

function evaluate(item) {
  const q = item.q;
  if (q.type === 'mc' || q.type === 'tf') return item.sel != null && item.options[item.sel].correct;
  if (q.type === 'fill') return item.pick === q.answer;
  if (q.type === 'order') return item.placed.length === q.items.length && item.placed.every((p, i) => p.id === i);
  return false;
}

function answerHTML(q) {
  if (q.type === 'mc') return fmt(q.options[0]);
  if (q.type === 'tf') return q.answer ? 'True' : 'False';
  if (q.type === 'fill') {
    const [before, after = ''] = q.q.split('___');
    return `${fmt(before)}<u>${fmt(q.answer)}</u>${fmt(after)}`;
  }
  if (q.type === 'order') return q.items.map((t, i) => `${i + 1}. ${fmt(t)}`).join('<br>');
  if (q.type === 'match') return q.pairs.map(([a, b]) => `${fmt(a)} → ${fmt(b)}`).join('<br>');
  return '';
}

function revealAnswer(item, ok) {
  const q = item.q;
  if (q.type === 'mc' || q.type === 'tf') {
    $$('#q-body .choice').forEach((c, i) => {
      c.disabled = true;
      c.classList.remove('selected');
      if (item.options[i].correct) c.classList.add('correct');
      else if (i === item.sel) c.classList.add('wrong');
      else c.classList.add('dim');
    });
  } else if (q.type === 'fill') {
    const blank = $('#blank');
    if (blank && item.pick != null) blank.classList.add(ok ? 'correct' : 'wrong');
    $$('#q-body .word').forEach((w) => (w.disabled = true));
  } else if (q.type === 'order') {
    $$('#q-body .order-line .tile').forEach((t, i) => {
      t.disabled = true;
      t.classList.add(item.placed[i] && item.placed[i].id === i ? 'correct' : 'wrong');
    });
    $$('#q-body .order-bank .tile').forEach((t) => (t.disabled = true));
  } else if (q.type === 'match') {
    $$('#q-body .tile').forEach((t) => (t.disabled = true));
  }
}

function record(q, ok) {
  const s = state.stats[q.topic] || (state.stats[q.topic] = { a: 0, c: 0 });
  s.a += 1;
  state.answered += 1;
  if (ok) {
    s.c += 1;
    state.correct += 1;
  }
  state.recent = [...state.recent.filter((id) => id !== q.id), q.id].slice(-200);
}

function grade(ok, skipped = false) {
  if (phase !== 'answer') return;
  phase = 'feedback';
  const item = current();
  const q = item.q;
  record(q, ok);
  if (ok) {
    lesson.correct += 1;
    lesson.combo += 1;
    lesson.xp += XP_PER_CORRECT;
    Sound.play('correct');
  } else {
    lesson.combo = 0;
    lesson.mistakes.push(q);
    Sound.play('wrong');
  }
  revealAnswer(item, ok);
  save(false);

  const f = $('#lesson-footer');
  f.classList.add(ok ? 'correct' : 'wrong');
  $('#fb-badge').innerHTML = ok ? ICON_CHECK : ICON_X;
  let title = ok ? pick(PRAISE) : 'Correct solution:';
  if (q.type === 'match') title = !ok ? `Matched with ${item.misses} mistakes` : item.misses ? 'Matched — just one slip!' : 'Perfect match!';
  if (skipped) title = 'Skipped — the answer is:';
  $('#fb-title').textContent = title;
  $('#fb-answer').innerHTML = answerHTML(q);
  $('#fb-explain').innerHTML = q.explain ? fmt(q.explain) : '';

  const check = $('#check-btn');
  check.hidden = false;
  check.disabled = false;
  check.textContent = ok ? 'Continue' : 'Got it';
  check.className = 'btn ' + (ok ? 'btn-green' : 'btn-red');
  $('#skip-btn').hidden = true;
  updateProgress();
  check.focus({ preventScroll: true });
}

function next() {
  lesson.index += 1;
  if (lesson.index >= lesson.items.length) finishLesson();
  else renderQuestion();
}

function finishLesson() {
  const total = lesson.items.length;
  const perfect = lesson.correct === total;
  if (perfect && total >= 5) lesson.xp += PERFECT_BONUS;
  pendingStreak = registerActivity();
  state.xp += lesson.xp;
  state.lessons += 1;
  if (lesson.mode === 'daily') state.daily = { date: dayKey(), score: lesson.correct, total };
  save();
  Sound.play('complete');
  showResults(perfect && total >= 5);
}

function showResults(bonus) {
  const total = lesson.items.length;
  const acc = Math.round((lesson.correct / total) * 100);
  const secs = Math.round((Date.now() - lesson.started) / 1000);
  const title = acc === 100 ? 'Flawless!' : acc >= 80 ? 'Amazing work!' : acc >= 60 ? 'Lesson complete!' : acc >= 40 ? 'Good effort!' : 'Keep practising!';
  $('#results-title').textContent = title;
  $('#results-sub').textContent = `${lesson.correct} of ${total} correct · ${lesson.title}${bonus ? ' · +10 perfect bonus' : ''}`;
  $('#results-mascot').innerHTML = `<div class="mascot-bob" style="width:100%;height:100%">${mascot(acc >= 50 ? 'happy' : 'wow')}</div>`;
  $('#res-xp').textContent = `+${lesson.xp}`;
  $('#res-acc').textContent = `${acc}%`;
  $('#res-time').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  const box = $('#res-mistakes');
  const n = lesson.mistakes.length;
  box.hidden = n === 0;
  box.open = false;
  $('#res-mistakes-summary').textContent = `Review ${n} mistake${n === 1 ? '' : 's'}`;
  $('#res-mistakes-list').innerHTML = lesson.mistakes.map((q) => `
    <li class="mistake">
      <div class="mistake-q">${fmt(q.q)}</div>
      <div class="mistake-a">${answerHTML(q)}</div>
      ${q.explain ? `<div class="mistake-e">${fmt(q.explain)}</div>` : ''}
    </li>`).join('');
  $('#res-review').hidden = n === 0;
  $('#res-review').textContent = `Practice mistakes (${n})`;

  show('screen-results');
  if (acc >= 60) setTimeout(confetti, 150);
}

function showStreak() {
  const n = state.streak;
  const num = $('#streak-number');
  num.textContent = Math.max(0, n - 1);
  setTimeout(() => (num.textContent = n), 450);

  const today = dayKey();
  const now = new Date();
  const monday = addDays(today, -((now.getDay() + 6) % 7));
  const days = new Set(state.days);
  $('#streak-week').innerHTML = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
    const key = addDays(monday, i);
    const on = days.has(key);
    return `<div class="week-day${on ? ' on' : ''}${key === today ? ' today' : ''}">
      <span>${label}</span>
      <span class="week-dot">${on ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</span>
    </div>`;
  }).join('');

  $('#streak-msg').textContent = n === 1
    ? 'You started a streak! Come back tomorrow to keep it going.'
    : n >= state.bestStreak && n > 2
      ? `${n} days in a row — your best streak ever!`
      : `${n} days in a row. Keep the fire burning!`;
  show('screen-streak');
}

function askQuit() {
  $('#quit-dialog').showModal();
}

/* ==========================================================================
   Settings
   ========================================================================== */
function openSettings(focusName = false) {
  fillSettings();
  $('#settings').showModal();
  if (focusName) $('#set-name').focus();
}

function fillSettings() {
  renderAvatar($('#set-avatar'), state.avatar);
  if (document.activeElement !== $('#set-name')) $('#set-name').value = state.name;

  const grid = $('#avatar-grid');
  grid.innerHTML = '';
  AVATARS.forEach((a) => {
    const b = h('button', 'avatar-opt' + (state.avatar.kind === 'preset' && state.avatar.value === a.id ? ' on' : ''), a.emoji);
    b.type = 'button';
    b.style.setProperty('--av', a.color);
    b.setAttribute('aria-label', `Avatar ${a.id}`);
    b.addEventListener('click', () => setAvatar({ kind: 'preset', value: a.id }));
    grid.append(b);
  });
  $('#set-google-photo').hidden = !(user && user.photoURL) || state.avatar.kind === 'google';

  $$('#set-theme button').forEach((b) => {
    b.classList.toggle('on', b.dataset.value === state.theme);
    b.setAttribute('aria-checked', b.dataset.value === state.theme);
  });
  $$('#set-level button').forEach((b) => {
    b.classList.toggle('on', b.dataset.value === state.level);
    b.setAttribute('aria-checked', b.dataset.value === state.level);
  });
  $('#set-sound').checked = state.sound;

  $('#set-account-text').textContent = user
    ? `Signed in as ${user.email || user.name}. Your streak and progress sync across devices.`
    : cloud
      ? 'Playing as a guest — progress is saved only in this browser. Sign in to sync it.'
      : 'Playing as a guest — progress is saved in this browser. Google sign-in is not configured for this site yet.';
  $('#set-signin').hidden = Boolean(user) || !cloud;
  $('#set-signout').hidden = !user;
  $('#set-signout').textContent = 'Sign out';
}

function setAvatar(avatar) {
  state.avatar = avatar;
  save();
  renderTopbar();
  fillSettings();
}

function resizeImage(file, size) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable image'));
    };
    img.src = url;
  });
}

/* ==========================================================================
   Sign-in flow
   ========================================================================== */
function authErrorMessage(e) {
  const code = (e && e.code) || '';
  if (code === 'auth/unauthorized-domain') return 'This website is not authorised in Firebase yet (Authentication → Settings → Authorised domains).';
  if (code === 'auth/network-request-failed') return 'Network error — check your connection and try again.';
  if (code === 'auth/operation-not-allowed') return 'Google sign-in is not enabled in the Firebase project yet.';
  return 'Sign-in failed. Please try again.';
}

async function signIn() {
  if (!cloud) {
    toast('Google sign-in is not configured for this site yet.');
    return;
  }
  try {
    await cloud.signIn();
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      console.warn(e);
      toast(authErrorMessage(e));
    }
  }
}

function showLogin() {
  state = null;
  const g = $('#google-btn');
  g.disabled = !cloud;
  $('#login-note').textContent = cloud
    ? 'Sign in to keep your streak and progress in sync across devices.'
    : 'Google sign-in is not configured yet — you can still practise as a guest.';
  paintMascots($('#screen-login'));
  show('screen-login');
}

function enterAsGuest() {
  user = null;
  setSession('guest');
  state = normalize(loadLocal('guest'));
  applyTheme();
  refreshStreak();
  save(false);
  setSync(cloud ? 'Guest mode — progress saved in this browser' : 'Progress saved in this browser');
  goHome();
}

async function enterAsUser(fb) {
  user = { uid: fb.uid, name: fb.displayName || '', email: fb.email || '', photoURL: fb.photoURL || '' };
  setSession('google');
  const local = loadLocal(user.uid);
  let remote = null;
  let online = true;
  try {
    remote = await cloud.load(user.uid);
  } catch (e) {
    online = false;
    console.warn('Could not load cloud progress', e);
  }
  let chosen = remote && local ? ((local.updatedAt || 0) > (remote.updatedAt || 0) ? local : remote) : remote || local;
  if (!chosen) {
    // First sign-in anywhere: carry over guest progress from this browser.
    chosen = normalize(loadLocal('guest'));
    if (chosen.name === 'Student' && user.name) chosen.name = user.name.slice(0, 24);
    if (user.photoURL && chosen.avatar.kind === 'preset' && chosen.avatar.value === 'robot') chosen.avatar = { kind: 'google' };
  }
  state = normalize(chosen);
  applyTheme();
  refreshStreak();
  save(online);
  setSync(online ? 'Synced with your Google account' : 'Offline — progress saved on this device');
  if ($('#settings').open) $('#settings').close();
  goHome();
}

function handleUser(fb) {
  if (fb) {
    if (!user || user.uid !== fb.uid) enterAsUser(fb);
    return;
  }
  user = null;
  if (getSession() === 'guest') {
    if (!state) enterAsGuest();
  } else {
    showLogin();
  }
}

async function signOutUser() {
  await flushCloud();
  setSession(null);
  if ($('#settings').open) $('#settings').close();
  user = null;
  state = null;
  if (cloud) await cloud.signOut();
  showLogin();
}

/* ==========================================================================
   Wiring
   ========================================================================== */
function wire() {
  paintMascots();

  $('#google-btn').addEventListener('click', signIn);
  $('#guest-btn').addEventListener('click', enterAsGuest);

  $('#brand-link').addEventListener('click', (e) => {
    e.preventDefault();
    goHome();
  });
  $('#profile-btn').addEventListener('click', () => openSettings(true));
  $('#settings-btn').addEventListener('click', () => openSettings());
  $('#streak-chip').addEventListener('click', () => toast($('#streak-chip').title));

  $('#daily-btn').addEventListener('click', () => startLesson({ mode: 'daily', title: 'Daily challenge', questions: dailyQuestions() }));
  $$('.mode-card').forEach((b) => b.addEventListener('click', () => {
    const mode = b.dataset.mode;
    if (mode === 'custom') return openCustom();
    startLesson({ mode, title: MODES[mode].title, questions: pickQuestions(allowedTopicIds(), MODES[mode].count) });
  }));

  $('#custom-back').addEventListener('click', goHome);
  $('#custom-start').addEventListener('click', () => {
    save();
    const ids = [...customSel].filter((id) => topicAllowed(TOPIC[id]));
    startLesson({ mode: 'custom', title: 'Custom practice', questions: pickQuestions(ids, state.custom.count) });
  });

  $('#check-btn').addEventListener('click', () => {
    if (phase === 'answer') grade(evaluate(current()));
    else next();
  });
  $('#skip-btn').addEventListener('click', () => grade(false, true));
  $('#quit-btn').addEventListener('click', askQuit);
  $('#quit-stay').addEventListener('click', () => $('#quit-dialog').close());
  $('#quit-leave').addEventListener('click', () => {
    $('#quit-dialog').close();
    lesson = null;
    save();
    goHome();
  });

  $('#res-continue').addEventListener('click', () => {
    if (pendingStreak) {
      pendingStreak = false;
      showStreak();
    } else {
      goHome();
    }
  });
  $('#res-review').addEventListener('click', () => {
    const qs = shuffle(lesson.mistakes);
    startLesson({ mode: 'review', title: 'Mistakes review', questions: qs });
  });
  $('#streak-continue').addEventListener('click', goHome);

  // Settings
  let nameTimer = null;
  $('#set-name').addEventListener('input', (e) => {
    state.name = e.target.value.trim().slice(0, 24) || 'Student';
    renderTopbar();
    clearTimeout(nameTimer);
    nameTimer = setTimeout(save, 600);
  });
  $('#set-upload').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      setAvatar({ kind: 'upload', value: await resizeImage(file, 160) });
    } catch (err) {
      toast("Couldn't read that image. Try a JPG or PNG.");
    }
  });
  $('#set-google-photo').addEventListener('click', () => setAvatar({ kind: 'google' }));
  $$('#set-theme button').forEach((b) => b.addEventListener('click', () => {
    state.theme = b.dataset.value;
    applyTheme();
    save();
    fillSettings();
  }));
  $$('#set-level button').forEach((b) => b.addEventListener('click', () => {
    state.level = b.dataset.value;
    save();
    fillSettings();
    renderHome();
  }));
  $('#set-sound').addEventListener('change', (e) => {
    state.sound = e.target.checked;
    save();
    Sound.play('correct');
  });
  $('#set-signin').addEventListener('click', signIn);
  $('#set-signout').addEventListener('click', signOutUser);
  $('#set-reset').addEventListener('click', () => {
    if (!confirm('Reset all XP, stats and your streak? Your name, photo and preferences are kept.')) return;
    const keep = { name: state.name, avatar: state.avatar, theme: state.theme, level: state.level, sound: state.sound };
    state = { ...defaults(), ...keep };
    save();
    $('#settings').close();
    goHome();
    toast('Progress reset.');
  });
  $('#settings').addEventListener('close', () => {
    if (!state) return;
    save();
    if ($('#screen-home').classList.contains('active')) renderHome();
  });
  // Close dialogs when clicking the backdrop.
  $$('dialog').forEach((d) => d.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  }));

  // Keyboard: 1–9 picks an option, Enter checks/continues, Esc asks to quit.
  document.addEventListener('keydown', (e) => {
    if (!$('#screen-lesson').classList.contains('active') || $('#quit-dialog').open) return;
    if (e.key === 'Enter') {
      // Prevent the focused button's own activation so one keypress never counts twice.
      e.preventDefault();
      const b = $('#check-btn');
      if (!b.hidden && !b.disabled) b.click();
    } else if (/^[1-9]$/.test(e.key) && phase === 'answer') {
      const target = $(`#q-body [data-key="${e.key}"]`);
      if (target) target.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      askQuit();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushCloud();
  });
  setInterval(tickDaily, 1000);
}

async function boot() {
  wire();
  if (firebaseConfig && firebaseConfig.apiKey) {
    try {
      const { createCloud } = await import('./firebase.js');
      cloud = createCloud(firebaseConfig);
    } catch (e) {
      console.error('Firebase failed to load; continuing in guest mode.', e);
      cloud = null;
    }
  }
  if (cloud) {
    cloud.onUser(handleUser);
    // If auth never answers (offline), don't leave the splash up forever.
    setTimeout(() => {
      if ($('#screen-splash').classList.contains('active')) {
        getSession() === 'guest' ? enterAsGuest() : showLogin();
      }
    }, 8000);
  } else if (getSession() === 'guest') {
    enterAsGuest();
  } else {
    showLogin();
  }
}

boot();
