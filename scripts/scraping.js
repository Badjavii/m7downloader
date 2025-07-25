function getCoursesInfo() {
    const tarjetas = document.querySelectorAll('.ic-DashboardCard');
    const cursos = [];

    tarjetas.forEach(card => {
        const titulo = card.querySelector('.ic-DashboardCard__header-title')?.innerText.trim();
        const urlRelativa = card.querySelector('.ic-DashboardCard__link')?.getAttribute('href');
        const codigo = card.querySelector('.ic-DashboardCard__header-subtitle')?.innerText.trim();
        const semestre = card.querySelector('.ic-DashboardCard__header-term')?.innerText.trim();

        cursos.push({
            nombre: titulo,
            url: `https://modulo7.ucab.edu.ve${urlRelativa}`,
            codigo,
            semestre
        });
    });

    return cursos;
}

function scrapeCursoContenido() {
    const nombreCurso = document.title?.split(':')[1]?.trim() || "Curso";
    console.log(`📚 Curso: ${nombreCurso}`);

    const modulos = document.querySelectorAll("div.context_module");

    modulos.forEach((modulo, i) => {
        const nombreSeccion = modulo.querySelector(".ig-header-title .name")?.innerText.trim() || `Sección ${i + 1}`;
        console.log(`🧩 ${nombreSeccion}`);

        const enlaces = modulo.querySelectorAll("a[href]");
        enlaces.forEach(enlace => {
            const texto = enlace.innerText.trim();
            const url = enlace.href;

            console.log(`   📄 ${texto} --> ${url}`);

            chrome.runtime.sendMessage({
                type: "download",
                url: url,
                filename: `${nombreCurso}/${nombreSeccion}/${texto}`
            });
        });
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "startScraping") {
        const urls = message.cursos;
        urls.forEach((cursoUrl) => {
            chrome.tabs.create({ url: `${cursoUrl}/modules` }, (tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: scrapeCursoContenido
                });
            })
        })
    }
})