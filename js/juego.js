//version 1.1.0
// Descripción: Juego de memoria con cartas, donde el jugador debe encontrar pares de cartas iguales.
document.addEventListener('DOMContentLoaded', () => {
    var msj = "none";
    document.getElementById('boton-jugar').addEventListener('click', () => {pantalla(msj)});
});

let cartasIMG = {
    Oro: 'resourse/img/Chetcard-Oro.png',
    Arbol: 'resourse/img/Chetcard-Arbol.png',
    Flor: 'resourse/img/Chetcard-Flor.png',
    Cereza: 'resourse/img/Chetcard-Cereza.png',
    Pelota: 'resourse/img/Chetcard-Pelota.png',
    Flecha: 'resourse/img/Chetcard-Flecha.png'
};
let IMGs, IMGsDups;
let cartasDeshabilitadas = false;
let controlador = true;
let puntos = 0;
let interval = null;
let racha = 0;

function pantalla(msj){
    console.log("pantalla")
    console.log(msj)
    let pantalla = document.getElementById("pantalla-inicio");
    document.getElementById("mensaje").innerText = msj;
    if(pantalla.style.display == "none"){
        console.log("pantalla -> block")
        pantalla.style.display = "block";
    }else{
        console.log("pantalla -> none")
        pantalla.style.display = "none";
        resetGame();
        timer(1000, 1); // Reinicia el temporizador con los valores iniciales
    }
}
function timer(unit, lim) {
    document.getElementById('puntos').innerHTML = puntos + "/600";
    const tiempo = document.getElementById('tiempo');
    tiempo.innerText = "00:00"; // Reinicia el temporizador
    document.getElementById('racha').innerHTML = racha;
    let minut = 0, seg = 0;
    interval = setInterval(() => {
        seg++;
        if (seg < 10) {
            tiempo.innerText = "0" + minut + ":0" + seg;
        } else if (seg >= 10 && seg < 60) {
            tiempo.innerText = "0" + minut + ":" + seg;
        } else {
            seg = 0;
            minut++;
            tiempo.innerText = "0" + minut + ":0" + seg;
        }
        var msj = "El tiempo se ha acabado! mejor suerte la próxima vez";
        if (minut == lim) {
            clearInterval(interval); // Detiene el temporizador
            puntos = 0; // Reinicia los puntos
            racha = 0; // Reinicia la racha
            pantalla(msj);
        }
    }, unit);
    mecanicas();
}

function mecanicas() {
    let Cartas = document.querySelectorAll(".carts");
    IMGs = Object.keys(cartasIMG);
    IMGsDups = IMGs.concat(IMGs);
    mezclarArray(IMGsDups);
    console.log(IMGsDups);

    Cartas.forEach((c) => {
        c.src = 'resourse/img/Chetcard-default.png';
    });

    let cart1='', cart2='', cartMem1, cartMem2;//cart solo guarda la propiedad "value", cartMem guarda todo el elemento de la jugada
    for(let i=0;i<Cartas.length;i++){
        let carta = Cartas[i];
        let propiedadCarta = IMGsDups[i];
        let imagenCarta = cartasIMG[propiedadCarta];
        switch(imagenCarta){
            case cartasIMG.Oro:
                carta.value = "oro";
                break;
            case cartasIMG.Arbol:
                carta.value = "arbol";
                break;
            case cartasIMG.Cereza:
                carta.value = "cereza";
                break;
            case cartasIMG.Flecha:
                carta.value = "flecha";
                break;
            case cartasIMG.Flor:
                carta.value = "flor";
                break;
            case cartasIMG.Pelota:
                carta.value = "pelota";
                break;
        }

        carta.addEventListener('click', ()=>{
            if(controlador){
                if(cartasDeshabilitadas){
                    console.log('cartas deshabilitadas')
                    return;
                }else{//activación
                    carta.src=imagenCarta;
                    if (carta.estado !== "pareja" && carta !== cartMem1 && carta !== cartMem2) {
                        if (!cart1 && !cartMem1) {
                            cartMem1 = carta;
                            cart1 = carta.value;
                            console.log("1. carta 1: ", cart1, cartMem1);
                        } else if (!cart2 && !cartMem2) {
                            cartMem2 = carta;
                            cart2 = carta.value;
                            console.log("2. carta 2: ", cart2, cartMem2);
                            // Verifica si hay dos cartas seleccionadas
                            if (cart1 && cart2) {
                                if (cart1 === cart2 && cartMem1.id !== cartMem2.id) {
                                    // Son iguales
                                    cartMem1.estado = "pareja";
                                    cartMem2.estado = "pareja";
                                    puntos += 100;
                                    console.log("!pareja ",cartMem1.estado, cartMem2.estado," puntos: ",puntos)
                                    reset_cartas();
                                } else {
                                    // Son diferentes
                                    console.log("diferentes")
                                    controlador = false;
                                    setTimeout(() => {
                                        cartMem1.src = 'resourse/img/Chetcard-default.png';
                                        cartMem2.src = 'resourse/img/Chetcard-default.png';
                                        controlador = true;
                                        reset_cartas();
                                    }, 500);
                                }
                                // Reinicia las variables después de comparar
                                function reset_cartas(){
                                    cart1 = '';
                                    cart2 = '';
                                    cartMem1 = null;
                                    cartMem2 = null;
                                    console.log("reinicio de variables [cart,cartMem]")
                                }
                                document.getElementById('puntos').innerHTML = puntos + "/600";

                                // Verifica si el jugador ha ganado
                                if(puntos==600){
                                let msj = "Ganaste!";
                                racha++;
                                puntos = 0; // Reinicia los puntos
                                document.getElementById('racha').innerHTML = racha;
                                clearInterval(interval); // Detiene el temporizador
                                pantalla(msj);
                                }
                            }
                        }
                        console.log('click')
                    }
                    
                    //código original
            }
        }else{
            console.log('controlador false')
                return;
        }
    }); 
}
}

//Algoritmo de Fisher-Yates para mezclar el array
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// Limpia los event listeners de las cartas
function limpiarEventListeners() {
    const cartas = document.querySelectorAll('.carts');
    cartas.forEach(carta => {
        const cartaLimpia = carta.cloneNode(true); // Clona el nodo, lo que elimina los listeners
        carta.parentNode.replaceChild(cartaLimpia, carta); // Reemplaza la carta por la versión "limpia"
    });
}
function resetGame() {
    cartasDeshabilitadas = false; // Habilita las cartas nuevamente
    controlador = true; // Reinicia el controlador
    IMGs = [];
    IMGsDups = [];
    limpiarEventListeners(); // Limpia los event listeners de las cartas
}     
