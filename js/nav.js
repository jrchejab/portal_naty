document.addEventListener("DOMContentLoaded", function () {
    const links = [
        { href: "index.html", label: "Calendario" },
        { href: "diferencia-horaria.html", label: "Horarios" },
        { href: "organigrama.html", label: "Organigrama" },
        { href: "crm.html", label: "CRM" },
        { href: "indicadores.html", label: "Indicadores" }
    ];
    const current = location.pathname.split("/").pop() || "index.html";
    const nav = document.getElementById("menu");
    if (!nav) return;
    nav.innerHTML = '<div class="menu-marca">PORTAL NATY</div>' + links.map(l =>
        `<a class="menu-link${current === l.href ? " active" : ""}" href="${l.href}">${l.label}</a>`
    ).join("");
});
