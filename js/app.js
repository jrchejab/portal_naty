const MONTHS = [
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MONTH_OFFSET = 6;
const YEAR = 2026;

let currentMonthIndex = 0;
let activeFilter = "ALL";

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

function renderMonth(year, month) {
    const grid = document.getElementById("dias-grid");
    const header = document.getElementById("mes-header");
    grid.innerHTML = "";
    closeAllTooltips();

    header.textContent = `${MONTHS[month - MONTH_OFFSET]} ${year}`;

    const cells = buildMonth(year, month);
    const monthHolidays = getMonthHolidays(year, month);

    cells.forEach((dayNum, idx) => {
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

            const parts = dateStr.split("-");
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

    updateLegend();
    updateNavButtons();
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
    document.getElementById("prev-btn").disabled = currentMonthIndex === 0;
    document.getElementById("next-btn").disabled = currentMonthIndex === MONTHS.length - 1;
}

function renderCurrent() {
    renderMonth(YEAR, currentMonthIndex + MONTH_OFFSET);
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

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    setupNavigation();
    renderCurrent();
});
