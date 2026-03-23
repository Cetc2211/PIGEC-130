# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.units import inch

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font families
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/informe_configuracion_expedientes_pigec.pdf",
    pagesize=letter,
    title="Informe de Configuracion - Sistema de Expedientes PIGEC-130",
    author="Z.ai",
    creator="Z.ai",
    subject="Analisis profundo y propuesta de configuracion para el sistema de gestion de expedientes psicometricos"
)

# Define styles
styles = getSampleStyleSheet()

# Cover styles
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=28,
    leading=38,
    alignment=TA_CENTER,
    spaceAfter=20
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',
    fontSize=16,
    leading=24,
    alignment=TA_CENTER,
    spaceAfter=40
)

# Content styles
h1_style = ParagraphStyle(
    name='ChineseH1',
    fontName='Microsoft YaHei',
    fontSize=16,
    leading=24,
    alignment=TA_LEFT,
    spaceBefore=20,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='ChineseH2',
    fontName='Microsoft YaHei',
    fontSize=13,
    leading=20,
    alignment=TA_LEFT,
    spaceBefore=14,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='ChineseH3',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=10,
    spaceAfter=6
)

body_style = ParagraphStyle(
    name='ChineseBody',
    fontName='SimHei',
    fontSize=10.5,
    leading=18,
    alignment=TA_JUSTIFY,
    spaceAfter=10,
    firstLineIndent=24,
    wordWrap='CJK'
)

body_no_indent = ParagraphStyle(
    name='ChineseBodyNoIndent',
    fontName='SimHei',
    fontSize=10.5,
    leading=18,
    alignment=TA_JUSTIFY,
    spaceAfter=10,
    wordWrap='CJK'
)

bullet_style = ParagraphStyle(
    name='BulletStyle',
    fontName='SimHei',
    fontSize=10.5,
    leading=18,
    alignment=TA_LEFT,
    spaceAfter=6,
    leftIndent=24,
    bulletIndent=12,
    wordWrap='CJK'
)

table_header_style = ParagraphStyle(
    name='TableHeader',
    fontName='SimHei',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

table_cell_style = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=9,
    alignment=TA_LEFT,
    leading=14,
    wordWrap='CJK'
)

table_cell_center = ParagraphStyle(
    name='TableCellCenter',
    fontName='SimHei',
    fontSize=9,
    alignment=TA_CENTER,
    leading=14,
    wordWrap='CJK'
)

caption_style = ParagraphStyle(
    name='Caption',
    fontName='SimHei',
    fontSize=9,
    alignment=TA_CENTER,
    spaceBefore=6,
    spaceAfter=16
)

story = []

# ============================================
# COVER PAGE
# ============================================
story.append(Spacer(1, 100))
story.append(Paragraph("INFORME TECNICO", cover_title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("Sistema de Gestion de Expedientes Psicometricos", cover_title_style))
story.append(Paragraph("PIGEC-130", cover_title_style))
story.append(Spacer(1, 40))
story.append(Paragraph("Analisis Profundo y Propuesta de Configuracion", cover_subtitle_style))
story.append(Spacer(1, 60))
story.append(Paragraph("Documento elaborado para la integracion del modulo de evaluacion", ParagraphStyle(
    name='CoverDesc',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_CENTER
)))
story.append(Paragraph("con el sistema de expedientes clinicos existente", ParagraphStyle(
    name='CoverDesc2',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_CENTER
)))
story.append(Spacer(1, 80))
story.append(Paragraph("Marzo 2026", ParagraphStyle(
    name='CoverDate',
    fontName='SimHei',
    fontSize=12,
    leading=18,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# ============================================
# SECTION 1: INTRODUCCION
# ============================================
story.append(Paragraph("<b>1. INTRODUCCION</b>", h1_style))

story.append(Paragraph(
    "El presente documento tiene como objetivo realizar un analisis profundo de la estructura actual del sistema de expedientes del proyecto PIGEC-130, con el fin de proponer una configuracion que permita integrar de manera efectiva los resultados de las evaluaciones psicometricas con el sistema de gestion de expedientes clinicos existente. El sistema PIGEC-130 ha sido disenado como una plataforma integral para la aplicacion y gestion de pruebas psicometricas en el ambito educativo, y su integracion con el dashboard de expedientes clinicos es fundamental para optimizar el flujo de trabajo del personal de orientacion y salud mental.",
    body_style
))

story.append(Paragraph(
    "El analisis se basa en la revision exhaustiva de los componentes existentes en el sistema, incluyendo el dashboard principal de expedientes clinicos, los modulos de evaluacion psicometrica, y la estructura de datos subyacente en Firestore. A partir de este analisis, se propone una arquitectura de datos y una serie de recomendaciones de implementacion que permitiran una integracion seamless entre ambos sistemas.",
    body_style
))

story.append(Paragraph("<b>1.1 Alcance del Analisis</b>", h2_style))
story.append(Paragraph(
    "Este informe cubre los siguientes aspectos fundamentales del sistema: la estructura general del dashboard de expedientes y su organizacion modular, el sistema de navegacion y pestañas para acceso a diferentes secciones del expediente, el modulo de evaluacion clinica con sus componentes de screening emocional, tamizaje neuropsicologico y evaluacion de conductas de riesgo, la estructura de datos actual en Firestore y las relaciones entre colecciones, y finalmente las propuestas de configuracion para integrar los resultados de evaluaciones automaticas.",
    body_style
))

# ============================================
# SECTION 2: ANALISIS DEL DASHBOARD ACTUAL
# ============================================
story.append(Paragraph("<b>2. ANALISIS DEL DASHBOARD ACTUAL</b>", h1_style))

story.append(Paragraph("<b>2.1 Estructura General</b>", h2_style))
story.append(Paragraph(
    "El dashboard de expedientes clinicos del sistema PIGEC-130 presenta una arquitectura multinivel disenada para gestionar informacion clinica sensible con diferentes niveles de acceso. La interfaz principal se denomina 'Expediente Clinico Nivel 3 - Confidencial', lo que indica un sistema de clasificacion por niveles de confidencialidad. Esta denominacion sugiere que existen al menos tres niveles de acceso a la informacion, siendo el Nivel 3 el mas restrictivo y reservado para personal clinico autorizado.",
    body_style
))

story.append(Paragraph(
    "El encabezado del expediente muestra el nombre completo del paciente junto con una etiqueta de clasificacion de riesgo, por ejemplo 'Ana M. Perez (Caso: Riesgo Critico)'. Esta visualizacion inmediata del nivel de riesgo permite al clinico identificar rapidamente los casos que requieren atencion prioritaria sin necesidad de navegar a secciones adicionales del expediente.",
    body_style
))

story.append(Paragraph("<b>2.2 Sistema de Alertas Visuales</b>", h2_style))
story.append(Paragraph(
    "Un componente critico del dashboard es el sistema de alertas visuales, que proporciona informacion esencial de manera prominente. El sistema implementa dos tipos principales de alertas que se muestran en la parte superior del expediente, inmediatamente despues del encabezado del paciente:",
    body_no_indent
))

story.append(Paragraph(
    "<b>Alerta de Riesgo Critico (Codigo Rojo):</b> Esta alerta se muestra en un recuadro de color rojo y advierte sobre casos que han sido identificados con riesgo suicida critico o alto. El mensaje indica especificamente que 'Se debe priorizar la aplicacion inmediata del Plan de Seguridad y la canalizacion externa de emergencia (Criterio A/B)'. Esta alerta es fundamental para garantizar la atencion oportuna de casos de alto riesgo y cumple con los protocolos de seguridad establecidos en el campo de la salud mental.",
    bullet_style
))

story.append(Paragraph(
    "<b>Disclaimer Deontologico (Cap. 1.5):</b> Esta alerta se muestra en un recuadro de color amarillo y cumple una funcion de proteccion etica y legal. El mensaje aclara que 'El resultado de este expediente (IRC, BDI, etc.) constituye una Alerta de Riesgo y una Impresion Diagnostica Provisional, no un diagnostico nosologico definitivo'. Esta aclaracion es esencial para evitar el uso inadecuado de los resultados y mantener la integridad etica del proceso de evaluacion.",
    bullet_style
))

story.append(Paragraph("<b>2.3 Sistema de Navegacion por Pestanas</b>", h2_style))
story.append(Paragraph(
    "El expediente clinico se organiza mediante un sistema de navegacion por pestañas que permite el acceso estructurado a diferentes modulos de informacion. Este patron de diseño facilita la organizacion de grandes volumenes de informacion clinica sin sobrecargar la interfaz visual. El sistema actual implementa cinco pestañas principales, cada una con un proposito especifico:",
    body_style
))

# Table: Pestanas
tab_data = [
    [Paragraph('<b>Pestana</b>', table_header_style), 
     Paragraph('<b>Icono</b>', table_header_style), 
     Paragraph('<b>Contenido Principal</b>', table_header_style)],
    [Paragraph('Ficha de Identificacion', table_cell_style), 
     Paragraph('UserCheck', table_cell_center), 
     Paragraph('Datos demograficos del estudiante, informacion de contacto de emergencia, y notas de trazabilidad de relacion dual', table_cell_style)],
    [Paragraph('Resumen Ejecutivo', table_cell_style), 
     Paragraph('Activity', table_cell_center), 
     Paragraph('Evaluacion clinica completa: screening emocional, tamizaje neuropsicologico, conductas de riesgo e impresion diagnostica', table_cell_style)],
    [Paragraph('Gestion de Pruebas', table_cell_style), 
     Paragraph('ClipboardList', table_cell_center), 
     Paragraph('Modulos para aplicar instrumentos de tamizaje individual, consola WISC-V/WAIS-IV, y consola de tamizaje neuropsicologico', table_cell_style)],
    [Paragraph('Evolucion y Notas', table_cell_style), 
     Paragraph('FileText', table_cell_center), 
     Paragraph('Notas SOAP para seguimiento clinico, registro de progreso del tratamiento, e indicadores KPI', table_cell_style)],
    [Paragraph('Documentacion Legal', table_cell_style), 
     Paragraph('FileDown', table_cell_center), 
     Paragraph('Generacion de reportes oficiales, documentos de consentimiento informado, y documentacion legal relacionada', table_cell_style)],
]
tab_table = Table(tab_data, colWidths=[1.8*inch, 0.9*inch, 3.3*inch])
tab_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(tab_table)
story.append(Paragraph("Tabla 1. Sistema de navegacion por pestañas del expediente clinico", caption_style))

# ============================================
# SECTION 3: MODULO DE EVALUACION CLINICA
# ============================================
story.append(Paragraph("<b>3. MODULO DE EVALUACION CLINICA (RESUMEN EJECUTIVO)</b>", h1_style))

story.append(Paragraph(
    "El Modulo 2.1 de Evaluacion Clinica representa el nucleo funcional del expediente, concentrando la informacion mas relevante para la toma de decisiones clinicas. Este modulo se accede a traves de la pestaña 'Resumen Ejecutivo' y se estructura en cuatro secciones principales que abordan diferentes dimensiones de la evaluacion psicologica.",
    body_style
))

story.append(Paragraph("<b>3.1 Seccion I: Screening Emocional</b>", h2_style))
story.append(Paragraph(
    "La primera seccion del modulo de evaluacion clinica se dedica al screening emocional, enfocado en la medicion de depresion, ansiedad e ideacion suicida. Esta seccion utiliza instrumentos psicométricos validados y estandarizados que permiten una evaluacion objetiva del estado emocional del evaluado. Los tres instrumentos principales utilizados en esta seccion son:",
    body_style
))

story.append(Paragraph(
    "<b>Inventario de Depresion de Beck-II (BDI-II):</b> Este instrumento evalua la severidad de los sintomas depresivos en adolescentes y adultos. El BDI-II consta de 21 items que exploran diferentes aspectos de la depresion, incluyendo sintomas afectivos, cognitivos, somaticos y vegetativos. Los puntajes se interpretan segun rangos establecidos: 0-13 indica depresion minima, 14-19 depresion leve, 20-28 depresion moderada, y 29-63 depresion severa. La aplicacion del BDI-II proporciona una medida cuantitativa del nivel de sintomatologia depresiva que puede ser monitoreada a lo largo del tiempo.",
    bullet_style
))

story.append(Paragraph(
    "<b>Inventario de Ansiedad de Beck (BAI):</b> Este instrumento evalua la severidad de los sintomas de ansiedad. El BAI consta de 21 items que describen sintomas comunes de ansiedad, y el evaluado indica el grado en que cada sintoma le ha afectado durante la ultima semana. Los puntajes se interpretan: 0-7 ansiedad minima, 8-15 ansiedad leve, 16-25 ansiedad moderada, y 26-63 ansiedad severa. El BAI es particularmente util para diferenciar entre ansiedad y depresion, aunque frecuentemente se presenta comorbilidad entre ambas condiciones.",
    bullet_style
))

story.append(Paragraph(
    "<b>Escala de Ideacion Suicida de Beck:</b> Este instrumento evalua la presencia e intensidad de pensamientos suicidas. Es una herramienta critica para la evaluacion del riesgo suicida y proporciona informacion esencial para la toma de decisiones clinicas relacionadas con la seguridad del paciente. Puntajes elevados en esta escala activan los protocolos de riesgo y pueden generar alertas de codigo rojo en el sistema.",
    bullet_style
))

# Table: Screening
story.append(Spacer(1, 12))
screen_data = [
    [Paragraph('<b>Instrumento</b>', table_header_style), 
     Paragraph('<b>Campo en BD</b>', table_header_style), 
     Paragraph('<b>Rangos de Interpretacion</b>', table_header_style)],
    [Paragraph('BDI-II', table_cell_style), 
     Paragraph('bdi_ii_score', table_cell_style), 
     Paragraph('Minima (0-13), Leve (14-19), Moderada (20-28), Severa (29-63)', table_cell_style)],
    [Paragraph('BAI', table_cell_style), 
     Paragraph('bai_score', table_cell_style), 
     Paragraph('Minima (0-7), Leve (8-15), Moderada (16-25), Severa (26-63)', table_cell_style)],
    [Paragraph('Ideacion Suicida Beck', table_cell_style), 
     Paragraph('riesgo_suicida_beck_score', table_cell_style), 
     Paragraph('Puntaje mayor indica mayor riesgo suicida - activa protocolos', table_cell_style)],
]
screen_table = Table(screen_data, colWidths=[1.8*inch, 1.8*inch, 2.4*inch])
screen_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(screen_table)
story.append(Paragraph("Tabla 2. Instrumentos de screening emocional y sus rangos de interpretacion", caption_style))

story.append(Paragraph("<b>3.2 Seccion II: Tamizaje Neuropsicologico</b>", h2_style))
story.append(Paragraph(
    "La segunda seccion del modulo evalua las funciones ejecutivas a traves de tres indices principales que proporcionan una vision integral del funcionamiento cognitivo del evaluado. Estos indices se derivan de pruebas estandarizadas que permiten comparar el desempeno individual con normas poblacionales:",
    body_style
))

story.append(Paragraph(
    "<b>Indice de Memoria de Trabajo (MT):</b> Este indice evalua la capacidad del individuo para retener y manipular informacion temporalmente. La memoria de trabajo es fundamental para tareas como el razonamiento, la comprension lectora y la resolucion de problemas. Un puntaje bajo en este indice puede indicar dificultades en el procesamiento de informacion compleja y en el seguimiento de instrucciones multiples.",
    bullet_style
))

story.append(Paragraph(
    "<b>Indice de Atencion Sostenida (AS):</b> Este indice mide la capacidad para mantener la concentracion en una tarea durante periodos prolongados. La atencion sostenida es crucial para el desempeno academico y laboral. Dificultades en esta area pueden manifestarse como problemas para completar tareas, facil distraccion o inconsistencia en el rendimiento.",
    bullet_style
))

story.append(Paragraph(
    "<b>Indice de Velocidad de Procesamiento (VP):</b> Este indice evalua la rapidez con la que el individuo procesa informacion visual y ejecuta tareas motoras simples. Una velocidad de procesamiento reducida puede afectar la eficiencia en tareas academicas y cotidianas, aunque no necesariamente refleja limitaciones en la capacidad intelectual.",
    bullet_style
))

story.append(Paragraph(
    "Adicionalmente, esta seccion incluye un campo narrativo denominado 'Contexto de Carga Cognitiva / Estres' que permite al evaluador documentar factores situacionales que puedan estar afectando el desempeno cognitivo del evaluado. Este contexto es fundamental para interpretar adecuadamente los puntajes obtenidos y evitar conclusiones erroneas basadas unicamente en datos cuantitativos.",
    body_style
))

story.append(Paragraph("<b>3.3 Seccion III: Conductas de Riesgo</b>", h2_style))
story.append(Paragraph(
    "La tercera seccion aborda la evaluacion de conductas de riesgo, dimension fundamental para la planificacion de intervenciones preventivas. Esta seccion incluye dos componentes principales:",
    body_style
))

story.append(Paragraph(
    "<b>Resultado ASSIST (Consumo de Sustancias):</b> El ASSIST (Alcohol, Smoking and Substance Involvement Screening Test) es un instrumento desarrollado por la OMS para detectar el consumo de sustancias y sus consecuencias. El resultado se registra como 'Positivo' o 'Negativo', y en caso de ser positivo, se activan protocolos de intervencion especificos para el abordaje de problematicas relacionadas con sustancias.",
    bullet_style
))

story.append(Paragraph(
    "<b>Puntaje de Conductas Autolesivas:</b> Este campo registra la frecuencia de conductas autolesivas, proporcionando informacion cuantitativa sobre un indicador critico de riesgo. Un puntaje elevado en este campo puede activar alertas de seguimiento cercano y la implementacion de planes de seguridad especificos.",
    bullet_style
))

story.append(Paragraph("<b>3.4 Seccion IV: Impresion Diagnostica</b>", h2_style))
story.append(Paragraph(
    "La cuarta y ultima seccion del modulo de evaluacion clinica permite al profesional registrar su impresion diagnostica provisional basada en la integracion de toda la evidencia recopilada. Este campo narrativo es fundamental para la formulacion del caso y sirve como puente entre los datos cuantitativos de las pruebas y la interpretacion clinica experta.",
    body_style
))

story.append(Paragraph(
    "La impresion diagnostica debe considerarse como una hipotesis clinica que guia las intervenciones subsecuentes, no como un diagnostico definitivo. Esta distincion es crucial desde el punto de vista etico y se refuerza mediante el disclaimer deontologico que se muestra en el encabezado del expediente.",
    body_style
))

# ============================================
# SECTION 4: ESTRUCTURA DE DATOS EN FIRESTORE
# ============================================
story.append(Paragraph("<b>4. ESTRUCTURA DE DATOS EN FIRESTORE</b>", h1_style))

story.append(Paragraph("<b>4.1 Vision General de la Arquitectura</b>", h2_style))
story.append(Paragraph(
    "El sistema PIGEC-130 utiliza Firebase Firestore como base de datos NoSQL para el almacenamiento de informacion. La arquitectura de datos se organiza en colecciones que representan diferentes entidades del sistema y sus relaciones. El diseno actual incluye colecciones para estudiantes, expedientes, resultados de pruebas, sesiones de evaluacion y matriculas, entre otras.",
    body_style
))

story.append(Paragraph(
    "La relacion entre las colecciones se establece mediante campos de referencia que permiten vincular documentos relacionados. Por ejemplo, los resultados de pruebas se vinculan a expedientes especificos a traves de la matricula del estudiante y el identificador de la sesion de evaluacion.",
    body_style
))

story.append(Paragraph("<b>4.2 Coleccion: expedientes</b>", h2_style))
story.append(Paragraph(
    "La coleccion 'expedientes' representa el registro principal que vincula a un estudiante con una sesion de evaluacion especifica. Cada documento en esta coleccion actua como contenedor de los resultados de las pruebas aplicadas durante esa sesion. A continuacion se presenta la estructura de campos propuesta para optimizar la integracion:",
    body_style
))

# Table: expedientes
exp_data = [
    [Paragraph('<b>Campo</b>', table_header_style), 
     Paragraph('<b>Tipo</b>', table_header_style), 
     Paragraph('<b>Descripcion</b>', table_header_style)],
    [Paragraph('id', table_cell_style), 
     Paragraph('string (auto)', table_cell_style), 
     Paragraph('Identificador unico del documento generado automaticamente por Firestore', table_cell_style)],
    [Paragraph('matricula', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Matricula del estudiante - campo clave para vinculacion con resultados', table_cell_style)],
    [Paragraph('nombreCompleto', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Nombre completo del estudiante para visualizacion en el dashboard', table_cell_style)],
    [Paragraph('grupoId', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Identificador del grupo para filtrado y organizacion', table_cell_style)],
    [Paragraph('grupoNombre', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Nombre del grupo (ej. 5A, 3B) para visualizacion directa', table_cell_style)],
    [Paragraph('sessionId', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Identificador de la sesion de evaluacion - campo clave para vinculacion', table_cell_style)],
    [Paragraph('sessionName', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Nombre descriptivo de la sesion de evaluacion', table_cell_style)],
    [Paragraph('estado', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Estado del expediente: en_progreso o completado', table_cell_style)],
    [Paragraph('fechaCreacion', table_cell_style), 
     Paragraph('timestamp', table_cell_style), 
     Paragraph('Fecha y hora de creacion del expediente', table_cell_style)],
    [Paragraph('fechaCompletado', table_cell_style), 
     Paragraph('timestamp', table_cell_style), 
     Paragraph('Fecha de finalizacion de todas las pruebas (opcional)', table_cell_style)],
    [Paragraph('testsTotal', table_cell_style), 
     Paragraph('number', table_cell_style), 
     Paragraph('Numero total de pruebas asignadas en la sesion', table_cell_style)],
    [Paragraph('testsCompletados', table_cell_style), 
     Paragraph('number', table_cell_style), 
     Paragraph('Numero de pruebas completadas hasta el momento', table_cell_style)],
    [Paragraph('riesgoGlobal', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Nivel de riesgo global: Bajo, Medio, Alto, Critico', table_cell_style)],
]
exp_table = Table(exp_data, colWidths=[1.6*inch, 1.2*inch, 3.2*inch])
exp_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 11), (-1, 11), colors.white),
    ('BACKGROUND', (0, 12), (-1, 12), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 13), (-1, 13), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 12))
story.append(exp_table)
story.append(Paragraph("Tabla 3. Estructura de campos para la coleccion 'expedientes'", caption_style))

story.append(Paragraph("<b>4.3 Coleccion: test_results</b>", h2_style))
story.append(Paragraph(
    "La coleccion 'test_results' almacena los resultados individuales de cada prueba psicometrica aplicada. Cada documento en esta coleccion representa la respuesta completa a un instrumento especifico, incluyendo tanto el puntaje calculado como las respuestas individuales a cada item.",
    body_style
))

# Table: test_results
test_data = [
    [Paragraph('<b>Campo</b>', table_header_style), 
     Paragraph('<b>Tipo</b>', table_header_style), 
     Paragraph('<b>Descripcion</b>', table_header_style)],
    [Paragraph('id', table_cell_style), 
     Paragraph('string (auto)', table_cell_style), 
     Paragraph('Identificador unico del resultado', table_cell_style)],
    [Paragraph('testId', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Identificador del test: gad-7, phq-9, bdi-ii, bai, beck-suicide, etc.', table_cell_style)],
    [Paragraph('testName', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Nombre completo del instrumento para visualizacion', table_cell_style)],
    [Paragraph('matricula', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Matricula del estudiante que completo la prueba', table_cell_style)],
    [Paragraph('sessionId', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Identificador de la sesion de evaluacion', table_cell_style)],
    [Paragraph('expedienteId', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('ID del expediente padre (opcional, para referencia directa)', table_cell_style)],
    [Paragraph('puntaje', table_cell_style), 
     Paragraph('number', table_cell_style), 
     Paragraph('Puntaje total obtenido en la prueba', table_cell_style)],
    [Paragraph('respuestas', table_cell_style), 
     Paragraph('map', table_cell_style), 
     Paragraph('Objeto con las respuestas individuales: {"q1": "2", "q2": "1", ...}', table_cell_style)],
    [Paragraph('fechaCompletado', table_cell_style), 
     Paragraph('timestamp', table_cell_style), 
     Paragraph('Fecha y hora de finalizacion de la prueba', table_cell_style)],
    [Paragraph('interpretacion', table_cell_style), 
     Paragraph('string', table_cell_style), 
     Paragraph('Interpretacion automatica del puntaje segun rangos', table_cell_style)],
]
test_table = Table(test_data, colWidths=[1.6*inch, 1.2*inch, 3.2*inch])
test_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 12))
story.append(test_table)
story.append(Paragraph("Tabla 4. Estructura de campos para la coleccion 'test_results'", caption_style))

# ============================================
# SECTION 5: MAPEO DE TESTS
# ============================================
story.append(Paragraph("<b>5. MAPEO DE TESTS A SECCIONES DEL EXPEDIENTE</b>", h1_style))

story.append(Paragraph(
    "Para lograr una integracion efectiva entre los resultados de las evaluaciones psicometricas y el dashboard de expedientes clinicos, es fundamental establecer un mapeo claro entre cada instrumento de evaluacion y las secciones correspondientes del expediente. Este mapeo permite que el sistema asigne automaticamente cada resultado a su ubicacion apropiada en el Resumen Ejecutivo.",
    body_style
))

# Table: Mapeo
map_data = [
    [Paragraph('<b>Test ID</b>', table_header_style), 
     Paragraph('<b>Instrumento</b>', table_header_style), 
     Paragraph('<b>Seccion</b>', table_header_style), 
     Paragraph('<b>Campo Destino</b>', table_header_style)],
    [Paragraph('gad-7', table_cell_style), 
     Paragraph('Escala de Ansiedad Generalizada-7', table_cell_style), 
     Paragraph('Screening Emocional', table_cell_style), 
     Paragraph('gad7_score (ansiedad)', table_cell_style)],
    [Paragraph('phq-9', table_cell_style), 
     Paragraph('Cuestionario de Salud del Paciente-9', table_cell_style), 
     Paragraph('Screening Emocional', table_cell_style), 
     Paragraph('phq9_score (depresion)', table_cell_style)],
    [Paragraph('bdi-ii', table_cell_style), 
     Paragraph('Inventario de Depresion de Beck-II', table_cell_style), 
     Paragraph('Screening Emocional', table_cell_style), 
     Paragraph('bdi_ii_score (depresion)', table_cell_style)],
    [Paragraph('bai', table_cell_style), 
     Paragraph('Inventario de Ansiedad de Beck', table_cell_style), 
     Paragraph('Screening Emocional', table_cell_style), 
     Paragraph('bai_score (ansiedad)', table_cell_style)],
    [Paragraph('beck-suicide', table_cell_style), 
     Paragraph('Escala Ideacion Suicida Beck', table_cell_style), 
     Paragraph('Screening Emocional', table_cell_style), 
     Paragraph('riesgo_suicida_beck_score', table_cell_style)],
    [Paragraph('assist', table_cell_style), 
     Paragraph('ASSIST (Consumo Sustancias)', table_cell_style), 
     Paragraph('Conductas de Riesgo', table_cell_style), 
     Paragraph('assist_result', table_cell_style)],
    [Paragraph('wisc-v', table_cell_style), 
     Paragraph('Escala Wechsler Ninos-V', table_cell_style), 
     Paragraph('Tamizaje Neuropsicologico', table_cell_style), 
     Paragraph('neuro_mt, neuro_as, neuro_vp', table_cell_style)],
    [Paragraph('wais-iv', table_cell_style), 
     Paragraph('Escala Wechsler Adultos-IV', table_cell_style), 
     Paragraph('Tamizaje Neuropsicologico', table_cell_style), 
     Paragraph('neuro_mt, neuro_as, neuro_vp', table_cell_style)],
]
map_table = Table(map_data, colWidths=[1.1*inch, 2*inch, 1.5*inch, 1.4*inch])
map_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 12))
story.append(map_table)
story.append(Paragraph("Tabla 5. Mapeo de tests a secciones y campos del expediente clinico", caption_style))

# ============================================
# SECTION 6: PROPUESTA DE INTEGRACION
# ============================================
story.append(Paragraph("<b>6. PROPUESTA DE INTEGRACION</b>", h1_style))

story.append(Paragraph("<b>6.1 Flujo de Datos Propuesto</b>", h2_style))
story.append(Paragraph(
    "Se propone implementar un flujo de datos que integre automaticamente los resultados de las evaluaciones psicometricas con el dashboard de expedientes clinicos. El flujo sigue una secuencia de cinco etapas que garantiza la consistencia de los datos y la trazabilidad de las evaluaciones:",
    body_style
))

story.append(Paragraph(
    "<b>Etapa 1 - Aplicacion de Pruebas:</b> El estudiante accede al modulo de evaluacion a traves de un enlace unico generado para su sesion. El sistema presenta las pruebas asignadas en secuencia y registra las respuestas en tiempo real. Al completar cada prueba, el sistema calcula automaticamente el puntaje y la interpretacion correspondiente.",
    bullet_style
))

story.append(Paragraph(
    "<b>Etapa 2 - Almacenamiento de Resultados:</b> Los resultados se almacenan en la coleccion 'test_results' de Firestore. Cada documento incluye el puntaje obtenido, las respuestas individuales, la interpretacion automatica, y los campos de vinculacion (matricula, sessionId) que permiten relacionar el resultado con el expediente correspondiente.",
    bullet_style
))

story.append(Paragraph(
    "<b>Etapa 3 - Actualizacion del Expediente:</b> El sistema actualiza automaticamente el registro del expediente en la coleccion 'expedientes'. Se incrementa el contador de pruebas completadas, se verifica si todas las pruebas han sido completadas para actualizar el estado, y se calcula el nivel de riesgo global basandose en los resultados obtenidos.",
    bullet_style
))

story.append(Paragraph(
    "<b>Etapa 4 - Visualizacion en Dashboard:</b> Cuando el clinico accede al expediente, el sistema consulta automaticamente los resultados almacenados y los presenta en las secciones correspondientes del Resumen Ejecutivo. Los puntajes se muestran con codificacion de colores segun el nivel de severidad, y se activan alertas automaticas cuando los puntajes superan los umbrales de riesgo.",
    bullet_style
))

story.append(Paragraph(
    "<b>Etapa 5 - Generacion de Impresion Diagnostica:</b> Opcionalmente, el sistema puede generar una sugerencia de impresion diagnostica basada en la integracion de todos los resultados. Esta sugerencia sirve como punto de partida para el clinico, quien puede modificarla o complementarla segun su juicio profesional.",
    bullet_style
))

story.append(Paragraph("<b>6.2 Componentes de Interfaz Recomendados</b>", h2_style))
story.append(Paragraph(
    "Para mantener la coherencia visual con el dashboard existente, se recomienda implementar los siguientes componentes de interfaz que permitan visualizar los resultados de manera clara y profesional:",
    body_style
))

story.append(Paragraph(
    "<b>Tarjetas de Evaluacion por Seccion:</b> Cada seccion del Resumen Ejecutivo debe presentarse en una tarjeta independiente con encabezado claramente identificado. Las tarjetas deben incluir codificacion por colores segun el nivel de riesgo detectado (verde para bajo, amarillo para medio, naranja para alto, rojo para critico). Adicionalmente, deben permitir la expansion para ver detalles adicionales como las respuestas individuales a cada item.",
    bullet_style
))

story.append(Paragraph(
    "<b>Indicadores de Progreso:</b> En la vista de lista de expedientes, se deben mostrar indicadores visuales del progreso de evaluacion (ej. 5/7 pruebas completadas) y del nivel de riesgo global. Estos indicadores permiten una rapida identificacion de casos que requieren atencion prioritaria.",
    bullet_style
))

story.append(Paragraph(
    "<b>Graficos de Seguimiento:</b> Para expedientes con multiples evaluaciones a lo largo del tiempo, se recomienda implementar graficos de linea que muestren la evolucion de los puntajes. Estos graficos son particularmente utiles para monitorear el progreso del tratamiento y la efectividad de las intervenciones.",
    bullet_style
))

# ============================================
# SECTION 7: RECOMENDACIONES
# ============================================
story.append(Paragraph("<b>7. RECOMENDACIONES DE IMPLEMENTACION</b>", h1_style))

story.append(Paragraph("<b>7.1 Prioridad Alta - Sincronizacion de Datos</b>", h2_style))
story.append(Paragraph(
    "La implementacion debe comenzar con la sincronizacion automatica de resultados entre el modulo de evaluacion y el panel de Resumen Ejecutivo. Esto implica modificar el flujo de guardado en el componente de evaluacion para que, ademas de almacenar el resultado en 'test_results', actualice los campos correspondientes en el documento del expediente. Esta sincronizacion eliminara la necesidad de entrada manual de datos y reducira significativamente el riesgo de errores.",
    body_style
))

story.append(Paragraph("<b>7.2 Prioridad Media - Interpretacion Automatica</b>", h2_style))
story.append(Paragraph(
    "En segundo lugar, se debe implementar la logica de interpretacion automatica de puntajes. El sistema debe calcular automaticamente la interpretacion del puntaje segun los criterios estandarizados de cada instrumento. Por ejemplo, un puntaje de 15 en el BDI-II debe mostrar automaticamente 'Depresion Leve' con codificacion de color amarillo. Esta funcionalidad facilita la interpretacion rapida de resultados y asegura la consistencia en la aplicacion de criterios clinicos.",
    body_style
))

story.append(Paragraph("<b>7.3 Prioridad Baja - Integracion con IA</b>", h2_style))
story.append(Paragraph(
    "Finalmente, se recomienda implementar la integracion con el modulo de Generacion de Impresion Diagnostica mediante Inteligencia Artificial. Esta funcionalidad permitira que el sistema genere sugerencias de impresion diagnostica basadas en la integracion de todos los resultados de las pruebas aplicadas. Es fundamental enfatizar que estas sugerencias sirven como herramienta de apoyo para el clinico y no reemplazan el juicio profesional. El clinico siempre tendra la capacidad de modificar, complementar o rechazar las sugerencias generadas.",
    body_style
))

# ============================================
# SECTION 8: CONCLUSION
# ============================================
story.append(Paragraph("<b>8. CONCLUSION</b>", h1_style))

story.append(Paragraph(
    "El sistema de expedientes PIGEC-130 presenta una arquitectura robusta y bien disenada para la gestion de evaluaciones psicometricas en el ambito educativo. La estructura modular del dashboard, con su sistema de navegacion por pestañas y sus alertas visuales, proporciona una interfaz profesional que facilita el trabajo del personal clinico mientras mantiene los estandares eticos y de confidencialidad requeridos en el campo de la salud mental.",
    body_style
))

story.append(Paragraph(
    "La propuesta de configuracion presentada en este documento busca optimizar la integracion entre los resultados de las pruebas aplicadas automaticamente y los paneles de visualizacion del expediente clinico. La implementacion gradual de las recomendaciones permitira mejorar significativamente la eficiencia del flujo de trabajo clinico, reduciendo la carga administrativa del personal y asegurando la consistencia de los datos a traves del sistema.",
    body_style
))

story.append(Paragraph(
    "El mapeo de tests a secciones del expediente y la estructura de datos propuesta proporcionan una base solida para el desarrollo de la integracion. Se recomienda priorizar la sincronizacion automatica de datos como primer paso, seguido de la implementacion de la interpretacion automatica de puntajes, y finalmente la integracion con el modulo de generacion de impresion diagnostica mediante IA.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF generado exitosamente")
