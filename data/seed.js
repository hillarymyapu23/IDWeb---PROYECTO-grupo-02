// Fichas de ejemplo para que el portal no salga vacío al presentarlo.
// Son datos ilustrativos (nombres genéricos y precios referenciales en soles):
// reemplázalos por las recomendaciones reales del grupo desde el panel de asesores.
// userId: null => ficha del equipo, ningún asesor puede editarla ni borrarla.

const EQUIPO = 'Equipo Primeros Pasos';

const FICHAS_EJEMPLO = [
  {
    categoria: 'asientos-auto', etapa: 'recien-nacido',
    titulo: 'Asiento giratorio 360° para recién nacidos',
    producto: 'Asiento giratorio i-Size con base ISOFIX',
    precio: 1450, edad: '0 a 4 años (hasta 18 kg)',
    descripcion: 'Rota 360° para sentar al bebé sin forzar la espalda y se instala con ISOFIX. Permite viajar de espaldas más allá de los 15 meses.'
  },
  {
    categoria: 'asientos-auto', etapa: 'bebe',
    titulo: 'Asiento reclinable que dura más años',
    producto: 'Asiento reclinable grupo 1 con arnés de 5 puntos',
    precio: 890, edad: '9 meses a 4 años (9 a 18 kg)',
    descripcion: 'Reposacabezas regulable en altura y varias posiciones de reclinado. Se instala con el cinturón del auto.'
  },
  {
    categoria: 'asientos-auto', etapa: 'preescolar',
    titulo: 'Elevador con respaldo para niños mayores',
    producto: 'Elevador con respaldo y guías para el cinturón',
    precio: 320, edad: '4 a 10 años (15 a 36 kg)',
    descripcion: 'Posiciona bien el cinturón sobre el hombro y la cadera. Liviano y fácil de pasar de un auto a otro.'
  },
  {
    categoria: 'camas-cuna', etapa: 'recien-nacido',
    titulo: 'Cama cuna convertible 3 en 1 de madera',
    producto: 'Cama cuna convertible de madera maciza',
    precio: 1250, edad: '0 a 5 años',
    descripcion: 'Empieza como cuna con barrotes, luego queda como cama con baranda y al final como cama infantil sin barandas.'
  },
  {
    categoria: 'camas-cuna', etapa: 'bebe',
    titulo: 'Cama cuna con somier de tres alturas',
    producto: 'Cama cuna con somier regulable',
    precio: 980, edad: '0 a 3 años',
    descripcion: 'El somier baja a medida que el bebé crece y empieza a pararse. Incluye colchón firme del tamaño exacto.'
  },
  {
    categoria: 'camas-cuna', etapa: 'caminante',
    titulo: 'Cama cuna con baranda desmontable',
    producto: 'Cama cuna con baranda lateral desmontable',
    precio: 1050, edad: '1 a 5 años',
    descripcion: 'Con la baranda quitada, el niño puede subir y bajar solo. Ideal para la transición a la cama sin cambiar de colchón.'
  },
  {
    categoria: 'coches-bebe', etapa: 'recien-nacido',
    titulo: 'Coche compacto de viaje, plegado con una mano',
    producto: 'Coche de viaje reclinable y liviano',
    precio: 1190, edad: '0 a 3 años (hasta 15 kg)',
    descripcion: 'Cierra con una sola mano y entra en maleteras pequeñas. Se reclina por completo para recién nacidos.'
  },
  {
    categoria: 'coches-bebe', etapa: 'bebe',
    titulo: 'Coche 3 en 1 con capazo y portabebé',
    producto: 'Sistema de viaje 3 en 1',
    precio: 1650, edad: '0 a 3 años',
    descripcion: 'Capazo para los primeros meses, silla para pasear y portabebé para el auto. Suspensión en las cuatro ruedas.'
  },
  {
    categoria: 'coches-bebe', etapa: 'bebe',
    titulo: 'Accesorio: protector de lluvia universal',
    producto: 'Protector de lluvia transparente con ventilación',
    precio: 59, edad: 'Para coches de 0 a 3 años',
    descripcion: 'Cubre el coche completo sin tapar al niño y tiene aberturas de ventilación. Se guarda doblado en su bolsa.'
  },
  {
    categoria: 'coches-bebe', etapa: 'caminante',
    titulo: 'Accesorio: organizador liviano con portavasos',
    producto: 'Organizador de manubrio con bolsillos',
    precio: 79, edad: 'Para coches de 1 a 3 años',
    descripcion: 'Para llaves, celular y un biberón. Úsalo solo con cosas livianas: el peso en el manubrio puede volcar el coche.'
  },
  {
    categoria: 'coches-bebe', etapa: 'bebe',
    titulo: 'Accesorio: bolsa de transporte para viajes',
    producto: 'Bolsa acolchada para coche plegado',
    precio: 120, edad: 'Para coches de 0 a 3 años',
    descripcion: 'Protege el coche de golpes en el aeropuerto y de la suciedad. Tiene correa para cargarla al hombro.'
  },
  {
    categoria: 'cunas-infantiles', etapa: 'recien-nacido',
    titulo: 'Cuna de madera con cajonera integrada',
    producto: 'Cuna fija de madera con dos cajones',
    precio: 980, edad: '0 a 3 años',
    descripcion: 'Estructura estable con acabado atóxico y dos cajones inferiores para la ropa de cama y los pañales.'
  },
  {
    categoria: 'cunas-infantiles', etapa: 'bebe',
    titulo: 'Cuna clásica de barrotes con colchón firme',
    producto: 'Cuna de madera con barrotes verticales',
    precio: 760, edad: '0 a 3 años',
    descripcion: 'Barrotes verticales sin travesaños escalables y colchón del tamaño exacto. Sencilla de armar y de limpiar.'
  },
  {
    categoria: 'cunas-bebes', etapa: 'recien-nacido',
    titulo: 'Cuna de colecho con lateral abatible',
    producto: 'Cuna de colecho anclable a la cama',
    precio: 850, edad: '0 a 6 meses (hasta 9 kg)',
    descripcion: 'El lateral baja y la cuna se ancla a la cama de los padres sin dejar huecos. Malla transpirable en los costados.'
  },
  {
    categoria: 'cunas-bebes', etapa: 'recien-nacido',
    titulo: 'Moisés portátil con malla transpirable',
    producto: 'Moisés plegable con soporte',
    precio: 430, edad: '0 a 5 meses',
    descripcion: 'Liviano para mover de cuarto en cuarto y con base firme. Se pliega para guardarlo o llevarlo de viaje.'
  }
];

module.exports = { FICHAS_EJEMPLO, EQUIPO };
