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

// --- FUNZIONI DI FORMATTAZIONE TEL E SITO ---
function formattaTelefono(tel) {
    if (!tel) return '';
    return tel.replace(/[^0-9+]/g, '');
}

function formattaUrl(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

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
    renderCategoryContacts(cat);
}

function renderCategoryContacts(cat) {
    const list = document.getElementById('records-list');
    if (!list) return;

    let fil = contacts.filter(x => x.cat === cat);
    fil.sort((a, b) => (parseFloat(a.km) || 0) - (parseFloat(b.km) || 0));

    list.innerHTML = fil.length ? "" : "<p style='padding:20px;'>Nessun contatto salvato in questa sezione.</p>";

    fil.forEach(x => {
        const index = contacts.indexOf(x);
        const mapUrl = `https://www.google.it/maps/dir/Via+Cascina+Comune+24,+Pregnana+Milanese/${encodeURIComponent(x.via || '')}+${encodeURIComponent(x.loc || '')}`;
        const percorsoInfo = x.ss ? `${x.sub} > ${x.ss}` : `${x.sub || ''}`;
        
        const telFisso = formattaTelefono(x.tel);
        const telCell = formattaTelefono(x.cell);
        const sitoUrl = formattaUrl(x.sito);

        const adminButtons = (new URLSearchParams(window.location.search).get('admin') === '1') ? `
            <button onclick="editContact(${index})" title="Modifica">📝</button>
            <button onclick="duplicateContact(${index})" title="Duplica">📄</button>
            <button onclick="deleteContact(${index})" title="Elimina">🗑️</button>
        ` : '';

        list.innerHTML += `
            <div style="background:white; padding:20px; border-radius:15px; border-left:6px solid #003366; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-bottom:15px; cursor:pointer; position:relative;" onclick="showFullDetails(${index})">
                <div style="font-size:0.75em; color:#888; text-transform:uppercase; margin-bottom:5px;">${percorsoInfo}</div>
                ${x.foto ? `<img src="${x.foto}" style="width:100%; height:120px; object-fit:cover; border-radius:10px; margin:10px 0;">` : ''}
                <b style="font-size:1.2em; color:#003366">${x.nome}</b><br>
                
                <div style="margin-top:5px; font-size:14px;">📍 ${x.via || ''}, ${x.loc || ''}</div>
                
                <!-- Chiamata rapida telefono fisso e cellulare -->
                <div style="margin-top:8px; font-size:14px; display:flex; gap:10px; flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${telFisso ? `<a href="tel:${telFisso}" style="color:#003366; text-decoration:none; font-weight:bold; background:#eef6ff; padding:4px 8px; border-radius:6px; border:1px solid #d1e3f8;">📞 ${x.tel}</a>` : ''}
                    ${telCell ? `<a href="tel:${telCell}" style="color:#28a745; text-decoration:none; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:6px; border:1px solid #c3e6cb;">📱 ${x.cell}</a>` : ''}
                </div>

                <div style="position:absolute; bottom:20px; right:20px; color:#d9534f; font-weight:bold; font-size:1.1em; display:flex; align-items:center; gap:5px;">
                    🚗 ${x.km || '0'} KM
                </div>

                <!-- Azioni (Mappa, Sito Web e Admin) -->
                <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;" onclick="event.stopPropagation()">
                    <button onclick="window.open('${mapUrl}')" title="Mappa">🗺️ Mappa</button>
                    ${sitoUrl ? `<a href="${sitoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;"><button style="background:#17a2b8; color:white; border:none; padding:6px 10px; border-radius:5px; cursor:pointer; font-weight:bold;" title="Visita Sito">🌐 Sito Web</button></a>` : ''}
                    ${adminButtons}
                </div>
            </div>`;
    });
}

function goHome() {
    document.getElementById('view-main').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
}

// --- TASTI E PANNELLI ---
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
