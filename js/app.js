// ── Supabase ──
const { createClient } = window.supabase;
const db = createClient(
  'https://gylytumjkmahzjfwdkyc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bHl0dW1qa21haHpqZndka3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzcyNzIsImV4cCI6MjA4NzAxMzI3Mn0.6mFhWHP6dFDr4oCGdB2x2Nv_Z5KP_X72kcaQ6wBWgLo'
);

// ── Statuts FDES ──
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

// ── Structure du formulaire de collecte ──
const COLLECTE_ONGLETS = [
  {
    onglet: 'organisation',
    label: 'Organisation',
    fields: [
      { champ: 'nom_societe',   label: 'Nom de la société',    type: 'text',   unite: null },
      { champ: 'nom_referent',  label: 'Nom du référent',      type: 'text',   unite: null },
      { champ: 'email_referent',label: 'Email du référent',    type: 'email',  unite: null },
      { champ: 'nom_usine',     label: "Nom de l'usine / site",type: 'text',   unite: null },
    ]
  },
  {
    onglet: 'infos_generales',
    label: 'Infos générales',
    fields: [
      { champ: 'annee_reference',   label: 'Année de référence',           type: 'number', unite: null },
      { champ: 'production_totale', label: 'Production totale du site',    type: 'number', unite: 't'  },
      { champ: 'casse_cuite',       label: 'Casse cuite totale du site',   type: 'number', unite: 't'  },
    ]
  },
  {
    onglet: 'energie',
    label: 'Énergie',
    fields: [
      { champ: 'gaz_naturel',       label: 'Gaz naturel',       type: 'number', unite: 'm³'   },
      { champ: 'electricite',       label: 'Électricité',       type: 'number', unite: 'kWh'  },
      { champ: 'autre_combustible', label: 'Autre combustible', type: 'number', unite: 'libre'},
    ]
  },
  {
    onglet: 'matieres_premieres',
    label: 'Matières premières',
    fields: [
      { champ: 'eau_potable',    label: 'Eau potable réseau', type: 'number', unite: 'kg'   },
      { champ: 'eau_forage',     label: 'Eau de forage',      type: 'number', unite: 'kg'   },
      { champ: 'argiles',        label: 'Argiles',            type: 'number', unite: 'kg'   },
      { champ: 'chamotte',       label: 'Chamotte',           type: 'number', unite: 'kg'   },
      { champ: 'autres_matieres',label: 'Autres matières',    type: 'number', unite: 'libre'},
    ]
  },
  {
    onglet: 'emissions_air',
    label: 'Émissions dans l\'air',
    fields: [
      { champ: 'co2_fossile',       label: 'CO2 fossile combustion',          type: 'number', unite: 'kg CO2' },
      { champ: 'energie_combustion',label: 'Énergie liée à la combustion GN', type: 'number', unite: 'MJ'    },
      { champ: 'autres_emissions',  label: 'Autres émissions',                type: 'number', unite: 'libre' },
    ]
  },
  {
    onglet: 'emballages',
    label: 'Emballages',
    fields: [
      { champ: 'masse_produit_palette', label: 'Masse produit sur palette', type: 'number', unite: 'kg/palette' },
      { champ: 'type_emballage',        label: "Type d'emballage",          type: 'text',   unite: null        },
      { champ: 'masse_emballage_total', label: 'Masse emballage total',     type: 'number', unite: 'kg'        },
    ]
  },
  {
    onglet: 'dechets',
    label: 'Déchets',
    fields: [
      { champ: 'dechets_recycles',  label: 'Déchets recyclés',         type: 'number', unite: 't'  },
      { champ: 'dechets_elimines',  label: 'Déchets éliminés',         type: 'number', unite: 't'  },
      { champ: 'code_ler',          label: 'Code LER + description',   type: 'text',   unite: null },
    ]
  },
  {
    onglet: 'transports',
    label: 'Transports',
    fields: [
      { champ: 'distance_matieres', label: 'Distance transport matières premières', type: 'number', unite: 'km'  },
      { champ: 'type_transport',    label: 'Type de transport',                     type: 'text',   unite: null  },
      { champ: 'tonnage_transporte',label: 'Tonnage transporté',                    type: 'number', unite: 'tkm' },
    ]
  }
];

// ── État global ──
let fdes = [];
let currentDetailId  = null;
let currentCollecteId = null;

// ── Utilitaires ──
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
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

// ── Supabase : FDES ──
async function loadFdes() {
  const { data, error } = await db
    .from('fdes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.error('Erreur chargement :', error.message); return; }
  fdes = data || [];
  render();
}

async function createFdes(nom, statut, deadline, bureau_etudes) {
  const { error } = await db.from('fdes').insert({
    nom,
    statut,
    deadline: deadline || null,
    bureau_etudes: bureau_etudes || null
  });
  if (error) { console.error('Erreur création :', error.message); return false; }
  return true;
}

async function updateStatut(id, statut) {
  const { error } = await db.from('fdes').update({ statut }).eq('id', id);
  if (error) { console.error('Erreur mise à jour :', error.message); return false; }
  return true;
}

async function removeFdes(id) {
  const { error } = await db.from('fdes').delete().eq('id', id);
  if (error) { console.error('Erreur suppression :', error.message); return false; }
  return true;
}

// ── Vue Détail ──
function openDetail(id) {
  currentDetailId = id;
  const f = fdes.find(x => x.id === id);
  if (!f) return;
  renderDetail(f);
  document.getElementById('viewDashboard').style.display = 'none';
  document.getElementById('viewDetail').style.display = 'block';
}

function closeDetail() {
  currentDetailId = null;
  document.getElementById('viewDashboard').style.display = '';
  document.getElementById('viewDetail').style.display = 'none';
}

function renderDetail(f) {
  document.getElementById('detailCard').innerHTML = `
    <div class="detail-name">${escHtml(f.nom)}</div>
    <div class="detail-actions">
      <button class="btn btn-primary" onclick="openCollecte('${f.id}')">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1 2h11M1 6.5h11M1 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        Formulaire de collecte
      </button>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Statut</div>
      <span class="status-badge s${f.statut}" style="font-size:13px">
        <select class="status-select" style="font-size:13px;padding:7px 28px 7px 12px"
                onchange="changeStatusFromDetail('${f.id}', this.value)">
          ${STATUSES.map((s, si) => `<option value="${si}" ${si === f.statut ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </span>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Bureau d'études</div>
      <span style="font-size:14px;color:var(--text-secondary)">${escHtml(f.bureau_etudes) || '<span style="color:var(--text-muted)">—</span>'}</span>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Deadline</div>
      ${deadlineChip(f.deadline)}
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Ajoutée le</div>
      <span style="font-size:14px;color:var(--text-secondary)">${fmt(f.created_at)}</span>
    </div>
  `;
}

async function changeStatusFromDetail(id, val) {
  const ok = await updateStatut(id, parseInt(val));
  if (!ok) return;
  await loadFdes();
  if (currentDetailId !== null) {
    const f = fdes.find(x => x.id === currentDetailId);
    if (f) renderDetail(f);
  }
}

// ── Vue Collecte ──
async function openCollecte(fdesId) {
  currentCollecteId = fdesId;
  const f = fdes.find(x => x.id === fdesId);

  // Titre
  document.getElementById('collecteFdesName').textContent = f ? f.nom : '';

  // Générer le formulaire
  renderCollecteForm();

  // Afficher la vue
  document.getElementById('viewDetail').style.display = 'none';
  document.getElementById('viewCollecte').style.display = 'block';

  // Préremplir avec les données existantes
  await loadCollecteData(fdesId);
}

function closeCollecte() {
  currentCollecteId = null;
  document.getElementById('viewCollecte').style.display = 'none';
  document.getElementById('viewDetail').style.display = 'block';
}

function renderCollecteForm() {
  const tabsHtml = COLLECTE_ONGLETS.map((o, i) =>
    `<button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="switchTab(${i})">${o.label}</button>`
  ).join('');

  const panelsHtml = COLLECTE_ONGLETS.map((o, i) =>
    `<div class="tab-panel ${i === 0 ? 'active' : ''}" id="panel-${i}">
      ${o.fields.map(renderCollecteField).join('')}
    </div>`
  ).join('');

  document.getElementById('collecteForm').innerHTML = `
    <div class="tabs">${tabsHtml}</div>
    ${panelsHtml}
    <div class="collecte-save-bar">
      <button class="btn btn-primary" onclick="saveCollecte()" id="saveBtn">Sauvegarder</button>
      <span class="save-feedback" id="saveFeedback">✓ Données sauvegardées</span>
    </div>
  `;
}

function renderCollecteField(field) {
  let inputHtml;

  if (field.unite === null) {
    // Champ texte simple, sans unité
    inputHtml = `
      <div class="collecte-input-row">
        <input type="${field.type}" class="collecte-input" id="val_${field.champ}" placeholder="" />
      </div>`;
  } else if (field.unite === 'libre') {
    // Valeur + unité libre saisie par l'utilisateur
    inputHtml = `
      <div class="collecte-input-row">
        <input type="number" class="collecte-input" id="val_${field.champ}" placeholder="0" step="any" />
        <input type="text" class="collecte-unit-input" id="unit_${field.champ}" placeholder="unité" />
      </div>`;
  } else {
    // Valeur + unité fixe
    inputHtml = `
      <div class="collecte-input-row">
        <input type="number" class="collecte-input" id="val_${field.champ}" placeholder="0" step="any" />
        <span class="collecte-unit-badge">${field.unite}</span>
      </div>`;
  }

  return `
    <div class="collecte-field">
      <label for="val_${field.champ}">${field.label}</label>
      ${inputHtml}
    </div>`;
}

function switchTab(idx) {
  document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === idx));
  document.querySelectorAll('.tab-panel').forEach((panel, i) => panel.classList.toggle('active', i === idx));
}

async function loadCollecteData(fdesId) {
  const { data, error } = await db
    .from('fdes_collecte')
    .select('*')
    .eq('fdes_id', fdesId);

  if (error) { console.error('Erreur chargement collecte :', error.message); return; }

  (data || []).forEach(row => {
    const valInput  = document.getElementById(`val_${row.champ}`);
    const unitInput = document.getElementById(`unit_${row.champ}`);
    if (valInput)  valInput.value  = row.valeur || '';
    if (unitInput) unitInput.value = row.unite  || '';
  });
}

async function saveCollecte() {
  const saveBtn  = document.getElementById('saveBtn');
  const feedback = document.getElementById('saveFeedback');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Sauvegarde…';

  // Construire les lignes depuis tous les champs
  const rows = [];
  COLLECTE_ONGLETS.forEach(o => {
    o.fields.forEach(field => {
      const valInput  = document.getElementById(`val_${field.champ}`);
      const unitInput = document.getElementById(`unit_${field.champ}`);
      if (!valInput) return;

      const valeur = valInput.value.trim();
      let unite = '';
      if (field.unite === 'libre') {
        unite = unitInput ? unitInput.value.trim() : '';
      } else if (field.unite !== null) {
        unite = field.unite;
      }

      rows.push({ fdes_id: currentCollecteId, onglet: o.onglet, champ: field.champ, valeur, unite });
    });
  });

  // Supprimer les anciennes données puis insérer les nouvelles
  const { error: delError } = await db.from('fdes_collecte').delete().eq('fdes_id', currentCollecteId);
  if (delError) {
    console.error('Erreur suppression collecte :', delError.message);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Sauvegarder';
    return;
  }

  const nonEmpty = rows.filter(r => r.valeur !== '');
  if (nonEmpty.length > 0) {
    const { error: insError } = await db.from('fdes_collecte').insert(nonEmpty);
    if (insError) {
      console.error('Erreur insertion collecte :', insError.message);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Sauvegarder';
      return;
    }
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Sauvegarder';
  feedback.classList.add('show');
  setTimeout(() => feedback.classList.remove('show'), 3000);
}

// ── Tableau & Stats ──
function render() {
  const tbody      = document.getElementById('tbody');
  const empty      = document.getElementById('empty');
  const stats      = document.getElementById('stats');
  const progressRow = document.getElementById('progressRow');

  const counts = [0, 0, 0, 0, 0, 0];
  fdes.forEach(f => counts[f.statut]++);

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
    <tr onclick="openDetail('${f.id}')">
      <td style="color:var(--text-muted);font-size:12px">${String(i + 1).padStart(2, '0')}</td>
      <td style="font-weight:500">${escHtml(f.nom)}</td>
      <td style="color:var(--text-secondary);font-size:13px">${escHtml(f.bureau_etudes) || '<span style="color:var(--text-muted)">—</span>'}</td>
      <td onclick="event.stopPropagation()">
        <span class="status-badge s${f.statut}">
          <select class="status-select" onchange="changeStatus('${f.id}', this.value)">
            ${STATUSES.map((s, si) => `<option value="${si}" ${si === f.statut ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </span>
      </td>
      <td>${deadlineChip(f.deadline)}</td>
      <td style="color:var(--text-muted);font-size:13px">${fmt(f.created_at)}</td>
      <td onclick="event.stopPropagation()">
        <div class="actions">
          <button class="btn-icon" onclick="deleteFdes('${f.id}')" title="Supprimer">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3h9M5 3V2h3v1M3 3l.7 8h5.6L10 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function changeStatus(id, val) {
  await updateStatut(id, parseInt(val));
  await loadFdes();
}

async function deleteFdes(id) {
  const f = fdes.find(x => x.id === id);
  if (!f) return;
  if (confirm(`Supprimer la FDES "${f.nom}" ?`)) {
    const ok = await removeFdes(id);
    if (ok) await loadFdes();
  }
}

// ── Modal ──
function openModal() {
  document.getElementById('overlay').classList.add('open');
  document.getElementById('inputName').value = '';
  document.getElementById('inputBureau').value = '';
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

async function addFdes() {
  const nom          = document.getElementById('inputName').value.trim();
  const bureau_etudes = document.getElementById('inputBureau').value.trim();
  const statut       = parseInt(document.getElementById('inputStatus').value);
  const deadline     = document.getElementById('inputDeadline').value;
  const err          = document.getElementById('errName');

  if (!nom) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const ok = await createFdes(nom, statut, deadline, bureau_etudes);
  if (ok) {
    await loadFdes();
    closeModal();
  }
}

// ── Raccourcis clavier ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('overlay').classList.contains('open')) closeModal();
    else if (currentCollecteId !== null) closeCollecte();
    else if (currentDetailId !== null) closeDetail();
  }
});

// ── Init ──
loadFdes();
