const MONTHS = [
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MONTH_OFFSET = 6;
const YEAR = 2026;

let currentStart = 0;
let activeFilter = "ALL";
let currentView = "MES";

const CAL_API_URL = "api.php?tipo=calendario";
const CAL_NOTAS_KEY = "cal_notas_v1";
let notasCal = {};
let panelDate = null;
let notasCalLocal = false;

function getCountry(code) {
    return countries.find(c => c.code === code);
}

function holidaysForDate(dateStr) {
    return holidays.filter(h => h.date === dateStr);
}

function buildMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const startOffset = startDow === 0 ? 6 : startDow - 1;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startOffset + 1;
        cells.push(dayNum < 1 || dayNum > daysInMonth ? null : dayNum);
    }
    return cells;
}

function formatDate(year, month, day) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function getMonthHolidays(year, month) {
    const result = {};
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
        const dateStr = formatDate(year, month, d);
        const h = holidaysForDate(dateStr);
        if (h.length > 0) {
            const filtered = activeFilter === "ALL"
                ? h
                : activeFilter === "SHARED"
                    ? (h.length >= 2 ? h : [])
                    : h.filter(hol => hol.country === activeFilter);
            if (filtered.length > 0) {
                result[dateStr] = filtered;
            }
        }
    }
    return result;
}

function closeAllTooltips() {
    document.querySelectorAll(".tooltip.show").forEach(t => t.classList.remove("show"));
}

function renderMonthEl(container, year, month) {
    container.innerHTML = "";
    closeAllTooltips();

    const header = document.createElement("div");
    header.className = "mes-header";
    header.textContent = `${MONTHS[month - MONTH_OFFSET]} ${year}`;
    container.appendChild(header);

    const dow = document.createElement("div");
    dow.className = "dias-semana";
    dow.innerHTML = "<span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>";
    container.appendChild(dow);

    const grid = document.createElement("div");
    grid.className = "dias-grid";
    container.appendChild(grid);

    const cells = buildMonth(year, month);
    const monthHolidays = getMonthHolidays(year, month);

    cells.forEach((dayNum) => {
        const div = document.createElement("div");
        div.className = "dia";
        if (dayNum === null) {
            div.classList.add("vacio");
            grid.appendChild(div);
            return;
        }

        const dateStr = formatDate(year, month, dayNum);
        const hList = monthHolidays[dateStr];

        div.innerHTML = `<span class="dia-numero">${dayNum}</span>`;

        const indicators = document.createElement("div");
        indicators.className = "indicadores";

        if (hList && hList.length > 0) {
            div.classList.add("tiene-feriado");
            const seen = new Set();
            hList.forEach(h => {
                if (seen.has(h.country)) return;
                seen.add(h.country);
                const c = getCountry(h.country);
                if (!c) return;
                const dot = document.createElement("span");
                dot.className = "indicador";
                dot.style.background = c.color;
                dot.title = `${c.name}: ${h.name}`;
                indicators.appendChild(dot);
            });
        }
        div.appendChild(indicators);

        if (notasCal[dateStr]) {
            const nt = document.createElement("div");
            nt.className = "nota-texto-celda";
            nt.textContent = notasCal[dateStr];
            nt.title = notasCal[dateStr];
            div.appendChild(nt);
        }

        div.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirPanelNota(dateStr);
        });

        grid.appendChild(div);
    });
}

function renderMonth(year, month) {
    const container = document.getElementById("vista-mes-container");
    container.style.display = "block";
    container.innerHTML = `
        <div id="mes-header" class="mes-header"></div>
        <div class="dias-semana">
            <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
        </div>
        <div id="dias-grid" class="dias-grid"></div>
    `;
    document.getElementById("vista-bimestre-container").style.display = "none";
    document.getElementById("vista-semestre-container").style.display = "none";
    renderMonthEl(document.getElementById("vista-mes-container"), year, month);
    updateLegend();
    updateNavButtons();
}

function renderBimestre(start) {
    const container = document.getElementById("vista-bimestre-container");
    container.style.display = "grid";
    container.innerHTML = "";
    document.getElementById("vista-mes-container").style.display = "none";
    document.getElementById("vista-semestre-container").style.display = "none";
    closeAllTooltips();

    for (let i = 0; i < 2; i++) {
        const block = document.createElement("div");
        block.className = "mes-block";
        container.appendChild(block);
        renderMonthEl(block, YEAR, start + i + MONTH_OFFSET);
    }

    updateLegend();
    updateNavButtons();
}

function renderSemestre() {
    const container = document.getElementById("vista-semestre-container");
    container.style.display = "grid";
    container.innerHTML = "";
    document.getElementById("vista-mes-container").style.display = "none";
    document.getElementById("vista-bimestre-container").style.display = "none";
    closeAllTooltips();

    for (let i = 0; i < MONTHS.length; i++) {
        const block = document.createElement("div");
        block.className = "mes-block";
        container.appendChild(block);
        renderMonthEl(block, YEAR, i + MONTH_OFFSET);
    }

    updateLegend();
}

function updateLegend() {
    const el = document.getElementById("leyenda");
    el.innerHTML = countries.map(c =>
        `<span class="leyenda-item">
            <span class="leyenda-dot" style="background:${c.color}"></span>
            ${c.name}
        </span>`
    ).join("");
}

function getStep() {
    return currentView === "BIMESTRE" ? 2 : 1;
}

function getMax() {
    return currentView === "BIMESTRE" ? MONTHS.length - 2 : MONTHS.length - 1;
}

function updateNavButtons() {
    const show = currentView !== "SEMESTRE";
    document.getElementById("prev-btn").style.display = show ? "" : "none";
    document.getElementById("next-btn").style.display = show ? "" : "none";

    if (currentView === "MES") {
        document.getElementById("periodo-label").textContent = "SEGUNDO SEMESTRE 2026";
        document.getElementById("print-btn").style.display = currentStart < MONTHS.length - 1 ? "" : "none";
    } else if (currentView === "BIMESTRE") {
        document.getElementById("periodo-label").textContent =
            `${MONTHS[currentStart]} - ${MONTHS[currentStart + 1]} ${YEAR}`;
        document.getElementById("print-btn").style.display = "none";
    } else {
        document.getElementById("periodo-label").textContent = "";
        document.getElementById("print-btn").style.display = "none";
    }

    if (show) {
        document.getElementById("prev-btn").disabled = currentStart === 0;
        document.getElementById("next-btn").disabled = currentStart >= getMax();
    }
}

function renderCurrent() {
    if (currentView === "MES") {
        renderMonth(YEAR, currentStart + MONTH_OFFSET);
    } else if (currentView === "BIMESTRE") {
        renderBimestre(currentStart);
    } else {
        renderSemestre();
    }
}

function setupFilters() {
    const container = document.getElementById("filtros");
    container.innerHTML = `<button class="filtro-btn active" data-filter="ALL">TODOS</button>`;

    countries.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "filtro-btn";
        btn.dataset.filter = c.code;
        btn.textContent = c.name;
        container.appendChild(btn);
    });

    const sharedBtn = document.createElement("button");
    sharedBtn.className = "filtro-btn";
    sharedBtn.dataset.filter = "SHARED";
    sharedBtn.textContent = "COMPARTIDOS";
    container.appendChild(sharedBtn);

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".filtro-btn");
        if (!btn) return;
        container.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        renderCurrent();
    });
}

function getPrintHtml(monthIdx) {
    const m1 = MONTH_OFFSET + monthIdx;
    const m2 = m1 + 1;
    const m1Name = MONTHS[monthIdx];
    const m2Name = MONTHS[monthIdx + 1];

    const legendHtml = countries.map(c =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin:0 5px;font-size:10px;">
            <span style="width:9px;height:9px;border-radius:50%;background:${c.color};display:inline-block;print-color-adjust:exact;-webkit-print-color-adjust:exact;"></span>
            ${c.name}
        </span>`
    ).join("");

    function build(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDow = firstDay.getDay();
        const startOffset = startDow === 0 ? 6 : startDow - 1;
        const daysInMonth = lastDay.getDate();
        const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
        const cells = [];
        for (let i = 0; i < totalCells; i++) {
            const d = i - startOffset + 1;
            cells.push(d < 1 || d > daysInMonth ? null : d);
        }
        return cells;
    }

    function renderTable(year, month) {
        const cells = build(year, month);
        const rows = [];
        for (let r = 0; r < cells.length / 7; r++) {
            const week = cells.slice(r * 7, (r + 1) * 7);
            rows.push(`<tr>${week.map(d => {
                if (d === null) return '<td class="v"></td>';
                const dateStr = formatDate(year, month, d);
                const hList = holidays.filter(h => h.date === dateStr);
                let borderStyle = "border:1px solid #d0d5dd;";
                let dots = "";
                if (hList.length > 0) {
                    const seen = [];
                    hList.forEach(h => {
                        if (seen.find(s => s.country === h.country)) return;
                        seen.push(h);
                    });
                    const colors = seen.map(h => getCountry(h.country).color);
                    const shadows = colors.map((c, i) =>
                        `inset 0 -${3 + i * 4}px 0 0 ${c}`
                    ).join(",");
                    borderStyle = `border:2px solid ${colors[0]};box-shadow:${shadows};print-color-adjust:exact;-webkit-print-color-adjust:exact;`;
                    dots = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;margin-top:4px;">${colors.map(c =>
                        `<span style="width:7px;height:7px;border-radius:50%;background:${c};display:inline-block;print-color-adjust:exact;-webkit-print-color-adjust:exact;"></span>`
                    ).join("")}</div>`;
                }
                return `<td style="text-align:center;vertical-align:top;padding:6px 2px;font-size:13px;font-weight:${hList.length ? 700 : 400};${borderStyle}border-radius:4px;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;">${d}${dots}</td>`;
            }).join("")}</tr>`);
        }
        return rows.join("");
    }

    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Calendario Feriados 2026 - ${m1Name} / ${m2Name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:24px 32px;color:#1a1a2e;height:100vh;}
h1{text-align:center;font-size:18px;margin-bottom:6px;}
.leyenda{text-align:center;margin-bottom:12px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;height:calc(100vh - 110px);}
.mes{display:flex;flex-direction:column;height:100%;}
.mes h2{text-align:center;font-size:15px;margin-bottom:6px;flex-shrink:0;}
.dow{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:10px;font-weight:600;color:#6b7280;margin-bottom:4px;flex-shrink:0;}
table{width:100%;border-collapse:collapse;flex:1;}
td{text-align:center;vertical-align:top;padding:8px 3px;font-size:13px;border:1px solid #d0d5dd;border-radius:4px;background:#fff;width:14.28%;height:calc((100vh - 200px) / 6);print-color-adjust:exact;-webkit-print-color-adjust:exact;}
td.v{border:none;background:transparent;}
@media print{body{padding:16px 24px;}.grid{height:calc(100vh - 100px);gap:24px;}td{height:calc((100vh - 180px) / 6);}@page{size:landscape;margin:12mm;}}
</style></head>
<body>
<h1>CALENDARIO DE FERIADOS 2026</h1>
<div class="leyenda">${legendHtml}</div>
<div class="grid">
<div class="mes"><h2>${m1Name.toUpperCase()} ${YEAR}</h2><div class="dow"><span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span></div><table>${renderTable(YEAR, m1)}</table></div>
<div class="mes"><h2>${m2Name.toUpperCase()} ${YEAR}</h2><div class="dow"><span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span></div><table>${renderTable(YEAR, m2)}</table></div>
</div>
<script>window.onload=function(){window.print();};<\/script>
</body></html>`;
}

function openPrintView() {
    if (currentStart >= MONTHS.length - 1) return;
    const html = getPrintHtml(currentStart);
    const w = window.open("", "_blank", "width=1000,height=700");
    w.document.write(html);
    w.document.close();
}

function setupNavigation() {
    document.getElementById("prev-btn").addEventListener("click", () => {
        if (currentStart > 0) {
            currentStart -= getStep();
            renderCurrent();
        }
    });
    document.getElementById("print-btn").addEventListener("click", openPrintView);
    document.getElementById("next-btn").addEventListener("click", () => {
        if (currentStart < getMax()) {
            currentStart += getStep();
            renderCurrent();
        }
    });
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".dia")) {
        closeAllTooltips();
    }
    if (!e.target.closest(".nota-panel") && !e.target.closest(".dia")) {
        cerrarPanelNota();
    }
});

function cargarNotasCal() {
    fetch(CAL_API_URL, { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error("api");
            return res.json();
        })
        .then(data => {
            notasCal = (data && typeof data === "object" && !Array.isArray(data)) ? data : {};
            notasCalLocal = false;
            renderCurrent();
        })
        .catch(() => {
            notasCalLocal = true;
            try {
                notasCal = JSON.parse(localStorage.getItem(CAL_NOTAS_KEY)) || {};
            } catch (e) {
                notasCal = {};
            }
            renderCurrent();
        });
}

function guardarNotasCal() {
    if (notasCalLocal) {
        localStorage.setItem(CAL_NOTAS_KEY, JSON.stringify(notasCal));
        return;
    }
    fetch(CAL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notasCal)
    }).catch(() => {
        notasCalLocal = true;
        localStorage.setItem(CAL_NOTAS_KEY, JSON.stringify(notasCal));
    });
}

function abrirPanelNota(dateStr) {
    panelDate = dateStr;
    const fecha = new Date(dateStr + "T12:00:00");
    const label = fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    document.getElementById("nota-fecha").textContent = label.toUpperCase();
    document.getElementById("nota-texto").value = notasCal[dateStr] || "";

    const hList = holidaysForDate(dateStr);
    const feriadosEl = document.getElementById("nota-feriados");
    if (hList.length > 0) {
        feriadosEl.innerHTML = hList.map(h => {
            const c = getCountry(h.country);
            return `<div class="nota-feriado">
                <span class="nota-dot" style="background:${c ? c.color : "#94a3b8"}"></span>
                <div>
                    <div class="nota-feriado-pais">${c ? c.name : h.country}</div>
                    <div class="nota-feriado-nombre">${h.name} · ${h.type}</div>
                </div>
            </div>`;
        }).join("");
        feriadosEl.style.display = "block";
    } else {
        feriadosEl.innerHTML = '<div class="nota-feriado nota-sin">No hay feriados registrados.</div>';
        feriadosEl.style.display = "block";
    }

    document.getElementById("nota-msg").textContent = "";
    document.getElementById("nota-panel").style.display = "flex";
}

function cerrarPanelNota() {
    document.getElementById("nota-panel").style.display = "none";
    panelDate = null;
}

function guardarNotaActual() {
    if (!panelDate) return;
    const txt = document.getElementById("nota-texto").value.trim();
    if (txt) {
        notasCal[panelDate] = txt;
    } else {
        delete notasCal[panelDate];
    }
    guardarNotasCal();
    renderCurrent();
    const msg = document.getElementById("nota-msg");
    msg.textContent = "Nota guardada.";
    setTimeout(() => { msg.textContent = ""; }, 2000);
}

function borrarNotaActual() {
    if (!panelDate) return;
    delete notasCal[panelDate];
    document.getElementById("nota-texto").value = "";
    guardarNotasCal();
    renderCurrent();
    const msg = document.getElementById("nota-msg");
    msg.textContent = "Nota eliminada.";
    setTimeout(() => { msg.textContent = ""; }, 2000);
}

function setupViewToggle() {
    const views = ["MES", "BIMESTRE", "SEMESTRE"];
    const ids = ["vista-mes", "vista-bimestre", "vista-semestre"];

    views.forEach((v, i) => {
        document.getElementById(ids[i]).addEventListener("click", () => {
            if (currentView === v) return;
            const prevView = currentView;
            currentView = v;
            ids.forEach(id => document.getElementById(id).classList.remove("active"));
            document.getElementById(ids[i]).classList.add("active");

            if (prevView === "SEMESTRE" && v !== "SEMESTRE") {
                currentStart = 0;
            } else if (prevView === "MES" && v === "BIMESTRE") {
                currentStart = Math.floor(currentStart / 2) * 2;
            } else if (prevView === "BIMESTRE" && v === "MES") {
            }

            renderCurrent();
        });
    });
}

function mesInicial() {
    const now = new Date();
    if (now.getFullYear() !== YEAR) return 0;
    const idx = now.getMonth() - MONTH_OFFSET;
    return Math.max(0, Math.min(idx, MONTHS.length - 1));
}

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    setupNavigation();
    setupViewToggle();

    document.getElementById("nota-guardar").addEventListener("click", guardarNotaActual);
    document.getElementById("nota-borrar").addEventListener("click", borrarNotaActual);
    document.getElementById("nota-cerrar").addEventListener("click", cerrarPanelNota);
    document.getElementById("nota-panel").addEventListener("click", (e) => {
        if (e.target.id === "nota-panel") cerrarPanelNota();
    });

    currentStart = mesInicial();
    renderCurrent();
    cargarNotasCal();
});