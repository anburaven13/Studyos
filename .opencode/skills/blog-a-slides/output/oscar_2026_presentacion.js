/**
 * ============================================
 * 🎬 OSCAR 2026 - PRESENTACIÓN GOOGLE SLIDES
 * ============================================
 * 
 * Generado automáticamente a partir del artículo de BBC Mundo
 * https://www.bbc.com/mundo/articles/cdren3n8xe4o
 * 
 * INSTRUCCIONES:
 * 1. Abre script.google.com
 * 2. Crea un nuevo proyecto
 * 3. Pega este código completo
 * 4. Ejecuta la función crearPresentacionOscar2026()
 * 5. Autoriza los permisos cuando se soliciten
 * 6. Revisa el log para obtener el enlace de tu presentación
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  titulo: 'Oscar 2026',
  subtitulo: 'Nominaciones y Favoritas',
  autor: 'BBC News Mundo',
  contacto: 'bbc.com/mundo',
  fechaCeremonia: '15 de marzo de 2026'
};

// Paleta inspirada en los Oscar - Dorado y negro elegante
const COLORES = {
  primario: '#1a1a2e',      // Azul oscuro/negro elegante
  secundario: '#c9a227',     // Dorado Oscar
  acento: '#e74c3c',         // Rojo alfombra roja
  fondo: '#ffffff',
  fondoAlt: '#f8f8f8',
  texto: '#1a1a2e',
  textoClaro: '#ffffff'
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
function crearPresentacionOscar2026() {
  const presentacion = SlidesApp.create('🎬 Oscar 2026 - Nominaciones');
  
  // Eliminar diapositiva inicial en blanco
  const slidesIniciales = presentacion.getSlides();
  if (slidesIniciales.length > 0) {
    slidesIniciales[0].remove();
  }
  
  // === DIAPOSITIVAS ===
  crearPortada(presentacion);
  crearDatoImpactante(presentacion);
  crearAgenda(presentacion);
  crearSlideGranFavorita(presentacion);
  crearSlideMejorPelicula(presentacion);
  crearSlideActores(presentacion);
  crearSlideDirectores(presentacion);
  crearSlideLatinoamerica(presentacion);
  crearSlideEspana(presentacion);
  crearCitaDestacada(presentacion);
  crearSlideFechas(presentacion);
  crearCierre(presentacion);
  
  const url = presentacion.getUrl();
  Logger.log('✅ ¡Presentación Oscar 2026 creada exitosamente!');
  Logger.log('🔗 URL: ' + url);
  Logger.log('📅 La ceremonia será el ' + CONFIG.fechaCeremonia);
  
  return url;
}

// ============================================
// DIAPOSITIVA 1: PORTADA
// ============================================
function crearPortada(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.primario);
  
  // Estatuilla emoji
  const emoji = slide.insertTextBox('🏆');
  emoji.setTop(80).setLeft(280).setWidth(160).setHeight(100);
  emoji.getText().getTextStyle().setFontSize(72);
  emoji.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Título
  const titulo = slide.insertTextBox('OSCAR 2026');
  titulo.setTop(180).setLeft(40).setWidth(640).setHeight(80);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(56)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  titulo.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Subtítulo
  const subtitulo = slide.insertTextBox('Lista Completa de Nominaciones');
  subtitulo.setTop(265).setLeft(40).setWidth(640).setHeight(50);
  subtitulo.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(28)
    .setForegroundColor(COLORES.textoClaro);
  subtitulo.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Línea decorativa dorada
  const linea = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  linea.setTop(330).setLeft(250).setWidth(220).setHeight(4);
  linea.getFill().setSolidFill(COLORES.secundario);
  linea.getBorder().setTransparent();
  
  // Fecha
  const fecha = slide.insertTextBox('15 de marzo de 2026 • Teatro Dolby, Hollywood');
  fecha.setTop(350).setLeft(40).setWidth(640).setHeight(40);
  fecha.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(16)
    .setForegroundColor('#b0b0b0');
  fecha.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 2: DATO IMPACTANTE
// ============================================
function crearDatoImpactante(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.secundario);
  
  // Número grande
  const numero = slide.insertTextBox('16');
  numero.setTop(80).setLeft(40).setWidth(640).setHeight(150);
  numero.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(120)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  numero.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Texto explicativo
  const texto = slide.insertTextBox('NOMINACIONES');
  texto.setTop(220).setLeft(40).setWidth(640).setHeight(50);
  texto.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  texto.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Película
  const pelicula = slide.insertTextBox('Sinners ("Pecadores")');
  pelicula.setTop(280).setLeft(40).setWidth(640).setHeight(40);
  pelicula.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(24)
    .setItalic(true)
    .setForegroundColor(COLORES.primario);
  pelicula.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Récord
  const record = slide.insertTextBox('⭐ RÉCORD HISTÓRICO ⭐');
  record.setTop(340).setLeft(40).setWidth(640).setHeight(40);
  record.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(18)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  record.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 3: AGENDA
// ============================================
function crearAgenda(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondo);
  
  // Barra lateral dorada
  const barra = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  barra.setTop(0).setLeft(0).setWidth(8).setHeight(405);
  barra.getFill().setSolidFill(COLORES.secundario);
  barra.getBorder().setTransparent();
  
  // Título
  const titulo = slide.insertTextBox('Lo que veremos');
  titulo.setTop(30).setLeft(40).setWidth(640).setHeight(60);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(36)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  const items = [
    '🎬  La gran favorita: Sinners',
    '🏆  Mejor Película: 10 nominadas',
    '🎭  Actores y Actrices protagonistas',
    '🎥  Mejor Director',
    '🌎  América Latina y España en los Oscar'
  ];
  
  let yPos = 110;
  items.forEach((item, i) => {
    const itemBox = slide.insertTextBox(item);
    itemBox.setTop(yPos).setLeft(50).setWidth(620).setHeight(45);
    itemBox.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(22)
      .setForegroundColor(COLORES.texto);
    yPos += 55;
  });
}

// ============================================
// DIAPOSITIVA 4: GRAN FAVORITA
// ============================================
function crearSlideGranFavorita(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.primario);
  
  // Título
  const titulo = slide.insertTextBox('La Gran Favorita');
  titulo.setTop(30).setLeft(40).setWidth(640).setHeight(50);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  titulo.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Nombre película
  const pelicula = slide.insertTextBox('SINNERS\n("Pecadores")');
  pelicula.setTop(90).setLeft(40).setWidth(640).setHeight(100);
  pelicula.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(44)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  pelicula.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Detalles
  const detalles = slide.insertTextBox('Director: Ryan Coogler\nGénero: Thriller Sobrenatural / Vampiros');
  detalles.setTop(200).setLeft(40).setWidth(640).setHeight(60);
  detalles.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(20)
    .setForegroundColor('#b0b0b0');
  detalles.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Nominaciones clave
  const nominaciones = slide.insertTextBox('Nominada a: Mejor Película • Mejor Director • Mejor Actor\nMejor Guion Original • Mejor Fotografía • Mejor Edición + 10 más');
  nominaciones.setTop(290).setLeft(40).setWidth(640).setHeight(70);
  nominaciones.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(16)
    .setForegroundColor(COLORES.secundario);
  nominaciones.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 5: MEJOR PELÍCULA
// ============================================
function crearSlideMejorPelicula(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondo);
  
  // Barra lateral
  const barra = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  barra.setTop(0).setLeft(0).setWidth(8).setHeight(405);
  barra.getFill().setSolidFill(COLORES.secundario);
  barra.getBorder().setTransparent();
  
  // Título
  const titulo = slide.insertTextBox('🏆 Mejor Película');
  titulo.setTop(15).setLeft(30).setWidth(640).setHeight(45);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(30)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  const peliculas = [
    ['Sinners', 'Bugonia', 'F1', 'Frankenstein', 'Hamnet'],
    ['Marty Supreme', 'One Battle After Another', 'O Agente Secreto', 'Sentimental Value', 'Train Dreams']
  ];
  
  // Columna izquierda
  let yPos = 70;
  peliculas[0].forEach(peli => {
    const box = slide.insertTextBox('• ' + peli);
    box.setTop(yPos).setLeft(40).setWidth(310).setHeight(35);
    box.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(18)
      .setForegroundColor(COLORES.texto);
    yPos += 38;
  });
  
  // Columna derecha
  yPos = 70;
  peliculas[1].forEach(peli => {
    const box = slide.insertTextBox('• ' + peli);
    box.setTop(yPos).setLeft(350).setWidth(310).setHeight(35);
    box.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(18)
      .setForegroundColor(COLORES.texto);
    yPos += 38;
  });
  
  // Destacado
  const destacado = slide.insertTextBox('★ Sinners lidera con 16 nominaciones • One Battle After Another: 13 nominaciones');
  destacado.setTop(365).setLeft(30).setWidth(660).setHeight(30);
  destacado.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(14)
    .setItalic(true)
    .setForegroundColor(COLORES.secundario);
  destacado.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 6: ACTORES
// ============================================
function crearSlideActores(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondoAlt);
  
  // Título Actor
  const tituloActor = slide.insertTextBox('🎭 Mejor Actor');
  tituloActor.setTop(20).setLeft(30).setWidth(320).setHeight(35);
  tituloActor.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(24)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  const actores = [
    'Timothée Chalamet - Marty Supreme',
    'Leonardo DiCaprio - One Battle...',
    'Ethan Hawke - Blue Moon',
    'Michael B. Jordan - Sinners',
    'Wagner Moura - O Agente Secreto'
  ];
  
  let yPos = 60;
  actores.forEach(actor => {
    const box = slide.insertTextBox('• ' + actor);
    box.setTop(yPos).setLeft(30).setWidth(320).setHeight(30);
    box.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(14)
      .setForegroundColor(COLORES.texto);
    yPos += 32;
  });
  
  // Título Actriz
  const tituloActriz = slide.insertTextBox('🎭 Mejor Actriz');
  tituloActriz.setTop(20).setLeft(370).setWidth(320).setHeight(35);
  tituloActriz.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(24)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  const actrices = [
    'Jessie Buckley - Hamnet',
    'Rose Byrne - If I Had Legs...',
    'Kate Hudson - Song Sung Blue',
    'Renate Reinsve - Sentimental Value',
    'Emma Stone - Bugonia'
  ];
  
  yPos = 60;
  actrices.forEach(actriz => {
    const box = slide.insertTextBox('• ' + actriz);
    box.setTop(yPos).setLeft(370).setWidth(300).setHeight(30);
    box.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(14)
      .setForegroundColor(COLORES.texto);
    yPos += 32;
  });
  
  // Línea divisoria
  const linea = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  linea.setTop(55).setLeft(355).setWidth(2).setHeight(160);
  linea.getFill().setSolidFill(COLORES.secundario);
  linea.getBorder().setTransparent();
  
  // Sección reparto
  const tituloReparto = slide.insertTextBox('Actor de Reparto Destacado');
  tituloReparto.setTop(230).setLeft(30).setWidth(660).setHeight(30);
  tituloReparto.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(18)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  tituloReparto.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  const reparto = slide.insertTextBox('Benicio del Toro • Jacob Elordi • Delroy Lindo • Sean Penn • Stellan Skarsgård');
  reparto.setTop(265).setLeft(30).setWidth(660).setHeight(30);
  reparto.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(16)
    .setForegroundColor(COLORES.texto);
  reparto.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 7: DIRECTORES
// ============================================
function crearSlideDirectores(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondo);
  
  // Barra lateral
  const barra = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  barra.setTop(0).setLeft(0).setWidth(8).setHeight(405);
  barra.getFill().setSolidFill(COLORES.acento);
  barra.getBorder().setTransparent();
  
  // Título
  const titulo = slide.insertTextBox('🎥 Mejor Dirección');
  titulo.setTop(30).setLeft(40).setWidth(640).setHeight(50);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  const directores = [
    ['Ryan Coogler', 'Sinners'],
    ['Paul Thomas Anderson', 'One Battle After Another'],
    ['Chloé Zhao', 'Hamnet'],
    ['Josh Safdie', 'Marty Supreme'],
    ['Joachim Trier', 'Sentimental Value']
  ];
  
  let yPos = 100;
  directores.forEach((dir, i) => {
    // Nombre
    const nombre = slide.insertTextBox(dir[0]);
    nombre.setTop(yPos).setLeft(50).setWidth(300).setHeight(35);
    nombre.getText().getTextStyle()
      .setFontFamily('Montserrat')
      .setFontSize(20)
      .setBold(true)
      .setForegroundColor(COLORES.texto);
    
    // Película
    const peli = slide.insertTextBox(dir[1]);
    peli.setTop(yPos).setLeft(360).setWidth(300).setHeight(35);
    peli.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(18)
      .setItalic(true)
      .setForegroundColor(COLORES.secundario);
    
    yPos += 50;
  });
}

// ============================================
// DIAPOSITIVA 8: LATINOAMÉRICA
// ============================================
function crearSlideLatinoamerica(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.secundario);
  
  // Título
  const titulo = slide.insertTextBox('🌎 América Latina en los Oscar');
  titulo.setTop(30).setLeft(40).setWidth(640).setHeight(50);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(30)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  titulo.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Película brasileña
  const bandera = slide.insertTextBox('🇧🇷');
  bandera.setTop(90).setLeft(40).setWidth(60).setHeight(50);
  bandera.getText().getTextStyle().setFontSize(36);
  
  const pelicula = slide.insertTextBox('O Agente Secreto\n("El Agente Secreto")');
  pelicula.setTop(90).setLeft(110).setWidth(550).setHeight(70);
  pelicula.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(28)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  
  // Director
  const director = slide.insertTextBox('Director: Kleber Mendonça Filho • Brasil');
  director.setTop(165).setLeft(110).setWidth(550).setHeight(30);
  director.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(18)
    .setForegroundColor(COLORES.primario);
  
  // Nominaciones
  const nominaciones = slide.insertTextBox('Nominada en 4 categorías:');
  nominaciones.setTop(220).setLeft(40).setWidth(640).setHeight(35);
  nominaciones.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(20)
    .setBold(true)
    .setForegroundColor(COLORES.textoClaro);
  
  const categorias = [
    '🏆 Mejor Película',
    '🌍 Mejor Película Internacional',
    '🎭 Mejor Actor (Wagner Moura)',
    '👥 Mejor Casting'
  ];
  
  let yPos = 260;
  categorias.forEach(cat => {
    const box = slide.insertTextBox(cat);
    box.setTop(yPos).setLeft(60).setWidth(600).setHeight(30);
    box.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(18)
      .setForegroundColor(COLORES.textoClaro);
    yPos += 32;
  });
}

// ============================================
// DIAPOSITIVA 9: ESPAÑA
// ============================================
function crearSlideEspana(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondo);
  
  // Barra lateral
  const barra = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  barra.setTop(0).setLeft(0).setWidth(8).setHeight(405);
  barra.getFill().setSolidFill('#c60b1e'); // Rojo español
  barra.getBorder().setTransparent();
  
  // Bandera
  const bandera = slide.insertTextBox('🇪🇸');
  bandera.setTop(40).setLeft(40).setWidth(60).setHeight(60);
  bandera.getText().getTextStyle().setFontSize(40);
  
  // Título
  const titulo = slide.insertTextBox('España en los Oscar');
  titulo.setTop(50).setLeft(110).setWidth(550).setHeight(50);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  
  // Película
  const pelicula = slide.insertTextBox('Sirat: Trance en el Desierto');
  pelicula.setTop(130).setLeft(40).setWidth(640).setHeight(50);
  pelicula.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(28)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  
  // Nominaciones
  const nominaciones = slide.insertTextBox('Nominada a:\n\n🌍  Mejor Película Internacional\n🔊  Mejor Sonido');
  nominaciones.setTop(200).setLeft(60).setWidth(600).setHeight(120);
  nominaciones.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(22)
    .setForegroundColor(COLORES.texto);
}

// ============================================
// DIAPOSITIVA 10: CITA DESTACADA
// ============================================
function crearCitaDestacada(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.primario);
  
  // Comillas
  const comillas = slide.insertTextBox('"');
  comillas.setTop(60).setLeft(40).setWidth(100).setHeight(100);
  comillas.getText().getTextStyle()
    .setFontFamily('Georgia')
    .setFontSize(100)
    .setForegroundColor('#4a4a5e');  // Gris oscuro para simular transparencia
  
  // Cita
  const cita = slide.insertTextBox('Con un récord histórico de 16 nominaciones, el thriller sobrenatural Sinners se ha convertido en la gran favorita de cara a los premios Oscar de este año.');
  cita.setTop(130).setLeft(60).setWidth(600).setHeight(150);
  cita.getText().getTextStyle()
    .setFontFamily('Georgia')
    .setFontSize(24)
    .setItalic(true)
    .setForegroundColor(COLORES.textoClaro);
  cita.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Fuente
  const fuente = slide.insertTextBox('— BBC News Mundo');
  fuente.setTop(300).setLeft(60).setWidth(600).setHeight(40);
  fuente.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(18)
    .setForegroundColor(COLORES.secundario);
  fuente.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 11: FECHAS
// ============================================
function crearSlideFechas(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.fondoAlt);
  
  // Título
  const titulo = slide.insertTextBox('📅 Marca tu Calendario');
  titulo.setTop(40).setLeft(40).setWidth(640).setHeight(50);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORES.primario);
  titulo.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Fecha grande
  const fecha = slide.insertTextBox('15 de Marzo');
  fecha.setTop(120).setLeft(40).setWidth(640).setHeight(80);
  fecha.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(56)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  fecha.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Año
  const anio = slide.insertTextBox('2026');
  anio.setTop(200).setLeft(40).setWidth(640).setHeight(50);
  anio.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(36)
    .setForegroundColor(COLORES.texto);
  anio.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Detalles
  const detalles = slide.insertTextBox('98ª Edición de los Premios Oscar\nTeatro Dolby • Hollywood, Los Ángeles\nPresentador: Conan O\'Brien');
  detalles.setTop(280).setLeft(40).setWidth(640).setHeight(100);
  detalles.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(18)
    .setForegroundColor(COLORES.texto);
  detalles.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// DIAPOSITIVA 12: CIERRE
// ============================================
function crearCierre(presentacion) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(COLORES.primario);
  
  // Emoji
  const emoji = slide.insertTextBox('🎬');
  emoji.setTop(100).setLeft(280).setWidth(160).setHeight(80);
  emoji.getText().getTextStyle().setFontSize(60);
  emoji.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Gracias
  const gracias = slide.insertTextBox('¡Gracias!');
  gracias.setTop(180).setLeft(40).setWidth(640).setHeight(80);
  gracias.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(52)
    .setBold(true)
    .setForegroundColor(COLORES.secundario);
  gracias.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Línea
  const linea = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  linea.setTop(270).setLeft(250).setWidth(220).setHeight(3);
  linea.getFill().setSolidFill(COLORES.secundario);
  linea.getBorder().setTransparent();
  
  // Fuente
  const fuente = slide.insertTextBox('Fuente: BBC News Mundo\nbbc.com/mundo');
  fuente.setTop(290).setLeft(40).setWidth(640).setHeight(60);
  fuente.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(16)
    .setForegroundColor('#b0b0b0');
  fuente.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}
