const ESTADOS = [
    "Facturado",
    "Enviado a Facturar",
    "Pendiente confirmacion PM",
    "Pendiente SKU promo y Carta",
    "Pendiente lanzamiento",
    "En Negociacion",
    "Cotizacion"
];

const ESTADO_COLORS = {
    "Facturado": "#22c55e",
    "Enviado a Facturar": "#84cc16",
    "Pendiente confirmacion PM": "#eab308",
    "Pendiente SKU promo y Carta": "#f97316",
    "Pendiente lanzamiento": "#f59e0b",
    "En Negociacion": "#3b82f6",
    "Cotizacion": "#64748b"
};

const REGIONES = [
    "Chile", "Colombia", "Costa Rica", "Ecuador", "El Salvador",
    "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Perú",
    "Regional", "US", "Venezuela"
];

const STORAGE_KEY = "crm_clientes_v1";
const NOTES_KEY = "crm_notas_v1";
const MIGRADO_KEY = "crm_fechas_migrado_v1";
const API_URL = "api.php";

let clientes = [];
let notas = "";
let editandoId = null;
let usandoAPI = true;
let regionPorCanal = {};

function seedData() {
    const hoy = new Date().toISOString().slice(0, 10);
    return [
        { region: "Costa Rica", canal: "Intelec", linea: "MT1", sku: "SE000MCA02", unidades: 250, promo: "SKUPROMO", skuPromo: "PROMO2026Q311926", precioCliente: 5.54, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Facturado", observaciones: "" },
        { region: "Salvador", canal: "almacenes Siman", linea: "MT1", sku: "SE000MCA02", unidades: 200, promo: "SKUPROMO", skuPromo: "PROMO2026Q311925", precioCliente: 7.3, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Facturado", observaciones: "" },
        { region: "Salvador", canal: "Gmg", linea: "MT1", sku: "SE000MCA02", unidades: 10, promo: "SKUPROMO", skuPromo: "PROMO2026Q311925", precioCliente: 7.3, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Enviado a Facturar", observaciones: "" },
        { region: "Salvador", canal: "Acer", linea: "MT1", sku: "SE000MCA02", unidades: 100, promo: "", skuPromo: "", precioCliente: 7.3, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Pendiente confirmacion PM", observaciones: "" },
        { region: "Salvador", canal: "Lenovo", linea: "MT1", sku: "SE000MCA02", unidades: 190, promo: "", skuPromo: "", precioCliente: 5.1, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Pendiente confirmacion PM", observaciones: "" },
        { region: "Salvador", canal: "HP", linea: "MT1", sku: "SE000MCA02", unidades: 100, promo: "", skuPromo: "", precioCliente: 5.1, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Pendiente SKU promo y Carta", observaciones: "" },
        { region: "Regional", canal: "Intcomex", linea: "MT1", sku: "SE000MCA02", unidades: 100, promo: "", skuPromo: "", precioCliente: 7.3, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Pendiente lanzamiento", observaciones: "" },
        { region: "US", canal: "Intcomex", linea: "MT1", sku: "SE000MCA02", unidades: 100, promo: "", skuPromo: "", precioCliente: 5.1, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Pendiente lanzamiento", observaciones: "" },
        { region: "Salvador", canal: "Lenovo", linea: "MT1", sku: "SE000MCA02", unidades: 1000, promo: "", skuPromo: "", precioCliente: 5.1, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "En Negociacion", observaciones: "" },
        { region: "Venezuela", canal: "X5server", linea: "MT1", sku: "SE000MCA02", unidades: 100, promo: "", skuPromo: "", precioCliente: 14.6, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Cotizacion", observaciones: "" },
        { region: "Chile", canal: "Paris", linea: "MT1", sku: "SE000MCA02", unidades: 50, promo: "", skuPromo: "", precioCliente: 14.6, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Cotizacion", observaciones: "" },
        { region: "Peru", canal: "connecta", linea: "MT1", sku: "SE000MCA02", unidades: 2000, promo: "", skuPromo: "", precioCliente: 14.6, precioIntcomex: 14.6, fechaEstimada: "2026-08-25", fechaRegistro: hoy, fechaEstado: hoy, estado: "Cotizacion", observaciones: "" }
    ];
}

function totalRegistro(c) {
    return Math.round((Number(c.unidades) || 0) * (Number(c.precioCliente) || 0) * 100) / 100;
}

function fmt(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function normalizarIds(arr) {
    return arr.map((c, i) => (c && c.id ? c : Object.assign({}, c, { id: Date.now() + i })));
}

function migrarFechas() {
    if (localStorage.getItem(MIGRADO_KEY)) return;
    const hoy = new Date().toISOString().slice(0, 10);
    let cambio = false;
    clientes.forEach(c => {
        if (c.fechaEstimada !== "2026-08-25" || c.fechaRegistro !== hoy || c.fechaEstado !== hoy) {
            c.fechaEstimada = "2026-08-25";
            c.fechaRegistro = hoy;
            c.fechaEstado = hoy;
            cambio = true;
        }
    });
    if (cambio) saveData();
    localStorage.setItem(MIGRADO_KEY, "1");
}

function loadData() {
    fetch(API_URL, { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error("api");
            return res.json();
        })
        .then(data => {
            clientes = normalizarIds(Array.isArray(data.clientes) ? data.clientes : []);
            const vacio = clientes.length === 0;
            if (vacio) clientes = seedData();
            migrarFechas();
            if (vacio) saveData();
            notas = data.notas || "";
            usandoAPI = true;
            document.getElementById("crm-notas-texto").value = notas;
            renderAll();
        })
        .catch(() => {
            usandoAPI = false;
            const raw = localStorage.getItem(STORAGE_KEY);
            try {
                clientes = normalizarIds(raw ? JSON.parse(raw) : seedData());
            } catch (e) {
                clientes = seedData();
            }
            migrarFechas();
            notas = localStorage.getItem(NOTES_KEY) || "";
            document.getElementById("crm-notas-texto").value = notas;
            renderAll();
        });
}

function saveData() {
    if (usandoAPI) {
        return fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientes: clientes, notas: notas })
        }).catch(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
            localStorage.setItem(NOTES_KEY, notas);
        });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
    localStorage.setItem(NOTES_KEY, notas);
    return Promise.resolve();
}

function renderResumen() {
    const el = document.getElementById("crm-resumen");
    const cont = {};
    ESTADOS.forEach(e => cont[e] = { n: 0, total: 0 });
    let totalGeneral = 0;
    clientes.forEach(c => {
        const e = c.estado || "Cotizacion";
        if (!cont[e]) cont[e] = { n: 0, total: 0 };
        cont[e].n++;
        cont[e].total += totalRegistro(c);
        totalGeneral += totalRegistro(c);
    });
    let html = ESTADOS.map(e => {
        const d = cont[e];
        return `<div class="crm-resumen-item" style="border-left:4px solid ${ESTADO_COLORS[e]}">
            <div class="crm-resumen-nombre">${e}</div>
            <div class="crm-resumen-cant">${d.n}</div>
            <div class="crm-resumen-total">$${fmt(d.total)}</div>
        </div>`;
    }).join("");
    html += `<div class="crm-resumen-item crm-resumen-total-item">
        <div class="crm-resumen-nombre">TOTAL</div>
        <div class="crm-resumen-cant">${clientes.length}</div>
        <div class="crm-resumen-total">$${fmt(totalGeneral)}</div>
    </div>`;
    el.innerHTML = html;
}

function renderFiltros() {
    const regiones = [...new Set(clientes.map(c => c.region).filter(Boolean))].sort();
    const canales = [...new Set(clientes.map(c => c.canal).filter(Boolean))].sort();

    const selR = document.getElementById("filtro-region");
    const actualR = selR.value;
    selR.innerHTML = '<option value="">TODAS LAS REGIONES</option>' +
        regiones.map(r => `<option value="${r}">${r}</option>`).join("");
    selR.value = actualR;

    const selC = document.getElementById("filtro-cliente");
    const actualC = selC.value;
    selC.innerHTML = '<option value="">TODOS LOS CLIENTES</option>' +
        canales.map(c => `<option value="${c}">${c}</option>`).join("");
    selC.value = actualC;

    const selE = document.getElementById("filtro-estado");
    const actualE = selE.value;
    selE.innerHTML = '<option value="">TODOS LOS ESTADOS</option>' +
        ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");
    selE.value = actualE;
}

function filtrados() {
    const r = document.getElementById("filtro-region").value;
    const c = document.getElementById("filtro-cliente").value;
    const e = document.getElementById("filtro-estado").value;
    const feD = document.getElementById("filtro-fe-desde").value;
    const feH = document.getElementById("filtro-fe-hasta").value;
    const frD = document.getElementById("filtro-fr-desde").value;
    const frH = document.getElementById("filtro-fr-hasta").value;
    const fsD = document.getElementById("filtro-fs-desde").value;
    const fsH = document.getElementById("filtro-fs-hasta").value;
    const entre = (v, d, h) => (v ? ((!d || v >= d) && (!h || v <= h)) : (!d && !h));
    return clientes.filter(x =>
        (!r || x.region === r) &&
        (!c || x.canal === c) &&
        (!e || x.estado === e) &&
        entre(x.fechaEstimada, feD, feH) &&
        entre(x.fechaRegistro, frD, frH) &&
        entre(x.fechaEstado, fsD, fsH)
    );
}

function fmtFecha(iso) {
    if (!iso) return "";
    const p = String(iso).split("-");
    if (p.length !== 3) return iso;
    return `${p[0]}/${p[1]}/${p[2]}`;
}

function renderTabla() {
    const rows = filtrados();
    const tbody = document.getElementById("crm-tbody");
    const vacio = document.getElementById("crm-vacio");
    tbody.innerHTML = rows.map(c => {
        const color = ESTADO_COLORS[c.estado] || "#64748b";
        return `<tr>
            <td><strong>${esc(c.canal)}</strong></td>
            <td>${esc(c.region)}</td>
            <td>${esc(c.linea)}</td>
            <td>${esc(c.sku)}</td>
            <td class="crm-num">${fmt(c.unidades)}</td>
            <td>${esc(c.promo)}</td>
            <td class="crm-num">$${fmt(c.precioCliente)}</td>
            <td class="crm-num">$${fmt(c.precioIntcomex)}</td>
            <td class="crm-num"><strong>$${fmt(totalRegistro(c))}</strong></td>
            <td><span class="crm-estado" style="background:${color}">${esc(c.estado)}</span></td>
            <td class="crm-obs" title="${esc(c.observaciones)}">${esc(c.observaciones)}</td>
            <td class="crm-acciones">
                <button class="filtro-btn crm-edit" data-id="${c.id}">Editar</button>
                <button class="filtro-btn crm-del" data-id="${c.id}">Eliminar</button>
            </td>
            <td class="crm-num">${fmtFecha(c.fechaEstimada)}</td>
            <td class="crm-num">${fmtFecha(c.fechaRegistro)}</td>
            <td class="crm-num">${fmtFecha(c.fechaEstado)}</td>
        </tr>`;
    }).join("");
    vacio.style.display = rows.length ? "none" : "block";
}

function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function actualizarBadgeFechas() {
    const ids = ["filtro-fe-desde", "filtro-fe-hasta", "filtro-fr-desde", "filtro-fr-hasta", "filtro-fs-desde", "filtro-fs-hasta"];
    const activos = ids.filter(id => document.getElementById(id).value).length;
    const badge = document.getElementById("crm-fechas-badge");
    if (activos > 0) {
        badge.textContent = activos;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

function renderAll() {
    renderResumen();
    renderFiltros();
    renderTabla();
}

function abrirModal(registro) {
    editandoId = registro ? registro.id : null;

    const canales = [...new Set(clientes.map(c => (c.canal || "").trim()).filter(Boolean))].sort();
    document.getElementById("lista-canales").innerHTML =
        canales.map(x => `<option value="${esc(x)}"></option>`).join("");

    const lineas = [...new Set(clientes.map(c => (c.linea || "").trim()).filter(Boolean))].sort();
    document.getElementById("lista-lineas").innerHTML =
        lineas.map(x => `<option value="${esc(x)}"></option>`).join("");

    const skus = [...new Set(clientes.map(c => (c.sku || "").trim()).filter(Boolean))].sort();
    document.getElementById("lista-skus").innerHTML =
        skus.map(x => `<option value="${esc(x)}"></option>`).join("");

    const todasRegiones = [...new Set([...REGIONES, ...clientes.map(c => c.region).filter(Boolean)])];
    document.getElementById("lista-regiones").innerHTML =
        todasRegiones.map(r => `<option value="${esc(r)}"></option>`).join("");

    regionPorCanal = {};
    clientes.forEach(c => {
        if (c.canal && c.region) {
            regionPorCanal[c.canal.trim()] = c.region;
        }
    });

    document.getElementById("crm-modal-titulo").textContent = registro ? "EDITAR REGISTRO" : "NUEVO REGISTRO";
    document.getElementById("f-canal").value = registro ? registro.canal : "";
    document.getElementById("f-region").value = registro ? registro.region : "";
    document.getElementById("f-linea").value = registro ? (registro.linea || "") : "";
    document.getElementById("f-sku").value = registro ? (registro.sku || "") : "";
    document.getElementById("f-unidades").value = registro ? registro.unidades : 0;
    document.getElementById("f-promo").value = registro ? (registro.promo || "") : "";
    document.getElementById("f-skuPromo").value = registro ? (registro.skuPromo || "") : "";
    document.getElementById("f-precioCliente").value = registro ? registro.precioCliente : 0;
    document.getElementById("f-precioIntcomex").value = registro ? registro.precioIntcomex : 0;
    document.getElementById("f-fecha").value = registro ? (registro.fechaEstimada || "") : "";
    const hoy = new Date().toISOString().slice(0, 10);
    document.getElementById("f-fechaRegistro").value = registro ? (registro.fechaRegistro || hoy) : hoy;
    document.getElementById("f-fechaEstado").value = registro ? (registro.fechaEstado || hoy) : hoy;
    document.getElementById("f-estado").value = registro ? registro.estado : "Cotizacion";
    document.getElementById("f-obs").value = registro ? (registro.observaciones || "") : "";
    actualizarTotalForm();
    document.getElementById("crm-modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("crm-modal").style.display = "none";
    editandoId = null;
}

function actualizarTotalForm() {
    const u = Number(document.getElementById("f-unidades").value) || 0;
    const p = Number(document.getElementById("f-precioCliente").value) || 0;
    document.getElementById("f-total").value = "$" + fmt(Math.round(u * p * 100) / 100);
}

function guardarForm(e) {
    e.preventDefault();
    const estado = document.getElementById("f-estado").value;
    const hoy = new Date().toISOString().slice(0, 10);
    let anterior = null;
    if (editandoId) {
        anterior = clientes.find(c => c.id === editandoId);
    }
    const rec = {
        canal: document.getElementById("f-canal").value.trim(),
        region: document.getElementById("f-region").value.trim(),
        linea: document.getElementById("f-linea").value.trim(),
        sku: document.getElementById("f-sku").value.trim(),
        unidades: Number(document.getElementById("f-unidades").value) || 0,
        promo: document.getElementById("f-promo").value.trim(),
        skuPromo: document.getElementById("f-skuPromo").value.trim(),
        precioCliente: Number(document.getElementById("f-precioCliente").value) || 0,
        precioIntcomex: Number(document.getElementById("f-precioIntcomex").value) || 0,
        fechaEstimada: document.getElementById("f-fecha").value,
        estado: estado,
        observaciones: document.getElementById("f-obs").value.trim()
    };
    if (!rec.canal) return;
    if (anterior) {
        rec.fechaRegistro = anterior.fechaRegistro || hoy;
        rec.fechaEstado = (anterior.estado !== estado) ? hoy : (anterior.fechaEstado || hoy);
        Object.assign(anterior, rec);
    } else {
        rec.id = Date.now();
        rec.fechaRegistro = hoy;
        rec.fechaEstado = hoy;
        clientes.push(rec);
    }
    saveData();
    cerrarModal();
    renderAll();
}

function exportarCSV() {
    const hdr = ["Region", "Canal", "Linea", "SKU", "Unidades", "Promo", "skuPromo", "PrecioCliente", "PrecioIntcomex", "FechaEstimada", "Total", "Estado", "FechaRegistro", "FechaEstado", "Observaciones"];
    const lines = [hdr.join(",")];
    clientes.forEach(c => {
        const vals = [c.region, c.canal, c.linea, c.sku, c.unidades, c.promo, c.skuPromo, c.precioCliente, c.precioIntcomex, c.fechaEstimada, totalRegistro(c), c.estado, c.fechaRegistro, c.fechaEstado, c.observaciones];
        lines.push(vals.map(v => {
            v = (v === null || v === undefined) ? "" : String(v);
            return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(","));
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "crm_clientes.csv";
    a.click();
    URL.revokeObjectURL(a.href);
}

function importarCSV(file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
        const texto = ev.target.result;
        const lines = texto.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) return;
        const delim = lines[0].includes(";") ? ";" : ",";
        const parseLine = l => {
            const out = [];
            let cur = "", q = false;
            for (let i = 0; i < l.length; i++) {
                const ch = l[i];
                if (q) {
                    if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; }
                    else if (ch === '"') q = false;
                    else cur += ch;
                } else {
                    if (ch === '"') q = true;
                    else if (ch === delim) { out.push(cur); cur = ""; }
                    else cur += ch;
                }
            }
            out.push(cur);
            return out;
        };
        const rows = lines.map(parseLine);
        const header = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
        const idx = name => header.indexOf(name);
        const importados = rows.slice(1).map(r => {
            const g = n => { const i = idx(n); return i >= 0 ? (r[i] || "").trim() : ""; };
            const num = n => { const v = parseFloat(g(n)); return isNaN(v) ? 0 : v; };
            return {
                region: g("region"),
                canal: g("canal"),
                linea: g("linea"),
                sku: g("sku"),
                unidades: num("unidades"),
                promo: g("promo"),
                skuPromo: g("skupromo"),
                precioCliente: num("preciocliente"),
                precioIntcomex: num("preciointcomex"),
                fechaEstimada: g("fechaestimada") || g("fecha"),
                estado: g("estado"),
                fechaRegistro: g("fecharegistro"),
                fechaEstado: g("fechaestado"),
                observaciones: g("observaciones")
            };
        }).filter(c => c.canal);
        if (importados.length === 0) return;
        importados.forEach(c => { c.id = Date.now() + Math.random(); });
        if (confirm(`Se importarán ${importados.length} registros. ¿Reemplazar los actuales?`)) {
            clientes = importados;
        } else {
            clientes = clientes.concat(importados);
        }
        saveData();
        renderAll();
    };
    reader.readAsText(file);
}

function guardarNotas() {
    notas = document.getElementById("crm-notas-texto").value;
    saveData();
    const msg = document.getElementById("crm-notas-save-msg");
    msg.textContent = "Notas guardadas.";
    setTimeout(() => { msg.textContent = ""; }, 2000);
}

function setup() {
    loadData();

    document.getElementById("filtro-region").addEventListener("change", renderTabla);
    document.getElementById("filtro-cliente").addEventListener("change", renderTabla);
    document.getElementById("filtro-estado").addEventListener("change", renderTabla);
    ["filtro-fe-desde", "filtro-fe-hasta", "filtro-fr-desde", "filtro-fr-hasta", "filtro-fs-desde", "filtro-fs-hasta"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            renderTabla();
            actualizarBadgeFechas();
        });
    });

    const fechasBtn = document.getElementById("crm-fechas-btn");
    const fechasPopup = document.getElementById("crm-fechas-popup");
    fechasBtn.addEventListener("click", ev => {
        ev.stopPropagation();
        const vis = fechasPopup.style.display === "block";
        fechasPopup.style.display = vis ? "none" : "block";
        if (!vis) actualizarBadgeFechas();
    });
    document.getElementById("crm-fechas-limpiar").addEventListener("click", () => {
        ["filtro-fe-desde", "filtro-fe-hasta", "filtro-fr-desde", "filtro-fr-hasta", "filtro-fs-desde", "filtro-fs-hasta"].forEach(id => {
            document.getElementById(id).value = "";
        });
        renderTabla();
        actualizarBadgeFechas();
    });
    document.addEventListener("click", ev => {
        if (!ev.target.closest(".crm-fechas-wrap")) {
            fechasPopup.style.display = "none";
        }
    });

    const selEstado = document.getElementById("f-estado");
    selEstado.innerHTML = ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");

    const todasRegiones = [...new Set([...REGIONES, ...clientes.map(c => c.region).filter(Boolean)])];
    document.getElementById("lista-regiones").innerHTML =
        todasRegiones.map(r => `<option value="${esc(r)}"></option>`).join("");

    document.getElementById("f-unidades").addEventListener("input", actualizarTotalForm);
    document.getElementById("f-precioCliente").addEventListener("input", actualizarTotalForm);

    function llenarPorCanal() {
        const v = document.getElementById("f-canal").value.trim();
        if (!v) return;
        const directo = regionPorCanal[v];
        if (directo) {
            document.getElementById("f-region").value = directo;
            return;
        }
        const hits = Object.keys(regionPorCanal).filter(k => k.toLowerCase() === v.toLowerCase());
        if (hits.length === 1) {
            document.getElementById("f-region").value = regionPorCanal[hits[0]];
        }
    }
    document.getElementById("f-canal").addEventListener("input", llenarPorCanal);
    document.getElementById("f-canal").addEventListener("change", llenarPorCanal);

    document.getElementById("crm-nuevo").addEventListener("click", () => abrirModal(null));
    document.getElementById("crm-cancelar").addEventListener("click", cerrarModal);
    document.getElementById("crm-form").addEventListener("submit", guardarForm);
    document.getElementById("crm-export").addEventListener("click", exportarCSV);
    document.getElementById("crm-import-btn").addEventListener("click", () => document.getElementById("crm-import-file").click());
    document.getElementById("crm-import-file").addEventListener("change", ev => {
        if (ev.target.files[0]) importarCSV(ev.target.files[0]);
        ev.target.value = "";
    });
    document.getElementById("crm-notas-save").addEventListener("click", guardarNotas);

    document.getElementById("crm-tbody").addEventListener("click", ev => {
        const btn = ev.target.closest("button");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.classList.contains("crm-edit")) {
            const rec = clientes.find(c => c.id === id);
            if (rec) abrirModal(rec);
        } else if (btn.classList.contains("crm-del")) {
            if (confirm("¿Eliminar este registro?")) {
                clientes = clientes.filter(c => c.id !== id);
                saveData();
                renderAll();
            }
        }
    });

    document.getElementById("crm-modal").addEventListener("click", ev => {
        if (ev.target.id === "crm-modal") cerrarModal();
    });
}

document.addEventListener("DOMContentLoaded", setup);
