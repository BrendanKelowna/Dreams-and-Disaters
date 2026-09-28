const STORAGE_KEYS = {
  settings: 'dreamsAndDisastersSettings',
  players: 'dreamsAndDisastersPlayers',
  rules: 'dreamsAndDisastersRules',
  events: 'dreamsAndDisastersEvents',
  histories: 'dreamsAndDisastersHistories',
};

const FALLBACK_DEFAULTS = {
  settings: { eventsPerRound: 2 },
  players: [],
  rules: [],
  events: [],
};

const app = window.DreamsAndDisasters || {};
app.settings = app.settings || {};
app.players = Array.isArray(app.players) ? app.players : [];
app.rules = Array.isArray(app.rules) ? app.rules : [];
app.events = Array.isArray(app.events) ? app.events : [];
app.histories = Array.isArray(app.histories) ? app.histories : [];
window.DreamsAndDisasters = app;

function loadNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  fetch('nav.html')
    .then((response) => {
      if (!response.ok) throw new Error(`Navigation request failed: ${response.status}`);
      return response.text();
    })
    .then((html) => { nav.innerHTML = html; })
    .catch((error) => console.error('Failed to load navigation:', error));
}

loadNav();

function readStoredJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage:`, error);
    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
}

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSettings(value, defaultSettings = {}) {
  const eventAmount = Number(value?.eventsAmount ?? value?.eventsPerRound ??
    defaultSettings.eventsAmount ?? defaultSettings.eventsPerRound ?? 2);
  return {
    eventsAmount: Number.isFinite(eventAmount) ? Math.max(1, Math.floor(eventAmount)) : 2,
  };
}

function normalizePlayer(player) {
  if (typeof player === 'string') player = { name: player };
  if (!player || typeof player !== 'object') return null;
  const name = String(player.name ?? player.value ?? '').trim();
  return name ? { id: String(player.id || createId()), name } : null;
}

function normalizeRule(rule) {
  if (typeof rule === 'string') rule = { value: rule };
  if (!rule || typeof rule !== 'object') return null;
  const value = String(rule.value ?? rule.name ?? '').trim();
  return value ? { id: String(rule.id || createId()), value } : null;
}

function normalizeEvent(event) {
  if (typeof event === 'string') event = { title: event };
  if (!event || typeof event !== 'object') return null;
  const title = String(event.title ?? event.name ?? event.value ?? '').trim();
  if (!title) return null;
  return {
    id: String(event.id || createId()),
    title,
    description: String(event.description ?? event.discription ?? ''),
  };
}

function normalizeHistory(history) {
  if (!history || typeof history !== 'object' || !Array.isArray(history.value)) return null;
  const value = history.value
    .filter((result) => result && typeof result === 'object')
    .map((result) => ({
      player: String(result.player ?? ''),
      event: String(result.event ?? ''),
      roll: Math.min(12, Math.max(2, Math.floor(Number(result.roll) || 2))),
    }));
  return { id: String(history.id || createId()), value };
}

const normalizers = {
  players: normalizePlayer,
  rules: normalizeRule,
  events: normalizeEvent,
  histories: normalizeHistory,
};

function replaceCollection(name, values) {
  if (!normalizers[name] || !Array.isArray(values)) return false;
  const normalized = values.map(normalizers[name]).filter(Boolean);
  app[name].splice(0, app[name].length, ...normalized);
  return writeStoredJson(STORAGE_KEYS[name], app[name]);
}

app.persistCollection = (name) => {
  if (!STORAGE_KEYS[name] || name === 'settings') return false;
  return writeStoredJson(STORAGE_KEYS[name], app[name]);
};

app.replaceCollection = replaceCollection;

app.updateSettings = (values) => {
  Object.assign(app.settings, normalizeSettings({ ...app.settings, ...values }));
  return writeStoredJson(STORAGE_KEYS.settings, app.settings);
};

app.resetConfiguration = () => {
  const defaults = app.defaults || FALLBACK_DEFAULTS;
  Object.assign(app.settings, normalizeSettings({}, defaults.settings));
  writeStoredJson(STORAGE_KEYS.settings, app.settings);
  replaceCollection('players', defaults.players || []);
  replaceCollection('rules', defaults.rules || []);
  replaceCollection('events', defaults.events || []);
};

app.ready = (async () => {
  let defaults = FALLBACK_DEFAULTS;
  try {
    const response = await fetch('defaultSettings.json');
    if (!response.ok) throw new Error(`Defaults request failed: ${response.status}`);
    defaults = await response.json();
  } catch (error) {
    console.warn('Using built-in defaults:', error);
  }

  app.defaults = {
    settings: normalizeSettings({}, defaults.settings),
    players: (Array.isArray(defaults.players) ? defaults.players : []).map(normalizePlayer).filter(Boolean),
    rules: (Array.isArray(defaults.rules) ? defaults.rules : []).map(normalizeRule).filter(Boolean),
    events: (Array.isArray(defaults.events) ? defaults.events : []).map(normalizeEvent).filter(Boolean),
  };

  Object.assign(app.settings, normalizeSettings(
    readStoredJson(STORAGE_KEYS.settings, app.defaults.settings), app.defaults.settings,
  ));

  for (const name of ['players', 'rules', 'events', 'histories']) {
    const fallback = name === 'histories' ? [] : app.defaults[name];
    const saved = readStoredJson(STORAGE_KEYS[name], fallback);
    const values = Array.isArray(saved) ? saved : fallback;
    app[name].splice(0, app[name].length, ...values.map(normalizers[name]).filter(Boolean));
  }

  writeStoredJson(STORAGE_KEYS.settings, app.settings);
  for (const name of ['players', 'rules', 'events', 'histories']) {
    writeStoredJson(STORAGE_KEYS[name], app[name]);
  }
  return app;
})();