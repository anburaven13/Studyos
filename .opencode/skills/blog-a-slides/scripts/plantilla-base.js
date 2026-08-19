/**
 * ============================================
 * PLANTILLA BASE: Blog a Google Slides
 * ============================================
 * 
 * INSTRUCCIONES:
 * 1. Personaliza los valores en la sección CONFIGURACIÓN
 * 2. Modifica las diapositivas según el contenido del blog
 * 3. Ejecuta la función crearPresentacion()
 * 
 * PALETAS DISPONIBLES:
 * - tecnologia: Azules y verdes modernos
 * - negocios: Azul corporativo y dorado
 * - creativo: Púrpuras y turquesas vibrantes
 * - salud: Verdes y azules suaves
 * - minimalista: Blancos, negros y un acento
 */

// ============================================
// CONFIGURACIÓN - PERSONALIZA AQUÍ
// ============================================
const CONFIG = {
  titulo: 'Título de la Presentación',
  subtitulo: 'Subtítulo o tagline',
  autor: 'Tu Nombre',
  contacto: 'email@ejemplo.com',
  paleta: 'tecnologia' // Opciones: tecnologia, negocios, creativo, salud, minimalista
};

// ============================================
// PALETAS DE COLORES
// ============================================
const PALETAS = {
  tecnologia: {
    primario: '#1a73e8',
    secundario: '#34a853',
    acento: '#ea4335',
    fondo: '#ffffff',
    fondoAlt: '#f8f9fa',
    texto: '#202124',
    textoClaro: '#ffffff'
  },
  negocios: {
    primario: '#1e3a5f',
    secundario: '#c9a227',
    acento: '#e74c3c',
    fondo: '#ffffff',
    fondoAlt: '#f4f4f4',
    texto: '#2c3e50',
    textoClaro: '#ffffff'
  },
  creativo: {
    primario: '#6c5ce7',
    secundario: '#00cec9',
    acento: '#fd79a8',
    fondo: '#ffffff',
    fondoAlt: '#dfe6e9',
    texto: '#2d3436',
    textoClaro: '#ffffff'
  },
  salud: {
    primario: '#00b894',
    secundario: '#0984e3',
    acento: '#fdcb6e',
    fondo: '#ffffff',
    fondoAlt: '#f5f6fa',
    texto: '#2d3436',
    textoClaro: '#ffffff'
  },
  minimalista: {
    primario: '#2d3436',
    secundario: '#636e72',
    acento: '#e17055',
    fondo: '#ffffff',
    fondoAlt: '#f5f5f5',
    texto: '#2d3436',
    textoClaro: '#ffffff'
  }
};

// ============================================
// CONTENIDO DE LAS DIAPOSITIVAS
// Modifica este array con el contenido del blog
// ============================================
const DIAPOSITIVAS = [
  {
    tipo: 'portada',
    titulo: CONFIG.titulo,
    subtitulo: CONFIG.subtitulo
  },
  {
    tipo: 'agenda',
    titulo: 'Lo que veremos hoy',
    puntos: [
      'Primer tema principal',
      'Segundo tema principal',
      'Tercer tema principal',
      'Conclusiones clave'
    ]
  },
  {
    tipo: 'seccion',
    titulo: 'Primera Sección',
    puntos: [
      'Punto clave número uno',
      'Punto clave número dos',
      'Punto clave número tres'
    ]
  },
  {
    tipo: 'cita',
    texto: 'Una cita impactante del blog que resuma una idea poderosa.',
    autor: 'Autor de la cita'
  },
  {
    tipo: 'datos',
    titulo: 'Dato Impactante',
    numero: '85%',
    descripcion: 'de los usuarios prefieren contenido visual'
  },
  {
    tipo: 'cierre',
    titulo: '¡Gracias!',
    contacto: CONFIG.contacto
  }
];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
function crearPresentacion() {
  const colores = PALETAS[CONFIG.paleta];
  const presentacion = SlidesApp.create(CONFIG.titulo);
  
  // Eliminar diapositiva inicial en blanco
  const slidesIniciales = presentacion.getSlides();
  if (slidesIniciales.length > 0) {
    slidesIniciales[0].remove();
  }
  
  // Generar cada diapositiva
  DIAPOSITIVAS.forEach(diap => {
    switch(diap.tipo) {
      case 'portada':
        crearPortada(presentacion, diap, colores);
        break;
      case 'agenda':
        crearAgenda(presentacion, diap, colores);
        break;
      case 'seccion':
        crearSeccion(presentacion, diap, colores);
        break;
      case 'cita':
        crearCita(presentacion, diap, colores);
        break;
      case 'datos':
        crearDatos(presentacion, diap, colores);
        break;
      case 'cierre':
        crearCierre(presentacion, diap, colores);
        break;
    }
  });
  
  const url = presentacion.getUrl();
  Logger.log('✅ Presentación creada exitosamente!');
  Logger.log('🔗 URL: ' + url);
  
  return url;
}

// ============================================
// FUNCIONES DE DIAPOSITIVAS
// ============================================

function crearPortada(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.primario);
  
  // Título
  const titulo = slide.insertTextBox(contenido.titulo);
  titulo.setTop(180).setLeft(40).setWidth(640).setHeight(100);
  const tituloTexto = titulo.getText();
  tituloTexto.getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(52)
    .setBold(true)
    .setForegroundColor(colores.textoClaro);
  tituloTexto.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Subtítulo
  const subtitulo = slide.insertTextBox(contenido.subtitulo);
  subtitulo.setTop(290).setLeft(40).setWidth(640).setHeight(60);
  const subTexto = subtitulo.getText();
  subTexto.getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(24)
    .setForegroundColor('#e8eaed');
  subTexto.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

function crearAgenda(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.fondo);
  
  // Título
  agregarTitulo(slide, contenido.titulo, colores);
  
  // Puntos con números
  let yPos = 140;
  contenido.puntos.forEach((punto, i) => {
    // Número circular
    const numBox = slide.insertTextBox((i + 1).toString());
    numBox.setTop(yPos).setLeft(60).setWidth(40).setHeight(40);
    numBox.getText().getTextStyle()
      .setFontFamily('Montserrat')
      .setFontSize(18)
      .setBold(true)
      .setForegroundColor(colores.textoClaro);
    numBox.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    numBox.getFill().setSolidFill(colores.primario);
    
    // Texto del punto
    const puntoBox = slide.insertTextBox(punto);
    puntoBox.setTop(yPos + 5).setLeft(115).setWidth(530).setHeight(35);
    puntoBox.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(20)
      .setForegroundColor(colores.texto);
    
    yPos += 60;
  });
}

function crearSeccion(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.fondo);
  
  // Barra de acento lateral
  const barra = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  barra.setTop(0).setLeft(0).setWidth(8).setHeight(405);
  barra.getFill().setSolidFill(colores.primario);
  barra.getBorder().setTransparent();
  
  // Título
  agregarTitulo(slide, contenido.titulo, colores);
  
  // Puntos
  let yPos = 140;
  contenido.puntos.forEach(punto => {
    const puntoBox = slide.insertTextBox('●  ' + punto);
    puntoBox.setTop(yPos).setLeft(50).setWidth(620).setHeight(45);
    puntoBox.getText().getTextStyle()
      .setFontFamily('Open Sans')
      .setFontSize(22)
      .setForegroundColor(colores.texto);
    yPos += 55;
  });
}

function crearCita(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.secundario);
  
  // Comillas decorativas
  const comillas = slide.insertTextBox('"');
  comillas.setTop(80).setLeft(50).setWidth(100).setHeight(100);
  comillas.getText().getTextStyle()
    .setFontFamily('Georgia')
    .setFontSize(120)
    .setForegroundColor('#ffffff50');
  
  // Cita
  const cita = slide.insertTextBox(contenido.texto);
  cita.setTop(140).setLeft(80).setWidth(560).setHeight(150);
  cita.getText().getTextStyle()
    .setFontFamily('Georgia')
    .setFontSize(28)
    .setItalic(true)
    .setForegroundColor(colores.textoClaro);
  cita.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Autor
  const autor = slide.insertTextBox('— ' + contenido.autor);
  autor.setTop(310).setLeft(80).setWidth(560).setHeight(40);
  autor.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(18)
    .setForegroundColor('#e8eaed');
  autor.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

function crearDatos(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.fondoAlt);
  
  // Número grande
  const numero = slide.insertTextBox(contenido.numero);
  numero.setTop(100).setLeft(40).setWidth(640).setHeight(150);
  numero.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(96)
    .setBold(true)
    .setForegroundColor(colores.primario);
  numero.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Descripción
  const desc = slide.insertTextBox(contenido.descripcion);
  desc.setTop(260).setLeft(60).setWidth(600).setHeight(80);
  desc.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(28)
    .setForegroundColor(colores.texto);
  desc.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

function crearCierre(presentacion, contenido, colores) {
  const slide = presentacion.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(colores.primario);
  
  // Gracias
  const gracias = slide.insertTextBox(contenido.titulo);
  gracias.setTop(150).setLeft(40).setWidth(640).setHeight(100);
  gracias.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(64)
    .setBold(true)
    .setForegroundColor(colores.textoClaro);
  gracias.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  
  // Contacto
  const contacto = slide.insertTextBox(contenido.contacto);
  contacto.setTop(270).setLeft(40).setWidth(640).setHeight(50);
  contacto.getText().getTextStyle()
    .setFontFamily('Open Sans')
    .setFontSize(22)
    .setForegroundColor('#e8eaed');
  contacto.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function agregarTitulo(slide, texto, colores) {
  const titulo = slide.insertTextBox(texto);
  titulo.setTop(40).setLeft(40).setWidth(640).setHeight(70);
  titulo.getText().getTextStyle()
    .setFontFamily('Montserrat')
    .setFontSize(40)
    .setBold(true)
    .setForegroundColor(colores.primario);
}
