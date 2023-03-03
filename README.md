# Tarea 3

## Opcion elegida: C. Rendering de un terreno

- Lenguaje utilizado: Javascript
- API: WebGL

## Ejecucion de la tarea

Para ejecutar la tarea basta con abrir el archivo `index.html` en un navegador, sin embargo es necesario que sea un
navegador (y computador) que soporte WebGL.

## Camara

La camara orbita respecto al punto `(0, 0, 0)` y esta diseñada con coordenadas esfericas.

## Controles

La tarea solo cuenta con controles basicos a traves del teclado:

- `Flecha [izquierda/derecha/arriba/abajo]`: Rota la camara hacia `[izquierda/derecha/arriba/abajo]` segun la 
flecha que se haya presionado.
- `W`: Zoom-In
- `S`: Zoom-Out
- `R`: Cambiar la funcion fractal generadora de terreno al azar (actualmente solo hay ~19 imagenes por lo que puede volverse un
poco repetitivo).