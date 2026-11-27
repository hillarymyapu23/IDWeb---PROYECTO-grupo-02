// Fuente única de las 5 categorías asignadas, las etapas y los asuntos de contacto.
// El servidor valida contra estas listas y el frontend las lee desde GET /api/meta,
// así que un cambio aquí se refleja en el menú, los filtros y los formularios.
//
// IMPORTANTE: confirma con tu guía que las 5 categorías sean exactamente las asignadas al grupo.
// "Accesorios" no es una categoría aparte: forma parte de "Coches para bebés y accesorios".

const ETAPAS = [
  { slug: 'recien-nacido', nombre: 'Recién nacido', rango: '0 a 3 meses' },
  { slug: 'bebe', nombre: 'Bebé', rango: '3 a 12 meses' },
  { slug: 'caminante', nombre: 'Caminante', rango: '1 a 3 años' },
  { slug: 'preescolar', nombre: 'Preescolar', rango: '3 a 5 años' }
];

const ASUNTOS = [
  { slug: 'consulta', nombre: 'Tengo una consulta' },
  { slug: 'sugerencia', nombre: 'Quiero sugerir un producto' },
  { slug: 'correccion', nombre: 'Encontré un error en una guía' },
  { slug: 'otro', nombre: 'Otro tema' }
];

const CATEGORIAS = [
  {
    slug: 'asientos-auto',
    nombre: 'Asientos de seguridad para autos',
    corto: 'Asientos de auto',
    imagen: 'img/asientos-auto.svg',
    alt: 'Ilustración de un asiento de seguridad infantil para auto con arnés',
    resumen: 'La compra de seguridad más importante: protege al bebé en cada trayecto, también en los cortos.',
    queMirar: [
      'Homologación vigente: busca la etiqueta ECE R129 (i-Size) o ECE R44/04.',
      'Elige por peso y talla del niño, no solo por su edad.',
      'Que quede firme al instalarlo: en la base del cinturón o del ISOFIX no debe moverse más de unos 2,5 cm.',
      'Arnés de 5 puntos con altura regulable y reposacabezas que crezca con el niño.',
      'Que entre bien en tu auto: si puedes, pruébalo instalado antes de comprarlo.'
    ],
    seguridad: [
      { titulo: 'Viajar de espaldas el mayor tiempo posible', texto: 'Los asientos orientados hacia atrás protegen mejor la cabeza, el cuello y la columna. La norma i-Size exige viajar de espaldas al menos hasta los 15 meses.' },
      { titulo: 'Arnés bien ajustado', texto: 'Las correas deben quedar planas y tan ajustadas que no puedas pellizcar tela a la altura del hombro. Evita los abrigos gruesos bajo el arnés.' },
      { titulo: 'Nada de asientos con historia', texto: 'No uses un asiento que haya sufrido un choque, que esté vencido o que no tenga manual ni etiqueta: el plástico envejece y pierde resistencia.' },
      { titulo: 'Nunca solo en el auto', texto: 'No dejes al niño solo dentro del vehículo ni un momento: en un auto cerrado la temperatura sube muy rápido.' }
    ]
  },
  {
    slug: 'camas-cuna',
    nombre: 'Camas cuna',
    corto: 'Camas cuna',
    imagen: 'img/camas-cuna.svg',
    alt: 'Ilustración de una cama cuna de madera con barrotes y colchón',
    resumen: 'Cunas que crecen con el niño: al quitar las barandas pasan a ser cama infantil y se usan por más años.',
    queMirar: [
      'Que cumpla una norma reconocida de seguridad para cunas (por ejemplo EN 716 o ASTM F1169) y pide el certificado.',
      'Separación entre barrotes de 4,5 a 6,5 cm: ni la cabeza ni los miembros deben poder atravesarlos.',
      'Colchón firme y ajustado: no debe quedar un hueco de más de dos dedos con el marco.',
      'Somier regulable en varias alturas para bajarlo cuando el bebé empiece a pararse.',
      'Pintura y barniz atóxicos, sin astillas ni bordes filosos.'
    ],
    seguridad: [
      { titulo: 'Siempre boca arriba', texto: 'Para dormir, coloca al bebé boca arriba sobre un colchón firme, sin almohadas, peluches ni protectores de barrotes.' },
      { titulo: 'Baja el somier a tiempo', texto: 'Cuando el bebé se siente, baja el colchón al nivel más bajo. Si ya puede trepar para salir, es momento de pasar al modo cama.' },
      { titulo: 'Lejos de ventanas y cables', texto: 'Aleja la cuna de ventanas, cortinas con cordón, enchufes y cables.' },
      { titulo: 'Revisa los tornillos', texto: 'Los tornillos y herrajes se aflojan con el uso: revísalos cada cierto tiempo, sobre todo después de mover o transformar la cuna.' }
    ]
  },
  {
    slug: 'coches-bebe',
    nombre: 'Coches para bebés y accesorios',
    corto: 'Coches y accesorios',
    imagen: 'img/coches-bebe.svg',
    alt: 'Ilustración de un coche para bebé con capota y una bolsa organizadora',
    resumen: 'El coche que usarás todos los días y los accesorios que lo hacen más cómodo: lluvia, organizador, bolsa de viaje.',
    queMirar: [
      'Peso y plegado: ¿lo puedes cargar y cerrar con una sola mano?',
      'Posición completamente reclinable (o capazo) para recién nacidos.',
      'Arnés de 5 puntos y freno fácil de accionar.',
      'Ruedas y suspensión según dónde lo usarás: veredas, parques o viajes.',
      'Accesorios útiles: protector de lluvia, organizador liviano, mosquitero, parasol y bolsa de transporte.'
    ],
    seguridad: [
      { titulo: 'Arnés puesto siempre', texto: 'Abrocha el arnés en cada paseo, aunque sea corto y aunque el niño ya camine bien.' },
      { titulo: 'Freno al detenerte', texto: 'Activa el freno cada vez que te detengas, también en superficies que parecen planas.' },
      { titulo: 'No cuelgues peso del manubrio', texto: 'Las bolsas pesadas en el manubrio pueden volcar el coche. Usa el canasto inferior y organizadores livianos.' },
      { titulo: 'Respeta el peso máximo', texto: 'El límite del fabricante incluye al niño y lo que lleves en el canasto. Pasarte desgasta el coche y lo vuelve inestable.' },
      { titulo: 'Para dormir, una superficie plana', texto: 'Para siestas largas, pasa al bebé a una cuna o a una superficie plana y firme: los asientos inclinados no son lo ideal para dormir mucho tiempo.' }
    ]
  },
  {
    slug: 'cunas-infantiles',
    nombre: 'Cunas infantiles',
    corto: 'Cunas infantiles',
    imagen: 'img/cunas-infantiles.svg',
    alt: 'Ilustración de una cuna infantil de madera con barrotes verticales y un móvil',
    resumen: 'La cuna fija de madera, la opción clásica para el cuarto del bebé desde los primeros meses.',
    queMirar: [
      'Estructura estable: no debe balancearse al empujarla.',
      'Barrotes verticales, sin adornos ni travesaños que sirvan de escalón.',
      'Colchón del tamaño exacto de la cuna.',
      'Si trae cajones, que no comprometan la estabilidad de la estructura.',
      'Etiqueta con medidas, norma de seguridad y datos del fabricante.'
    ],
    seguridad: [
      { titulo: 'Cuna despejada', texto: 'Solo el colchón con una sábana ajustable. Sin almohadas, mantas sueltas, peluches ni protectores de barrotes.' },
      { titulo: 'Móviles fuera de alcance', texto: 'Retira los móviles y colgantes cuando el bebé empiece a apoyarse en manos y rodillas, alrededor de los 5 meses.' },
      { titulo: 'Cuidado con las cunas de segunda mano', texto: 'Evita cunas antiguas o sin manual: pueden tener separaciones o piezas fuera de norma.' },
      { titulo: 'Ubicación segura', texto: 'Lejos de ventanas, cortinas con cordón y cables.' }
    ]
  },
  {
    slug: 'cunas-bebes',
    nombre: 'Cunas para bebés',
    corto: 'Cunas para bebés',
    imagen: 'img/cunas-bebes.svg',
    alt: 'Ilustración de un moisés portátil con malla transpirable sobre un soporte',
    resumen: 'Cunas pequeñas, de colecho o portátiles, cercanas a la cama de los padres: ideales para los primeros meses.',
    queMirar: [
      'Límites de peso y de edad del fabricante: suelen ser pocos meses.',
      'Base firme y plana, sin inclinación, con colchón firme incluido.',
      'Laterales de malla transpirable.',
      'Si es de colecho, que se ancle a la cama de los padres sin dejar huecos.',
      'Si es portátil, que se pliegue fácil y quede bien trabada al armarla.'
    ],
    seguridad: [
      { titulo: 'Respeta el límite del fabricante', texto: 'Deja de usarla cuando el bebé alcance el peso máximo o pueda sentarse o ponerse a gatas.' },
      { titulo: 'Sin colchones ni almohadas extra', texto: 'Usa solo el colchón que viene con la cuna. Agregar capas deja huecos peligrosos.' },
      { titulo: 'Siempre boca arriba', texto: 'Para dormir, el bebé va boca arriba, en una superficie plana y firme.' },
      { titulo: 'Mecedora solo para calmar', texto: 'Si tiene modo mecedora o inclinado, úsalo con el bebé despierto y bloquéalo para dormir.' }
    ]
  }
];

module.exports = { CATEGORIAS, ETAPAS, ASUNTOS };
