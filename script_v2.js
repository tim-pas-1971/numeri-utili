const PROVINCE = ["AG", "AL", "AN", "AO", "AR", "AP", "AT", "AV", "BA", "BT", "BL", "BN", "BO", "BR", "BS", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE", "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU", "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV"];

const defaultSchema = {
    "AUTO": { icon: "🚗", sub: ["Elettrauto / Gommista / Meccanico", "Carrozzeria"] },
    "BAR / TABACCHI": { icon: "☕", sub: ["Bar", "Bar / Tabacchi", "Tabaccheria"] },
    "B&B / AFFITTACAMERE / ALBERGHI": { icon: "🛌", sub: ["B&B", "Affittacamere", "Alberghi"] },
    "BRICOLAGE / FAI DA TE": { icon: "🛠️", sub: ["FAI DA TE"] },
    "CASA (PROF.)": { icon: "🏠", sub: ["Amministrazione", "Antennista", "Elettricista", "Fabbro", "Falegname", "Idraulico", "Imbianchino", "Muratore", "Pavimentista / Piastrellista", "Tecnico Caldaia", "Tecnico Pc"] },
    "CENTRI COMM.": { icon: "🏬", sub: ["Supermercato", "Centro Commerciale"] },
    "ESTETICA": { icon: "💅", sub: ["Parrucchiere", "Estetista", "Solarium", "Unghie"] },
    "GARDEN": { icon: "🌻", sub: ["Vivai", "Fiorista", "Manutenzione Verde"] },
    "NEGOZI": { icon: "🛍️", sub: ["Abbigliamento", "Alimentari", "Scarpe", "Gioielleria", "Animali", "Ottica", "Casalinghi"] },
    "SALUTE": { icon: "🏥", sub: ["Diagnostica", "Farmacia", "Medico Mutua", "Medico Specialista", "Ospedale", "Veterinario"], subSub: { "Medico Specialista": ["Oculista", "Altro"] } },
    "RISTORANTI": { icon: "🍴", sub: ["Ristorante Classico / Pizzeria", "Etnico", "Osteria / Trattoria", "Agriturismo", "Vegetariano / Vegano", "Pub / Birreria", "Altro"], subSub: { "Ristorante Classico / Pizzeria": ["Carne", "Pesce", "Pizza"], "Etnico": ["Cinese", "Fusion", "Giapponese", "Asia", "Africa", "EstEuropa", "Altro"] } }
};

// --- CONFIGURAZIONE SUPABASE ---
const SUPABASE_URL = 'https://zcicgivsmamljqwbnfdx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zmIerEkMsUbLkyZcoY9ozg_tFb53oL_...'; // <-- Inserisci qui la tua Publishable Key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let schema = defaultSchema;
let contacts = [];
let isAdmin = false;

// --- GESTIONE DATI (SUPABASE + LOCALSTORAGE) ---
async function loadContacts() {
    try {
        // Tenta di caricare dal database Supabase (tabella 'contatti', colonna 'data')
        const { data, error } = await supabaseClient
            .from('contatti')
            .select('*');

        if (error) throw error;

        if (data && data.length > 0 && data[0].data) {
            // Se troviamo i dati su Supabase, li usiamo e aggiorniamo la cache locale
            contacts = data[0].data;
            saveContactsToLocalStorage(contacts);
        } else {
            // Fallback sul localStorage se Supabase è vuoto
            contacts = loadInitialContactsFromStorage();
        }
    } catch (e) {
        console.warn("Connessione cloud non disponibile, uso i dati locali:", e);
        contacts = loadInitialContactsFromStorage();
    }
    renderMain();
}

async function saveContacts(newData) {
    contacts = newData;
    saveContactsToLocalStorage(contacts);

    try {
        // Sincronizzazione su Supabase salvando l'intero array nella colonna 'data'
        // Verifichiamo prima se esiste già una riga nella tabella 'contatti'
        const { data: existing, error: fetchError } = await supabaseClient
            .from('contatti')
            .select('id');

        if (fetchError) throw fetchError;

        if (existing && existing.length > 0) {
            // Aggiorna la riga esistente
            const { error: updateError } = await supabaseClient
                .from('contatti')
                .update({ data: contacts })
                .eq('id', existing[0].id);
            if (updateError) throw updateError;
        } else {
            // Inserisce la prima riga se la tabella è vuota
            const { error: insertError } = await supabaseClient
                .from('contatti')
                .insert([{ data: contacts }]);
            if (insertError) throw insertError;
        }
    } catch (e) {
        console.error("Errore durante il salvataggio su Supabase:", e);
    }
}

function loadInitialContactsFromStorage() {
    const localData = localStorage.getItem("numeri_utili_contacts");
    if (localData) {
        try {
            return JSON.parse(localData);
        } catch (e) {
            console.error("Errore lettura LocalStorage:", e);
        }
    }
    return [];
}

function saveContactsToStorage(data) {
    localStorage.setItem("numeri_utili_contacts", JSON.stringify(data));
}

// --- FORMATTAZIONE ---
function formattaTelefono(tel) {
    if (!tel) return '';
    return tel.replace(/[^0-9+]/g, '');
}

function formattaUrl(url) {
    if (!url) return '';
    let u = url.trim();
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
        return 'https://' + u;
    }
    return u;
}

// --- AVVIO APPLICAZIONE ---
document.addEventListener("DOMContentLoaded", async () => {
    isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
    
    // Caricamento asincrono dei contatti (Cloud + Locale)
    await loadorticetti = loadContacts();

    // Gestione select province se presente
    const ps = document.getElementById('f-prov');
    if(ps) {
        ps.innerHTML = '<option value="">Prov.</option>'; 
        PROVINCE.forEach(p => {
            ps.innerHTML += `<option value="${p}">${p}</option>`;
        });
    }
});

function renderMain() {
    const g = document.getElementById('view-main'); 
    if(!g) return;
    g.innerHTML = "";
    
    Object.keys(schema).sort().forEach(c => {
        const count = contacts.filter(item => item.cat === c).length;
        const badge = count > 0 ? `<span class="badge-count" style="background:#d9534f; color:white; padding:2px 8px; border-radius:10px; font-size:0.8em; position:absolute; top:10px; right:10px;">${count}</span>` : "";
        
        g.innerHTML += `
            <div class="card-cat" onclick="openCat('${c}')" style="background:white; padding:20px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer; position:relative; text-align:center; transition:0.2s;">
                ${badge}
                <div style="font-size:2em; margin-bottom:8px;">${schema[c].icon}</div>
                <b style="color:#003366; font-size:1.1em;">${c}</b>
            </div>`;
    });
}

function openCat(c) {
    document.getElementById('view-main').classList.add('hidden');
    const detailView = document.getElementById('view-detail');
    if(detailView) detailView.classList.remove('hidden');
    
    const titleDetail = document.getElementById('title-detail');
    if(titleDetail) titleDetail.innerText = c;
    
    const sc = document.getElementById('sub-buttons-container'); 
    if(sc) sc.innerHTML = "";
    
    const row2 = document.createElement('div');
    Object.assign(row2.style, { display: "flex", flexWrap: "wrap", gap: "6px", background: "#003366", padding: "10px", borderRadius: "8px", width: "100%", boxSizing: "border-box" });
    
    const row3 = document.createElement('div');
    row3.id = "subsub-container"; 
    Object.assign(row3.style, { display: "none", width: "100%", marginTop: "5px" });

    const btnAll = document.createElement('button');
    btnAll.innerText = "🌟 TUTTI";
    Object.assign(btnAll.style, { border: "2px solid #fff", background: "#f39c12", color: "white", padding: "8px 12px", cursor: "pointer", fontWeight: "bold", borderRadius: "5px" });
    
    btnAll.onclick = () => {
        row3.style.display = "none";
        renderAllFromCat(c); 
    };
    row2.appendChild(btnAll);

    if(schema[c] && schema[c].sub) {
        schema[c].sub.sort().forEach(s => {
            const btn = document.createElement('button'); 
            btn.innerText = s;
            Object.assign(btn.style, { border: "none", background: "transparent", color: "white", padding: "8px 12px", cursor: "pointer", fontWeight: "bold", borderRadius: "5px" });
            btn.onclick = () => {
                renderRecs(c, s); 
            };
            row2.appendChild(btn);
        });
    }
    if(sc) { sc.appendChild(row2); sc.appendChild(row3); }

    renderAllFromCat(c);
}

function renderRecs(c, s) {
    const list = document.getElementById('records-list');
    if(!list) return;

    let fil = contacts.filter(x => x.cat === c && x.sub === s);
    fil.sort((a, b) => (parseFloat(a.km) || 0) - (parseFloat(b.km) || 0));

    list.innerHTML = fil.length ? "" : "<p style='padding:20px;'>Nessun contatto salvato in questa sottocategoria.</p>";

    fil.forEach(x => {
        const mapUrl = `https://www.google.it/maps/dir/Via+Cascina+Comune+24,+Pregnana+Milanese/${encodeURIComponent(x.via || '')}+${encodeURIComponent(x.loc || '')}`;
        
        list.innerHTML += `
            <div style="background:white; padding:20px; border-radius:15px; border-left:6px solid #003366; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-bottom:15px; position:relative;">
                <b style="font-size:1.2em; color:#003366">${x.nome}</b><br>
                <div style="margin-top:5px; font-size:14px;">📍 ${x.via || ''}, ${x.loc || ''}</div>
                <div style="margin-top:8px; font-size:14px;">📞 ${x.tel || ''}</div>
                <div style="margin-top:12px;"><button onclick="window.open('${mapUrl}')" style="background:#003366; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">🗺️ Mappa</button></div>
            </div>`;
    });
}

function renderAllFromCat(categoria) {
    const list = document.getElementById('records-list');
    if(!list) return;

    let fil = contacts.filter(x => x.cat === categoria);
    fil.sort((a, b) => (parseFloat(a.km) || 0) - (parseFloat(b.km) || 0));

    list.innerHTML = fil.length ? "" : "<p style='padding:20px;'>Nessun contatto salvato in questa sezione.</p>";

    fil.forEach(x => {
        const mapUrl = `https://www.google.it/maps/dir/Via+Cascina+Comune+24,+Pregnana+Milanese/${encodeURIComponent(x.via || '')}+${encodeURIComponent(x.loc || '')}`;
        
        list.innerHTML += `
            <div style="background:white; padding:20px; border-radius:15px; border-left:6px solid #28a745; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-bottom:15px; position:relative;">
                <b style="font-size:1.2em; color:#003366">${x.nome}</b><br>
                <div style="margin-top:5px; font-size:14px;">📍 ${x.via || ''}, ${x.loc || ''}</div>
                <div style="margin-top:8px; font-size:14px;">📞 ${x.tel || ''}</div>
                <div style="margin-top:12px;"><button onclick="window.open('${mapUrl}')" style="background:#003366; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">🗺️ Mappa</button></div>
            </div>`;
    });
}

// --- ESPORTAZIONE CON DATA ---
function exportJSON() {
    const oggi = new Date().toISOString().split('T')[0];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `Numeri_Utili _ backup contatti ${oggi}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// --- IMPORTAZIONE ---
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                await saveContacts(data); // Salva sul Cloud e in locale
                renderMain();
                alert(`Ripristino completato e sincronizzato! Caricati ${contacts.length} contatti.`);
            } else {
                alert("Il file JSON non è valido.");
            }
        } catch (err) {
            alert("Errore nella lettura: " + err.message);
        }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
}
