const button1 = document.getElementById("Button1");

function validateWebsite(targetUrl) {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const actual = tabs[0]?.url || "";
            resolve(actual.includes(targetUrl));
        });
    });
}

function showOnDisplayCourseListCheckBox(cursos) {
    const courseList = document.getElementById("courseList");
    const checklist = document.getElementById("cursoChecklist");

    if (!checklist || !courseList) return;

    checklist.innerHTML = ""; // Limpiar si ya hay contenido

    cursos.forEach((curso, index) => {
        const item = document.createElement("label");
        item.innerHTML = `
        <input type="checkbox" name="curso" value="${curso.url}" checked>
        ${curso.nombre}
        <br>
        `;
        checklist.appendChild(item);
    });

    courseList.classList.remove("hidden");
}

function showScrapeOptions() {
    const statusMessage = document.getElementById("statusMessage");
    const button1 = document.getElementById("Button1");

    if (statusMessage) {
        statusMessage.textContent = "Estás en la página de M7. Cargando cursos...";
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getCoursesInfo // Esta debe estar definida en background o scraping.js
        }, (result) => {
            const cursos = result[0].result;
            if (cursos && cursos.length > 0) {
                showOnDisplayCourseListCheckBox(cursos);
            } else {
                alert("No se encontraron cursos visibles.");
            }
        });
    });

    if (button1) {
        button1.classList.add("hidden");
    }
}


button1.addEventListener("click", async () => {
    const inM7 = await validateWebsite("modulo7.ucab.edu.ve");
    const inLoginUCAB = await validateWebsite("sso.ucab.edu.ve");

    if (inM7) {
        console.log("Estás en M7");
        showScrapeOptions();
    } else if (inLoginUCAB) {
        console.log("Parece que estás en la página de login. Inicia sesión primero.");
        // Mostrar mensaje informativo o estado de espera
    } else {
        console.log("No estás en la página de M7");
        alert("Por favor, accede a la página de M7 antes de continuar.");
    }
});


// Obtener el botón de inicio de scraping
const scrapingButton = document.getElementById("startScrapingBtn");

scrapingButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del botón

    const checkboxes = document.querySelectorAll('input[name="curso"]:checked');
    const selectedCourses = Array.from(checkboxes).map(checkbox => checkbox.value);

    chrome.runtime.sendMessage({
        type: "startScraping",
        courses: selectedCourses
    })
});
