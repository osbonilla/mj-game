# Genera src/lib/data/mensajes.js con 1000 mensajes de amor únicos.
# Puedes editar directamente mensajes.js o cambiar las listas de aquí y volver a ejecutar:
#   python3 scripts/generar-mensajes.py
import random, json, pathlib

escritos = """Si el mundo se acabara mañana, hoy te buscaría para pasar el último día abrazados.
Eres mi lugar favorito, y ni siquiera eres un lugar.
No sé qué hice bien en la vida, pero sé que tú eres el premio.
Tu risa es mi canción favorita y nunca me canso de escucharla.
Hoy también te elijo. Mañana también. Ya sabes cómo va esto.
Contigo aprendí que la palabra hogar puede tener ojos y sonreír.
Me gustas en modo despeinada, en modo arreglada y en modo dormida.
Si pudiera regalarte algo, te regalaría mis ojos para que vieras lo bonita que eres.
Eres la notificación que siempre quiero recibir.
Te quiero más que ayer y menos que mañana, y eso que ayer ya era muchísimo.
Gracias por existir justo en la misma época que yo.
Tienes una forma de mirarme que me arregla el día entero.
Mi parte favorita del día es cualquier parte en la que estés tú.
Hay muchas personas en el mundo, pero mi corazón solo sabe pronunciar tu nombre.
Si te portas mal hoy, igual te quiero. Si te portas bien, también. No tienes escapatoria.
Me encanta que seas tú. Exactamente tú, con todo.
Ojalá hoy te pase algo tan bonito como lo que me pasó a mí cuando te conocí.
Eres mi casualidad favorita.
Si los abrazos se guardaran, tendría una colección enorme de los tuyos y aún querría más.
No eres mi media naranja: eres la naranja entera, el jugo y el desayuno.
Cuando sonríes, el universo hace una pausa para mirarte.
Te quiero incluso cuando me robas la cobija.
Lo mejor de mis días tiene tu nombre.
Si fueras un videojuego, jugaría tu historia mil veces sin saltarme ningún diálogo.
Hoy me acordé de ti. Bueno, también ayer. Y antier. Es un poco grave ya.
Estar contigo se siente como llegar a casa después de un día largo.
Te quiero de una forma que no cabe en mensajes, pero lo intento cada día.
Eres la respuesta a muchas preguntas que ni sabía que tenía.
No necesito un mapa del tesoro: ya te encontré.
Me haces querer ser mejor persona sin pedírmelo nunca.
Tus manos son mi lugar seguro.
Ojalá pudieras verte con mis ojos un ratito.
Eres más bonita que un atardecer, y eso que los atardeceres se esfuerzan bastante.
Hoy es un buen día para recordarte que eres increíble.
Tu nombre es mi palabra favorita.
Si me pierdo, búscame cerca de ti; siempre estoy por ahí.
No importa a dónde vayamos, si vamos juntos ya es un buen plan.
Eres el capítulo que más me gusta releer.
Te quiero con todo, y con todo me refiero a todo.
Quiero envejecer contigo y seguir haciéndote reír cuando tengamos canas.
Eres mi persona favorita para no hacer nada.
Me encanta cómo haces que lo simple se sienta especial.
Si pudiera pedir un deseo, pediría más tiempo contigo.
Eres esa calma que no sabía que necesitaba.
Me gusta tu forma de ser, de reír, de enojarte y de quererme.
Contigo hasta el silencio se siente cómodo.
Hay días difíciles, pero ninguno es tan difícil si estás tú.
Eres mi tranquilidad favorita.
Te quiero en todos los idiomas, incluso en los que no hablo.
Me gustas tanto que a veces me da risa de lo feliz que estoy.
Eres mi plan A, mi plan B y todos los planes.
No hay filtro que mejore tu cara recién despierta.
Gracias por quedarte, incluso cuando soy difícil.
Mi corazón tiene tu forma desde hace tiempo.
Eres la mejor decisión que he tomado sin pensarlo mucho.
Dame tu mano y un rato. Con eso me alcanza para ser feliz.
Ojalá te quieras la mitad de lo que yo te quiero; así ya te querrías un montón.
Te quiero en tus días buenos y te quiero más en los malos.
Si fueras una estrella, serías la que todos usan para pedir deseos.
Eres esa canción que pongo en repetición.
Lo nuestro no es suerte: es que yo te encontré y no te solté.
Tienes un superpoder: mejorar cualquier día con un mensaje.
No sé el futuro, pero sé con quién quiero averiguarlo.
Mi lugar en el mundo cabe entre tus brazos.
Eres mucho más de lo que esperaba encontrar.
Me encanta que seas mi persona.
Tienes el abrazo exacto para mis días raros.
Me haces sentir en casa aunque estemos lejos.
Si un día dudas de lo especial que eres, vuelve a leer esto.
Eres mi suerte, mi refugio y mi lugar feliz.
Te miro y pienso: qué afortunado soy.
Tu voz arregla cosas que ni sabía que estaban rotas.
Contigo quiero las cosas grandes y también las pequeñas.
No te cambiaría por nada, ni por una pizza gigante, y eso es decir mucho.
Hoy te mando un abrazo de esos que duran más de lo normal.
Eres la razón por la que sonrío mirando el celular.
Me gusta cuando dices mi nombre.
Eres mi aventura favorita.
Gracias por enseñarme que el amor también puede ser tranquilo.
Si me preguntan por mi lugar feliz, voy a decir tu nombre.
Me enamoras un poquito más cada día, sin avisar.
Eres la persona con la que quiero compartir todos mis 'mira esto'.
Ser tuyo es mi título favorito.
Nunca olvides que alguien piensa en ti con una sonrisa tonta.
Me haces falta incluso cuando estás a mi lado.
Eres arte, y yo tengo la suerte de mirarte todos los días.
Te quiero en pijama, en jeans y en cualquier versión de ti.
Mis días tienen más color desde que estás tú.
Eres la casualidad más bonita que me ha pasado.
Pienso en ti y se me pasa el mal humor.
Eres la luz que me guía cuando todo está oscuro.
Si me dieran a elegir mil veces, mil veces te elegiría a ti.
Eres el abrazo que quiero al final de cada día.
Te quiero tanto que hice un universo pequeñito solo para ti.
Este mensaje es para recordarte que eres querida, muchísimo.
Hoy, mañana y todos los días que vengan: tú.
Eres mi cosa favorita en el mundo, y eso que me gustan muchas cosas.
Por ti aprendí que el amor bonito sí existe.
Tú y yo, contra todo lo que venga. Bueno, mejor con un cafecito primero.
Si tuviera que describirte en una palabra, no me alcanzaría el idioma.
Mi corazón da un saltito cada vez que me escribes.
Eres el detalle más bonito de mi vida.
Ojalá hoy sepas lo mucho que importas.
Eres como un domingo tranquilo: perfecta.
Me encanta tu forma de existir.
Contigo hasta perderse es divertido.
No hay distancia que le gane a lo que siento.
Eres mi tema favorito para pensar antes de dormir.
Te quiero bonito, sin prisa y para siempre.
La vida es mejor desde que te tengo cerca.
Eres mi principio de semana favorito y mi viernes también.
Eres la persona que quiero ver primero en cada buena noticia.
Te debo muchas sonrisas y pienso pagártelas con abrazos.
Quiero seguir conociéndote toda la vida.
No sé cómo lo haces, pero siempre me haces sentir querido.
Eres mi mejor hábito.
Guardo tus mensajes como si fueran tesoros.
Eres mi definición de bonito.
Hasta los lunes son más soportables si existes tú.
Contigo el tiempo pasa rapidísimo y yo quiero que se detenga.
Eres el sí más fácil de mi vida.
Cada día contigo es un recuerdo que quiero guardar.
Me encanta que nos riamos de tonterías juntos.
Tienes el corazón más bonito que conozco.
Eres el lugar donde quiero estar cuando todo va mal.
Me gusta imaginar nuestro futuro: siempre sales sonriendo.
Te quiero mucho, y lo voy a repetir hasta que te aburras. Spoiler: no te vas a aburrir.
Gracias por cuidarme a tu manera, que es la mejor.
Eres mi siempre.""".strip().split("\n")

aperturas = [
  "Hoy quiero recordarte que", "Por si nadie te lo dijo hoy:", "Te escribo solo para decirte que",
  "Mensaje importante del universo:", "Dato curioso del día:", "No es por nada, pero",
  "Que conste en el registro oficial:", "Aviso de última hora:", "Una cosita antes de que sigas con tu día:",
  "Recordatorio de amor:", "Secreto del día:", "Quiero que lo leas despacito:",
  "Si lo olvidaste, aquí te lo recuerdo:", "Pequeña verdad para hoy:", "Te lo digo en serio:",
  "Esto lo aprobó mi corazón:", "Desde este pequeño universo te digo que", "Nota mental para ti:",
  "Te cuento algo:", "Atención, por favor:", "Hoy el cielo me pidió que te dijera que",
  "Lo pienso todos los días, así que hoy te lo escribo:", "Ya sé que lo sabes, pero",
  "Escucha bien, amor:", "Mi corazón me pidió que te avisara:",
]
nucleos = [
  "eres lo más bonito que tengo", "contigo todo tiene más sentido", "eres mi persona favorita",
  "te quiero más de lo que sé decir", "me haces muy feliz", "eres mi lugar seguro",
  "tu sonrisa me cambia el día", "pienso en ti más de lo que admito", "eres increíble, aunque a veces no lo veas",
  "no hay nadie como tú", "me encantas", "eres mi suerte más grande",
  "estoy orgulloso de ti", "quiero estar contigo mucho tiempo", "te extraño aunque te haya visto hace poco",
  "contigo me siento en casa", "eres mi calma", "eres mi alegría de todos los días",
  "eres más fuerte de lo que crees", "estás más bonita que nunca", "me gusta todo de ti",
  "eres la mejor parte de mi historia", "mi corazón es tuyo", "te elegiría siempre",
  "a tu lado todo es más bonito", "me encanta quererte", "eres mi felicidad",
  "eres lo primero en lo que pienso al despertar", "eres lo último en lo que pienso antes de dormir",
  "me haces querer ser mejor", "el mundo es más bonito contigo en él", "eres mi mejor casualidad",
  "eres mi motivo para sonreír", "valoro cada momento contigo", "eres mi sol en días nublados",
  "eres mi aventura favorita", "eres mi refugio", "tienes el corazón más lindo",
  "me haces sentir afortunado", "eres el amor de mi vida",
]
cierres = ["", "", "", " Te quiero.", " Nunca lo olvides.", " Siempre.", " Te mando un abrazo enorme.",
  " Y eso no va a cambiar.", " Con todo mi corazón.", " Ahora sí, sigue con tu día."]

comparaciones_a = ["Me gustas más que", "Me haces más feliz que", "Te prefiero a ti antes que", "Eres más bonita que"]
comparaciones_b = [
  "el café por las mañanas", "un día libre", "la lluvia en tarde de cobijas", "el pan recién hecho",
  "las vacaciones", "el chocolate caliente", "una siesta perfecta", "un viernes en la tarde",
  "el helado en día de calor", "una pizza recién salida del horno", "el olor a pan en la mañana",
  "un domingo sin alarma", "una noche de estrellas", "una película con cobija",
]
quiero_mas = [
  "los gatos quieren a las cajas", "la luna quiere a la noche", "las flores quieren al sol",
  "el mar quiere a la playa", "los niños quieren un sábado de dibujos", "yo quiero dormir cinco minutitos más",
  "las abejas quieren a las flores", "los lunes quieren que nadie los odie", "un perrito quiere a su pelota",
  "el café quiere a su taza",
]
si_a = [
  "Si estás cansada hoy,", "Si el día se puso difícil,", "Si te sientes sola un ratito,", "Si dudas de ti,",
  "Si hoy no fue tu día,", "Si te falta energía,", "Si algo te preocupa,", "Si necesitas un abrazo,",
  "Si te sientes insegura,", "Si hoy te sientes bonita,", "Si sonreíste al abrir esto,", "Si estás leyendo esto en la cama,",
]
si_b = [
  "recuerda que aquí estoy, siempre.", "piensa que alguien te quiere muchísimo.", "imagínate que te estoy abrazando fuerte.",
  "acuérdate de lo increíble que eres.", "respira hondo: todo va a estar bien, y yo voy contigo.",
  "date permiso de descansar; te lo mereces.", "este mensaje es tu abrazo de emergencia.",
  "que sepas que creo en ti más que en nada.", "yo te voy a recordar lo valiosa que eres.",
  "mi corazón ya te está mandando fuerzas.",
]
razones_pre = ["Una razón más por la que te quiero:", "Razón número {n} por la que te quiero:", "Otra cosa que amo de ti:", "Algo que me enamora de ti:"]
razones = [
  "tu forma de reír", "cómo me miras cuando crees que no me doy cuenta", "tu paciencia conmigo",
  "lo dulce que eres sin intentarlo", "cómo te emocionas con las cosas pequeñas", "tu manera de cuidar a los demás",
  "tu voz cuando tienes sueño", "lo valiente que eres", "cómo me haces reír cuando estoy serio",
  "tus abrazos que lo arreglan todo", "lo inteligente que eres", "tu forma de ver el mundo",
  "lo bonita que te ves cuando te concentras", "que me entiendas sin que diga nada", "tu corazón tan noble",
  "lo auténtica que eres", "tus ocurrencias", "cómo dices mi nombre", "que seas mi compañera de todo",
  "tu cabello, que me encanta", "tus ojos, que me tienen loco", "lo fuerte que eres cuando las cosas se complican",
  "tus manos cuando toman las mías", "lo cariñosa que eres", "lo mucho que te esfuerzas",
  "cómo te ríes de mis chistes malos", "tu ternura", "tus ganas de vivir", "que nunca te rindes",
  "lo bien que se siente estar contigo",
]
deseos_a = ["Hoy te deseo", "Para hoy te mando", "Que hoy tengas", "Te regalo para hoy", "Hoy mereces"]
deseos_b = [
  "un día tan bonito como tú", "mil sonrisas y ninguna preocupación", "un café rico y un día tranquilo",
  "paciencia, calma y muchos abrazos", "todo el amor que tú das", "un ratito de paz solo para ti",
  "buenas noticias y mucha suerte", "energía bonita y un corazón tranquilo", "un día suave, sin prisas",
  "motivos para reír a carcajadas", "la seguridad de que eres amada", "un pedacito de cielo",
]

rnd = random.Random(14)
pool = set()
out = []
def add(s):
    s = s.strip().replace("  ", " ")
    s = s[0].upper() + s[1:]
    if not s.endswith((".", "!", "?", ":")): s += "."
    if s not in pool:
        pool.add(s); out.append(s)

for e in escritos: add(e)
comb = []
for a in aperturas:
    for n in nucleos:
        comb.append(f"{a} {n}.")
rnd.shuffle(comb)
gen = []
for c in comb[:540]: gen.append(c + rnd.choice(cierres))
for a in comparaciones_a:
    for b in comparaciones_b: gen.append(f"{a} {b}.")
for q in quiero_mas: gen.append(f"Te quiero más de lo que {q}.")
for a in si_a:
    for b in si_b: gen.append(f"{a} {b}")
n = 1
rz = razones[:]; rnd.shuffle(rz)
for pre in razones_pre:
    for r in rz:
        if "{n}" in pre:
            gen.append(pre.replace("{n}", str(n)) + " " + r + "."); n += 1
        else:
            gen.append(pre + " " + r + ".")
for a in deseos_a:
    for b in deseos_b: gen.append(f"{a} {b}.")
rnd.shuffle(gen)
for g in gen:
    if len(out) >= 1000: break
    add(g)
assert len(out) == 1000, len(out)

# mezclar suavemente: intercalar escritos a mano con generados
hand = out[:len(escritos)]; rest = out[len(escritos):]
final = []
hi = 0
for i, r in enumerate(rest):
    if i % 6 == 0 and hi < len(hand): final.append(hand[hi]); hi += 1
    final.append(r)
final += hand[hi:]
assert len(final) == 1000 and len(set(final)) == 1000

dest = pathlib.Path(__file__).resolve().parent.parent / "src/lib/data/mensajes.js"
dest.parent.mkdir(parents=True, exist_ok=True)
body = ",\n".join("  " + json.dumps(m, ensure_ascii=False) for m in final)
dest.write_text(
  "// ✏️ 1000 mensajes de amor. Cada vez que ella abre la app, ve el siguiente.\n"
  "// Puedes editar, borrar o añadir los que quieras (uno por línea, entre comillas).\n"
  "// Si cambias la cantidad, todo sigue funcionando.\n\n"
  f"export const mensajes = [\n{body},\n];\n", encoding="utf-8")
print("ok", len(final), "escritos a mano:", len(escritos))
