const organigrama = {
    nombre: "Hernan Freire",
    cargo: "Volume Productor Director Systems",
    hijos: [
        {
            nombre: "Natalia Santamaria",
            cargo: "Product Manager Multicountry VS Volume",
            hijos: [
                        {
                            codigo: "GT", nombre: "Guatemala", cargo: "País", color: "#00BCD4", hijos: [
                                {
                                    nombre: "Alejandro",
                                    cargo: ["Product Division Director", "Volume", "Vs Volume"],
                                    hijos: [
                                        { nombre: "No Hay", cargo: "Product Manager", hijos: [] }
                                    ]
                                }
                            ]
                        },
                {
                    codigo: "SV", nombre: "El Salvador", cargo: "País", color: "#9C27B0", hijos: [
                        {
                            nombre: "",
                            cargo: ["Product Division Manager Sr", "VS Volume"],
                            hijos: [
                                { nombre: "Beatriz Bonilla", cargo: "Product Manager McAfee", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "PE", nombre: "Perú", cargo: "País", color: "#FF5722", hijos: [
                        {
                            nombre: "Roberto Cordoba",
                            cargo: ["Product Director", "Volume"],
                            hijos: [
                                { nombre: "Marella Sarmiento", cargo: "Product Manager Vs Volumne McAfee", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "CL", nombre: "Chile", cargo: "País", color: "#D32F2F", hijos: [
                        {
                            nombre: "Daniel",
                            cargo: ["Sales Manager", "Top Consumer", "CS Top Consumer"],
                            hijos: [
                                { nombre: "Maxely Guzman", cargo: "Product Manager McAfee", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "CR", nombre: "Costa Rica", cargo: "País", color: "#4CAF50", hijos: [
                        {
                            nombre: "Juan Fernando Rodriguez",
                            cargo: "Product Director",
                            hijos: [
                                { nombre: "Andry Perez", cargo: "Product Manager McAfee", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "PA", nombre: "Panamá", cargo: "País", color: "#607D8B", hijos: [
                        {
                            nombre: "Veronica Bonilla",
                            cargo: ["Product Division Director", "Volume"],
                            hijos: [
                                { nombre: "Claudia Sanchez", cargo: "Product Manager McAfee Vs Volume", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "MX", nombre: "México", cargo: "País", color: "#E91E63", hijos: [
                        {
                            nombre: "Veronica Ortega",
                            cargo: ["Product Director", "Volume"],
                            hijos: [
                                { nombre: "Deniesse Rios", cargo: "Product Manager McAfee Vs Volume", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "CO", nombre: "Colombia", cargo: "País", color: "#FF9800",
                    flotante: { nombre: "Sergio Lievano", cargo: "Gerente Intcomex Colombia" },
                    hijos: [
                        {
                            nombre: "Javier Succar",
                            cargo: "Product Division Director Vs Volume Consumo",
                            hijos: [
                                { nombre: "Cristian Rios", cargo: "Product Manager Consumo", hijos: [] }
                            ]
                        }
                    ]
                },
                { codigo: "EC", nombre: "Ecuador", cargo: "País", color: "#2196F3", hijos: [], datos: {} },
                { codigo: "HN", nombre: "Honduras", cargo: "País", color: "#FFC107", hijos: [], datos: {} },
                { codigo: "NI", nombre: "Nicaragua", cargo: "País", color: "#009688", hijos: [], datos: {} }
            ]
        }
    ]
};

function cargoLines(cargo) {
    if (Array.isArray(cargo)) return cargo;
    return String(cargo)
        .split(/\s+-\s+/)
        .flatMap(seg => seg.split(/\s+Vs\s+/i));
}

function renderCard(node, depth) {
    const border = node.color ? `border-left:4px solid ${node.color};` : "";
    const cls = node.color ? "org-card" : `org-card org-role org-role-${Math.min(depth, 4)}`;
    const cargoHtml = node.nombre
        ? `<div class="org-cargo">${cargoLines(node.cargo).map(l => `<div>${l}</div>`).join("")}</div>`
        : "";
    const nombre = node.nombre || node.cargo;
    return `<div class="${cls}" style="${border}">
        ${cargoHtml}
        <div class="org-nombre">${nombre}</div>
    </div>`;
}

function renderBranch(node, depth) {
    const floatHtml = node.flotante
        ? `<div class="org-flotante">${renderCard(node.flotante, depth)}</div>`
        : "";
    const card = renderCard(node, depth);
    if (!node.hijos || node.hijos.length === 0) {
        return `<div class="org-branch">${floatHtml}${card}</div>`;
    }
    const children = node.hijos.map(c => renderBranch(c, depth + 1)).join("");
    return `<div class="org-branch">
        ${floatHtml}
        ${card}
        <div class="org-line-v"></div>
        <div class="org-children">${children}</div>
    </div>`;
}

function renderOrg() {
    const container = document.getElementById("org-tree");
    if (!container) return;

    const chain = [organigrama];
    let cur = organigrama;
    while (cur.hijos && cur.hijos.length && !cur.hijos.every(h => h.color)) {
        cur = cur.hijos[0];
        chain.push(cur);
    }
    const columns = (cur.hijos || []).filter(h => h.color);

    let html = chain.map((n, i) => {
        const cls = i === 1 ? "org-line-v org-line-v-lg" : "org-line-v";
        return (i > 0 ? `<div class="${cls}"></div>` : '') +
            `<div class="org-top">${renderCard(n, i)}</div>`;
    }).join("");

    if (columns.length) {
        html += '<div class="org-line-v"></div>';
        html += '<div class="org-columns-wrap"><div class="org-columns">';
        html += columns.map(c => `<div class="org-column">${renderBranch(c, chain.length)}</div>`).join("");
        html += '</div></div>';
    }
    container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderOrg);
