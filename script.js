const PROVINCE = ["AG", "AL", "AN", "AO", "AR", "AP", "AT", "AV", "BA", "BT", "BL", "BN", "BO", "BR", "BS", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE", "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU", "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV"];

const defaultSchema = {
    "AUTO": { icon: "🚗", sub: ["Carrozzeria", "Elettrauto", "Gommista", "Meccanico"], subSub: {} },
    "BAR/TABACCHI": { icon: "☕", sub: ["Bar", "Tabaccheria"], subSub: {} },
    "BRICOLAGE": { icon: "🛠️", sub: ["Ferramenta"], subSub: {} },
    "CASA (PROF.)": { icon: "🏠", sub: ["Idraulico", "Elettricista", "Muratore"], subSub: {} },
    "CENTRI COMM.": { icon: "🏬", sub: ["Supermerkato"], subSub: {} },
    "ESTETICA": { icon: "💅", sub: ["Parrucchiere", "Centro Estetica"], subSub: {} },
    "GARDEN": { icon: "🌻", sub: ["Vivai"], subSub: {} },
    "NEGOZI": { icon: "🛍️", sub: ["Abbigliamento", "Scarpe / Borse", "Gioielleria", "Animali"], subSub: {} },
    "SALUTE": { icon: "🏥", sub: ["Centro Diagnostico", "Farmacia", "Laboratorio di analisi", "Medico Mutua / Specialista", "Ospedale", "Veterinario"], subSub: {} },
    "RISTORANTI": {
        icon: "🍴",
        sub: ["Ristorante Classico / Pizzeria", "Etnico", "Osteria / Trattoria", "Agriturismo", "Vegetariano / Vegano", "Pub / Birreria", "Altro"],
        subSub: { "Etnico": ["Cinese", "Giapponese", "Asia", "Africa", "EstEuropa", "Altro"] }
    }
};

let schema = JSON.parse(localStorage.getItem('app_schema')) || defaultSchema;
let contacts = JSON.parse(localStorage.getItem('app_contacts')) || [];
let curCat = ""; let curSub = "";

document.addEventListener('DOMContentLoaded', () => {
    // PROTEZIONE OSPITI: Nascondi tasti se non c'è ?admin=1 nell'URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') !== '1') {
        document.querySelectorAll('button[onclick*="openManage"], button[onclick*="openAddForm"], .footer-left').forEach(el => el.style.display = 'none');
        const h1 = document.querySelector('h1');
        if(h1) h1.innerText = "🗂️ Numeri Utili - Ospiti";
    }

    renderMainGrid();
    initTimetable();
    const pSel = document.getElementById('f-prov');
    if (pSel) PROVINCE.forEach(p => pSel.innerHTML += `<option value="${p}">${p}</option>`);
});

function renderMainGrid() {
    const g = document.getElementById('view-main'); if (!g) return;
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
    refreshSubButtons();
    document.getElementById('records-list').innerHTML = `<div class="select-prompt">Seleziona una sottocategoria.</div>`;
}

function refreshSubButtons() {
    const cont = document.getElementById('sub-buttons-container'); if (!cont) return;
    cont.innerHTML = "";
    schema[curCat].sub.sort().forEach(s => {
        const b = document.createElement('button');
        b.className = "btn-top";
        b.innerText = s;
        b.onclick = () => { curSub = s; renderRecords(); };
        cont.appendChild(b);
    });
}

function renderRecords() {
    const list = document.getElementById('records-list');
    const filtered = contacts.filter(c => c.cat === curCat && c.sub === curSub);
    list.innerHTML = filtered.length ? "" : "Nessun contatto trovato.";
    filtered.forEach(c => {
        list.innerHTML += `<div class="record-card"><h3>${c.nome}</h3><p>📞 ${c.tel || c.cell}</p><p>📍 ${c.via}, ${c.loc}</p></div>`;
    });
}

function openAddForm() {
    resetForm();
    const overlay = document.getElementById('form-overlay');
    if (overlay) overlay.classList.remove('hidden');

    const sel = document.getElementById('f-cat');
    if (sel) {
        sel.innerHTML = "<option value=''>Scegli...</option>";
        // Usiamo 'schema' che è la variabile che contiene i tuoi dati
        Object.keys(schema).sort().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            sel.appendChild(opt);
        });
    }
}

function closeAddForm() { document.getElementById('form-overlay').classList.add('hidden'); }
function goHome() { document.getElementById('view-main').classList.remove('hidden'); document.getElementById('view-detail').classList.add('hidden'); }
function openSearchPanel() { document.getElementById('search-overlay').classList.remove('hidden'); }
function closeSearchPanel() { document.getElementById('search-overlay').classList.add('hidden'); }
function openManage() { document.getElementById('manage-overlay').classList.remove('hidden'); }
function closeManage() { document.getElementById('manage-overlay').classList.add('hidden'); }
function initTimetable() { /* ... tua funzione timetable ... */ }
function resetForm() { document.querySelectorAll('#form-overlay input').forEach(i => i.value = ""); }

function saveContact() {
    const newC = {
        cat: document.getElementById('f-cat').value,
        sub: document.getElementById('f-subcat').value,
        nome: document.getElementById('f-nome').value,
        tel: document.getElementById('f-tel').value,
        loc: document.getElementById('f-loc').value,
        via: document.getElementById('f-via').value
    };
    contacts.push(newC);
    localStorage.setItem('app_contacts', JSON.stringify(contacts));
    alert("Contatto Salvato!");
    closeAddForm();
    renderRecords();
}
// Fa funzionare il tasto RICERCA
function openSearchPanel() {
    const sOverlay = document.getElementById('search-overlay');
    if (sOverlay) sOverlay.classList.remove('hidden');
}

// Chiude il pannello ricerca
function closeSearchPanel() {
    const sOverlay = document.getElementById('search-overlay');
    if (sOverlay) sOverlay.classList.add('hidden');
}

// Fa funzionare il tasto GOOGLE (apre la barra laterale)
function toggleGoogleSearch() {
    const sidebar = document.getElementById('sidebar');
    const iframe = document.getElementById('google-iframe');
    if (sidebar) {
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open') && iframe.src === "about:blank") {
            iframe.src = "https://www.google.com/search?igu=1";
        }
    }
}
