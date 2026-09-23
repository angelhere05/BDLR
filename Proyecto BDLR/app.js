const paginasBarrios = {
    "El Prado": "barrio-01",
    "Barrio Abajo": "barrio-02",
    "Rebolo": "barrio-03",
    "San Roque": "barrio-04",
    "Centro Histórico": "barrio-05"
};

const map = L.map('map').setView([10.9685, -74.7813], 13);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

let barriosLayer;

function resaltarBarrio(nombre) {

    if (!barriosLayer) return;

    barriosLayer.eachLayer(function (barrio) {

        if (barrio.feature.properties.name === nombre) {

            const color = {
                "Rebolo": "#1f8a5f",
                "San Roque": "#1e6fb8",
                "Centro Histórico": "#d6303f",
                "Barrio Abajo": "#f6b91b",
                "El Prado": "#7b3fa0"
            }[nombre];

            barrio.setStyle({
                color: color,
                fillColor: color,
                weight: 5,
                fillOpacity: 0.45,
                opacity: 1
            });

            barrio.bringToFront();

        } else {

            barrio.setStyle({
                fillOpacity: 0.05,
                opacity: 0.25,
                weight: 3
            });

        }

    });
}

function restaurarBarrios() {

    if (!barriosLayer) return;

    barriosLayer.eachLayer(function (barrio) {

        const nombre = barrio.feature.properties.name;

        const color = {
            "Rebolo": "#1f8a5f",
            "San Roque": "#1e6fb8",
            "Centro Histórico": "#d6303f",
            "Barrio Abajo": "#f6b91b",
            "El Prado": "#7b3fa0"
        }[nombre];

        barrio.setStyle({
            color: color,
            fillColor: color,
            weight: 3,
            fillOpacity: 0.20,
            opacity: 1
        });

    });
}

fetch('barrios.geojson')
    .then(response => {

        if (!response.ok) {
            throw new Error('No se pudo encontrar barrios.geojson');
        }

        return response.json();

    })
    .then(data => {

        barriosLayer = L.geoJSON(data, {

            style: function (feature) {

                const colores = {
                    "Rebolo": "#1f8a5f",
                    "San Roque": "#1e6fb8",
                    "Centro Histórico": "#d6303f",
                    "Barrio Abajo": "#f6b91b",
                    "El Prado": "#7b3fa0"
                };

                const color = colores[feature.properties.name] || "#7b3fa0";

                return {
                    color: color,
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.20
                };
            },

            onEachFeature: function (feature, layer) {

                layer.bindTooltip(
                    feature.properties.name,
                    {
                        sticky: true,
                        direction: 'top',
                        className: 'barrio-tooltip'
                    }
                );

                layer.on({
                    
                    mouseover: function (e) {

                        const nombre = e.target.feature.properties.name;
                        resaltarBarrio(nombre);
                    },

                    mouseout: function () {

                        restaurarBarrios();

                    },

                    click: function (e) {

                        const nombre = e.target.feature.properties.name;
                        const destino = paginasBarrios[nombre];

                        if (destino) {
                            window.location.hash = destino;
                        }

                    }

                });

            }

        }).addTo(map);

        map.fitBounds(barriosLayer.getBounds(), {
            padding: [5, 5]
            });

    })
    .catch(error => {

        console.error('Error cargando los polígonos:', error);
});


fetch('barrios.json')
    .then (response => {
        if (!response.ok) {
            throw new Error('No se pudo encontrar barrios.json');
        }
        return response.json();

    })
    .then(barrios => {

        const contenedor = document.getElementById('neighborhoodButtons');
        const contador = document.getElementById('neighborhoodCount');

        contenedor.innerHTML = '';

        contador.textContent = String(barrios.length).padStart(2, '0');

        barrios.forEach(barrio => {

            const boton = document.createElement('button');

            boton.type = 'button';
            boton.className = 'neighborhood-button';
            boton.textContent = barrio.nombre;

            boton.addEventListener('mouseenter', function () {

                resaltarBarrio(barrio.nombre);

            });

            boton.addEventListener('mouseleave', function () {

                restaurarBarrios();

            });
            boton.addEventListener('click', function () {

                const destino = paginasBarrios[barrio.nombre];

                if (destino) {
                    window.location.hash = destino;
                }

            });
            contenedor.appendChild(boton);

        });
    })
    .catch(error => {

        console.error('Error cargando los barrios:', error);

    });

const menuBtn = document.querySelector(".menu-btn");
const cabecera = document.querySelector(".cabecera");

menuBtn.addEventListener("click", () => {

    const abierto = cabecera.classList.toggle("abierto");

    menuBtn.setAttribute("aria-expanded", abierto);

    menuBtn.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );

});

function mostrarVista(destino) {

    const esBarrio = destino.startsWith('barrio-');

    document.querySelectorAll('.vista-barrio').forEach(function (vista) {
        vista.hidden = true;
    });

    document.querySelectorAll('main > :not(.vista-barrio)').forEach(function (el) {
        el.style.display = esBarrio ? 'none' : '';
    });

    if (esBarrio) {

        const vista = document.getElementById('vista-' + destino);
        if (vista) vista.hidden = false;
        window.scrollTo(0, 0);

    } else if (destino && destino !== 'inicio') {

        const seccion = document.getElementById(destino);
        if (seccion) {
            requestAnimationFrame(function () {
                seccion.scrollIntoView({ behavior: 'smooth' });
            });
        }

    } else {
        window.scrollTo(0, 0);
    }

}

function manejarRuta() {

    const destino = window.location.hash.replace('#', '').replace('/', '') || 'inicio';
    mostrarVista(destino);

}

window.addEventListener('hashchange', manejarRuta);
window.addEventListener('DOMContentLoaded', manejarRuta);