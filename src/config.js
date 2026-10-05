// ═══════════════════════════════════════════════════════════════
//   ✏️  ARCHIVO DE PERSONALIZACIÓN
//   Todo lo que ella va a leer y ver se cambia desde aquí.
//   Busca "✏️" para encontrar lo que conviene reemplazar.
//   Los 1000 mensajes diarios están en: src/lib/data/mensajes.js
// ═══════════════════════════════════════════════════════════════

export const config = {
  title: 'Nuestro pequeño universo',
  subtitle: 'Una pequeña aventura que solo tiene sentido porque existes tú',

  // ✏️ Nombres
  ella: 'MJ', //        ✏️ el nombre o apodo de ella
  yo: 'Tu chico', //    ✏️ tu nombre o apodo

  // ✏️ Fecha especial (aniversario). Formato AAAA-MM-DD. Déjalo en '' para ocultar el contador.
  fechaEspecial: '',
  textoFecha: 'días a tu lado', // se muestra como "123 días a tu lado"

  // ✏️ Colores de los personajes (pixel art)
  personajes: {
    ella: {
      skin: '#f0c09a',
      hair: '#1d1a26', // cabello negro
      shirt: '#b98ad6',
      pants: '#4a6fa5',
      shoes: '#f4efe6',
    },
    yo: {
      skin: '#e3b08a',
      hair: '#3b2618', // rulos
      shirt: '#4fa3a0',
      pants: '#3c4d6b',
      shoes: '#2f2f38',
    },
  },

  // ✏️ Colores de la interfaz
  colores: {
    acento: '#ffb3c7', //   rosa suave
    luz: '#ffd98a', //      luz cálida
    noche: '#1b1638', //    azul noche
    texto: '#fff8ef', //    blanco crema
  },

  // ✏️ Música (opcional). Pon un archivo .mp3 en public/audio/ y escribe su nombre.
  //    Si lo dejas vacío, el juego genera su propia música suave tipo 8 bits.
  musica: '', // ejemplo: 'audio/nuestra-cancion.mp3'

  // ── Pantalla de inicio ─────────────────────────────────────────
  inicio: {
    boton: 'Comenzar nuestra aventura',
    botonContinuar: 'Continuar la aventura',
    mensajeNuevo: 'Tienes un mensaje nuevo',
  },

  // ── Introducción (aparece una sola vez, antes de entrar al mundo)
  intro: [
    'Había una vez un pequeño universo...',
    'No era muy grande. Tenía un camino, unas flores y un estanque.',
    'Pero alguien lo construyó pixel a pixel, pensando en ti.',
    'Al final del camino, hay alguien esperándote.',
  ],

  // ── Tutorial (primer diálogo dentro del mundo)
  tutorial: {
    teclado: 'Muévete con las flechas o WASD. Pulsa Espacio o Enter para hablar con las cosas que brillan.',
    tactil: 'Toca el suelo para caminar. Toca las cosas que brillan para descubrirlas.',
    objetivo: 'Reúne las 3 luces para abrir el camino del final ✦',
  },

  // ── Letreros del camino: notitas románticas ──────────────────────
  // Cada letrero es una notita. Puedes cambiar los textos libremente.
  letreros: [
    {
      id: 'letrero-1',
      titulo: 'Inicio del camino',
      texto: 'Este camino no lleva a ningún tesoro. Lleva a mí, que es casi lo mismo, pero con más abrazos.',
    },
    {
      id: 'letrero-2',
      titulo: 'Junto al estanque',
      texto: 'Dicen que si miras el agua el tiempo suficiente ves tu reflejo. Yo miro y solo pienso en tu sonrisa.',
    },
    {
      id: 'letrero-3',
      titulo: 'El puente',
      texto: 'Por ti cruzaría cualquier río. Y si no hay puente, me mojo, no pasa nada.',
    },
    {
      id: 'letrero-4',
      titulo: 'Bosquecito',
      texto: '✏️ Escribe aquí algo que te encante de ella. (Ej: la forma en que se ríe cuando algo le da mucha gracia.)',
    },
    {
      id: 'letrero-5',
      titulo: 'Casi llegas',
      texto: 'Si estás leyendo esto, ya casi llegas. Y yo ya tengo los brazos abiertos.',
    },
  ],

  // ── Cofres: recuerdos ───────────────────────────────────────────
  // Sin fotos reales (el repositorio es público): cada recuerdo se muestra
  // con una ilustración pixel art de los dos. (La carpeta public/fotos/ está en
  // .gitignore para que ninguna foto se suba por accidente.)
  cofres: [
    {
      id: 'cofre-1',
      objeto: 'Un dibujito guardado',
      titulo: '✏️ Nuestro primer recuerdo',
      fecha: '✏️ DD/MM/AAAA',
      texto: '✏️ Escribe aquí cómo fue ese día. Lo que sentiste, lo que pensaste, lo que nunca le dijiste.',
      foto: '', // sin foto: se muestra una ilustración
    },
    {
      id: 'cofre-2',
      objeto: 'Un boleto doblado',
      titulo: '✏️ Esa salida que no olvido',
      fecha: '✏️ DD/MM/AAAA',
      texto: '✏️ Cuenta aquí una anécdota bonita o graciosa de los dos.',
      foto: '', // sin foto: se muestra una ilustración
    },
    {
      id: 'cofre-3',
      objeto: 'Una nota escondida',
      titulo: '✏️ Razones por las que te quiero',
      fecha: '',
      texto: '✏️ 1. Escribe una razón.\n✏️ 2. Escribe otra.\n✏️ 3. Y una más, la más importante.',
      foto: '', // sin foto: se muestra una ilustración
    },
  ],

  // ── Minijuego 1: estrellas escondidas en el pasto ────────────────
  estrellas: {
    pista: 'Hay 3 estrellitas escondidas entre las flores. A veces parpadean...',
    frases: [
      'Estrella 1 ✦ Eres mi persona favorita en todos los universos posibles.',
      'Estrella 2 ✦ Contigo hasta los días normales se sienten especiales.',
      'Estrella 3 ✦ Si tuviera que elegir otra vez, te elegiría siempre.',
    ],
    premio: 'Encontraste las 3 estrellas. Una luz se ha encendido ✦',
  },

  // ── Minijuego 2: la pregunta especial (la hace Hugo, el gatito de la entrada) ──
  pregunta: {
    npc: 'Hugo',
    saludo: [
      'Miau. Soy Hugo, el portero oficial de este universo. Sí, tengo credencial.',
      'Para darte mi luz tienes que contestar mi pregunta especial.',
      'Y no acepto sobornos. Bueno... atún sí. Pero no traes atún, así que pregunta.',
    ],
    // lo que dice Hugo si vuelves a hablarle después de ganar
    despues: [
      'Ya tienes mi luz. Ahora déjame dormir mis 18 horas reglamentarias.',
      'Y si ves a un chico alto con rulos, dile que me debe atún.',
    ],
    preguntas: [
      {
        // ✏️ Cambia la pregunta y las respuestas por algo vuestro
        texto: '✏️ ¿Quién quiere más a quién?',
        opciones: ['Ella a él', 'Él a ella', 'Empate técnico', 'Hugo a todos'],
        correcta: 1, // índice de la respuesta correcta (empieza en 0)
        fallos: [
          'Miau... buen intento, pero él tiene pruebas de que no.',
          'Ese empate no te lo cree ni el buzón. Inténtalo otra vez.',
          'Qué lindo de tu parte, pero yo no cuento. Prueba de nuevo, humana.',
        ],
      },
      {
        texto: '✏️ ¿Qué es lo que él más disfruta de pasar tiempo contigo?',
        opciones: ['La comida', 'Todo, literalmente todo', 'Las series', 'Que pierdas en los juegos'],
        correcta: 1,
        fallos: [
          'Miau. La comida ayuda, pero no es la respuesta.',
          'Las series están bien, pero sin ti son aburridas. Otra vez.',
          'Jaja, no. Bueno... un poquito. Pero no. Intenta otra vez.',
        ],
      },
    ],
    premio: '¡Correcto! Hugo está orgulloso (aunque no lo demuestre). Una luz se ha encendido ✦',
  },

  // ── Minijuego 3: el rompecabezas del pedestal ───────────────────
  rompecabezas: {
    intro: 'Un pedestal antiguo con una imagen rota. Toca dos piezas para cambiarlas de lugar.',
    premio: 'La imagen está completa. Somos nosotros, debajo de nuestro árbol. Una luz se ha encendido ✦',
  },

  // ── Él, esperando al final ──────────────────────────────────────
  final: {
    bloqueado: '¡Hola! Te estoy esperando aquí. Pero el camino solo se abre con las 3 luces ✦',
    puerta: 'Una cerca de flores bloquea el paso. Parece que necesita 3 luces para abrirse.',
    abierta: 'La cerca de flores se abre lentamente...',
    dialogo: [
      'Llegaste.',
      'Sabía que llegarías.',
      'Tengo algo que darte...',
    ],
  },

  // ── ✏️ CARTA FINAL ───────────────────────────────────────────────
  carta: {
    titulo: 'Para ti',
    // Usa \n\n para separar párrafos.
    texto:
      '✏️ Aquí va tu carta. Escríbela con calma, como si ella la fuera a leer muchas veces (porque lo va a hacer).\n\n' +
      'Puedes contarle por qué hiciste este pequeño universo, qué sientes cuando la ves, qué sueñas con ella.\n\n' +
      'No tiene que ser perfecta. Tiene que ser tuya.',
    firma: 'Con todo mi amor,',
  },
};
