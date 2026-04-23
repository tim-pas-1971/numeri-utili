// --- CONFIGURAZIONE CLOUD SUPABASE ---
const SUPABASE_URL = 'https://zcicgivsmamljqwbnfdx.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaWNnaXZzbWFtbGpxd2JuZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTgxODgsImV4cCI6MjA5MjE3NDE4OH0.CkjpBJ4uGB2ocEsjFoJFWTpyap249D1EGDP7Lc4pKb0'; 

async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    return await response.json();
}

// --- DATI E CONFIGURAZIONE (ORIGINALE TIZIANA) ---
const PROVINCE = ["AG", "AL", "AN", "AO", "AR", "AP", "AT", "AV", "BA", "BT", "BL", "BN", "BO", "BR", "BS", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE", "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU", "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV"];
const defaultSchema = {
    "AUTO": { icon: "🚗", sub: ["Carrozzeria", "Elettrauto", "Gommista", "Meccanico"], subSub: {} },
    "BAR/TABACCHI": { icon: "☕", sub: ["Bar", "Tabaccheria"], subSub: {} },
    "BRICOLAGE": { icon: "🛠️", sub: ["Ferramenta"], subSub: {} },
    "CASA (PROF.)": { icon: "🏠", sub: ["Idraulico", "Elettricista", "Muratore"], subSub: {} },
    "CENTRI COMM.": { icon: "🏬", sub: ["Supermerkato"], subSub: {} },
    "ESTETICA": { icon: "💅", sub: ["Parrucchiere", "Centro Estetica"], subSub: {} },
    "GARDEN": { icon: "🌻", sub: ["Vivai"], subSub: {} },
    "NEGOZI": { icon: "🛍️", sub: ["Abbigliamento"], subSub: {} },
    "SALUTE": { icon: "🏥", sub: ["Medico", "Farmacia"], subSub: {} },
    "RISTORANTI": {
        icon: "🍴",
        sub: ["Ristorante Classico / Pizzeria", "Etnico", "Osteria / Trattoria", "Agriturismo", "Vegetariano / Vegano", "Pub / Birreria", "Altro"],
        subSub: { "Etnico": ["Cinese", "Giapponese", "Asia", "Africa", "EstEuropa", "Altro"] }
    }
};

const START_ADDRESS = "Via Cascina Comune, 24, Pregnana Milanese";
let schema = JSON.parse(localStorage.getItem('app_schema')) || defaultSchema;
let contacts = []; 
let curCat = ""; let curSub = ""; let curSS = "";

document.addEventListener('DOMContentLoaded', async () => {
    renderMainGrid();
    initTimetable();
    await loadContacts();
    const pSel = document.getElementById('f-prov');
    if (pSel) PROVINCE.forEach(p => pSel.innerHTML += `<option value="${p}">${p}</option>`);
});

async function loadContacts() {
    try {
        const data = await supabaseRequest('contacts?select=*');
        if (data && !data.error) { contacts = data; if (!curCat) renderMainGrid(); else selectSub(curSub); }
    } catch (err) { console.error("Cloud Error:", err); }
}

// --- NAVIGAZIONE ---
function goHome() { curCat = ""; curSub = ""; curSS = ""; document.getElementById('view-main').classList.remove('hidden'); document.getElementById('view-detail').classList.add('hidden'); renderMainGrid(); }
function renderMainGrid() {
    // === NUOVO SISTEMA DI SICUREZZA TOTALE PER OSPITI ===
    
    // 1. ELIMINA I TASTI GESTISCI E RESET (anche se scritti in modo diverso)
    document.querySelectorAll('button').forEach(btn => {
        const testo = btn.innerText.toUpperCase();
        if (testo.includes('GESTISCI') || testo.includes('RESET')) {
            btn.remove(); 
        }
    });

    // 2. ELIMINA IL TASTO AGGIUNGI (il cerchietto con il +)
    const btnAdd = document.querySelector('.btn-add') || document.querySelector('button[onclick*="openAddForm"]');
    if (btnAdd) btnAdd.remove();

    // 3. FORZA IL TITOLO IN ROSSO E AGGIORNA IL TESTO
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
        mainTitle.innerText = "NUMERI UTILI - Versione Ospite";
        mainTitle.style.color = "red";
    }

    // --- DISEGNO DELLA GRIGLIA CATEGORIE ---
    const g = document.getElementById('view-main'); if (!g) return;
    g.innerHTML = "";
    Object.keys(schema).sort().forEach(c => {
        g.innerHTML += `<div class="card-cat" onclick="openCategory('${c}')"><i>${schema[c].icon}</i><b>${c}</b></div>`;
    });
}
function openCategory(cat) {
    curCat = cat; 
    curSub = ""; 
    curSS = "";
    
    // Pulisce le schede della categoria precedente
    const listCont = document.getElementById('records-list');
    if (listCont) listCont.innerHTML = "";
    
    // Cambia visualizzazione
    document.getElementById('view-main').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    
    // Aggiorna il titolo con l'icona (es: 🏥 SALUTE)
    const titleElem = document.getElementById('title-detail') || document.getElementById('cat-title');
    if (titleElem && schema[cat]) {
        titleElem.innerText = (schema[cat].icon || "") + " " + cat;
    }

    refreshSubButtons();
}
function refreshSubButtons() {
    const cont = document.getElementById('sub-buttons-container'); if (!cont) return;
    cont.innerHTML = "";
    const subDiv = document.createElement('div'); subDiv.id = "sub-buttons";
    schema[curCat].sub.sort().forEach(s => {
        const b = document.createElement('button');
        b.className = "btn-top" + (s === curSub ? " active" : "");
        b.innerText = s; b.onclick = () => selectSub(s);
        subDiv.appendChild(b);
    });
    cont.appendChild(subDiv);
    if (curSub && schema[curCat].subSub?.[curSub]) {
        const ssDiv = document.createElement('div'); ssDiv.style.cssText = "margin:10px 0; padding:10px; background:#e9ecef; border-radius:8px;";
        schema[curCat].subSub[curSub].sort().forEach(ss => {
            const bSS = document.createElement('button');
            bSS.className = "btn-top" + (ss === curSS ? " active" : "");
            bSS.style.background = ss === curSS ? "#f39c12" : "#28a745";
            bSS.innerText = ss; bSS.onclick = () => selectSS(ss);
            ssDiv.appendChild(bSS);
        });
        cont.appendChild(ssDiv);
    }
}
function selectSub(s) { 
    curSub = s; curSS = ""; refreshSubButtons(); 
    renderRecords(contacts.filter(c => c.cat === curCat && c.sub === curSub)); 
}

function selectSS(ss) { 
    curSS = ss; refreshSubButtons(); 
    renderRecords(contacts.filter(c => c.cat === curCat && c.sub === curSub && c.ss === curSS)); 
}

function renderRecords(list) {
    const cont = document.getElementById('records-list'); if (!cont) return;
    cont.innerHTML = "";
    if (list.length === 0) { cont.innerHTML = `<div class="select-prompt">Nessun nominativo trovato.</div>`; return; }
    
    list.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(c => {
        const d = document.createElement('div'); d.className = "card-record";
        const urlMappa = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(START_ADDRESS)}&destination=${encodeURIComponent(c.via + ',' + c.loc + ',' + c.prov)}`;
        
        d.innerHTML = `
            <div class="card-body" onclick="viewRecordOnly('${c.id}')">
                <img src="${c.foto || ''}" class="card-img" onerror="this.src='https://via.placeholder.com/300x150?text=Anteprima'">
                <div class="card-title">${c.nome}</div>
                <div style="font-size:0.85rem; color:#666;">${c.sub} ${c.ss ? ' > ' + c.ss : ''}</div>
                <div class="card-km">🚗 ${c.km || '---'} km</div>
            </div>
            <div style="display:flex; justify-content:center; padding:10px; background:#f8f9fa; border-top:1px solid #eee;">
                <button onclick="window.open('${urlMappa}','_blank')" style="width:90%; padding:10px; cursor:pointer; background:#28a745; color:white; border:none; border-radius:5px;">Visualizza Mappa 🗺️</button>
            </div>`;
        cont.appendChild(d);
    });
}
// --- FIX GOOGLE 1/3 e APP 2/3 ---
function toggleGoogleSearch() {
    const side = document.getElementById('sidebar');
    const iframe = document.getElementById('google-iframe');
    const app = document.getElementById('app-container') || document.querySelector('.main-wrapper');
    const form = document.getElementById('form-overlay');

    if (side.classList.contains('hidden') || side.style.display === 'none') {
        // 1. CARICHIAMO GOOGLE
        iframe.src = "https://www.google.it/webhp?igu=1";
        
        // 2. MOSTRIAMO LA SIDEBAR (La colonna a destra)
        side.classList.remove('hidden');
        side.style.cssText = "display:block !important; position:fixed; right:0; top:0; width:33% !important; height:100vh !important; z-index:1000; background:white; border-left:2px solid #ccc; overflow:hidden;";
        
        // 3. FORZIAMO L'IFRAME (Google) A ESSERE GRANDE AL 100%
        iframe.style.cssText = "width:100% !important; height:100% !important; border:none; display:block !important; min-height:100vh !important;";
        
        // 4. RESTRINGIAMO L'APP AI 2/3 DI SINISTRA
        if(app) {
            app.style.width = "67% !important";
            app.style.transition = "0.3s";
        }
        
        // 5. ALLINEIAMO IL FORM AGGIUNGI SUI 2/3
        if(form) { 
            form.style.width = "67%"; 
            form.style.left = "0"; 
            form.style.transform = "none";
        }
    } else {
        // CHIUDIAMO TUTTO E TORNIAMO A TUTTO SCHERMO
        side.classList.add('hidden');
        side.style.display = 'none';
        if(app) app.style.width = "100%";
        if(form) { 
            form.style.width = "100%"; 
            form.style.left = "50%"; 
            form.style.transform = "translateX(-50%)";
        }
    }
}

// --- FIX GESTISCI (Sottocategorie e tasti) ---
function openManage() { document.getElementById('manage-overlay').classList.remove('hidden'); renderManageTree(); }
function closeManage() { document.getElementById('manage-overlay').classList.add('hidden'); }
function renderManageTree() {
    const tree = document.getElementById('manage-tree'); if (!tree) return;
    tree.innerHTML = "";
    Object.keys(schema).sort().forEach(cat => {
        let h = `<div class="manage-node"><div class="tree-row"><strong>${cat}</strong><div><button onclick="renameItem('${cat}')">✏️</button> <button onclick="delItem('${cat}')">🗑️</button></div></div>`;
        schema[cat].sub.sort().forEach(sub => {
            h += `<div class="tree-sub"><div class="tree-row"><span>- ${sub}</span><div><button onclick="renameItem('${cat}','${sub}')">✏️</button> <button onclick="delItem('${cat}','${sub}')">🗑️</button> <button onclick="addSubSub('${cat}','${sub}')">++</button></div></div>`;
            if (schema[cat].subSub?.[sub]) schema[cat].subSub[sub].sort().forEach(ss => h += `<div class="tree-ss"><div class="tree-row"><span>-- ${ss}</span><div><button onclick="renameItem('${cat}','${sub}','${ss}')">✏️</button> <button onclick="delItem('${cat}','${sub}','${ss}')">🗑️</button></div></div></div>`);
            h += `</div>`;
        });
        h += `<div style="padding-left:30px;"><input type="text" id="in-${cat}"> <button onclick="addSub('${cat}')">+</button></div></div>`;
        tree.innerHTML += h;
    });
}

// --- FIX RICERCA (Tendine SubSub) ---
function openSearchPanel() {
    document.getElementById('search-overlay').classList.remove('hidden');
    const sel = document.getElementById('s-cat'); if (sel) {
        sel.innerHTML = "<option value=''>Tutte...</option>";
        Object.keys(schema).sort().forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`);
    }
}
function closeSearchPanel() { document.getElementById('search-overlay').classList.add('hidden'); }
function updateSearchSubCats() {
    const c = document.getElementById('s-cat').value; const s = document.getElementById('s-subcat'); s.innerHTML = "<option value=''>Tutte</option>";
    if (schema[c]) schema[c].sub.sort().forEach(i => s.innerHTML += `<option value="${i}">${i}</option>`);
    updateSearchSubSubCats(); // Reset del livello 3
}
function updateSearchSubSubCats() {
    const c = document.getElementById('s-cat').value; const sub = document.getElementById('s-subcat').value;
    const gr = document.getElementById('s-ss-group'); const s = document.getElementById('s-subsubcat');
    if (schema[c]?.subSub?.[sub]) { gr.classList.remove('hidden'); s.innerHTML = "<option value=''>Tutte</option>"; schema[c].subSub[sub].sort().forEach(ss => s.innerHTML += `<option value="${ss}">${ss}</option>`); } else gr?.classList.add('hidden');
}

// =========================================================
// SEZIONE GESTIONE SCHEDE, ORARI E CLOUD (VERSIONE FINALE)
// =========================================================

async function saveContact() {
    const id = document.getElementById('f-id').value;
    const orari = [];
    
    document.querySelectorAll('#timetable-input tr').forEach(tr => {
        const tms = tr.querySelectorAll('input[type="time"]');
        const chks = tr.querySelectorAll('input[type="checkbox"]');
        orari.push({ 
            m1: tms[0].value, m2: tms[1].value, 
            p1: tms[2].value, p2: tms[3].value, 
            chiusoM: chks[0].checked, 
            chiusoP: chks[1].checked 
        });
    });

    const c = { 
        cat: document.getElementById('f-cat').value, 
        sub: document.getElementById('f-subcat').value, 
        ss: document.getElementById('f-subsubcat')?.value || "", 
        nome: document.getElementById('f-nome').value, 
        tel: document.getElementById('f-tel').value, 
        cell: document.getElementById('f-cell').value, 
        via: document.getElementById('f-via').value, 
        loc: document.getElementById('f-loc').value, 
        prov: document.getElementById('f-prov').value, 
        km: document.getElementById('f-km').value, 
        foto: document.getElementById('f-foto').value,
        orari: orari 
    };

    try {
        if (id) {
            await supabaseRequest(`contacts?id=eq.${id}`, 'PATCH', c);
        } else {
            await supabaseRequest('contacts', 'POST', c);
        }
        await loadContacts(); 
        closeAddForm();
    } catch (err) { alert("Errore nel salvataggio Cloud."); }
}

// --- TASTI FUNZIONE: DUPLICA, SPOSTA, ELIMINA ---

async function duplicateRecord(id) {
    const o = contacts.find(x => String(x.id) === String(id));
    if (!o) return;
    const n = { ...o, nome: o.nome + " (Copia)" };
    delete n.id;
    await supabaseRequest('contacts', 'POST', n);
    await loadContacts();
}

function openMoveForm(id) {
    const c = contacts.find(x => String(x.id) === String(id));
    if (!c) return;
    document.getElementById('m-id').value = id;
    document.getElementById('move-info').innerText = `Sposta: ${c.nome}`;
    const s = document.getElementById('m-subcat');
    s.innerHTML = "";
    schema[c.cat].sub.sort().forEach(sub => s.innerHTML += `<option value="${sub}">${sub}</option>`);
    document.getElementById('move-overlay').classList.remove('hidden');
}

async function confirmMove() {
    const id = document.getElementById('m-id').value;
    const newSub = document.getElementById('m-subcat').value;
    const newSS = document.getElementById('m-subsubcat')?.value || "";
    await supabaseRequest(`contacts?id=eq.${id}`, 'PATCH', { sub: newSub, ss: newSS });
    await loadContacts();
    document.getElementById('move-overlay').classList.add('hidden');
}

async function deleteRecord(id) { 
    if (confirm("Eliminare definitivamente?")) { 
        await supabaseRequest(`contacts?id=eq.${id}`, 'DELETE'); 
        await loadContacts(); 
    } 
}

// --- FIX GOOGLE E RIDIMENSIONAMENTO ---

function toggleGoogleSearch() {
    const side = document.getElementById('sidebar');
    const iframe = document.getElementById('google-iframe');
    const app = document.getElementById('app-container') || document.querySelector('.main-wrapper');

    if (side.classList.contains('hidden') || side.style.display === 'none') {
        iframe.src = "https://www.google.it/webhp?igu=1";
        side.classList.remove('hidden');
        side.style.cssText = "display:block !important; position:fixed; right:0; top:0; width:33.3% !important; height:100vh !important; z-index:1000; background:white; border-left:2px solid #ccc;";
        iframe.style.cssText = "width:100% !important; height:100% !important; border:none;";
        if(app) app.style.cssText = "width:66.6% !important; margin:0 !important; float:left !important;";
    } else {
        side.classList.add('hidden');
        side.style.display = 'none';
        if(app) app.style.cssText = "width:100% !important; margin: 0 auto !important;";
    }
}

// --- VISUALIZZAZIONE ORARI IN LINEA ---

function initTimetable() { 
    const t = document.getElementById('timetable-input'); 
    if(t) {
        t.innerHTML = "";
        ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].forEach(g => {
            t.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 5px; min-width: 50px;"><b>${g}</b></td>
                <td style="padding: 10px 5px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span>M:</span>
                        <input type="time" style="width:70px">
                        <span>-</span>
                        <input type="time" style="width:70px">
                        <label style="display: flex; align-items: center; margin-left: 10px; cursor: pointer; white-space: nowrap;">
                            <input type="checkbox" style="margin-right: 4px;"> Chiuso
                        </label>
                    </div>
                </td>
                <td style="padding: 10px 5px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span>P:</span>
                        <input type="time" style="width:70px">
                        <span>-</span>
                        <input type="time" style="width:70px">
                        <label style="display: flex; align-items: center; margin-left: 10px; cursor: pointer; white-space: nowrap;">
                            <input type="checkbox" style="margin-right: 4px;"> Chiuso
                        </label>
                    </div>
                </td>
            </tr>`;
        });
    }
}

// --- APERTURA E MODIFICA SCHEDE ---

function viewRecordOnly(id) {
    const r = contacts.find(x => String(x.id) === String(id));
    if (!r) return;
    openAddForm();
    fillForm(r);
    document.getElementById('form-title').innerText = r.nome;
    document.getElementById('btn-save-main').classList.add('hidden');
    lockForm(true);
}

function editRecord(id) {
    const r = contacts.find(x => String(x.id) === String(id));
    if (!r) return;
    openAddForm();
    fillForm(r);
    document.getElementById('form-title').innerText = "Modifica: " + r.nome;
    document.getElementById('btn-save-main').classList.remove('hidden');
    lockForm(false);
}

function fillForm(c) {
    document.getElementById('f-id').value = c.id || "";
    document.getElementById('f-nome').value = c.nome || "";
    document.getElementById('f-cat').value = c.cat || "";
    updateFormSubCats();
    document.getElementById('f-subcat').value = c.sub || "";
    updateFormSubSubCats();
    if (c.ss) document.getElementById('f-subsubcat').value = c.ss;
    document.getElementById('f-tel').value = c.tel || "";
    document.getElementById('f-cell').value = c.cell || "";
    document.getElementById('f-via').value = c.via || "";
    document.getElementById('f-loc').value = c.loc || "";
    document.getElementById('f-prov').value = c.prov || "MI";
    document.getElementById('f-km').value = c.km || "";
    document.getElementById('f-foto').value = c.foto || "";
    
    if (c.orari) {
        const rows = document.querySelectorAll('#timetable-input tr');
        c.orari.forEach((o, i) => {
            if (rows[i]) {
                const tms = rows[i].querySelectorAll('input[type="time"]');
                const chks = rows[i].querySelectorAll('input[type="checkbox"]');
                if(tms.length >= 4) {
                    tms[0].value = o.m1 || ""; tms[1].value = o.m2 || ""; 
                    tms[2].value = o.p1 || ""; tms[3].value = o.p2 || "";
                }
                if(chks.length >= 2) {
                    chks[0].checked = o.chiusoM || false; 
                    chks[1].checked = o.chiusoP || false;
                }
            }
        });
    }
}

function lockForm(s) { document.querySelectorAll('#form-overlay input, #form-overlay select').forEach(i => i.disabled = s); }
function openAddForm() { resetForm(); document.getElementById('form-overlay').classList.remove('hidden'); lockForm(false); document.getElementById('btn-save-main').classList.remove('hidden'); const sel = document.getElementById('f-cat'); sel.innerHTML = "<option value=''>Scegli...</option>"; Object.keys(schema).sort().forEach(c => sel.innerHTML += `<option value="${c}">${c}</option>`); }
function closeAddForm() { document.getElementById('form-overlay').classList.add('hidden'); }
function resetForm() { document.getElementById('f-id').value = ""; document.querySelectorAll('#form-overlay input').forEach(i => i.value = ""); initTimetable(); }
function updateFormSubCats() { const c = document.getElementById('f-cat').value; const s = document.getElementById('f-subcat'); s.innerHTML = "<option value=''>Scegli...</option>"; if(schema[c]) schema[c].sub.sort().forEach(i => s.innerHTML += `<option value="${i}">${i}</option>`); }
function updateFormSubSubCats() { const c = document.getElementById('f-cat').value; const sub = document.getElementById('f-subcat').value; const gr = document.getElementById('f-ss-group'); const s = document.getElementById('f-subsubcat'); if(schema[c]?.subSub?.[sub]) { gr.classList.remove('hidden'); s.innerHTML = "<option value=''>Scegli...</option>"; schema[c].subSub[sub].sort().forEach(ss => s.innerHTML += `<option value="${ss}">${ss}</option>`); } else gr?.classList.add('hidden'); }
function closeMoveForm() { document.getElementById('move-overlay').classList.add('hidden'); }