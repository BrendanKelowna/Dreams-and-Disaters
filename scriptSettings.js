
(() => {
  const app = window.DreamsAndDisasters;

  const saveSettingsBtn = document.getElementById('save-settings');
  const openSettingsBtn = document.getElementById('open-settings');
  const resetSettingsBtn = document.getElementById('reset-settings');
  const eventsAmountInput = document.getElementById('events-amount');

  function makeId() {
    return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function downloadJson(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function syncEventsAmountLimit() {
    const playerCount = app.players.length;
    eventsAmountInput.max = String(playerCount);
    eventsAmountInput.disabled = playerCount === 0;

    if (playerCount > 0 && Number(app.settings.eventsAmount) > playerCount) {
      app.updateSettings({ eventsAmount: playerCount });
    }
    eventsAmountInput.value = app.settings.eventsAmount;
  }

  function setupCollection({
    name, input, uuidInput, addButton, clearButton, deleteButton, list, field, label,
    emptyText, descriptionInput = null,
  }) {
    function setAddButtonIcon(isEditing) {
      const icon = document.createElement('i');
      icon.className = `fa-solid ${isEditing ? 'fa-floppy-disk' : 'fa-plus'}`;
      icon.setAttribute('aria-hidden', 'true');
      addButton.replaceChildren(icon);
      addButton.setAttribute('aria-label', `${isEditing ? 'Save' : 'Add'} ${label.toLowerCase()}`);
      addButton.title = `${isEditing ? 'Save' : 'Add'} ${label.toLowerCase()}`;
    }

    function updateActionState() {
      const uuid = uuidInput.value.trim();
      const selectedEntry = app[name].some((entry) => entry.id === uuid);
      const hasValues = Boolean(input.value.trim() || descriptionInput?.value.trim() || uuid);

      setAddButtonIcon(Boolean(uuid));
      deleteButton.disabled = !selectedEntry;
      clearButton.disabled = !hasValues;
      clearButton.setAttribute('aria-label', `Clear ${label.toLowerCase()} inputs`);
      clearButton.title = `Clear ${label.toLowerCase()} inputs`;
      deleteButton.setAttribute('aria-label', `Delete selected ${label.toLowerCase()}`);
      deleteButton.title = `Delete selected ${label.toLowerCase()}`;
    }

    function resetEditor() {
      input.value = '';
      uuidInput.value = '';
      if (descriptionInput) descriptionInput.value = '';
      updateActionState();
    }

    function render() {
      list.replaceChildren();
      const entries = app[name];

      if (!entries.length) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = emptyText;
        list.appendChild(empty);
        return;
      }

      entries.forEach((entry) => {
        const item = document.createElement('li');
        item.className = 'settings-list-item';
        const text = document.createElement('span');
        text.textContent = entry[field];
        if (descriptionInput && entry.description) {
          const description = document.createElement('small');
          description.className = 'text-light';
          description.textContent = entry.description;
          const content = document.createElement('div');
          content.className = 'stack';
          content.append(text, description);
          item.appendChild(content);
        } else {
          item.appendChild(text);
        }

        const actions = document.createElement('div');
        actions.className = 'nav-actions';
        const editButton = document.createElement('button');
        const editIcon = document.createElement('i');
        editIcon.classList = "fa-solid fa-pen-to-square";
        editButton.appendChild(editIcon);
        editButton.type = 'button';
        editButton.setAttribute('aria-label', `Edit ${label.toLowerCase()}`);
        editButton.title = `Edit ${label.toLowerCase()}`;
        editButton.addEventListener('click', () => {
          uuidInput.value = entry.id;
          input.value = entry[field];
          if (descriptionInput) descriptionInput.value = entry.description || '';
          updateActionState();
          input.focus();
        });

        actions.appendChild(editButton);
        item.appendChild(actions);
        list.appendChild(item);
      });
    }

    document.addEventListener('settings-data-updated', () => {
      resetEditor();
      render();
    });
    function saveEntry() {
      const value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }

      const uuid = uuidInput.value.trim();
      if (uuid) {
        const entry = app[name].find((candidate) => candidate.id === uuid);
        if (!entry) return;
        entry[field] = value;
        if (descriptionInput) entry.description = descriptionInput.value.trim();
      } else {
        const entry = { id: makeId(), [field]: value };
        if (descriptionInput) entry.description = descriptionInput.value.trim();
        app[name].push(entry);
      }

      app.persistCollection(name);
      if (name === 'players') syncEventsAmountLimit();
      resetEditor();
      render();
    }

    function deleteEntry() {
      const uuid = uuidInput.value.trim();
      if (!uuid || !app[name].some((entry) => entry.id === uuid)) return;
      app[name] = app[name].filter((entry) => entry.id !== uuid);
      app.persistCollection(name);
      if (name === 'players') syncEventsAmountLimit();
      resetEditor();
      render();
    }

    addButton.addEventListener('click', saveEntry);
    clearButton.addEventListener('click', resetEditor);
    deleteButton.addEventListener('click', deleteEntry);
    [input, descriptionInput].filter(Boolean).forEach((fieldInput) => {
      fieldInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && fieldInput === input) {
          event.preventDefault();
          saveEntry();
        } else if (event.key === 'Escape') {
          resetEditor();
        }
      });
      fieldInput.addEventListener('input', updateActionState);
    });
    uuidInput.addEventListener('input', updateActionState);
    render();
    updateActionState();
  }

  async function importSettingsFile(file) {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('The selected file is not a settings export.');
    }

    const importedSettings = data.settings || {};
    if (data.settings !== undefined && (!data.settings || typeof data.settings !== 'object')) {
      throw new Error('Settings in the selected file are invalid.');
    }
    for (const name of ['players', 'rules', 'events']) {
      if (data[name] !== undefined && !Array.isArray(data[name])) {
        throw new Error(`${name} must be an array.`);
      }
    }

    app.updateSettings({
      eventsAmount: importedSettings.eventsAmount ?? importedSettings.eventsPerRound ?? app.settings.eventsAmount,
    });

    for (const name of ['players', 'rules', 'events']) {
      if (data[name] !== undefined) {
        app.replaceCollection(name, data[name]);
      }
    }
    renderSettings();
  }

  function renderSettings() {
    syncEventsAmountLimit();
    eventsAmountInput.min = '1';
    eventsAmountInput.step = '1';
    document.dispatchEvent(new CustomEvent('settings-data-updated'));
  }

  function bindSettingsActions() {
    saveSettingsBtn.setAttribute('aria-label', 'Export settings');
    saveSettingsBtn.title = 'Export settings';
    openSettingsBtn.setAttribute('aria-label', 'Import settings');
    openSettingsBtn.title = 'Import settings';
    resetSettingsBtn.setAttribute('aria-label', 'Reset settings');
    resetSettingsBtn.title = 'Reset settings';

    saveSettingsBtn.addEventListener('click', () => {
      downloadJson('dreams-and-disasters-settings.json', {
        settings: app.settings,
        players: app.players,
        rules: app.rules,
        events: app.events,
      });
    });

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.hidden = true;
    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files || [];
      if (!file) return;
      try {
        await importSettingsFile(file);
      } catch (error) {
        window.alert(`Could not import settings: ${error.message}`);
      } finally {
        fileInput.value = '';
      }
    });
    document.body.appendChild(fileInput);
    openSettingsBtn.addEventListener('click', () => fileInput.click());

    resetSettingsBtn.addEventListener('click', () => {
      if (!window.confirm('Reset settings, players, rules, and events to defaults?')) return;
      app.resetConfiguration();
      renderSettings();
    });

    eventsAmountInput.addEventListener('change', () => {
      const playerLimit = Math.max(1, app.players.length);
      const amount = Number(eventsAmountInput.value);
      const validAmount = Number.isFinite(amount) ? Math.min(playerLimit, Math.max(1, Math.floor(amount))) : 1;
      app.updateSettings({ eventsAmount: validAmount });
      renderSettings();
    });

  }

  async function initSettings() {
    await app.ready;
    setupCollection({
      name: 'players', input: document.getElementById('name-input'),
      uuidInput: document.getElementById('name-uuid'),
      addButton: document.getElementById('add-player'),
      clearButton: document.getElementById('clear-player'),
      deleteButton: document.getElementById('delete-player'), list: document.getElementById('name-list'),
      field: 'name', label: 'Player', emptyText: 'No players yet.',
    });
    setupCollection({
      name: 'rules', input: document.getElementById('rules-input'),
      uuidInput: document.getElementById('rule-uuid'),
      addButton: document.getElementById('add-rule'),
      clearButton: document.getElementById('clear-rule'),
      deleteButton: document.getElementById('delete-rule'), list: document.getElementById('rules-list'),
      field: 'value', label: 'Rule', emptyText: 'No rules yet.',
    });
    setupCollection({
      name: 'events', input: document.getElementById('event-name-input'),
      uuidInput: document.getElementById('event-uuid'),
      descriptionInput: document.getElementById('event-description-input'),
      addButton: document.getElementById('add-event'),
      clearButton: document.getElementById('clear-event'),
      deleteButton: document.getElementById('delete-event'), list: document.getElementById('events-list'),
      field: 'title', label: 'Event', emptyText: 'No events yet.',
    });
    bindSettingsActions();
    renderSettings();
  }

  initSettings().catch((error) => console.error('Failed to initialize settings:', error));
})();