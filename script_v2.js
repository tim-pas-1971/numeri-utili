const PROVINCE = ["AG", "AL", "AN", "AO", "AR", "AP", "AT", "AV", "BA", "BT", "BL", "BN", "BO", "BR", "BS", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE", "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU", "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV"];

const schema = {
    "AUTO": { icon: "🚗", sub: ["Carrozzeria", "Elettrauto", "Gommista", "Meccanico"] },
    "BAR/TABACCHI": { icon: "☕", sub: ["Bar", "Tabaccheria"] },
    "BRICOLAGE": { icon: "🛠️", sub: ["Ferramenta"] },
    "CASA (PROF.)": { icon: "🏠", sub: ["Idraulico", "Elettricista", "Muratore"] },
    "CENTRI COMM.": { icon: "🏬", sub: ["Supermerkato"] },
    "ESTETICA": { icon: "💅", sub: ["Parrucchiere", "Centro Estetica"] },
    "GARDEN": { icon: "🌻", sub: ["Vivai"] },
    "NEGOZI": { icon: "🛍️", sub: ["Abbigliamento", "Scarpe / Borse", "Gioielleria", "Animali"] },
    "SALUTE": { icon: "🏥", sub: ["Centro Diagnostico", "Farmacia", "Laboratorio di analisi", "Medico Mutua / Specialista", "Ospedale", "Veterinario"] },
    "RISTORANTI": { icon: "🍴", sub: ["Ristorante Classico / Pizzeria", "Etnico", "Osteria / Trattoria", "Agriturismo", "Pub / Birreria", "Altro"] }
};

let contacts = JSON.parse(localStorage.getItem('app_contacts')) || [];
let curCat = "";

// --- INIZIO APP ---
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') !== '1') {
        document.querySelectorAll('button[onclick*="openManage"], button[onclick*="openAddForm"], button[onclick*="toggleGoogleSearch"]').forEach(el => el.style.display = 'none');
    }
    renderMainGrid();
    const pSel = document.getElementById('f-prov');
    if (pSel) PROVINCE.forEach(p => pSel.innerHTML += `<option value="${p}">${p}</option>`);
});

function renderMainGrid() {
    const g = document.getElementById('view-main');
    if (!g) return;
    g.innerHTML = "";
    Object.keys(schema).sort().forEach(c => {
        g.innerHTML += `<div class="card-cat" onclick="openCategory('${c}')"><i>${schema[c].icon}</i><b>${c}</b></div>`;
    });
}

function openCategory(cat) {
    curCat = cat;
    document.getElementById('view-main').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    document.getElementById('title-detail').innerText = cat;
}

function goHome() {
    document.getElementById('view-main').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
}

// --- TASTI ---
function openAddForm() {
    document.getElementById('form-overlay').classList.remove('hidden');
    const sel = document.getElementById('f-cat');
    sel.innerHTML = "<option value=''>Scegli...</option>";
    Object.keys(schema).sort().forEach(c => sel.innerHTML += `<option value="${c}">${c}</option>`);
}

function closeAddForm() { document.getElementById('form-overlay').classList.add('hidden'); }
function openSearchPanel() { document.getElementById('search-overlay').classList.remove('hidden'); }
function closeSearchPanel() { document.getElementById('search-overlay').classList.add('hidden'); }
function openManage() { document.getElementById('manage-overlay').classList.remove('hidden'); }
function closeManage() { document.getElementById('manage-overlay').classList.add('hidden'); }
function toggleGoogleSearch() { document.getElementById('sidebar').classList.toggle('open'); }

function updateFormSubCats() {
    const c = document.getElementById('f-cat').value;
    const s = document.getElementById('f-subcat');
    if (s && schema[c]) {
        s.innerHTML = "<option value=''>Scegli...</option>";
        schema[c].sub.sort().forEach(i => s.innerHTML += `<option value="${i}">${i}</option>`);
    }
}
