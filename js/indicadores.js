const API_URL = "api.php";
const STORAGE_KEY = "crm_clientes_v1";

const ESTADOS_PIPELINE = ["Cotizado", "En Negociación", "Facturado", "Perdido"];
const COLOR = {
    "Cotizado": "#3b82f6",
    "En Negociación": "#f59e0b",
    "Facturado": "#22c55e",
    "Perdido": "#64748b"
};

let clientes = [];
let mesActivo = "TODOS";
let detModo = "canal";

function fmt(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function totalRegistro(c) {
    return Math.round((Number(c.unidades) || 0) * (Number(c.precioCliente) || 0) * 100) / 100;
}

function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function keyMes(fecha) {
    if (!fecha) return "Sin fecha";
    const p = String(fecha).split("-");
    if (p.length !== 3) return "Sin fecha";
    return `${p[0]}-${p[1]}`;
}

function labelMes(key) {
    if (key === "Sin fecha") return "Sin fecha";
    const [y, m] = key.split("-");
    const meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${meses[Number(m)]} ${y}`;
}

function agruparPorMes() {
    const porMes = {};
    clientes.forEach(c => {
        const k = keyMes(c.fechaEstado);
        if (!porMes[k]) porMes[k] = [];
        porMes[k].push(c);
    });
    const keys = Object.keys(porMes).filter(k => k !== "Sin fecha").sort();
    return { porMes, keys };
}

function loadData() {
    fetch(API_URL, { cache: "no-store" })
        .then(res => { if (!res.ok) throw new Error("api"); return res.json(); })
        .then(data => {
            clientes = Array.isArray(data.clientes) ? data.clientes : [];
            if (!clientes.length) {
                const raw = localStorage.getItem(STORAGE_KEY);
                try { clientes = raw ? JSON.parse(raw) : []; } catch (e) { clientes = []; }
            }
            render();
        })
        .catch(() => {
            const raw = localStorage.getItem(STORAGE_KEY);
            try { clientes = raw ? JSON.parse(raw) : []; } catch (e) { clientes = []; }
            render();
        });
}

function render() {
    renderSelector();
    renderResumen();
    renderPipeline();
    renderConversion();
    renderTop();
    renderDesglose();
}

function renderSelector() {
    const { keys } = agruparPorMes();
    const sel = document.getElementById("ind-meses-selector");
    sel.innerHTML = "";
    const btnAll = document.createElement("button");
    btnAll.className = "filtro-btn" + (mesActivo === "TODOS" ? " active" : "");
    btnAll.textContent = "TODOS";
    btnAll.addEventListener("click", () => { mesActivo = "TODOS"; render(); });
    sel.appendChild(btnAll);
    keys.forEach(k => {
        const b = document.createElement("button");
        b.className = "filtro-btn" + (mesActivo === k ? " active" : "");
        b.textContent = labelMes(k);
        b.addEventListener("click", () => { mesActivo = k; render(); });
        sel.appendChild(b);
    });
}

function enMes(c) {
    if (mesActivo === "TODOS") return true;
    return keyMes(c.fechaEstado) === mesActivo;
}

function renderResumen() {
    const lista = clientes.filter(enMes);
    let unidades = 0;
    let total = 0;
    lista.forEach(c => { unidades += Number(c.unidades) || 0; total += totalRegistro(c); });
    const n = lista.length;
    const html = [
        `<div class="crm-resumen-item">
            <div class="crm-resumen-fila1"><span class="crm-resumen-nombre">REGISTROS</span></div>
            <div class="crm-resumen-valor">${fmt(n)}</div>
        </div>`,
        `<div class="crm-resumen-item">
            <div class="crm-resumen-fila1"><span class="crm-resumen-nombre">UNIDADES</span></div>
            <div class="crm-resumen-valor">${fmt(unidades)}</div>
        </div>`,
        `<div class="crm-resumen-item crm-resumen-total-item">
            <div class="crm-resumen-fila1"><span class="crm-resumen-nombre">TOTAL</span></div>
            <div class="crm-resumen-valor">$${fmt(total)}</div>
        </div>`
    ].join("");
    document.getElementById("ind-resumen").innerHTML = html;
}

function renderPipeline() {
    const { porMes, keys } = agruparPorMes();
    const tbody = document.querySelector("#ind-pipeline tbody");
    let rows = "";
    let acum = {};
    keys.forEach(k => {
        if (mesActivo !== "TODOS" && k !== mesActivo) return;
        const recs = porMes[k];
        const e = {};
        ESTADOS_PIPELINE.forEach(s => e[s] = 0);
        let tot = 0;
        recs.forEach(c => {
            const f = Number(totalRegistro(c)) || 0;
            if (ESTADOS_PIPELINE.includes(c.estado)) e[c.estado] += f;
            tot += f;
        });
        ESTADOS_PIPELINE.forEach(s => acum[s] = (acum[s] || 0) + e[s]);
        acum.Total = (acum.Total || 0) + tot;
        const backlog = e["Cotizado"] + e["En Negociación"];
        rows += `<tr>
            <td><strong>${labelMes(k)}</strong></td>
            <td>$${fmt(e["Cotizado"])}</td>
            <td>$${fmt(e["En Negociación"])}</td>
            <td>$${fmt(e["Facturado"])}</td>
            <td>$${fmt(e["Perdido"])}</td>
            <td>$${fmt(backlog)}</td>
            <td>$${fmt(tot)}</td>
        </tr>`;
    });
    if (mesActivo === "TODOS") {
        rows += `<tr class="ind-total-row">
            <td><strong>ACUMULADO</strong></td>
            <td>$${fmt(acum["Cotizado"] || 0)}</td>
            <td>$${fmt(acum["En Negociación"] || 0)}</td>
            <td>$${fmt(acum["Facturado"] || 0)}</td>
            <td>$${fmt(acum["Perdido"] || 0)}</td>
            <td>$${fmt((acum["Cotizado"] || 0) + (acum["En Negociación"] || 0))}</td>
            <td>$${fmt(acum.Total || 0)}</td>
        </tr>`;
    }
    tbody.innerHTML = rows || '<tr><td colspan="7" class="sin-feriados">Sin datos para este mes.</td></tr>';
}

function renderConversion() {
    const { porMes, keys } = agruparPorMes();
    const tbody = document.querySelector("#ind-conversion tbody");
    let rows = "";
    let aF = 0, aP = 0, aUF = 0, aUP = 0;
    keys.forEach(k => {
        if (mesActivo !== "TODOS" && k !== mesActivo) return;
        const recs = porMes[k];
        let f = 0, p = 0, uf = 0, up = 0;
        recs.forEach(c => {
            const v = Number(totalRegistro(c)) || 0;
            const u = Number(c.unidades) || 0;
            if (c.estado === "Facturado") { f += v; uf += u; }
            else if (c.estado === "Perdido") { p += v; up += u; }
        });
        aF += f; aP += p; aUF += uf; aUP += up;
        const cerrados = f + p;
        const conv = cerrados ? Math.round((f / cerrados) * 1000) / 10 : 0;
        rows += `<tr>
            <td><strong>${labelMes(k)}</strong></td>
            <td>$${fmt(f)}</td>
            <td>$${fmt(p)}</td>
            <td>$${fmt(cerrados)}</td>
            <td><strong>${conv}%</strong></td>
            <td>${fmt(uf)}</td>
            <td>${fmt(up)}</td>
        </tr>`;
    });
    if (mesActivo === "TODOS") {
        const conv = (aF + aP) ? Math.round((aF / (aF + aP)) * 1000) / 10 : 0;
        rows += `<tr class="ind-total-row">
            <td><strong>ACUMULADO</strong></td>
            <td>$${fmt(aF)}</td>
            <td>$${fmt(aP)}</td>
            <td>$${fmt(aF + aP)}</td>
            <td><strong>${conv}%</strong></td>
            <td>${fmt(aUF)}</td>
            <td>${fmt(aUP)}</td>
        </tr>`;
    }
    tbody.innerHTML = rows || '<tr><td colspan="7" class="sin-feriados">Sin datos para este mes.</td></tr>';
}

function renderTop() {
    const lista = clientes.filter(enMes);
    const porCanal = {};
    const porRegion = {};
    lista.forEach(c => {
        const k = c.canal || "Sin canal";
        porCanal[k] = (porCanal[k] || 0) + totalRegistro(c);
        const r = c.region || "Sin región";
        porRegion[r] = (porRegion[r] || 0) + totalRegistro(c);
    });
    const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const filas = (arr) => arr.map(([k, v], i) =>
        `<div class="ind-top-fila">
            <span class="ind-top-pos">${i + 1}</span>
            <span class="ind-top-nombre">${esc(k)}</span>
            <span class="ind-top-valor">$${fmt(v)}</span>
        </div>`).join("") || '<div class="sin-feriados">Sin datos.</div>';

    document.getElementById("ind-top-clientes").innerHTML = filas(top(porCanal));
    document.getElementById("ind-top-regiones").innerHTML = filas(top(porRegion));
}

function renderDesglose() {
    const lista = clientes.filter(enMes);
    const agg = {};
    lista.forEach(c => {
        const key = detModo === "canal" ? (c.canal || "Sin canal") : (c.region || "Sin región");
        if (!agg[key]) agg[key] = { u: 0, t: 0, n: 0 };
        agg[key].u += Number(c.unidades) || 0;
        agg[key].t += totalRegistro(c);
        agg[key].n++;
    });
    const sorted = Object.entries(agg).sort((a, b) => b[1].t - a[1].t);
    const tbody = document.querySelector("#ind-desglose tbody");
    let tU = 0, tT = 0;
    tbody.innerHTML = sorted.map(([k, d]) => {
        tU += d.u; tT += d.t;
        return `<tr>
            <td><strong>${esc(k)}</strong></td>
            <td class="crm-num">${fmt(d.u)}</td>
            <td class="crm-num">$${fmt(d.t)}</td>
        </tr>`;
    }).join("") || '<tr><td colspan="3" class="sin-feriados">Sin datos.</td></tr>';
    if (sorted.length) {
        tbody.innerHTML += `<tr class="ind-total-row">
            <td><strong>TOTAL</strong></td>
            <td class="crm-num">${fmt(tU)}</td>
            <td class="crm-num">$${fmt(tT)}</td>
        </tr>`;
    }
    document.querySelectorAll(".ind-det-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(detModo === "canal" ? "ind-det-cliente" : "ind-det-region").classList.add("active");
}

document.addEventListener("DOMContentLoaded", function () {
    loadData();
    document.getElementById("ind-det-cliente").addEventListener("click", () => { detModo = "canal"; renderDesglose(); });
    document.getElementById("ind-det-region").addEventListener("click", () => { detModo = "region"; renderDesglose(); });
});
