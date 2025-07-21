const defaultPlatforms = [
  { name: "Linkedin", template: "https://www.linkedin.com/search/results/people/?keywords=%s" },
  { name: "Github", template: "https://github.com/search?type=Users&q=%s" },
  { name: "MobyGames", template: "https://www.mobygames.com/search/quick?q=%s" },
  { name: "ArtStation", template: "https://www.artstation.com/search/artists?sort_by=followers&query=%s" },
  { name: "Google", template: "https://www.google.com/search?q=%s" },
  { name: "Behance", template: "https://www.behance.net/search/users?search=%s" },
];

document.addEventListener('DOMContentLoaded', () => {
  loadOptions();
  document.getElementById('addPlatform').addEventListener('click', addPlatform);
  document.getElementById('save').addEventListener('click', saveOptions);
});

function createRow(name, template) {
  const div = document.createElement('div');
  div.className = 'platform';
  div.innerHTML = `<input class="name" value="${name}" /> ` +
                  `<input class="template" value="${template}" style="width:400px;" /> ` +
                  `<button class="remove">Remove</button>`;
  div.querySelector('.remove').addEventListener('click', () => div.remove());
  return div;
}

function loadOptions() {
  chrome.storage.sync.get('platforms', (data) => {
    const platforms = data.platforms && data.platforms.length ? data.platforms : defaultPlatforms;
    const list = document.getElementById('platformList');
    list.innerHTML = '';
    platforms.forEach(p => list.appendChild(createRow(p.name, p.template)));
  });
}

function addPlatform() {
  const name = document.getElementById('newName').value.trim();
  const url = document.getElementById('newUrl').value.trim();
  if (!name || !url) return;
  const list = document.getElementById('platformList');
  list.appendChild(createRow(name, url));
  document.getElementById('newName').value = '';
  document.getElementById('newUrl').value = '';
}

function saveOptions() {
  const rows = document.querySelectorAll('#platformList .platform');
  const platforms = Array.from(rows).map(row => ({
    name: row.querySelector('.name').value.trim(),
    template: row.querySelector('.template').value.trim(),
  })).filter(p => p.name && p.template);
  chrome.storage.sync.set({ platforms }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(() => status.textContent = '', 1000);
  });
}
