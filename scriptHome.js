const nameList = document.getElementById('nameList');

window.DreamsAndDisasters = window.DreamsAndDisasters || {};
window.DreamsAndDisasters.names = window.DreamsAndDisasters.names || [];
const players = window.DreamsAndDisasters.names;

function renderNames() {
  nameList.innerHTML = '';

  if (!players.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-state';
    emptyItem.textContent = 'No names saved yet.';
    nameList.appendChild(emptyItem);
    return;
  }

  players.forEach((person) => {
    const item = document.createElement('li');
    item.className = 'name-item';

    const label = document.createElement('span');
    label.textContent = typeof person === 'string' ? person : person.name;

    item.append(label);
    nameList.appendChild(item);
  });
}

function loadNames() {
  readNames();
  renderNames();
}

function load() {
  loadNames();
}

load();