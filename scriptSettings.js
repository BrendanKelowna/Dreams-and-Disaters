const nameInput = document.getElementById('nameInput');
const eventsInput = document.getElementById('eventsInput');
const rulesInput = document.getElementById('rulesInput');
const addNameBtn = document.getElementById('addNameBtn');
const loadNamesBtn = document.getElementById('loadNamesBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const nameList = document.getElementById('nameList');

// General settings inputs
const rollIrlInput = document.getElementById('roll-irl');
const eventsAmountInput = document.getElementById('events-amount');

window.DreamsAndDisasters = window.DreamsAndDisasters || {};
window.DreamsAndDisasters.names = window.DreamsAndDisasters.names || [];
const players = window.DreamsAndDisasters.names;

/* Rendering functions */

function renderGeneralSettings() {
    rollIrlInput.checked = settings['roll-irl'];
    eventsAmountInput.value = settings['events-amount'] || 1;
}

function renderPlayers() {
    nameList.innerHTML = '';
    if (!players.length) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'No names saved yet.';
        nameList.appendChild(emptyItem);
        return;
    }

    players.forEach((person, index) => {
        const item = document.createElement('li');
        item.className = 'name-item settings-list-item';

        const details = document.createElement('div');
        details.className = 'stack g1';

        const uuidLabel = document.createElement('span');
        uuidLabel.className = 'uuid hidden';
        uuidLabel.textContent = person.id;
        details.append(uuidLabel);

        const nameLabel = document.createElement('strong');
        nameLabel.textContent = person.name;

        details.append(nameLabel);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            players.splice(index, 1);
            writeNames();
            renderSettings();
        });

        item.append(details, removeBtn);
        nameList.appendChild(item);
    });

}

function renderRules() {
    const rulesList = document.getElementById('rulesList');
    rulesList.innerHTML = '';
    if (!rules.length) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'No rules saved yet.';
        rulesList.appendChild(emptyItem);
        return;
    }

    rules.forEach((ruleObj, index) => {
        const item = document.createElement('li');
        item.className = 'rule-item settings-list-item';

        const details = document.createElement('div');
        details.className = 'stack g1';

        const uuidLabel = document.createElement('span');
        uuidLabel.className = 'uuid hidden';
        uuidLabel.textContent = ruleObj.id;
        details.append(uuidLabel);

        const ruleLabel = document.createElement('strong');
        ruleLabel.textContent = ruleObj.rule;

        details.append(ruleLabel);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            rules.splice(index, 1);
            writeRules();
            renderSettings();
        });

        item.append(details, removeBtn);
        rulesList.appendChild(item);
    });
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    if (!events.length) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'No events saved yet.';
        eventsList.appendChild(emptyItem);
        return;
    }

    events.forEach((eventObj, index) => {
        const item = document.createElement('li');
        item.className = 'event-item settings-list-item';

        const details = document.createElement('div');
        details.className = 'stack g1';

        const uuidLabel = document.createElement('span');
        uuidLabel.className = 'uuid hidden';
        uuidLabel.textContent = eventObj.id;
        details.append(uuidLabel);

        const eventLabel = document.createElement('strong');
        eventLabel.textContent = eventObj.event;

        details.append(eventLabel);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            events.splice(index, 1);
            writeEvents();
            renderSettings();
        });

        item.append(details, removeBtn);
        eventsList.appendChild(item);
    });
}

function renderSettings() {
    renderPlayers();
    renderRules();
    renderEvents();
}

/* CRUD functions for settings */
function addName() {
    const name = nameInput.value.trim();
    const uuid = crypto.randomUUID();

    while (rules.some((r) => r.id === uuid)) {
        uuid = crypto.randomUUID();
    }

    if (!name) {
        nameInput.focus();
        return;
    }

    players.push({ name, id: uuid });
    writeNames();
    renderSettings();
    nameInput.value = '';
    nameInput.focus();
}

function addRule() {
    const rule = rulesInput.value.trim();
    const uuid = crypto.randomUUID();

    while (rules.some((r) => r.id === uuid)) {
        uuid = crypto.randomUUID();
    }

    if (!rule) {
        rulesInput.focus();
        return;
    }
    rules.push({ id: uuid, rule });
    writeRules();
    renderSettings();
    rulesInput.value = '';
    rulesInput.focus();
}

function addEvent() {
    const event = eventsInput.value.trim();
    const uuid = crypto.randomUUID();

    while (events.some((e) => e.id === uuid)) {
        uuid = crypto.randomUUID();
    }

    if (!event) {
        eventsInput.focus();
        return;
    }
    events.push({ id: uuid, event });
    writeEvents();
    renderSettings();
    eventsInput.value = '';
    eventsInput.focus();
}

/* Storage functions */
function loadNames() {
    readNames();
    renderSettings();
}

function loadAllSettings() {
    readNames();
    readSettings();
    readRules();
    readEvents();
    renderSettings();
    renderGeneralSettings();
}

function loadDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        /* Todo: Load default rules and events etc. */
        renderSettings();
        renderGeneralSettings();
    }
}

function exportSettings() {
    if (!players.length) {
        alert('There are no names to export.');
        return;
    }
    /* Todo export */
}

function importNames(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();

    /* Todo import */
    writeNames();
    renderSettings();
}

/* Handlers */
function setupGeneralSettingsListeners() {
    rollIrlInput.addEventListener('change', () => {
        settings['roll-irl'] = rollIrlInput.checked;
        writeSettings();
    });

    eventsAmountInput.addEventListener('change', () => {
        settings['events-amount'] = parseInt(eventsAmountInput.value) || 1;
        writeSettings();
    });
}

addNameBtn.addEventListener('click', addName);
loadNamesBtn.addEventListener('click', loadNames);
exportBtn.addEventListener('click', exportSettings);
importBtn.addEventListener('click', () => importInput.click());

const defaultsBtn = document.getElementById('defaults');
defaultsBtn.addEventListener('click', loadDefaults);

nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addName();
    }
});

rulesInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addRule();
    }
});

eventsInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addEvent();
    }
});

/* Initialization */
setupGeneralSettingsListeners();
loadAllSettings();
