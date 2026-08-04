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
                            cargo: "Product Division Director - Volume",
                            hijos: [
                                { nombre: "Sin definir", cargo: "Product Manager", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "SV", nombre: "El Salvador", cargo: "País", color: "#9C27B0", hijos: [
                        {
                            nombre: "",
                            cargo: "Product Division Manager Sr Vs Volumne",
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
                            cargo: "Product Director Vs Volume",
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
                            cargo: "Product Director",
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
                            cargo: "Product Division Director Vs Volumne",
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
                            cargo: "Product Director Vs Volume",
                            hijos: [
                                { nombre: "Deniesse Rios", cargo: "Product Manager McAfee Vs Volume", hijos: [] }
                            ]
                        }
                    ]
                },
                {
                    codigo: "CO", nombre: "Colombia", cargo: "País", color: "#FF9800", hijos: [
                        {
                            nombre: "Sergio Lievano",
                            cargo: "Gerente Intcomex Colombia",
                            hijos: [
                                {
                                    nombre: "Javier Succar",
                                    cargo: "Product Division Director Vs Volume Consumo",
                                    hijos: [
                                        { nombre: "Cristian Rios", cargo: "Product Manager Consumo", hijos: [] }
                                    ]
                                }
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

function renderCard(node) {
    const border = node.color ? `border-left:4px solid ${node.color};` : "";
    const cargoHtml = node.nombre ? `<div class="org-cargo">${node.cargo}</div>` : "";
    const nombre = node.nombre || node.cargo;
    return `<div class="org-card" style="${border}">
        ${cargoHtml}
        <div class="org-nombre">${nombre}</div>
    </div>`;
}

function renderBranch(node) {
    const card = renderCard(node);
    if (!node.hijos || node.hijos.length === 0) {
        return `<div class="org-branch">${card}</div>`;
    }
    const children = node.hijos.map(renderBranch).join("");
    return `<div class="org-branch">
        ${card}
        <div class="org-line-v"></div>
        <div class="org-children">${children}</div>
    </div>`;
}

function renderOrg() {
    const container = document.getElementById("org-tree");
    if (!container) return;

    const root = organigrama;
    const mid = root.hijos || [];
    const columns = [];
    for (const m of mid) {
        for (const c of (m.hijos || [])) {
            columns.push(c);
        }
    }

    let html = `<div class="org-top">${renderCard(root)}</div>`;
    for (const m of mid) {
        html += '<div class="org-line-v"></div>';
        html += `<div class="org-top">${renderCard(m)}</div>`;
    }
    if (columns.length) {
        html += '<div class="org-line-v"></div>';
        html += '<div class="org-columns-wrap"><div class="org-columns">';
        html += columns.map(c => `<div class="org-column">${renderBranch(c)}</div>`).join("");
        html += '</div></div>';
    }
    container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderOrg);
