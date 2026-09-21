const STORAGE_KEY = 'dreamsAndDisastersNames';
const STORAGE_KEY_SETTINGS = 'dreamsAndDisastersSettings';
const STORAGE_KEY_RULES = 'dreamsAndDisastersRules';
const STORAGE_KEY_EVENTS = 'dreamsAndDisastersEvents';

window.DreamsAndDisasters = window.DreamsAndDisasters || {};
window.DreamsAndDisasters.names = window.DreamsAndDisasters.names || [];
window.DreamsAndDisasters.settings = window.DreamsAndDisasters.settings || {};
window.DreamsAndDisasters.rules = window.DreamsAndDisasters.rules || [];
window.DreamsAndDisasters.events = window.DreamsAndDisasters.events || [];

const names = window.DreamsAndDisasters.names;
const settings = window.DreamsAndDisasters.settings;
const rules = window.DreamsAndDisasters.rules;
const events = window.DreamsAndDisasters.events;

function loadNav() {
  fetch("nav.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("nav").innerHTML = data;
    });
};
loadNav();

function normalizeNameEntry(entry) {
  if (typeof entry === 'string') {
    return {
      name: entry.trim(),
      events: '',
    };
  }

  return {
    name: typeof entry?.name === 'string' ? entry.name.trim() : '',
    events: typeof entry?.events === 'string' ? entry.events.trim() : '',
  };
}

function readNames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const parsed = Array.isArray(saved) ? saved.map(normalizeNameEntry) : [];
    names.length = 0;
    parsed.filter((person) => person.name).forEach((person) => names.push(person));
  } catch (error) {
    console.error('Failed to read names from localStorage:', error);
    names.length = 0;
  }
}

function writeNames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '{}');
    Object.assign(settings, {
      'roll-irl': saved['roll-irl'] || false,
      'players-choosen': saved['players-choosen'] || 1,
      'events-amount': saved['events-amount'] || 1,
    });
  } catch (error) {
    console.error('Failed to read settings from localStorage:', error);
    settings['roll-irl'] = false;
    settings['players-choosen'] = 1;
    settings['events-amount'] = 1;
  }
}

function writeSettings() {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

function readRules() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_RULES) || '[]');
    const parsed = Array.isArray(saved) ? saved.filter((r) => typeof r === 'string' && r.trim()) : [];
    rules.length = 0;
    parsed.forEach((rule) => rules.push(rule));
  } catch (error) {
    console.error('Failed to read rules from localStorage:', error);
    rules.length = 0;
  }
}

function writeRules() {
  localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
}

function readEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_EVENTS) || '[]');
    const parsed = Array.isArray(saved) ? saved.filter((d) => typeof d === 'string' && d.trim()) : [];
    events.length = 0;
    parsed.forEach((event) => events.push(event));
  } catch (error) {
    console.error('Failed to read events from localStorage:', error);
    events.length = 0;
  }
}

function writeEvents() {
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
}
