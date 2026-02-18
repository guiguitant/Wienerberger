const STATUSES = [
  'Lancement',
  'En cours de collecte',
  'En cours de modélisation',
  'En cours de rapport',
  'En cours de vérification',
  'Vérifié'
];

const STAT_LABELS = [
  'Lancement', 'Collecte', 'Modélisation', 'Rapport', 'Vérification', 'Vérifié'
];

let fdes = JSON.parse(localStorage.getItem('fdes') || '[]');

function save() {
  localStorage.setItem('fdes', JSON.stringify(fdes));
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function deadlineChip(deadline) {
  if (!deadline) return '<span style="color:var(--text-muted);font-size:12px">—</span>';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline + 'T00:00:00');
  const diff = Math.round((dl - today) / 86400000);
  if (diff < 0)  return `<span class="deadline-chip dl-late">Dépassée (${Math.abs(diff)}j)</span>`;
  if (diff <= 7) return `<span class="deadline-chip dl-warn">Dans ${diff} jour${diff > 1 ? 's' : ''}</span>`;
  return `<span class="deadline-chip dl-ok">${dl.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>`;
}

// ── Detail view ──
let currentDetailIdx = null;

function openDetail(idx) {
  currentDetailIdx = idx;
  renderDetail(idx);
  document.getElementById('viewDashboard').style.display = 'none';
  document.getElementById('viewDetail').style.display = 'block';
}

function closeDetail() {
  currentDetailIdx = null;
  document.getElementById('viewDashboard').style.display = '';
  document.getElementById('viewDetail').style.display = 'none';
}

function renderDetail(idx) {
  const f = fdes[idx];
  document.getElementById('detailCard').innerHTML = `
    <div class="detail-name">${escHtml(f.name)}</div>
    <div class="detail-field">
      <div class="detail-field-label">Statut</div>
      <span class="status-badge s${f.status}" style="font-size:13px">
        <select class="status-select" style="font-size:13px;padding:7px 28px 7px 12px"
                onchange="changeStatusFromDetail(${idx}, this.value)">
          ${STATUSES.map((s, si) => `<option value="${si}" ${si === f.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </span>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Deadline</div>
      ${deadlineChip(f.deadline)}
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Ajoutée le</div>
      <span style="font-size:14px;color:var(--text-secondary)">${fmt(f.createdAt)}</span>
    </div>
  `;
}

function changeStatusFromDetail(idx, val) {
  fdes[idx].status = parseInt(val);
  save();
  render();
  renderDetail(idx);
}

// ── Table & Stats ──
function render() {
  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('empty');
  const stats = document.getElementById('stats');
  const progressRow = document.getElementById('progressRow');

  const counts = [0, 0, 0, 0, 0, 0];
  fdes.forEach(f => counts[f.status]++);

  stats.innerHTML = counts.map((c, i) =>
    `<div class="stat-card">
      <div class="num" style="color:var(--s${i})">${c}</div>
      <div class="label">${STAT_LABELS[i]}</div>
    </div>`
  ).join('');

  if (fdes.length > 0) {
    progressRow.style.display = '';
    const pct = Math.round((counts[5] / fdes.length) * 100);
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
  } else {
    progressRow.style.display = 'none';
  }

  if (fdes.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = fdes.map((f, i) => `
    <tr onclick="openDetail(${i})">
      <td style="color:var(--text-muted);font-size:12px">${String(i + 1).padStart(2, '0')}</td>
      <td style="font-weight:500">${escHtml(f.name)}</td>
      <td onclick="event.stopPropagation()">
        <span class="status-badge s${f.status}">
          <select class="status-select" onchange="changeStatus(${i}, this.value)">
            ${STATUSES.map((s, si) => `<option value="${si}" ${si === f.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </span>
      </td>
      <td>${deadlineChip(f.deadline)}</td>
      <td style="color:var(--text-muted);font-size:13px">${fmt(f.createdAt)}</td>
      <td onclick="event.stopPropagation()">
        <div class="actions">
          <button class="btn-icon" onclick="deleteFdes(${i})" title="Supprimer">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3h9M5 3V2h3v1M3 3l.7 8h5.6L10 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function changeStatus(idx, val) {
  fdes[idx].status = parseInt(val);
  save();
  render();
}

function deleteFdes(idx) {
  const name = fdes[idx].name;
  if (confirm(`Supprimer la FDES "${name}" ?`)) {
    fdes.splice(idx, 1);
    save();
    render();
  }
}

// ── Modal ──
function openModal() {
  document.getElementById('overlay').classList.add('open');
  document.getElementById('inputName').value = '';
  document.getElementById('inputStatus').value = '0';
  document.getElementById('inputDeadline').value = '';
  document.getElementById('errName').classList.remove('show');
  setTimeout(() => document.getElementById('inputName').focus(), 50);
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

function addFdes() {
  const name = document.getElementById('inputName').value.trim();
  const status = parseInt(document.getElementById('inputStatus').value);
  const err = document.getElementById('errName');

  if (!name) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const deadline = document.getElementById('inputDeadline').value;
  fdes.push({ name, status, deadline, createdAt: new Date().toISOString() });
  save();
  render();
  closeModal();
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('overlay').classList.contains('open')) closeModal();
    else if (currentDetailIdx !== null) closeDetail();
  }
  if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) addFdes();
});

render();
