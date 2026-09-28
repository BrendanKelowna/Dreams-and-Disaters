(() => {
  const app = window.DreamsAndDisasters;

  const rollButton = document.getElementById('roll');
  const saveButton = document.getElementById('save');
  const openButton = document.getElementById('open');
  const newGameButton = document.getElementById('new-game');
  const playArea = document.getElementById('play-area');
  const playContainer = document.getElementById('play-container');
  const historiesPagination = document.getElementById('histories-pagination');
  const playersList = document.getElementById('players-list');
  const rulesList = document.getElementById('rules-list');
  let currentPage = 0;

  function makeId() {
    return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function makeCell(value, className = '') {
    const cell = document.createElement('div');
    cell.className = className;
    cell.textContent = value;
    return cell;
  }

  function renderNamedList(list, values, getText, emptyText) {
    list.replaceChildren();
    if (!values.length) {
      const empty = document.createElement('li');
      empty.className = 'text-light';
      empty.textContent = emptyText;
      list.appendChild(empty);
      return;
    }

    values.forEach((value) => {
      const item = document.createElement('li');
      item.textContent = getText(value);
      list.appendChild(item);
    });
  }

  function renderHistory() {
    const pageCount = app.histories.length + 1;
    currentPage = Math.max(0, Math.min(currentPage, pageCount - 1));
    const currentHistory = app.histories[currentPage];
    const eventCount = currentHistory
      ? currentHistory.value.length
      : Math.min(
        app.events.length,
        app.players.length,
        Math.max(1, Number(app.settings.eventsAmount) || 1),
      );
    playArea.style.minHeight = `${200 + eventCount * 68}px`;
    playContainer.replaceChildren();

    if (currentPage === app.histories.length) {
      const empty = document.createElement('div');
      empty.className = 'text-light';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'Roll';
      playContainer.appendChild(empty);
      renderPagination(pageCount);
      return;
    }

    const history = app.histories[currentPage];
    if (!history.value.length) {
      const empty = document.createElement('div');
      empty.className = 'text-light';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'This round has no results.';
      playContainer.appendChild(empty);
    } else {
      history.value.forEach((result, index) => {
        const player = app.players.find((candidate) => candidate.id === result.player);
        const event = app.events.find((candidate) => candidate.id === result.event);
        const eventCell = makeCell(event?.title || 'Unknown event', 'roll-result');
        if (event?.description) {
          const description = document.createElement('small');
          description.className = 'text-light';
          description.textContent = event.description;
          eventCell.appendChild(description);
        }
        const cells = [
          makeCell(player?.name || 'Unknown player', 'roll-result'),
          eventCell,
          makeCell(String(result.roll), 'roll-result roll-value'),
        ];
        cells.forEach((cell) => playContainer.appendChild(cell));
      });
    }

    renderPagination(pageCount);
  }

  function renderPagination(pageCount) {
    historiesPagination.replaceChildren();

    const addPageButton = (text, page, label, disabled = false, active = false) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `pagination-button${active ? ' active' : ''}`;
      button.textContent = text;
      button.title = label;
      button.setAttribute('aria-label', label);
      if (active) button.setAttribute('aria-current', 'page');
      button.disabled = disabled;
      button.addEventListener('click', () => {
        currentPage = page;
        renderHistory();
      });
      item.appendChild(button);
      historiesPagination.appendChild(item);
    };

    addPageButton('First', 0, 'First round', currentPage === 0);
    addPageButton('Prev', currentPage - 1, 'Previous round', currentPage === 0);
    const start = Math.min(Math.max(0, currentPage - 2), Math.max(0, pageCount - 5));
    const end = Math.min(pageCount, start + 5);
    for (let page = start; page < end; page += 1) {
      const roundNumber = page + 1;
      addPageButton(String(roundNumber), page, `Round ${roundNumber}`, false, page === currentPage);
    }
    addPageButton('Next', currentPage + 1, 'Next round', currentPage >= pageCount - 1);
    addPageButton('Last', pageCount - 1, 'Last round', currentPage >= pageCount - 1);
  }

  function renderPage() {
    renderHistory();
    renderNamedList(playersList, app.players, (player) => player.name, 'No players configured.');
    renderNamedList(rulesList, app.rules, (rule) => rule.value, 'No rules configured.');
  }

  function rollTwoDice() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  }

  function rollRound() {
    if (!app.players.length || !app.events.length) {
      window.alert('Add at least one player and one event before rolling.');
      return;
    }

    const eventCount = Math.min(
      app.events.length,
      app.players.length,
      Math.max(1, Number(app.settings.eventsAmount) || 1),
    );
    const availableEvents = [...app.events];
    const availablePlayers = [...app.players];
    const results = [];
    for (let index = 0; index < eventCount; index += 1) {
      const event = availableEvents.splice(Math.floor(Math.random() * availableEvents.length), 1)[0];
      const player = availablePlayers.splice(Math.floor(Math.random() * availablePlayers.length), 1)[0];
      const roll = rollTwoDice();
      results.push({ player: player.id, event: event.id, roll });
    }

    app.histories.push({ id: makeId(), value: results });
    app.persistCollection('histories');
    currentPage = app.histories.length - 1;
    renderPage();
  }

  function startNewGame() {
    if (!window.confirm('Clear all roll history and start a new game?')) return;
    app.replaceCollection('histories', []);
    currentPage = 0;
    renderHistory();
  }

  function downloadHistories() {
    const blob = new Blob([JSON.stringify(app.histories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dreams-and-disasters-save.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function bindHistoryImport() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.hidden = true;
    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files || [];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const imported = Array.isArray(data) ? data : data?.histories;
        if (!Array.isArray(imported) || imported.some((history) => !history || !Array.isArray(history.value))) {
          throw new Error('The selected file does not contain valid history data.');
        }
        app.replaceCollection('histories', imported);
        currentPage = 0;
        renderHistory();
      } catch (error) {
        window.alert(`Could not open history: ${error.message}`);
      } finally {
        fileInput.value = '';
      }
    });
    document.body.appendChild(fileInput);
    openButton.addEventListener('click', () => fileInput.click());
  }

  async function initHome() {
    await app.ready;
    rollButton.setAttribute('aria-label', 'Roll a round');
    rollButton.title = 'Roll a round';
    saveButton.setAttribute('aria-label', 'Export history');
    saveButton.title = 'Export history';
    openButton.setAttribute('aria-label', 'Import history');
    openButton.title = 'Import history';
    rollButton.addEventListener('click', rollRound);
    saveButton.addEventListener('click', downloadHistories);
    newGameButton.addEventListener('click', startNewGame);
    bindHistoryImport();
    renderPage();
  }

  initHome().catch((error) => console.error('Failed to initialize home:', error));
})();