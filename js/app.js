// ── Supabase ──
const { createClient } = window.supabase;
const db = createClient(
  'https://gylytumjkmahzjfwdkyc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bHl0dW1qa21haHpqZndka3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzcyNzIsImV4cCI6MjA4NzAxMzI3Mn0.6mFhWHP6dFDr4oCGdB2x2Nv_Z5KP_X72kcaQ6wBWgLo'
);

// ── Statuts FDES ──
const STATUSES = [
  'Lancement', 'En cours de collecte', 'En cours de modélisation',
  'En cours de rapport', 'En cours de vérification', 'Vérifié'
];
const STAT_LABELS = ['Lancement', 'Collecte', 'Modélisation', 'Rapport', 'Vérification', 'Vérifié'];

// ── Structure du formulaire de collecte ──
const COLLECTE_ONGLETS = [
  {
    onglet: 'organisation', label: 'Organisation', emoji: '🏢', modules: [],
    fields: [
      { champ: 'nom_societe',   label: 'Nom de la société',     type: 'text',  unite: null },
      { champ: 'nom_referent',  label: 'Nom du référent',       type: 'text',  unite: null },
      { champ: 'email_referent',label: 'Email du référent',     type: 'email', unite: null },
      { champ: 'nom_usine',     label: "Nom de l'usine / site", type: 'text',  unite: null },
    ]
  },
  {
    onglet: 'infos_generales', label: 'Infos générales', emoji: '📋', modules: [],
    fields: [
      { champ: 'annee_reference',   label: 'Année de référence',         type: 'number', unite: null },
      { champ: 'production_totale', label: 'Production totale du site',  type: 'number', unite: 't'  },
      { champ: 'casse_cuite',       label: 'Casse cuite totale du site', type: 'number', unite: 't'  },
    ]
  },
  {
    onglet: 'energie', label: 'Énergie', emoji: '⚡', modules: ['A3'],
    fields: [
      { champ: 'gaz_naturel',       label: 'Gaz naturel',       type: 'number', unite: 'm³'    },
      { champ: 'electricite',       label: 'Électricité',       type: 'number', unite: 'kWh'   },
      { champ: 'autre_combustible', label: 'Autre combustible', type: 'number', unite: 'libre' },
    ]
  },
  {
    onglet: 'matieres_premieres', label: 'Matières premières', emoji: '🪨', modules: ['A1', 'A2'],
    fields: [
      { champ: 'eau_potable',    label: 'Eau potable réseau', type: 'number', unite: 'kg'    },
      { champ: 'eau_forage',     label: 'Eau de forage',      type: 'number', unite: 'kg'    },
      { champ: 'argiles',        label: 'Argiles',            type: 'number', unite: 'kg'    },
      { champ: 'chamotte',       label: 'Chamotte',           type: 'number', unite: 'kg'    },
      { champ: 'autres_matieres',label: 'Autres matières',    type: 'number', unite: 'libre' },
    ]
  },
  {
    onglet: 'emissions_air', label: "Émissions dans l'air", emoji: '💨', modules: ['A3'],
    fields: [
      { champ: 'co2_fossile',       label: 'CO2 fossile combustion',          type: 'number', unite: 'kg CO2' },
      { champ: 'energie_combustion',label: 'Énergie liée à la combustion GN', type: 'number', unite: 'MJ'    },
      { champ: 'autres_emissions',  label: 'Autres émissions',                type: 'number', unite: 'libre' },
    ]
  },
  {
    onglet: 'emballages', label: 'Emballages', emoji: '📦', modules: ['A3', 'A5'],
    fields: [
      { champ: 'masse_produit_palette', label: 'Masse produit sur palette', type: 'number', unite: 'kg/palette' },
      { champ: 'type_emballage',        label: "Type d'emballage",          type: 'text',   unite: null         },
      { champ: 'masse_emballage_total', label: 'Masse emballage total',     type: 'number', unite: 'kg'         },
    ]
  },
  {
    onglet: 'dechets', label: 'Déchets', emoji: '🗑️', modules: ['A3'],
    fields: [
      { champ: 'dechets_recycles', label: 'Déchets recyclés',       type: 'number', unite: 't'  },
      { champ: 'dechets_elimines', label: 'Déchets éliminés',       type: 'number', unite: 't'  },
      { champ: 'code_ler',         label: 'Code LER + description', type: 'text',   unite: null },
    ]
  },
  {
    onglet: 'transports', label: 'Transports', emoji: '🚛', modules: ['A2', 'A4'],
    fields: [
      { champ: 'distance_matieres', label: 'Distance transport matières premières', type: 'number', unite: 'km'  },
      { champ: 'type_transport',    label: 'Type de transport',                     type: 'text',   unite: null  },
      { champ: 'tonnage_transporte',label: 'Tonnage transporté',                    type: 'number', unite: 'tkm' },
    ]
  },
  {
    onglet: 'mise_en_oeuvre', label: 'Mise en œuvre', emoji: '🔧', modules: ['A5'],
    fields: [
      { champ: 'type_fixation',     label: 'Type de fixation',         type: 'text',   unite: null    },
      { champ: 'masse_agrafe',      label: 'Masse agrafe / vis',       type: 'number', unite: 'kg/m²' },
      { champ: 'matiere_agrafe',    label: 'Matière agrafe',           type: 'text',   unite: null    },
      { champ: 'nb_vis_par_agrafe', label: 'Nombre de vis par agrafe', type: 'number', unite: null    },
    ]
  },
  {
    onglet: 'fin_de_vie', label: 'Fin de vie', emoji: '♻️', modules: ['C1', 'C2', 'C3', 'C4', 'D'],
    fields: [
      { champ: 'qte_collectee',  label: 'Quantité collectée séparément',  type: 'number', unite: 'kg' },
      { champ: 'qte_recyclage',  label: 'Quantité destinée au recyclage', type: 'number', unite: 'kg' },
      { champ: 'qte_enfouie',    label: 'Quantité enfouie',               type: 'number', unite: 'kg' },
      { champ: 'dist_stockage',  label: 'Distance centre de stockage',    type: 'number', unite: 'km' },
      { champ: 'taux_recyclage', label: 'Taux de recyclage',              type: 'number', unite: '%'  },
    ]
  }
];

// ── État global ──
let fdes             = [];
let contacts         = [];
let currentFdes      = null;
let currentCollecteId = null;
let currentOngletIdx  = null;
let collecteData      = {};

// ── Navigation centrale ──
function showView(viewId) {
  ['viewDashboard', 'viewFdes', 'viewContacts'].forEach(id => {
    document.getElementById(id).style.display = (id === viewId) ? '' : 'none';
  });
  document.getElementById('navDashboard').classList.toggle('active', viewId === 'viewDashboard');
  document.getElementById('navContacts').classList.toggle('active',  viewId === 'viewContacts');
}

function openDashboard() { showView('viewDashboard'); }

// ── Utilitaires ──
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function deadlineChip(deadline) {
  if (!deadline) return '<span style="color:var(--text-muted);font-size:12px">—</span>';
  const today = new Date(); today.setHours(0,0,0,0);
  const dl    = new Date(deadline + 'T00:00:00');
  const diff  = Math.round((dl - today) / 86400000);
  if (diff < 0)  return `<span class="deadline-chip dl-late">Dépassée (${Math.abs(diff)}j)</span>`;
  if (diff <= 7) return `<span class="deadline-chip dl-warn">Dans ${diff} jour${diff > 1 ? 's' : ''}</span>`;
  return `<span class="deadline-chip dl-ok">${dl.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</span>`;
}

function getCompletion(onglet) {
  const total  = onglet.fields.length;
  const filled = onglet.fields.filter(f => collecteData[f.champ]?.valeur).length;
  return { filled, total };
}

function getGlobalProgress() {
  let total = 0, filled = 0;
  COLLECTE_ONGLETS.forEach(o => o.fields.forEach(f => {
    total++;
    if (collecteData[f.champ]?.valeur) filled++;
  }));
  return { filled, total, pct: total > 0 ? Math.round(filled / total * 100) : 0 };
}

// ══════════════════════════════════════════════════════════
// CONTACTS
// ══════════════════════════════════════════════════════════

async function loadContacts() {
  const { data, error } = await db.from('contacts').select('*').order('created_at', { ascending: true });
  if (error) { console.error('Erreur contacts :', error.message); return; }
  contacts = data || [];
}

function openContacts() {
  showView('viewContacts');
  renderContacts();
}

function renderContacts() {
  const bureaux = contacts.filter(c => c.type === 'bureau_etudes');
  const verifs  = contacts.filter(c => c.type === 'verificateur');

  document.getElementById('blockBureau').innerHTML = renderContactBlock(
    "Bureaux d'études", bureaux, 'bureau_etudes'
  );
  document.getElementById('blockVerif').innerHTML = renderContactBlock(
    'Vérificateurs', verifs, 'verificateur'
  );
}

function renderContactBlock(title, list, type) {
  const emptyHtml = list.length === 0
    ? `<div class="contacts-empty">Aucun contact pour l'instant.</div>`
    : list.map(c => `
        <div class="contact-card">
          <div class="contact-info">
            <div class="contact-name">${escHtml(c.nom)}</div>
            <div class="contact-meta">
              ${c.email     ? `<span>${escHtml(c.email)}</span>` : ''}
              ${c.telephone ? `<span>${escHtml(c.telephone)}</span>` : ''}
            </div>
          </div>
          <button class="btn-icon" onclick="deleteContact('${c.id}')" title="Supprimer">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3h9M5 3V2h3v1M3 3l.7 8h5.6L10 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>`).join('');

  return `
    <div class="contacts-block">
      <div class="contacts-block-header">
        <h2>${title}</h2>
        <button class="btn btn-primary" onclick="openContactModal('${type}')">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Ajouter
        </button>
      </div>
      ${emptyHtml}
    </div>`;
}

function openContactModal(type = 'bureau_etudes') {
  document.getElementById('overlayContact').classList.add('open');
  document.getElementById('inputContactNom').value = '';
  document.getElementById('inputContactEmail').value = '';
  document.getElementById('inputContactTel').value = '';
  document.getElementById('inputContactType').value = type;
  document.getElementById('errContactNom').classList.remove('show');
  setTimeout(() => document.getElementById('inputContactNom').focus(), 50);
}

function closeContactModal() {
  document.getElementById('overlayContact').classList.remove('open');
}

function handleContactOverlayClick(e) {
  if (e.target === document.getElementById('overlayContact')) closeContactModal();
}

async function saveContact() {
  const nom       = document.getElementById('inputContactNom').value.trim();
  const type      = document.getElementById('inputContactType').value;
  const email     = document.getElementById('inputContactEmail').value.trim();
  const telephone = document.getElementById('inputContactTel').value.trim();
  const err       = document.getElementById('errContactNom');

  if (!nom) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const { error } = await db.from('contacts').insert({
    nom, type,
    email:     email     || null,
    telephone: telephone || null
  });
  if (error) { console.error('Erreur ajout contact :', error.message); return; }

  await loadContacts();
  renderContacts();
  populateContactDropdowns();
  closeContactModal();
}

async function deleteContact(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  if (confirm(`Supprimer le contact "${c.nom}" ?`)) {
    const { error } = await db.from('contacts').delete().eq('id', id);
    if (error) { console.error('Erreur suppression contact :', error.message); return; }
    await loadContacts();
    renderContacts();
    populateContactDropdowns();
  }
}

function populateContactDropdowns() {
  const bureaux = contacts.filter(c => c.type === 'bureau_etudes');
  const verifs  = contacts.filter(c => c.type === 'verificateur');

  const bureauSel = document.getElementById('inputBureau');
  const verifSel  = document.getElementById('inputVerif');

  if (bureauSel) {
    const curr = bureauSel.value;
    bureauSel.innerHTML =
      '<option value="">— Sélectionner —</option>' +
      bureaux.map(c => `<option value="${escHtml(c.nom)}"${c.nom === curr ? ' selected' : ''}>${escHtml(c.nom)}</option>`).join('');
  }
  if (verifSel) {
    const curr = verifSel.value;
    verifSel.innerHTML =
      '<option value="">— Sélectionner —</option>' +
      verifs.map(c => `<option value="${escHtml(c.nom)}"${c.nom === curr ? ' selected' : ''}>${escHtml(c.nom)}</option>`).join('');
  }
}

// ══════════════════════════════════════════════════════════
// FDES — Supabase
// ══════════════════════════════════════════════════════════

async function loadFdes() {
  const { data, error } = await db.from('fdes').select('*').order('created_at', { ascending: true });
  if (error) { console.error('Erreur chargement :', error.message); return; }
  fdes = data || [];
  render();
}

async function createFdes(nom, statut, deadline, bureau_etudes, verificateur) {
  const { error } = await db.from('fdes').insert({
    nom, statut,
    deadline:      deadline      || null,
    bureau_etudes: bureau_etudes || null,
    verificateur:  verificateur  || null
  });
  if (error) { console.error('Erreur création :', error.message); return false; }
  return true;
}

async function updateStatut(id, statut) {
  const { error } = await db.from('fdes').update({ statut }).eq('id', id);
  if (error) { console.error('Erreur statut :', error.message); return false; }
  return true;
}

async function removeFdes(id) {
  const { error } = await db.from('fdes').delete().eq('id', id);
  if (error) { console.error('Erreur suppression :', error.message); return false; }
  return true;
}

async function loadCollecteData(fdesId) {
  const { data, error } = await db.from('fdes_collecte').select('*').eq('fdes_id', fdesId);
  if (error) { console.error('Erreur collecte :', error.message); return; }
  collecteData = {};
  (data || []).forEach(row => {
    collecteData[row.champ] = { valeur: row.valeur || '', unite: row.unite || '' };
  });
}

// ══════════════════════════════════════════════════════════
// PAGE FDES UNIFIÉE
// ══════════════════════════════════════════════════════════

async function openFdes(id) {
  currentFdes       = fdes.find(x => x.id === id);
  currentCollecteId = id;
  currentOngletIdx  = null;
  if (!currentFdes) return;

  await loadCollecteData(id);
  showView('viewFdes');
  renderFdesLeft(currentFdes);
  renderFdesRightGrid();
}

function closeFdes() {
  currentFdes = null; currentCollecteId = null;
  currentOngletIdx = null; collecteData = {};
  showView('viewDashboard');
}

// ── Colonne gauche ──
function renderFdesLeft(f) {
  const { filled, total, pct } = getGlobalProgress();
  document.getElementById('fdesInfoCard').innerHTML = `
    <div class="fdes-name">${escHtml(f.nom)}</div>
    <div class="fdes-info-row">
      <div class="fdes-info-label">Statut</div>
      <span class="status-badge s${f.statut}">
        <select class="status-select" onchange="changeStatusInline('${f.id}', this.value)">
          ${STATUSES.map((s,si) => `<option value="${si}"${si===f.statut?' selected':''}>${s}</option>`).join('')}
        </select>
      </span>
    </div>
    <div class="fdes-info-row">
      <div class="fdes-info-label">Deadline</div>
      <div>${deadlineChip(f.deadline)}</div>
    </div>
    <div class="fdes-info-row">
      <div class="fdes-info-label">Bureau d'études</div>
      <div class="fdes-info-value">${escHtml(f.bureau_etudes) || '<span style="color:var(--text-muted)">—</span>'}</div>
    </div>
    <div class="fdes-info-row">
      <div class="fdes-info-label">Vérificateur</div>
      <div class="fdes-info-value">${escHtml(f.verificateur) || '<span style="color:var(--text-muted)">—</span>'}</div>
    </div>
    <div class="fdes-info-row">
      <div class="fdes-info-label">Créée le</div>
      <div class="fdes-info-value">${fmt(f.created_at)}</div>
    </div>
    <div class="fdes-info-row" style="border-bottom:none;padding-bottom:0">
      <div class="fdes-info-label">Notes</div>
      <div class="fdes-info-value">${escHtml(f.notes) || '<span style="color:var(--text-muted)">—</span>'}</div>
    </div>
    <div class="fdes-progress-section">
      <div class="fdes-progress-header">
        <span class="fdes-progress-label">Collecte globale</span>
        <span class="fdes-progress-pct" id="fdesGlobalPct">${pct}%</span>
      </div>
      <div class="fdes-global-bar">
        <div class="fdes-global-fill" id="fdesGlobalFill" style="width:${pct}%"></div>
      </div>
      <div class="fdes-intro-text">
        Remplissez chaque section avec les données de votre FDES. Cliquez sur une carte pour accéder au formulaire correspondant.
      </div>
    </div>`;
}

function updateFdesLeftProgress() {
  const { pct } = getGlobalProgress();
  const pctEl  = document.getElementById('fdesGlobalPct');
  const fillEl = document.getElementById('fdesGlobalFill');
  if (pctEl)  pctEl.textContent  = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';
}

async function changeStatusInline(id, val) {
  await updateStatut(id, parseInt(val));
  await loadFdes();
  currentFdes = fdes.find(x => x.id === id);
  if (currentFdes) renderFdesLeft(currentFdes);
}

// ── Colonne droite : grille ──
function renderFdesRightGrid() {
  const cardsHtml = COLLECTE_ONGLETS.map((o, i) => {
    const { filled, total } = getCompletion(o);
    const pct      = total > 0 ? Math.round((filled / total) * 100) : 0;
    const complete = filled === total && total > 0;
    const badgesHtml = (o.modules && o.modules.length)
      ? `<div class="section-modules">${o.modules.map(m => `<span class="module-badge">${m}</span>`).join('')}</div>`
      : '';
    return `
      <div class="section-card${complete ? ' complete' : ''}" onclick="openOngletRight(${i})">
        <span class="section-card-emoji">${o.emoji}</span>
        <div class="section-card-title">${o.label}</div>
        ${badgesHtml}
        <div class="section-progress-bar">
          <div class="section-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="section-progress-label">${filled}/${total} champs remplis</div>
      </div>`;
  }).join('');

  document.getElementById('fdesRightContent').innerHTML =
    `<div class="collecte-grid">${cardsHtml}</div>`;
}

// ── Colonne droite : formulaire section ──
function openOngletRight(idx) {
  currentOngletIdx = idx;
  const o = COLLECTE_ONGLETS[idx];
  document.getElementById('fdesRightContent').innerHTML = `
    <div class="section-form-header">
      <button class="btn btn-ghost" onclick="backToGridRight()" style="padding:5px 10px;gap:4px">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Retour aux sections
      </button>
      <span class="section-form-emoji">${o.emoji}</span>
      <span class="section-form-title">${o.label}</span>
    </div>
    ${o.fields.map(renderCollecteField).join('')}
    <div class="collecte-save-bar">
      <button class="btn btn-primary" onclick="saveSection(${idx})" id="saveBtn">Sauvegarder</button>
      <span class="save-feedback" id="saveFeedback">✓ Sauvegardé</span>
    </div>`;
}

function backToGridRight() {
  if (currentOngletIdx !== null) {
    COLLECTE_ONGLETS[currentOngletIdx].fields.forEach(field => {
      const valInput  = document.getElementById(`val_${field.champ}`);
      const unitInput = document.getElementById(`unit_${field.champ}`);
      if (!valInput) return;
      const unite = field.unite === 'libre' ? (unitInput ? unitInput.value.trim() : '') : (field.unite || '');
      collecteData[field.champ] = { valeur: valInput.value.trim(), unite };
    });
  }
  currentOngletIdx = null;
  renderFdesRightGrid();
  updateFdesLeftProgress();
}

function renderCollecteField(field) {
  const d   = collecteData[field.champ] || {};
  const val  = escHtml(d.valeur || '');
  const unit = escHtml(d.unite  || '');
  let inputHtml;
  if (field.unite === null) {
    inputHtml = `<div class="collecte-input-row"><input type="${field.type}" class="collecte-input" id="val_${field.champ}" value="${val}" /></div>`;
  } else if (field.unite === 'libre') {
    inputHtml = `<div class="collecte-input-row"><input type="number" class="collecte-input" id="val_${field.champ}" placeholder="0" step="any" value="${val}" /><input type="text" class="collecte-unit-input" id="unit_${field.champ}" placeholder="unité" value="${unit}" /></div>`;
  } else {
    inputHtml = `<div class="collecte-input-row"><input type="number" class="collecte-input" id="val_${field.champ}" placeholder="0" step="any" value="${val}" /><span class="collecte-unit-badge">${field.unite}</span></div>`;
  }
  return `<div class="collecte-field"><label for="val_${field.champ}">${field.label}</label>${inputHtml}</div>`;
}

async function saveSection(idx) {
  const saveBtn  = document.getElementById('saveBtn');
  const feedback = document.getElementById('saveFeedback');
  saveBtn.disabled = true; saveBtn.textContent = 'Sauvegarde…';

  COLLECTE_ONGLETS[idx].fields.forEach(field => {
    const valInput  = document.getElementById(`val_${field.champ}`);
    const unitInput = document.getElementById(`unit_${field.champ}`);
    if (!valInput) return;
    const unite = field.unite === 'libre' ? (unitInput ? unitInput.value.trim() : '') : (field.unite || '');
    collecteData[field.champ] = { valeur: valInput.value.trim(), unite };
  });

  const rows = [];
  COLLECTE_ONGLETS.forEach(o => {
    o.fields.forEach(field => {
      const d = collecteData[field.champ];
      if (!d || d.valeur === '') return;
      rows.push({ fdes_id: currentCollecteId, onglet: o.onglet, champ: field.champ, valeur: d.valeur, unite: d.unite });
    });
  });

  const { error: delError } = await db.from('fdes_collecte').delete().eq('fdes_id', currentCollecteId);
  if (delError) { console.error(delError.message); saveBtn.disabled=false; saveBtn.textContent='Sauvegarder'; return; }

  if (rows.length > 0) {
    const { error: insError } = await db.from('fdes_collecte').insert(rows);
    if (insError) { console.error(insError.message); saveBtn.disabled=false; saveBtn.textContent='Sauvegarder'; return; }
  }

  saveBtn.disabled = false; saveBtn.textContent = 'Sauvegarder';
  feedback.classList.add('show');
  setTimeout(() => { feedback.classList.remove('show'); backToGridRight(); }, 1200);
}

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════

function render() {
  const tbody       = document.getElementById('tbody');
  const empty       = document.getElementById('empty');
  const stats       = document.getElementById('stats');
  const progressRow = document.getElementById('progressRow');

  const counts = [0,0,0,0,0,0];
  fdes.forEach(f => counts[f.statut]++);

  stats.innerHTML = counts.map((c,i) =>
    `<div class="stat-card"><div class="num" style="color:var(--s${i})">${c}</div><div class="label">${STAT_LABELS[i]}</div></div>`
  ).join('');

  if (fdes.length > 0) {
    progressRow.style.display = '';
    const pct = Math.round((counts[5] / fdes.length) * 100);
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
  } else { progressRow.style.display = 'none'; }

  if (fdes.length === 0) { tbody.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';

  tbody.innerHTML = fdes.map((f,i) => `
    <tr onclick="openFdes('${f.id}')">
      <td style="color:var(--text-muted);font-size:12px">${String(i+1).padStart(2,'0')}</td>
      <td style="font-weight:500">${escHtml(f.nom)}</td>
      <td style="color:var(--text-secondary);font-size:13px">${escHtml(f.bureau_etudes)||'<span style="color:var(--text-muted)">—</span>'}</td>
      <td onclick="event.stopPropagation()">
        <span class="status-badge s${f.statut}">
          <select class="status-select" onchange="changeStatus('${f.id}',this.value)">
            ${STATUSES.map((s,si)=>`<option value="${si}"${si===f.statut?' selected':''}>${s}</option>`).join('')}
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
    </tr>`).join('');
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

// ── Modal FDES ──
function openModal() {
  populateContactDropdowns();
  document.getElementById('overlay').classList.add('open');
  document.getElementById('inputName').value = '';
  document.getElementById('inputBureau').value = '';
  document.getElementById('inputVerif').value = '';
  document.getElementById('inputStatus').value = '0';
  document.getElementById('inputDeadline').value = '';
  document.getElementById('errName').classList.remove('show');
  setTimeout(() => document.getElementById('inputName').focus(), 50);
}

function closeModal() { document.getElementById('overlay').classList.remove('open'); }

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

async function addFdes() {
  const nom           = document.getElementById('inputName').value.trim();
  const bureau_etudes = document.getElementById('inputBureau').value;
  const verificateur  = document.getElementById('inputVerif').value;
  const statut        = parseInt(document.getElementById('inputStatus').value);
  const deadline      = document.getElementById('inputDeadline').value;
  const err           = document.getElementById('errName');

  if (!nom) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const ok = await createFdes(nom, statut, deadline, bureau_etudes, verificateur);
  if (ok) { await loadFdes(); closeModal(); }
}

// ── Raccourcis clavier ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('overlayContact').classList.contains('open')) closeContactModal();
    else if (document.getElementById('overlay').classList.contains('open')) closeModal();
    else if (currentOngletIdx !== null) backToGridRight();
    else if (currentCollecteId !== null) closeFdes();
  }
});

// ── Init ──
(async () => {
  await loadContacts();
  populateContactDropdowns();
  await loadFdes();
})();
