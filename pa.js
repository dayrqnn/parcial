document.addEventListener("DOMContentLoaded", () => {  
    console.log("JavaScript cargado correctamente.");

    // IDs de los botones y contenedores
    const buttons = {
        recent: document.getElementById("btn-recent"),
        today: document.getElementById("btn-today"),
        upcoming: document.getElementById("btn-upcoming")
    };

    const containers = {
        recent: document.getElementById("recent-matches"),
        today: document.getElementById("today-matches"),
        upcoming: document.getElementById("upcoming-matches")
    };

    // Asignar eventos a los botones
    Object.keys(buttons).forEach((key) => {
        if (buttons[key]) {
            console.log(`Botón encontrado: ${buttons[key].textContent}`);
            buttons[key].addEventListener("click", () => toggleMatches(key));
        }
    });

    function toggleMatches(category) {
        console.log(`Se hizo clic en: ${buttons[category].textContent}`);
        const container = containers[category];

        if (container.style.display === "none" || container.innerHTML === "") {
            container.style.display = "block";
            fetchMatches(category);
        } else {
            container.style.display = "none";
        }
    }

    async function fetchMatches(category) {
        let url = "https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/competitions/CL/matches";
        let apiKey = "ede9897fba744dd294255b9e6a2a6d49"; // Reemplaza con tu clave real

        try {
            console.log("Realizando solicitud a la API...");

            let response = await fetch(url, {
                headers: { "X-Auth-Token": apiKey }
            });

            console.log("Estado de la respuesta:", response.status);

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }

            let data = await response.json();
            console.log("Datos de la API recibidos:", data);

            if (!data.matches || !Array.isArray(data.matches)) {
                throw new Error("Estructura de datos inesperada en la respuesta.");
            }

            let matches = data.matches;

            // Obtener fecha actual en formato YYYY-MM-DD
            let today = new Date();
            let todayStr = today.toISOString().split("T")[0];

            // Filtrar solo los partidos del 2025
            let matches2025 = matches.filter(match => match.utcDate.startsWith("2025"));

            let filteredMatches = matches2025.filter(match => {
                let matchDate = match.utcDate.split("T")[0]; // Obtener solo la parte de la fecha

                if (category === "recent") {
                    return matchDate < todayStr; // Partidos pasados
                } else if (category === "today") {
                    return matchDate === todayStr; // Partidos de hoy
                } else if (category === "upcoming") {
                    return matchDate > todayStr; // Partidos futuros
                }
            });

            console.log(`Partidos filtrados para ${category}:`, filteredMatches);
            displayMatches(filteredMatches, category);
        } catch (error) {
            console.error("Error al obtener los partidos:", error);
            containers[category].innerHTML = `<p style="color: red;">Error al cargar los datos. Revisa la consola.</p>`;
        }
    }

    function displayMatches(matches, category) {
        const container = containers[category];
        container.innerHTML = "";

        if (matches.length === 0) {
            container.innerHTML = `<p>No se encontraron partidos disponibles.</p>`;
            return;
        }

        matches.forEach(match => {
            let matchElement = document.createElement("div");
            matchElement.classList.add("match-item");
            matchElement.innerHTML = `
                <p><strong>${match.competition.name}</strong></p>
                <p>${match.homeTeam.name} 🆚 ${match.awayTeam.name}</p>
                <p>Fecha: ${new Date(match.utcDate).toLocaleString()}</p>
                <hr>
            `;
            container.appendChild(matchElement);
        });
    }
});
