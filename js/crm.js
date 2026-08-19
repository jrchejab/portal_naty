const ESTADOS = [
    "Lead",
    "Cotizado",
    "En Negociación",
    "Facturado",
    "Perdido"
];

const ESTADOS_INDICADORES = [
    "Cotizado",
    "En Negociación",
    "Facturado",
    "Perdido"
];

const ESTADO_COLORS = {
    "Lead": "#6366f1",
    "Cotizado": "#3b82f6",
    "En Negociación": "#f59e0b",
    "Facturado": "#22c55e",
    "Perdido": "#64748b"
};

const ESTADO_PASTEL = {
    "Lead": "#c7d2fe",
    "Cotizado": "#bfdbfe",
    "En Negociación": "#fde68a",
    "Facturado": "#bbf7d0",
    "Perdido": "#e2e8f0"
};

const MAPA_ESTADOS = {
    "Facturado": "Facturado",
    "Enviado a Facturar": "En Negociación",
    "Pendiente confirmacion PM": "En Negociación",
    "Pendiente SKU promo y Carta": "En Negociación",
    "Pendiente lanzamiento": "En Negociación",
    "En Negociacion": "En Negociación",
    "Cotizacion": "Cotizado",
    "Cerrado": "Perdido"
};

const REGIONES = [
    "Chile", "Colombia", "Costa Rica", "Ecuador", "El Salvador",
    "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Perú",
    "Regional", "US", "Venezuela"
];

const STORAGE_KEY = "crm_clientes_v1";
const NOTES_KEY = "crm_notas_v1";
const API_URL = "api.php";

let clientes = [];
let notas = "";
let editandoId = null;
let usandoAPI = true;
let regionPorCanal = {};
let filtroRegiones = [];
let filtroClientes = [];
let notasCalendario = {};

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
    const hoy = new Date().toISOString().slice(0, 10);
    let cambio = false;
    clientes.forEach(c => {
        if (!c.fechaEstimada) {
            c.fechaEstimada = (c.fecha && c.fecha !== "Agosto/Septiembre") ? c.fecha : "2026-08-25";
            cambio = true;
        }
        if (!c.fechaRegistro) {
            c.fechaRegistro = hoy;
            cambio = true;
        }
        if (!c.fechaEstado) {
            c.fechaEstado = hoy;
            cambio = true;
        }
        if (c.fecha) {
            delete c.fecha;
            cambio = true;
        }
    });
    if (cambio) saveData();
}

function migrarEstados() {
    let cambio = false;
    clientes.forEach(c => {
        const nuevo = MAPA_ESTADOS[c.estado];
        if (nuevo && c.estado !== nuevo) {
            c.estado = nuevo;
            cambio = true;
        }
    });
    if (cambio) saveData();
}

function copiaLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) { }
    return null;
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
            if (vacio) {
                const local = copiaLocal();
                clientes = local ? normalizarIds(local) : seedData();
            }
            migrarFechas();
            migrarEstados();
            if (vacio) saveData();
            notas = "";
            usandoAPI = true;
            renderAll();
            cargarNotasCalendario();
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
            migrarEstados();
            notas = "";
            renderAll();
            cargarNotasCalendario();
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
    ESTADOS_INDICADORES.forEach(e => cont[e] = { n: 0, total: 0 });
    let totalGeneral = 0;
    let totalUnidades = 0;
    clientes.forEach(c => {
        const est = ESTADOS_INDICADORES.includes(c.estado) ? c.estado : null;
        if (est) {
            cont[est].n++;
            cont[est].total += totalRegistro(c);
        }
        if (c.estado) totalGeneral += totalRegistro(c);
        totalUnidades += Number(c.unidades) || 0;
    });
    let html = ESTADOS_INDICADORES.map(e => {
        const d = cont[e];
        return `<div class="crm-resumen-item" style="border-left:4px solid ${ESTADO_COLORS[e]}">
            <div class="crm-resumen-fila1">
                <span class="crm-resumen-nombre">${e}</span>
                <span class="crm-resumen-cant">${d.n}</span>
            </div>
            <div class="crm-resumen-valor">$${fmt(d.total)}</div>
        </div>`;
    }).join("");
    html += `<div class="crm-resumen-item">
        <div class="crm-resumen-fila1">
            <span class="crm-resumen-nombre">UNIDADES</span>
        </div>
        <div class="crm-resumen-valor">${fmt(totalUnidades)}</div>
    </div>`;
    html += `<div class="crm-resumen-item crm-resumen-total-item">
        <div class="crm-resumen-fila1">
            <span class="crm-resumen-nombre">TOTAL</span>
            <span class="crm-resumen-cant">${clientes.length}</span>
        </div>
        <div class="crm-resumen-valor">$${fmt(totalGeneral)}</div>
    </div>`;
    el.innerHTML = html;
}

function renderFiltros() {
    const regiones = [...new Set(clientes.map(c => c.region).filter(Boolean))].sort();
    const canales = [...new Set(clientes.map(c => c.canal).filter(Boolean))].sort();

    const popR = document.getElementById("filtro-region-popup");
    popR.innerHTML = regiones.map(r =>
        `<label class="crm-multi-opcion"><input type="checkbox" value="${esc(r)}" ${filtroRegiones.includes(r) ? "checked" : ""}> ${esc(r)}</label>`
    ).join("") || '<div class="nota-sin">Sin regiones</div>';

    const popC = document.getElementById("filtro-cliente-popup");
    popC.innerHTML = canales.map(c =>
        `<label class="crm-multi-opcion"><input type="checkbox" value="${esc(c)}" ${filtroClientes.includes(c) ? "checked" : ""}> ${esc(c)}</label>`
    ).join("") || '<div class="nota-sin">Sin clientes</div>';

    const selE = document.getElementById("filtro-estado");
    const actualE = selE.value;
    selE.innerHTML = '<option value="">TODOS LOS ESTADOS</option>' +
        ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");
    selE.value = actualE;

    actualizarBadgeFiltros();
}

function actualizarBadgeFiltros() {
    const br = document.getElementById("filtro-region-badge");
    br.textContent = filtroRegiones.length;
    br.style.display = filtroRegiones.length ? "inline-block" : "none";
    const bc = document.getElementById("filtro-cliente-badge");
    bc.textContent = filtroClientes.length;
    bc.style.display = filtroClientes.length ? "inline-block" : "none";
}

function filtrados() {
    const e = document.getElementById("filtro-estado").value;
    const feD = document.getElementById("filtro-fe-desde").value;
    const feH = document.getElementById("filtro-fe-hasta").value;
    const frD = document.getElementById("filtro-fr-desde").value;
    const frH = document.getElementById("filtro-fr-hasta").value;
    const fsD = document.getElementById("filtro-fs-desde").value;
    const fsH = document.getElementById("filtro-fs-hasta").value;
    const entre = (v, d, h) => (v ? ((!d || v >= d) && (!h || v <= h)) : (!d && !h));
    return clientes.filter(x =>
        (!filtroRegiones.length || filtroRegiones.includes(x.region)) &&
        (!filtroClientes.length || filtroClientes.includes(x.canal)) &&
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
        const color = ESTADO_PASTEL[c.estado] || "#e2e8f0";
        const obsCls = c.observaciones ? "crm-obs-btn crm-obs-tiene" : "crm-obs-btn crm-obs-vacio";
        return `<tr>
            <td><strong>${esc(c.canal)}</strong></td>
            <td>${esc(c.region)}</td>
            <td>${esc(c.linea)}</td>
            <td>${esc(c.sku)}</td>
            <td class="crm-num">${fmt(c.unidades)}</td>
            <td class="crm-fecha">${esc(c.promo)}</td>
            <td class="crm-num">$${fmt(c.precioCliente)}</td>
            <td class="crm-num crm-col-total">$${fmt(totalRegistro(c))}</td>
            <td class="crm-num">$${fmt(c.precioIntcomex)}</td>
            <td class="crm-num crm-col-total"><strong>$${fmt(totalRegistro(c))}</strong></td>
            <td>${c.shipAndDebit ? esc(c.shipAndDebit) : "—"}</td>
            <td>${c.orderNo ? esc(c.orderNo) : "—"}</td>
            <td><span class="crm-estado" style="background:${color}">${esc(c.estado)}</span></td>
            <td class="crm-obs">
                <button class="${obsCls}" data-id="${c.id}" title="Ver observaciones">Obs</button>
            </td>
            <td class="crm-acciones">
                <button class="crm-icono crm-edit" data-id="${c.id}" title="Editar">&#9998;</button>
                <button class="crm-icono crm-del" data-id="${c.id}" title="Eliminar">&#128465;</button>
            </td>
            <td class="crm-num crm-fecha">${fmtFecha(c.fechaEstimada)}</td>
            <td class="crm-num crm-fecha">${fmtFecha(c.fechaRegistro)}</td>
            <td class="crm-num crm-fecha">${fmtFecha(c.fechaEstado)}</td>
        </tr>`;
    }).join("");
    vacio.style.display = rows.length ? "none" : "block";
    renderTotales(rows);
}

function renderTotales(rows) {
    const tfoot = document.getElementById("crm-tfoot");
    if (!rows.length) {
        tfoot.innerHTML = "";
        return;
    }
    const sum = { u: 0, p: 0, pt: 0, pi: 0, t: 0 };
    rows.forEach(c => {
        sum.u += Number(c.unidades) || 0;
        sum.p += Number(c.precioCliente) || 0;
        sum.pt += totalRegistro(c);
        sum.pi += Number(c.precioIntcomex) || 0;
        sum.t += totalRegistro(c);
    });
    tfoot.innerHTML = `<tr class="crm-total-fila">
        <td><strong>TOTALES</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="crm-num">${fmt(sum.u)}</td>
        <td></td>
        <td class="crm-num">$${fmt(sum.p)}</td>
        <td class="crm-num crm-col-total">$${fmt(sum.pt)}</td>
        <td class="crm-num">$${fmt(sum.pi)}</td>
        <td class="crm-num crm-col-total"><strong>$${fmt(sum.t)}</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`;
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
    document.getElementById("f-estado").value = registro ? registro.estado : "Lead";
    document.getElementById("f-ship").value = registro ? (registro.shipAndDebit || "") : "";
    document.getElementById("f-order").value = registro ? (registro.orderNo || "") : "";
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
    const shipVal = document.getElementById("f-ship").value.trim();
    if (shipVal && shipVal.length > 80) {
        alert("Ship and Debit no puede superar 80 caracteres.");
        return;
    }
    if (shipVal) {
        const duplicado = clientes.find(c => c.id !== editandoId && String(c.shipAndDebit || "").trim() === shipVal);
        if (duplicado) {
            alert("Ship and Debit ya existe en otro registro.");
            return;
        }
    }
    const orderVal = document.getElementById("f-order").value.trim();
    if (orderVal && !/^[A-Za-z0-9]{1,12}$/.test(orderVal)) {
        alert("# Order debe ser alfanumérico de máximo 12 caracteres.");
        return;
    }
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
        shipAndDebit: shipVal,
        orderNo: orderVal,
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
    const hdr = ["Region", "Canal", "Linea", "SKU", "Unidades", "Promo", "skuPromo", "PrecioCliente", "PrecioIntcomex", "FechaEstimada", "Total", "ShipAndDebit", "OrderNo", "Estado", "FechaRegistro", "FechaEstado", "Observaciones"];
    const lines = [hdr.join(",")];
    clientes.forEach(c => {
        const vals = [c.region, c.canal, c.linea, c.sku, c.unidades, c.promo, c.skuPromo, c.precioCliente, c.precioIntcomex, c.fechaEstimada, totalRegistro(c), c.shipAndDebit || "", c.orderNo || "", c.estado, c.fechaRegistro, c.fechaEstado, c.observaciones];
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
                shipAndDebit: g("shipanddebit"),
                orderNo: g("orderno"),
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

function cargarNotasCalendario() {
    fetch("api.php?tipo=calendario", { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error("api");
            return res.json();
        })
        .then(data => {
            notasCalendario = (data && typeof data === "object" && !Array.isArray(data)) ? data : {};
            renderBell();
        })
        .catch(() => {
            notasCalendario = {};
            renderBell();
        });
}

function renderBell() {
    const hoy = new Date();
    const hoyISO = hoy.toISOString().slice(0, 10);
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 3);
    const fin = new Date(hoy);
    fin.setDate(hoy.getDate() + 5);
    const inicioISO = inicio.toISOString().slice(0, 10);
    const finISO = fin.toISOString().slice(0, 10);

    const fechas = Object.keys(notasCalendario).sort();
    const list = fechas.filter(f => f >= inicioISO && f <= finISO).map(f => {
        const cls = f === hoyISO ? "bell-dia-hoy" : (f < hoyISO ? "bell-dia-pasado" : "bell-dia-futuro");
        const fecha = new Date(f + "T12:00:00");
        const label = fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
        return `<div class="bell-item ${cls}">
            <div class="bell-dia">${label}</div>
            <div class="bell-nota">${esc(notasCalendario[f])}</div>
        </div>`;
    }).join("");

    const listEl = document.getElementById("crm-bell-list");
    listEl.innerHTML = list || '<div class="nota-sin">Sin notas en los próximos días</div>';

    const badge = document.getElementById("crm-bell-badge");
    const total = fechas.filter(f => f >= inicioISO && f <= finISO).length;
    badge.textContent = total;
    badge.style.display = total ? "inline-block" : "none";
}

function abrirObsPopup(id) {
    const rec = clientes.find(c => c.id === id);
    if (!rec) return;
    const nombre = rec.canal || "Registro";
    document.getElementById("crm-obs-titulo").textContent = `OBSERVACIONES · ${nombre}`;
    document.getElementById("crm-obs-texto").textContent = rec.observaciones || "Sin observaciones.";
    document.getElementById("crm-obs-popup").style.display = "flex";
}

function setup() {
    loadData();

    document.getElementById("filtro-estado").addEventListener("change", renderTabla);

    const regionBtn = document.getElementById("filtro-region-btn");
    const regionPop = document.getElementById("filtro-region-popup");
    regionBtn.addEventListener("click", ev => {
        ev.stopPropagation();
        regionPop.style.display = regionPop.style.display === "block" ? "none" : "block";
        clientePop.style.display = "none";
    });
    regionPop.addEventListener("change", () => {
        filtroRegiones = [...regionPop.querySelectorAll("input:checked")].map(i => i.value);
        actualizarBadgeFiltros();
        renderTabla();
    });

    const clienteBtn = document.getElementById("filtro-cliente-btn");
    const clientePop = document.getElementById("filtro-cliente-popup");
    clienteBtn.addEventListener("click", ev => {
        ev.stopPropagation();
        clientePop.style.display = clientePop.style.display === "block" ? "none" : "block";
        regionPop.style.display = "none";
    });
    clientePop.addEventListener("change", () => {
        filtroClientes = [...clientePop.querySelectorAll("input:checked")].map(i => i.value);
        actualizarBadgeFiltros();
        renderTabla();
    });

    document.addEventListener("click", ev => {
        if (!ev.target.closest(".crm-multi-wrap")) {
            regionPop.style.display = "none";
            clientePop.style.display = "none";
        }
        if (!ev.target.closest(".crm-fechas-wrap")) {
            fechasPopup.style.display = "none";
        }
    });

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

    document.getElementById("crm-obs-cerrar").addEventListener("click", () => {
        document.getElementById("crm-obs-popup").style.display = "none";
    });
    document.getElementById("crm-obs-popup").addEventListener("click", ev => {
        if (ev.target.id === "crm-obs-popup") document.getElementById("crm-obs-popup").style.display = "none";
    });

    const bellBtn = document.getElementById("crm-bell");
    const bellPop = document.getElementById("crm-bell-popup");
    bellBtn.addEventListener("click", ev => {
        ev.stopPropagation();
        bellPop.style.display = bellPop.style.display === "block" ? "none" : "block";
        if (bellPop.style.display === "block") renderBell();
    });
    document.addEventListener("click", ev => {
        if (!ev.target.closest(".crm-bell-wrap")) {
            bellPop.style.display = "none";
        }
    });

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
        } else if (btn.classList.contains("crm-obs-btn")) {
            abrirObsPopup(id);
        }
    });

    document.getElementById("crm-modal").addEventListener("click", ev => {
        if (ev.target.id === "crm-modal") cerrarModal();
    });
}

document.addEventListener("DOMContentLoaded", setup);
