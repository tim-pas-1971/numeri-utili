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

let schema = defaultSchema;
let contacts = [];
let isAdmin = false;

// --- FUNZIONI DI FORMATTAZIONE TELEFONO E SITO WEB ---
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

// --- INIZIALIZZAZIONE FIREBASE ED APP ---
function init() {
    isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
    if (!isAdmin) {
        document.querySelectorAll('#admin-menu button:not([onclick*="Search"])')
                .forEach(b => b.style.display='none');
        const adminFooter = document.getElementById('admin-footer');
        if (adminFooter) adminFooter.style.display = 'none';
    }

    const ps = document.getElementById('f-prov');
    if(ps) {
        ps.innerHTML = '<option value="">Prov.</option>'; 
        PROVINCE.forEach(p => {
            ps.innerHTML += `<option value="${p}">${p}</option>`;
        });
    }

    buildOrari();

    db.ref('contacts').on('value', snapshot => {
        const val = snapshot.val();
        contacts = val ? Object.values(val) : [];
        renderMain();
    });

    db.ref('schema').on('value', snapshot => {
        const val = snapshot.val();
        schema = val ? val : defaultSchema;
        renderMain();
    });
}

function renderMain() {
    const g = document.getElementById('view-main'); 
    if(!g) return;
    g.innerHTML = "";
    
    Object.keys(schema).sort().forEach(c => {
        const count = contacts.filter(item => item.cat === c).length;
        const badge = count > 0 ? `<span class="badge-count">${count}</span>` : "";
        
        g.innerHTML += `
            <div class="card-cat" onclick="openCat('${c}')" style="position: relative;">
                ${badge}
                <i>${schema[c].icon}</i>
                <b>${c}</b>
            </div>`;
    });
}

function openCat(c) {
    document.getElementById('view-main').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    document.getElementById('title-detail').innerText = c;
    const sc = document.getElementById('sub-buttons-container'); 
    if(sc) sc.innerHTML = "";
    
    const row2 = document.createElement('div');
    Object.assign(row2.style, { display: "flex", flexWrap: "wrap", gap: "4px", background: "#003366", padding: "10px", borderRadius: "8px", width: "100%", boxSizing: "border-box" });
    
    const row3 = document.createElement('div');
    row3.id = "subsub-container"; row3.style.display = "none"; row3.style.width = "100%"; row3.style.marginTop = "5px";

    const btnAll = document.createElement('button');
    btnAll.innerText = "🌟 TUTTI";
    btnAll.className = "nav-btn-l2";
    Object.assign(btnAll.style, { border: "2px solid #fff", background: "#f39c12", color: "white", padding: "10px 15px", cursor: "pointer", fontWeight: "bold", fontSize: "0.9em", borderRadius: "5px" });
    
    btnAll.onclick = () => {
        document.querySelectorAll('.nav-btn-l2').forEach(b => b.style.background = "transparent");
        btnAll.style.background = "#f39c12";
        row3.style.display = "none";
        renderAllFromCat(c); 
    };
    row2.appendChild(btnAll);

    if(schema[c] && schema[c].sub) {
        schema[c].sub.sort().forEach(s => {
            const btn = document.createElement('button'); btn.innerText = s; btn.className = "nav-btn-l2";
            Object.assign(btn.style, { border: "none", background: "transparent", color: "white", padding: "10px 15px", cursor: "pointer", fontWeight: "bold", fontSize: "0.9em", borderRadius: "5px" });
            btn.onclick = () => {
                document.querySelectorAll('.nav-btn-l2').forEach(b => b.style.background = "transparent");
                btnAll.style.background = "transparent";
                btn.style.background = "#f0ad4e";
                renderRecs(c, s); 
                showSubSub(c, s, row3);
            };
            row2.appendChild(btn);
        });
    }
    if(sc) { sc.appendChild(row2); sc.appendChild(row3); }

    renderAllFromCat(c);
}

function showSubSub(c, s, container) {
    container.innerHTML = "";
    if (!schema[c].subSub || !schema[c].subSub[s]) { container.style.display = "none"; return; }
    container.style.display = "flex"; container.style.flexWrap = "wrap"; container.style.gap = "8px"; container.style.background = "#e9ecef"; container.style.padding = "10px"; container.style.borderRadius = "8px";
    schema[c].subSub[s].sort().forEach(ss => {
        const btn = document.createElement('button'); btn.innerText = ss; btn.className = "nav-btn-l3";
        Object.assign(btn.style, { border: "1px solid #1e7e34", background: "#28a745", color: "white", padding: "8px 15px", cursor: "pointer", borderRadius: "5px", fontSize: "0.85em", fontWeight: "600" });
        btn.onclick = () => {
            document.querySelectorAll('.nav-btn-l3').forEach(b => b.style.background = "#28a745");
            btn.style.background = "#0b4d1a"; renderRecs(c, s, ss);
        };
        container.appendChild(btn);
    });
}

function renderRecs(c, s, ss) {
    const list = document.getElementById('records-list');
    if(!list) return;

    let fil = contacts.filter(x => { 
        const m = x.cat === c && x.sub === s; 
        return ss ? (m && x.ss === ss) : m; 
    });

    fil.sort((a, b) => (parseFloat(a.km) || 0) - (parseFloat(b.km) || 0));

    list.innerHTML = fil.length ? "" : "<p style='padding:20px;'>Nessun contatto salvato.</p>";

    fil.forEach(x => {
        const index = contacts.indexOf(x);
        const mapUrl = `https://www.google.it/maps/dir/Via+Cascina+Comune+24,+Pregnana+Milanese/${encodeURIComponent(x.via || '')}+${encodeURIComponent(x.loc || '')}`;
        const percorsoInfo = x.ss ? `${x.sub} > ${x.ss}` : `${x.sub || ''}`;
        
        const telFisso = formattaTelefono(x.tel);
        const telCell = formattaTelefono(x.cell);
        const sitoUrl = formattaUrl(x.sito);

        const adminButtons = isAdmin ? `
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

                <!-- PULSANTI TELEFONO E CELLULARE PER CHIAMATA DIRETTA -->
                <div style="margin-top:8px; font-size:14px; display:flex; gap:10px; flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${telFisso ? `<a href="tel:${telFisso}" style="color:#003366; text-decoration:none; font-weight:bold; background:#eef6ff; padding:4px 8px; border-radius:6px; border:1px solid #d1e3f8; display:inline-block;">📞 ${x.tel}</a>` : ''}
                    ${telCell ? `<a href="tel:${telCell}" style="color:#28a745; text-decoration:none; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:6px; border:1px solid #c3e6cb; display:inline-block;">📱 ${x.cell}</a>` : ''}
                </div>

                <div style="position:absolute; bottom:20px; right:20px; color:#d9534f; font-weight:bold; font-size:1.1em; display:flex; align-items:center; gap:5px;">
                    🚗 ${x.km || '0'} KM
                </div>

                <!-- BOTTONI MAPPA, SITO WEB E ADMIN -->
                <div style="margin-top:12px; display:flex; gap:5px; align-items:center;" onclick="event.stopPropagation()">
                    <button onclick="window.open('${mapUrl}')" title="Mappa">🗺️</button>
                    ${sitoUrl ? `<a href="${sitoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;"><button style="background:#17a2b8; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Visita Sito Web">🌐 Sito</button></a>` : ''}
                    ${adminButtons}
                </div>
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
        const index = contacts.indexOf(x);
        const mapUrl = `https://www.google.it/maps/dir/Via+Cascina+Comune+24,+Pregnana+Milanese/${encodeURIComponent(x.via || '')}+${encodeURIComponent(x.loc || '')}`;
        let infoPercorso = x.ss ? `${x.sub} > ${x.ss}` : `${x.sub || ''}`;
        
        const telFisso = formattaTelefono(x.tel);
        const telCell = formattaTelefono(x.cell);
        const sitoUrl = formattaUrl(x.sito);

        const adminButtons = isAdmin ? `
            <button onclick="editContact(${index})" title="Modifica">📝</button>
            <button onclick="duplicateContact(${index})" title="Duplica">📄</button>
            <button onclick="deleteContact(${index})" title="Elimina">🗑️</button>
        ` : '';

        list.innerHTML += `
            <div style="background:white; padding:20px; border-radius:15px; border-left:6px solid #28a745; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-bottom:15px; cursor:pointer; position:relative;" onclick="showFullDetails(${index})">
                <div style="font-size:0.75em; color:#888; text-transform:uppercase; margin-bottom:5px;">${infoPercorso}</div>
                ${x.foto ? `<img src="${x.foto}" style="width:100%; height:120px; object-fit:cover; border-radius:10px; margin:10px 0;">` : ''}
                <b style="font-size:1.2em; color:#003366">${x.nome}</b><br>
                
                <div style="margin-top:5px; font-size:14px;">📍 ${x.via || ''}, ${x.loc || ''}</div>

                <!-- PULSANTI TELEFONO E CELLULARE PER CHIAMATA DIRETTA -->
                <div style="margin-top:8px; font-size:14px; display:flex; gap:10px; flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${telFisso ? `<a href="tel:${telFisso}" style="color:#003366; text-decoration:none; font-weight:bold; background:#eef6ff; padding:4px 8px; border-radius:6px; border:1px solid #d1e3f8; display:inline-block;">📞 ${x.tel}</a>` : ''}
                    ${telCell ? `<a href="tel:${telCell}" style="color:#28a745; text-decoration:none; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:6px; border:1px solid #c3e6cb; display:inline-block;">📱 ${x.cell}</a>` : ''}
                </div>

                <div style="position:absolute; bottom:20px; right:20px; color:#d9534f; font-weight:bold; font-size:1.1em; display:flex; align-items:center; gap:5px;">
                    🚗 ${x.km || '0'} KM
                </div>

                <!-- BOTTONI MAPPA, SITO WEB E ADMIN -->
                <div style="margin-top:12px; display:flex; gap:5px; align-items:center;" onclick="event.stopPropagation()">
                    <button onclick="window.open('${mapUrl}')" title="Mappa">🗺️</button>
                    ${sitoUrl ? `<a href="${sitoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;"><button style="background:#17a2b8; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Visita Sito Web">🌐 Sito</button></a>` : ''}
                    ${adminButtons}
                </div>
            </div>`;
    });
}
