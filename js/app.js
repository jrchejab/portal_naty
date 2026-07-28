const MONTHS = [
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MONTH_OFFSET = 6;
const YEAR = 2026;

let currentMonthIndex = 0;
let activeFilter = "ALL";
let currentView = "MES";

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
        if (dayNum < 1 || dayNum > daysInMonth) {
            cells.push(null);
        } else {
            cells.push(dayNum);
        }
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
    document.querySelectorAll(".tooltip.show").forEach(t => {
        t.classList.remove("show");
    });
}

function renderMonthEl(container, year, month, compact) {
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

            const tip = document.createElement("div");
            tip.className = "tooltip";

            const fechaLabel = `${dayNum} DE ${MONTHS[month - MONTH_OFFSET].toUpperCase()} DE ${year}`;
            tip.innerHTML = `<div class="tooltip-fecha">${fechaLabel}</div>`;

            const seen2 = new Set();
            hList.forEach(h => {
                if (seen2.has(h.country)) return;
                seen2.add(h.country);
                const c = getCountry(h.country);
                if (!c) return;
                const item = document.createElement("div");
                item.className = "tooltip-feriado";
                item.innerHTML = `
                    <span class="tooltip-dot" style="background:${c.color}"></span>
                    <div class="tooltip-info">
                        <div class="tooltip-pais">${c.name}</div>
                        <div class="tooltip-nombre">${h.name}</div>
                        <div class="tooltip-tipo">${h.type}</div>
                    </div>
                `;
                tip.appendChild(item);
            });

            div.appendChild(indicators);
            div.appendChild(tip);

            div.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllTooltips();
                tip.classList.toggle("show");
            });
        } else {
            div.appendChild(indicators);
        }

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
    document.getElementById("vista-semestre-container").style.display = "none";
    renderMonthEl(document.getElementById("vista-mes-container"), year, month, false);
    updateLegend();
    updateNavButtons();
}

function renderSemestre() {
    const container = document.getElementById("vista-semestre-container");
    container.style.display = "grid";
    container.innerHTML = "";
    document.getElementById("vista-mes-container").style.display = "none";
    closeAllTooltips();

    for (let i = 0; i < MONTHS.length; i++) {
        const block = document.createElement("div");
        block.className = "mes-block";
        container.appendChild(block);
        renderMonthEl(block, YEAR, i + MONTH_OFFSET, true);
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

function updateNavButtons() {
    const show = currentView === "MES";
    document.getElementById("prev-btn").style.display = show ? "" : "none";
    document.getElementById("next-btn").style.display = show ? "" : "none";
    document.getElementById("periodo-label").textContent = show ? "SEGUNDO SEMESTRE 2026" : "";
    if (show) {
        document.getElementById("prev-btn").disabled = currentMonthIndex === 0;
        document.getElementById("next-btn").disabled = currentMonthIndex === MONTHS.length - 1;
    }
}

function renderCurrent() {
    if (currentView === "MES") {
        renderMonth(YEAR, currentMonthIndex + MONTH_OFFSET);
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

function setupNavigation() {
    document.getElementById("prev-btn").addEventListener("click", () => {
        if (currentMonthIndex > 0) {
            currentMonthIndex--;
            renderCurrent();
        }
    });
    document.getElementById("next-btn").addEventListener("click", () => {
        if (currentMonthIndex < MONTHS.length - 1) {
            currentMonthIndex++;
            renderCurrent();
        }
    });
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".dia")) {
        closeAllTooltips();
    }
});

function setupViewToggle() {
    document.getElementById("vista-mes").addEventListener("click", () => {
        if (currentView === "MES") return;
        currentView = "MES";
        document.getElementById("vista-mes").classList.add("active");
        document.getElementById("vista-semestre").classList.remove("active");
        renderCurrent();
    });
    document.getElementById("vista-semestre").addEventListener("click", () => {
        if (currentView === "SEMESTRE") return;
        currentView = "SEMESTRE";
        document.getElementById("vista-semestre").classList.add("active");
        document.getElementById("vista-mes").classList.remove("active");
        renderCurrent();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    setupNavigation();
    setupViewToggle();
    renderCurrent();
});
