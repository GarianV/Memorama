//version 1.1.0 (Refactorizada)
// Descripción: Juego de memoria con cartas, donde el jugador debe encontrar pares de cartas iguales.

// --- CONFIGURACIÓN DEL JUEGO ---
const cartasIMG = {
    Oro: 'resource/img/Chetcard-Oro.png',
    Arbol: 'resource/img/Chetcard-Arbol.png',
    Flor: 'resource/img/Chetcard-Flor.png',
    Cereza: 'resource/img/Chetcard-Cereza.png',
    Pelota: 'resource/img/Chetcard-Pelota.png',
    Flecha: 'resource/img/Chetcard-Flecha.png'
};
const TIEMPO_LIMITE_MIN = 1; // Límite de tiempo en minutos
const IMG_DEFAULT = 'resource/img/Chetcard-Default.png';
const maxPuntos = Object.keys(cartasIMG).length * 100;

// --- VARIABLES DE ESTADO DEL JUEGO ---
let cartasDeshabilitadas = false;
let cartaVolteada1 = null;
let cartaVolteada2 = null;
let puntos = 0;
let racha = 0;
let intervalTimer = null;

// --- ELEMENTOS DEL DOM (CACHÉ) ---
let pantallaInicioEl, mensajeEl, botonJugarEl, tableroEl, puntosEl, tiempoEl, rachaEl;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Guardamos los elementos del DOM una sola vez
    pantallaInicioEl = document.getElementById('pantalla-inicio');
    mensajeEl = document.getElementById('mensaje');
    botonJugarEl = document.getElementById('boton-jugar');
    tableroEl = document.querySelector('.tablero');
    puntosEl = document.getElementById('puntos');
    tiempoEl = document.getElementById('tiempo');
    rachaEl = document.getElementById('racha');

    // Listener para el botón de jugar
    botonJugarEl.addEventListener('click', () => {
        mostrarPantalla(false);
        iniciarJuego();
    });
});

/**
 * Muestra u oculta la pantalla de inicio/fin.
 * @param {boolean} mostrar - true para mostrar, false para ocultar.
 * @param {string} [msj=''] - Mensaje para mostrar en la pantalla.
 */
function mostrarPantalla(mostrar, msj = '') {
    if (msj) {
        mensajeEl.innerText = msj;
    }
    pantallaInicioEl.style.display = mostrar ? 'block' : 'none';
}

/**
 * Inicia o reinicia todo el juego.
 */
function iniciarJuego() {
    // 1. Reiniciar estado
    puntos = 0;
    cartaVolteada1 = null;
    cartaVolteada2 = null;
    cartasDeshabilitadas = false;
    
    // 2. Detener timer anterior (si existe)
    if (intervalTimer) {
        clearInterval(intervalTimer);
    }
    
    // 3. Actualizar UI
    actualizarPuntos();
    rachaEl.innerHTML = racha;
    tiempoEl.innerText = '00:00';

    // 4. Generar nuevo tablero
    generarTablero();

    // 5. Iniciar nuevo timer
    iniciarTimer(TIEMPO_LIMITE_MIN);
}

/**
 * Inicia el temporizador del juego.
 * @param {number} lim - Límite de minutos.
 */
function iniciarTimer(lim) {
    let minut = 0, seg = 0;
    
    intervalTimer = setInterval(() => {
        seg++;
        if (seg >= 60) {
            seg = 0;
            minut++;
        }

        // Formateo de tiempo
        tiempoEl.innerText = `${String(minut).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;

        // Comprobar si se acabó el tiempo
        if (minut >= lim) {
            clearInterval(intervalTimer);
            racha = 0; // Reinicia la racha si pierde
            mostrarPantalla(true, "¡El tiempo se ha acabado! Mejor suerte la próxima vez");
        }
    }, 1000);
}

/**
 * Genera dinámicamente las cartas y las añade al tablero.
 * Esta es la clave para la escalabilidad.
 */
function generarTablero() {
    // 1. Limpiar tablero anterior
    tableroEl.innerHTML = '';
    // Remover listener anterior si se usa (aunque con innerHTML se limpian)
    // Para delegación de eventos, lo asignamos una sola vez fuera si no cambiamos el tableroEl
    // Pero como lo asignaremos ahora, nos aseguramos de que solo haya uno.
    tableroEl.onclick = manejarClicCarta; // Asigna el manejador de eventos

    // 2. Preparar array de cartas
    const IMGs = Object.keys(cartasIMG);
    const IMGsDups = [...IMGs, ...IMGs]; // Duplicar
    mezclarArray(IMGsDups);

    // 3. Crear y añadir cada carta al DOM
    for (const nombreCarta of IMGsDups) {
        const rutaImagen = cartasIMG[nombreCarta];

        // Creamos la estructura HTML de la carta
        const cartaContainer = document.createElement('div');
        cartaContainer.classList.add('carts-container');
        cartaContainer.dataset.value = nombreCarta; // Guardamos el valor para comparar

        cartaContainer.innerHTML = `
            <img src="${rutaImagen}" class="carts-face carts-front" draggable="false">
            <img src="${IMG_DEFAULT}" class="carts-face carts-back" draggable="false">
        `;

        tableroEl.appendChild(cartaContainer);
    }
}

/**
 * Manejador central de clics en el tablero (Delegación de Eventos).
 * @param {Event} event - El objeto del evento click.
 */
function manejarClicCarta(event) {
    // 1. Encontrar el contenedor de la carta que fue clickeado
    const cartaClickeada = event.target.closest('.carts-container');

    // 2. Validar el clic
    if (!cartaClickeada || // Clic fuera de una carta
        cartasDeshabilitadas || // Clics bloqueados
        cartaClickeada === cartaVolteada1 || // Clic en la misma carta
        cartaClickeada.classList.contains('voltear')) // Clic en una carta ya volteada/encontrada
    {
        return;
    }

    // 3. Voltear la carta
    cartaClickeada.classList.add('voltear');

    // 4. Lógica de juego
    if (!cartaVolteada1) {
        // Es la primera carta
        cartaVolteada1 = cartaClickeada;
    } else {
        // Es la segunda carta
        cartaVolteada2 = cartaClickeada;
        cartasDeshabilitadas = true; // Bloquear clics mientras se compara

        // 5. Comparar las cartas
        comprobarCoincidencia();
    }
}

/**
 * Comprueba si las dos cartas volteadas son un par.
 */
function comprobarCoincidencia() {
    const esCoincidencia = cartaVolteada1.dataset.value === cartaVolteada2.dataset.value;

    if (esCoincidencia) {
        // ¡Es un par!
        puntos += 100;
        actualizarPuntos();
        deshabilitarCartasCoincidentes();
        comprobarSiGano();
    } else {
        // No es un par
        voltearCartasIncorrectas();
    }
}

/**
 * Deja las cartas volteadas y las resetea para la siguiente jugada.
 */
function deshabilitarCartasCoincidentes() {
    // Las cartas ya tienen la clase 'voltear', solo reseteamos las variables
    resetearTurno();
}

/**
 * Oculta las cartas después de un breve momento.
 */
function voltearCartasIncorrectas() {
    setTimeout(() => {
        cartaVolteada1.classList.remove('voltear');
        cartaVolteada2.classList.remove('voltear');
        resetearTurno();
    }, 800); // Dar tiempo a ver la segunda carta
}

/**
 * Resetea las variables de turno y re-habilita los clics.
 */
function resetearTurno() {
    [cartaVolteada1, cartaVolteada2] = [null, null];
    cartasDeshabilitadas = false;
}

/**
 * Comprueba si el jugador ha ganado la partida.
 */
function comprobarSiGano() {
    if (puntos === maxPuntos) {
        racha++;
        rachaEl.innerHTML = racha;
        clearInterval(intervalTimer); // Detiene el temporizador
        // Espera 1 segundo para mostrar la última carta antes de la pantalla de victoria
        setTimeout(() => {
            mostrarPantalla(true, "¡Felicidades, has ganado!");
        }, 1000);
    }
}

/**
 * Actualiza el contador de puntos en la UI.
 */
function actualizarPuntos() {
    puntosEl.innerHTML = `${puntos}/${maxPuntos}`;
}

/**
 * Algoritmo de Fisher-Yates para mezclar el array (in-place).
 * @param {Array} array - El array a mezclar.
 */
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}