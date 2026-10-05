# ✦ Nuestro pequeño universo

Un mini RPG pixel art (vista desde arriba, estilo 16 bits) con interfaz de cristal, hecho en **Svelte 5 + Vite**.
Ella recorre un pequeño mundo, lee notitas en los letreros, abre cofres con recuerdos, resuelve tres retos
y al final del camino te encuentra a ti, bajo un árbol rosado, con una carta.

Además: **1000 mensajes de amor**. Cada vez que abra la app aparece uno nuevo en la portada (y en el buzón del juego).

Funciona en iPhone/Android (cruceta táctil y tocar para caminar) y en computadora (teclado).
Es una web estática: sin servidor, sin base de datos, sin servicios externos.

---

## 1. Ejecutarlo en tu computadora

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install        # instala las dependencias (una sola vez)
npm run dev        # abre http://localhost:5173
```

`npm run dev` también muestra una dirección de red (`Network: http://192.168...`).
Ábrela desde tu celular conectado al mismo wifi para probarlo en el iPhone.

Otros comandos:

```bash
npm run build      # genera la versión final en la carpeta dist/
npm run preview    # prueba esa versión final
```

---

## 2. Personalizarlo (lo importante)

Casi todo está en **`src/config.js`**. Busca el símbolo ✏️: marca lo que conviene reemplazar.

| Quieres cambiar…                     | Dónde                                                         |
| ------------------------------------ | ------------------------------------------------------------- |
| Nombre de ella y el tuyo             | `config.ella`, `config.yo`                                    |
| Título y subtítulo                   | `config.title`, `config.subtitle`                             |
| Contador de días juntos              | `config.fechaEspecial: '2024-02-14'`                          |
| Colores de pelo, piel y ropa         | `config.personajes`                                           |
| Colores de la interfaz               | `config.colores`                                              |
| Frases de la introducción            | `config.intro`                                                |
| Notitas de los 5 letreros            | `config.letreros`                                             |
| Recuerdos de los 3 cofres            | `config.cofres` (título, fecha y texto)                       |
| Frases de las 3 estrellas escondidas | `config.estrellas.frases`                                     |
| Preguntas del gatito Hugo            | `config.pregunta.preguntas` (`correcta` empieza en 0)         |
| Lo que dices al final                | `config.final.dialogo`                                        |
| **La carta final**                   | `config.carta` (separa párrafos con `\n\n`)                   |
| Música                               | `config.musica` (ver abajo)                                   |
| **Los 1000 mensajes diarios**        | `src/lib/data/mensajes.js`                                    |

### Sin fotos (privacidad)
El proyecto no usa fotos reales: como el repositorio es público, cualquiera podría verlas.
Cada recuerdo se muestra con una ilustración pixel art de los dos.
Por seguridad, `public/fotos/` está en `.gitignore`, así que aunque copies una foto ahí por error, no se sube.

### Música
Por defecto el juego genera su propia música suave 8-bit (y cambia a una melodía más emotiva en el final).
Para usar vuestra canción: copia un `.mp3` a `public/audio/` y escribe `musica: 'audio/nuestra-cancion.mp3'`.
Nunca suena nada hasta que ella toca un botón, y siempre se puede silenciar.

### Los 1000 mensajes
`src/lib/data/mensajes.js` es una lista de frases entre comillas. Puedes editarlas, borrarlas o añadir las vuestras
(¡las que escribas tú van a pegar mucho más!). El orden de la lista es el orden en el que aparecen.
- Cada apertura de la app = un mensaje nuevo. Recargar la misma pestaña no gasta mensajes.
- Los que ya leyó quedan guardados en el **Diario → Mensajes**.
- Al llegar al 1000, vuelve a empezar.

Los mensajes se generaron combinando ~130 frases escritas a mano con plantillas; si quieres regenerarlos
con tus propias listas, edita `scripts/generar-mensajes.py` y ejecuta `python3 scripts/generar-mensajes.py`.

---

## 3. Publicarlo gratis en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `nuestro-universo`) y sube esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Nuestro pequeño universo"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/nuestro-universo.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Listo. El archivo `.github/workflows/deploy.yml` compila y publica solo en cada `push`.
   En la pestaña **Actions** verás el progreso; la dirección queda así:
   `https://TU_USUARIO.github.io/nuestro-universo/`

**Actualizar el contenido:** cambia lo que quieras, y luego
```bash
git add .
git commit -m "Nuevos mensajes"
git push
```
En uno o dos minutos ya está actualizado.

> El proyecto usa rutas relativas (`base: './'` en `vite.config.js`), así que funciona en cualquier subcarpeta.
> Si alguna vez necesitas fijar la ruta: `BASE_PATH=/nuestro-universo/ npm run build`.

> Ojo: en un repositorio público cualquiera con el enlace puede ver el juego y leer `config.js`.
> No pongas datos muy privados (direcciones, teléfonos…).

### Para que ella lo tenga como app en el iPhone
Ábrelo en Safari → botón compartir → **Añadir a pantalla de inicio**. Se abrirá a pantalla completa, con su icono.

---

## 4. Cómo se juega

- **Computadora:** flechas o WASD para caminar · Espacio/Enter para interactuar · J diario · M sonido · Esc pausa.
- **Celular:** tocar el suelo para caminar (o la cruceta) · tocar las cosas que brillan · botón **A** para interactuar.

Para llegar al final hay que encender **3 luces**:
1. ✦ Encontrar las 3 estrellas escondidas entre las flores (parpadean de vez en cuando).
2. ❀ Responder bien las preguntas de Hugo, el gatito de la entrada (equivocarse no castiga, solo hace bromas).
3. ◈ Armar el rompecabezas del pedestal (toca dos piezas para intercambiarlas).

Con las 3 luces se abre la cerca de flores del norte, donde estás tú. El progreso se guarda solo en el navegador;
se puede reiniciar desde **Pausa → Reiniciar aventura** (pide confirmación; los mensajes diarios se conservan).

---

## 5. Estructura

```
src/
├── config.js                     ✏️ todo lo personalizable
├── App.svelte                    escenas + transición tipo iris
├── app.css                       estilos globales, cristal (glassmorphism)
└── lib/
    ├── data/mensajes.js          ✏️ los 1000 mensajes
    ├── game/
    │   ├── engine.js             bucle, movimiento, colisiones, cámara, luces, final
    │   ├── world.js              mapa y todo el arte del escenario (dibujado en código)
    │   ├── sprites.js            pixel art de los personajes (editable como texto)
    │   ├── illustration.js       escena de los dos bajo el árbol
    │   ├── state.svelte.js       estado, máquina de escenas y guardado
    │   ├── daily.js              un mensaje nuevo por apertura
    │   └── audio.js              música y efectos 8-bit (Web Audio)
    └── components/               menú, intro, mundo, diálogos, cofres, minijuegos, diario, carta…
public/
└── audio/                        ✏️ tu música (opcional)
```

Los personajes están dibujados como texto en `src/lib/game/sprites.js` (cada letra es un color).
Si quieres retocar el pelo o la ropa pixel a pixel, se hace ahí; los colores se cambian desde `config.js`.
