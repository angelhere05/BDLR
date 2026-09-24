let barriosData = [];

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
            const barrioData = barriosData.find(barrio => barrio.nombre ===nombre);
            const color = barrioData ? barrioData.color : "#7b3fa0";

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
        const barrioData = barriosData.find(barrio => barrio.nombre === nombre);
        const color = barrioData ? barrioData.color : "#7b3fa0";

        barrio.setStyle({
            color: color,
            fillColor: color,
            weight: 3,
            fillOpacity: 0.20,
            opacity: 1
        });

    });
}

fetch('barrios.json')
    .then (response => {
        if (!response.ok) {
            throw new Error('No se pudo encontrar barrios.json');
        }
        return response.json();

    })
    .then(barrios => {
        barriosData = barrios;

        const contenedor = document.getElementById('neighborhoodButtons');
        const contador = document.getElementById('neighborhoodCount');

        contenedor.innerHTML = '';

        contador.textContent = String(barrios.length).padStart(2, '0');

        barrios.forEach(barrio => {

            const boton = document.createElement('button');

            boton.type = 'button';
            boton.className = 'neighborhood-button';
            boton.style.setProperty('--color-barrio', barrio.color);
            boton.textContent = barrio.nombre;

            boton.addEventListener('mouseenter', function () {

                resaltarBarrio(barrio.nombre);

            });

            boton.addEventListener('mouseleave', function () {

                restaurarBarrios();

            });

            boton.addEventListener('click', function () {
                window.location.hash = barrio.id;
            });

            contenedor.appendChild(boton);

        });

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

                        const barrioData = barriosData.find(
                            barrio => barrio.nombre === feature.properties.name
                        );

                        const color = barrioData ? barrioData.color : "#7b3fa0";

                        return {color: color, weight: 3, fillColor: color, fillOpacity: 0.20};
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
                                const barrioData = barriosData.find(barrio => barrio.nombre === nombre);

                                if (barrioData) {
                                    window.location.hash = barrioData.id;
                                }
                            }

                        });

                    }

                }).addTo(map);

                map.fitBounds(barriosLayer.getBounds(), {
                    padding: [5, 5]
                });

                manejarRuta()

            })

    })
    .catch(error => {

        console.error('Error cargando los barrios:', error);

    }
);

function cargarBarrio(barrio) {

    const vista = document.getElementById('vista-barrio');

    const franja = document.getElementById('barrio-franja');
    const nombre = document.getElementById('barrio-nombre');
    const descripcion = document.getElementById('barrio-descripcion');
    const imagen = document.getElementById('barrio-imagen');
    const datos = document.getElementById('barrio-datos');
    const historia = document.getElementById('barrio-historia');
    const destacados = document.getElementById('barrio-destacados');
    const galeria = document.getElementById('barrio-galeria');
    const cta = document.getElementById('barrio-cta');

    franja.style.background = barrio.color;

    nombre.textContent = barrio.nombre;

    descripcion.textContent = barrio.descripcion;

    imagen.src = barrio.imagen;
    imagen.alt = barrio.altImagen;

    datos.innerHTML = '';

    Object.entries(barrio.datos).forEach(([titulo, valor]) => {

        const tarjeta = document.createElement('div');

        tarjeta.className = 'dato-card';

        tarjeta.innerHTML = `
            <span>${titulo}</span>
            <strong>${valor}</strong>
        `;

        datos.appendChild(tarjeta);
    });

    const tarjetaColor = document.createElement('div');

    tarjetaColor.className = 'dato-card';

    tarjetaColor.innerHTML = `
        <span>Color en el mapa</span>
        <strong style="color:${barrio.color};">
            ● ${barrio.colorNombre}
        </strong>
    `;

    datos.appendChild(tarjetaColor);

    historia.innerHTML = '';

    barrio.historia.forEach(parrafo => {

        const p = document.createElement('p');

        if (parrafo.startsWith('Nota:')) {
            const em = document.createElement('em');
            em.textContent = parrafo;
            p.appendChild(em);
        } else {
            p.textContent = parrafo;
        }

        historia.appendChild(p);
    });

    destacados.innerHTML = '';

    barrio.destacados.forEach(destacado => {

        const tarjeta = document.createElement('div');

        tarjeta.className = 'destacado-card';

        tarjeta.innerHTML = `
            <h3>${destacado.titulo}</h3>
            <p>${destacado.descripcion}</p>
        `;

        destacados.appendChild(tarjeta);
    });

    galeria.innerHTML = '';

    barrio.galeria.forEach(texto => {

        const item = document.createElement('div');

        item.className = 'galeria-item';

        const span = document.createElement('span');
        span.textContent = texto;

        item.appendChild(span);

        galeria.appendChild(item);
    });

    cta.textContent =
        `Ubica ${barrio.nombre} en el mapa interactivo junto a los demás barrios patrimoniales.`;

    vista.hidden = false;
}

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

document.querySelectorAll(".nav a").forEach(enlace => {

    enlace.addEventListener("click", () => {

        cabecera.classList.remove("abierto");

        menuBtn.setAttribute("aria-expanded", "false");

        menuBtn.setAttribute("aria-label", "Abrir menú");
    });
});

document.addEventListener("click", (e) => {

    if (
        cabecera.classList.contains("abierto") &&
        !cabecera.contains(e.target)
    ) {
        cabecera.classList.remove("abierto");

        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Abrir menú");
    }
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

        const barrio = barriosData.find(
            barrio => barrio.id === destino
        );

        if (barrio) {
            cargarBarrio(barrio);
        }

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