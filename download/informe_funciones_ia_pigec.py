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
    "/home/z/my-project/download/informe_funciones_ia_pigec.pdf",
    pagesize=letter,
    title="Analisis de Funciones de IA - Sistema PIGEC-130",
    author="Z.ai",
    creator="Z.ai",
    subject="Revision y analisis de funciones de inteligencia artificial configuradas y proyectadas en el sistema PIGEC-130"
)

# Define styles
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=26,
    leading=36,
    alignment=TA_CENTER,
    spaceAfter=20
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',
    fontSize=14,
    leading=22,
    alignment=TA_CENTER,
    spaceAfter=40
)

h1_style = ParagraphStyle(
    name='ChineseH1',
    fontName='Microsoft YaHei',
    fontSize=15,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=10,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='ChineseH2',
    fontName='Microsoft YaHei',
    fontSize=12,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=6,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='ChineseH3',
    fontName='SimHei',
    fontSize=11,
    leading=16,
    alignment=TA_LEFT,
    spaceBefore=8,
    spaceAfter=4
)

body_style = ParagraphStyle(
    name='ChineseBody',
    fontName='SimHei',
    fontSize=10,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=8,
    firstLineIndent=20,
    wordWrap='CJK'
)

body_no_indent = ParagraphStyle(
    name='ChineseBodyNoIndent',
    fontName='SimHei',
    fontSize=10,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=8,
    wordWrap='CJK'
)

bullet_style = ParagraphStyle(
    name='BulletStyle',
    fontName='SimHei',
    fontSize=10,
    leading=16,
    alignment=TA_LEFT,
    spaceAfter=6,
    leftIndent=20,
    bulletIndent=10,
    wordWrap='CJK'
)

table_header_style = ParagraphStyle(
    name='TableHeader',
    fontName='SimHei',
    fontSize=9,
    textColor=colors.white,
    alignment=TA_CENTER
)

table_cell_style = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=8.5,
    alignment=TA_LEFT,
    leading=13,
    wordWrap='CJK'
)

table_cell_center = ParagraphStyle(
    name='TableCellCenter',
    fontName='SimHei',
    fontSize=8.5,
    alignment=TA_CENTER,
    leading=13,
    wordWrap='CJK'
)

caption_style = ParagraphStyle(
    name='Caption',
    fontName='SimHei',
    fontSize=8.5,
    alignment=TA_CENTER,
    spaceBefore=4,
    spaceAfter=14
)

code_style = ParagraphStyle(
    name='CodeStyle',
    fontName='Times New Roman',
    fontSize=8,
    leading=11,
    alignment=TA_LEFT,
    spaceAfter=6,
    backColor=colors.HexColor('#F5F5F5'),
    leftIndent=10,
    rightIndent=10
)

story = []

# ============================================
# COVER PAGE
# ============================================
story.append(Spacer(1, 80))
story.append(Paragraph("INFORME DE ANALISIS", cover_title_style))
story.append(Paragraph("Funciones de Inteligencia Artificial", cover_title_style))
story.append(Paragraph("Sistema PIGEC-130", cover_title_style))
story.append(Spacer(1, 30))
story.append(Paragraph("Revision del Estado Actual y Proyecciones de Desarrollo", cover_subtitle_style))
story.append(Spacer(1, 50))
story.append(Paragraph("Documento Tecnico de Evaluacion", ParagraphStyle(
    name='CoverDesc',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_CENTER
)))
story.append(Paragraph("Marzo 2026", ParagraphStyle(
    name='CoverDate',
    fontName='SimHei',
    fontSize=11,
    leading=16,
    alignment=TA_CENTER,
    spaceAfter=8
)))
story.append(PageBreak())

# ============================================
# SECTION 1: RESUMEN EJECUTIVO
# ============================================
story.append(Paragraph("<b>1. RESUMEN EJECUTIVO</b>", h1_style))

story.append(Paragraph(
    "El presente informe documenta el analisis exhaustivo de las funciones de inteligencia artificial configuradas en el sistema PIGEC-130, asi como aquellas funcionalidades que se encuentran proyectadas para implementacion futura. El sistema PIGEC-130 es una plataforma integral para la gestion de evaluaciones psicometricas en el ambito educativo, que incluye modulos para la aplicacion de pruebas, gestion de expedientes clinicos y generacion de reportes especializados.",
    body_style
))

story.append(Paragraph(
    "El analisis revela que el sistema cuenta con una arquitectura de IA basada en Genkit y Google AI (Gemini), la cual se encuentra actualmente deshabilitada. Los archivos de configuracion y flujos de IA existen en el repositorio con extension .bak, lo que indica que fueron desarrollados pero posteriormente desactivados, posiblemente por razones de configuracion, costos o estabilidad. El sistema actualmente opera con algoritmos basados en reglas y texto predefinido para simular funcionalidades de IA.",
    body_style
))

# Summary table
story.append(Spacer(1, 12))
summary_data = [
    [Paragraph('<b>Categoria</b>', table_header_style), 
     Paragraph('<b>Cantidad</b>', table_header_style), 
     Paragraph('<b>Estado</b>', table_header_style)],
    [Paragraph('Funciones IA configuradas pero deshabilitadas', table_cell_style), 
     Paragraph('2', table_cell_center), 
     Paragraph('Archivos .bak pendientes de reactivacion', table_cell_style)],
    [Paragraph('Funciones que simulan IA con algoritmos', table_cell_style), 
     Paragraph('15+', table_cell_center), 
     Paragraph('Operativas con logica basada en reglas', table_cell_style)],
    [Paragraph('Funciones proyectadas para IA', table_cell_style), 
     Paragraph('8', table_cell_center), 
     Paragraph('Requieren desarrollo e integracion', table_cell_style)],
    [Paragraph('APIs de IA disponibles', table_cell_style), 
     Paragraph('1', table_cell_center), 
     Paragraph('z-ai-web-dev-sdk instalado, no utilizado', table_cell_style)],
]
summary_table = Table(summary_data, colWidths=[2.5*inch, 1*inch, 2.5*inch])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(summary_table)
story.append(Paragraph("Tabla 1. Resumen del estado de funciones de IA en PIGEC-130", caption_style))

# ============================================
# SECTION 2: FUNCIONES IA CONFIGURADAS
# ============================================
story.append(Paragraph("<b>2. FUNCIONES DE IA CONFIGURADAS (DESHABILITADAS)</b>", h1_style))

story.append(Paragraph("<b>2.1 Infraestructura de IA: Genkit con Google AI</b>", h2_style))
story.append(Paragraph(
    "El sistema PIGEC-130 cuenta con una infraestructura de inteligencia artificial basada en Genkit, un framework de Google para el desarrollo de aplicaciones con IA generativa. Esta infraestructura utiliza el modelo Gemini 1.5 Flash de Google AI para la generacion de contenido. Los archivos de configuracion se encuentran en el directorio src/ai/ del proyecto, pero estan renombrados con extension .bak, lo que indica que fueron deshabilitados intencionalmente.",
    body_style
))

story.append(Paragraph(
    "El archivo genkit.ts.bak configura la instancia de Genkit con el plugin de Google AI, requiriendo la variable de entorno GEMINI_API_KEY para su funcionamiento. El codigo incluye una advertencia que se muestra cuando esta variable no esta configurada, indicando que la IA no funcionara correctamente. Esta arquitectura permite la definicion de flujos (flows) que procesan entradas estructuradas y generan salidas tambien estructuradas mediante prompts especializados.",
    body_style
))

story.append(Paragraph("<b>2.2 Flujo de Generacion de Informes WISC-V/WAIS-IV</b>", h2_style))
story.append(Paragraph(
    "El archivo wisc-report-flow.ts.bak define un flujo completo para la generacion automatica de informes narrativos de evaluaciones psicometricas WISC-V y WAIS-IV. Este flujo utiliza un prompt especializado que instruye al modelo de IA para actuar como un experto en Psicometria y Evaluacion Clinica Neuropsicologica especializado en escalas Wechsler.",
    body_style
))

# Table: WISC Flow Details
story.append(Spacer(1, 10))
wisc_data = [
    [Paragraph('<b>Aspecto</b>', table_header_style), 
     Paragraph('<b>Detalle</b>', table_header_style)],
    [Paragraph('Nombre del flujo', table_cell_style), 
     Paragraph('wiscReportFlow', table_cell_style)],
    [Paragraph('Modelo utilizado', table_cell_style), 
     Paragraph('googleai/gemini-1.5-flash', table_cell_style)],
    [Paragraph('Temperatura', table_cell_style), 
     Paragraph('0.7 (balance entre creatividad y precision)', table_cell_style)],
    [Paragraph('Entrada (Input)', table_cell_style), 
     Paragraph('studentName, studentAge, compositeScores[], strengths[], weaknesses[]', table_cell_style)],
    [Paragraph('Salida (Output)', table_cell_style), 
     Paragraph('narrativeReport (informe narrativo completo), diagnosticSynthesis (sintesis diagnostica)', table_cell_style)],
    [Paragraph('Estado', table_cell_style), 
     Paragraph('DESHABILITADO (archivo .bak)', table_cell_style)],
]
wisc_table = Table(wisc_data, colWidths=[1.8*inch, 4.2*inch])
wisc_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#FFF3CD')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(wisc_table)
story.append(Paragraph("Tabla 2. Especificaciones del flujo de generacion de informes WISC-V/WAIS-IV", caption_style))

story.append(Paragraph("<b>2.3 Capacidades del Prompt de IA</b>", h2_style))
story.append(Paragraph(
    "El prompt disenado para la generacion de informes WISC-V/WAIS-IV demuestra un alto nivel de especializacion clinica. Las instrucciones de redaccion incluyen cuatro componentes principales que guian la salida del modelo de IA de manera estructurada:",
    body_style
))

story.append(Paragraph(
    "<b>Introduccion:</b> El modelo genera una descripcion de la capacidad intelectual general basada en el C.I. Total (CIT), proporcionando una vision general del rendimiento cognitivo del evaluado en terminos comparativos con la poblacion normativa.",
    bullet_style
))

story.append(Paragraph(
    "<b>Analisis por Dominios:</b> Se generan parrafos descriptivos para cada indice compuesto incluyendo Comprension Verbal, Visoespacial, Razonamiento Fluido, Memoria de Trabajo y Velocidad de Procesamiento. El estilo sigue las convenciones del manual tecnico de las escalas Wechsler.",
    bullet_style
))

story.append(Paragraph(
    "<b>Sintesis Diagnostica:</b> El modelo produce una conclusion clinica que integra los antecedentes del estudiante con los resultados numericos para ofrecer una vision integral. Se incluyen indicaciones sobre si el rendimiento es acorde a la edad o si sugiere algun deficit intelectual.",
    bullet_style
))

story.append(Paragraph(
    "<b>Formato de Salida:</b> El resultado se estructura como un objeto JSON con dos claves principales, facilitando la integracion con el sistema y permitiendo la separacion entre el informe narrativo extenso y la sintesis diagnostica concisa.",
    bullet_style
))

story.append(Paragraph("<b>2.4 Estado Actual de la Infraestructura</b>", h2_style))
story.append(Paragraph(
    "La infraestructura de IA se encuentra completamente desarrollada pero deshabilitada. Los archivos de configuracion y flujos existen en el repositorio pero con extension .bak, lo que impide su ejecucion. En el componente WISC-VScoringConsole.tsx, el codigo intenta invocar generateWiscReport() pero captura el error y utiliza una sintesis local como fallback. Esto indica que la funcionalidad fue probada en desarrollo pero desactivada para produccion, posiblemente por consideraciones de costos, configuracion de API keys, o estabilidad del servicio.",
    body_style
))

# ============================================
# SECTION 3: FUNCIONES QUE SIMULAN IA
# ============================================
story.append(Paragraph("<b>3. FUNCIONES QUE SIMULAN IA CON ALGORITMOS</b>", h1_style))

story.append(Paragraph(
    "El sistema PIGEC-130 incluye multiples componentes que presentan interfaces con etiquetas de 'IA' o 'Generador', pero que en realidad funcionan mediante algoritmos deterministas basados en reglas o texto predefinido. Estas implementaciones proporcionan funcionalidad util pero carecen de las capacidades adaptativas y generativas de la inteligencia artificial verdadera.",
    body_style
))

story.append(Paragraph("<b>3.1 Generador de Plan de Tratamiento</b>", h2_style))
story.append(Paragraph(
    "El componente TreatmentPlanGenerator presenta un boton etiquetado 'Generar Plan de Tratamiento (IA)' con un icono de robot (Bot). Sin embargo, al analizar el codigo fuente, se observa que la funcion handleGeneratePlan() utiliza un setTimeout para simular latencia y retorna un texto completamente predefinido con marcadores de posicion. El plan generado es identico en cada ejecucion, con la unica variable siendo el nombre del estudiante.",
    body_style
))

# Table: Treatment Plan Simulation
story.append(Spacer(1, 10))
treat_data = [
    [Paragraph('<b>Caracteristica</b>', table_header_style), 
     Paragraph('<b>Implementacion Actual</b>', table_header_style)],
    [Paragraph('Simulacion de latencia', table_cell_style), 
     Paragraph('setTimeout(resolve, 1500) - espera 1.5 segundos', table_cell_style)],
    [Paragraph('Contenido generado', table_cell_style), 
     Paragraph('Template string hardcodeado con interpolacion de nombre', table_cell_style)],
    [Paragraph('Variabilidad', table_cell_style), 
     Paragraph('Ninguna - el plan es identico cada vez', table_cell_style)],
    [Paragraph('Contexto clinico', table_cell_style), 
     Paragraph('No considera datos del estudiante mas alla del nombre', table_cell_style)],
    [Paragraph('Etiquetas en UI', table_cell_style), 
     Paragraph('Muestra "IA" en el boton aunque no usa IA', table_cell_style)],
]
treat_table = Table(treat_data, colWidths=[1.8*inch, 4.2*inch])
treat_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(treat_table)
story.append(Paragraph("Tabla 3. Analisis del Generador de Plan de Tratamiento", caption_style))

story.append(Paragraph("<b>3.2 Generador de PIEI (Plan de Intervencion Educativa)</b>", h2_style))
story.append(Paragraph(
    "El componente PIEIGenerator implementa un 'Algoritmo de Traduccion Clinica' que mapea hallazgos clinicos a instrucciones pedagogicas. Aunque esta disenado con una logica sofisticada, utiliza un sistema de reglas condicionales predefinidas (translationMap) en lugar de inteligencia artificial. El algoritmo evalua condiciones especificas como puntajes de memoria de trabajo menores a 85 o puntajes BDI-II mayores a 20 para generar sugerencias de intervencion.",
    body_style
))

story.append(Paragraph(
    "Este enfoque basado en reglas tiene ventajas en terminos de transparencia y previsibilidad, ya que cada sugerencia puede trazarse a una condicion especifica. Sin embargo, carece de la capacidad de adaptacion contextual que proporcionaria un modelo de IA, y no puede generar sugerencias novedosas para casos que no esten contemplados en el mapa de traduccion predefinido.",
    body_style
))

story.append(Paragraph("<b>3.3 Interpretaciones de Pruebas Psicometricas</b>", h2_style))
story.append(Paragraph(
    "Los formularios de evaluacion psicometrica (BAI, BDI-II, GAD-7, PHQ-9, SSI, ASSIST, etc.) implementan funciones de interpretacion que utilizan algoritmos de rangos predefinidos. Estas funciones, como interpretBAI() en BaiForm.tsx, calculan la interpretacion basandose en tablas de conversion que mapean puntajes brutos a niveles de severidad.",
    body_style
))

# Table: Interpretation Functions
story.append(Spacer(1, 10))
interp_data = [
    [Paragraph('<b>Componente</b>', table_header_style), 
     Paragraph('<b>Funcion</b>', table_header_style), 
     Paragraph('<b>Tipo</b>', table_header_style)],
    [Paragraph('BaiForm.tsx', table_cell_style), 
     Paragraph('interpretBAI()', table_cell_style), 
     Paragraph('Algoritmo de rangos', table_cell_style)],
    [Paragraph('BdiForm.tsx', table_cell_style), 
     Paragraph('interpretBDI()', table_cell_style), 
     Paragraph('Algoritmo de rangos', table_cell_style)],
    [Paragraph('Gad7Form.tsx', table_cell_style), 
     Paragraph('interpretGAD7()', table_cell_style), 
     Paragraph('Algoritmo de rangos', table_cell_style)],
    [Paragraph('Phq9Form.tsx', table_cell_style), 
     Paragraph('interpretPHQ9()', table_cell_style), 
     Paragraph('Algoritmo de rangos', table_cell_style)],
    [Paragraph('SsiForm.tsx', table_cell_style), 
     Paragraph('interpretSSI()', table_cell_style), 
     Paragraph('Algoritmo de rangos', table_cell_style)],
    [Paragraph('risk-analysis.ts', table_cell_style), 
     Paragraph('calculateRisk()', table_cell_style), 
     Paragraph('Regresion logistica', table_cell_style)],
]
interp_table = Table(interp_data, colWidths=[1.6*inch, 1.8*inch, 1.6*inch])
interp_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(interp_table)
story.append(Paragraph("Tabla 4. Funciones de interpretacion basadas en algoritmos", caption_style))

story.append(Paragraph("<b>3.4 ReportGenerator y Generacion de Documentos</b>", h2_style))
story.append(Paragraph(
    "El componente ReportGenerator simula la generacion de informes integrales mediante la construccion de un objeto de datos con estructura predefinida. El reportStructure incluye campos como motivoConsulta, pruebasAplicadas, analisisResultados y recomendaciones, todos ellos generados mediante templates condicionales simples. Por ejemplo, el motivo de consulta se determina evaluando si el GPA es menor a 7, pero no hay procesamiento de lenguaje natural ni generacion de contenido adaptativo.",
    body_style
))

# ============================================
# SECTION 4: FUNCIONES PROYECTADAS
# ============================================
story.append(Paragraph("<b>4. FUNCIONES PROYECTADAS PARA IMPLEMENTACION CON IA</b>", h1_style))

story.append(Paragraph(
    "Ademas de las funciones existentes, el sistema PIGEC-130 presenta multiples oportunidades para implementar funcionalidades de inteligencia artificial que mejorarian significativamente la eficiencia y calidad del trabajo clinico. A continuacion se describen las principales funciones proyectadas:",
    body_style
))

story.append(Paragraph("<b>4.1 Generacion de Impresion Diagnostica Automatica</b>", h2_style))
story.append(Paragraph(
    "El modulo de Evaluacion Clinica incluye un campo de texto libre para la Impresion Diagnostica Provisional. Actualmente, el clinico debe redactar manualmente este campo integrando los resultados de todas las pruebas aplicadas. Una funcion de IA podria analizar automaticamente los puntajes de BDI-II, BAI, Escala de Ideacion Suicida, indices neuropsicologicos y resultados ASSIST para generar una propuesta de impresion diagnostica que el clinico podria editar o aprobar.",
    body_style
))

story.append(Paragraph(
    "Esta funcionalidad tendria un impacto significativo en la eficiencia del flujo de trabajo, reduciendo el tiempo de documentacion y asegurando que todas las variables relevantes sean consideradas en la formulacion clinica. El modelo de IA podria identificar patrones y relaciones entre los diferentes puntajes que podrian pasar desapercibidos en una revision manual rapida.",
    body_style
))

story.append(Paragraph("<b>4.2 Analisis Funcional Asistido por IA</b>", h2_style))
story.append(Paragraph(
    "El formulario de Analisis Funcional requiere que el clinico identifique manualmente los antecedentes, conductas problema, funciones de mantenimiento y esquemas cognitivos. Una funcion de IA podria analizar la narrativa del paciente (si estuviera disponible en formato digital) o los patrones de respuesta en las pruebas para sugerir hipotesis funcionales, identificar posibles esquemas cognitivos basandose en las respuestas a escalas como el IPA, y generar recomendaciones de intervencion alineadas con la funcion identificada.",
    body_style
))

story.append(Paragraph("<b>4.3 Generacion de Notas SOAP</b>", h2_style))
story.append(Paragraph(
    "El componente SOAPNotesForm permite el registro de notas de evolucion clinica. Una funcion de IA podria transcribir automaticamente sesiones grabadas a formato SOAP, generar borradores de notas basandose en datos de sesiones previas, y sugerir objetivos y planes de tratamiento actualizados basandose en el progreso del paciente.",
    body_style
))

story.append(Paragraph("<b>4.4 Sistema de Alertas Inteligentes</b>", h2_style))
story.append(Paragraph(
    "Actualmente, las alertas de riesgo se basan en umbrales fijos. Un sistema de IA podria implementar alertas contextuales que consideren patrones temporales de cambio en los puntajes, factores de riesgo acumulativos no evidentes en evaluaciones individuales, y tendencias de deterioro o mejoria en el tiempo.",
    body_style
))

# Table: Projected Functions
story.append(Spacer(1, 10))
proj_data = [
    [Paragraph('<b>Funcion Proyectada</b>', table_header_style), 
     Paragraph('<b>Descripcion</b>', table_header_style), 
     Paragraph('<b>Complejidad</b>', table_header_style)],
    [Paragraph('Impresion Diagnostica Automatica', table_cell_style), 
     Paragraph('Integracion de multiples puntajes para generar propuesta diagnostica', table_cell_style), 
     Paragraph('Media', table_cell_center)],
    [Paragraph('Analisis Funcional Asistido', table_cell_style), 
     Paragraph('Sugerencia de hipotesis funcionales y esquemas cognitivos', table_cell_style), 
     Paragraph('Alta', table_cell_center)],
    [Paragraph('Notas SOAP Automaticas', table_cell_style), 
     Paragraph('Generacion de notas clinicas a partir de sesiones o datos previos', table_cell_style), 
     Paragraph('Media', table_cell_center)],
    [Paragraph('Alertas Inteligentes', table_cell_style), 
     Paragraph('Deteccion de patrones de riesgo contextuales y temporales', table_cell_style), 
     Paragraph('Alta', table_cell_center)],
    [Paragraph('Traduccion Clinico-Pedagogica', table_cell_style), 
     Paragraph('Generacion adaptativa de adaptaciones educativas', table_cell_style), 
     Paragraph('Media', table_cell_center)],
    [Paragraph('Reportes Personalizados', table_cell_style), 
     Paragraph('Generacion de informes adaptados al destinatario', table_cell_style), 
     Paragraph('Media', table_cell_center)],
    [Paragraph('Recomendaciones de Tratamiento', table_cell_style), 
     Paragraph('Sugerencias basadas en evidencia y perfil del paciente', table_cell_style), 
     Paragraph('Alta', table_cell_center)],
    [Paragraph('Chatbot de Apoyo Clinico', table_cell_style), 
     Paragraph('Asistente virtual para consultas de protocolos', table_cell_style), 
     Paragraph('Alta', table_cell_center)],
]
proj_table = Table(proj_data, colWidths=[1.8*inch, 3*inch, 1*inch])
proj_table.setStyle(TableStyle([
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
story.append(proj_table)
story.append(Paragraph("Tabla 5. Funciones proyectadas para implementacion con IA", caption_style))

# ============================================
# SECTION 5: INFRAESTRUCTURA DISPONIBLE
# ============================================
story.append(Paragraph("<b>5. INFRAESTRUCTURA DISPONIBLE PARA IA</b>", h1_style))

story.append(Paragraph("<b>5.1 SDK z-ai-web-dev-sdk</b>", h2_style))
story.append(Paragraph(
    "El proyecto cuenta con el paquete z-ai-web-dev-sdk instalado, que proporciona acceso a capacidades de IA incluyendo chat completions, generacion de imagenes, comprension de imagenes (VLM), texto a voz (TTS) y voz a texto (ASR). Este SDK podria utilizarse para implementar las funciones de IA proyectadas sin necesidad de configurar infraestructura adicional.",
    body_style
))

# Table: SDK Capabilities
story.append(Spacer(1, 10))
sdk_data = [
    [Paragraph('<b>Capacidad</b>', table_header_style), 
     Paragraph('<b>Funcion</b>', table_header_style), 
     Paragraph('<b>Aplicacion en PIGEC</b>', table_header_style)],
    [Paragraph('Chat Completions', table_cell_style), 
     Paragraph('zai.chat.completions.create()', table_cell_style), 
     Paragraph('Generacion de texto, impresiones diagnosticas, planes', table_cell_style)],
    [Paragraph('Vision (VLM)', table_cell_style), 
     Paragraph('zai.chat.completions.createVision()', table_cell_style), 
     Paragraph('Analisis de graficos proyectivos, interpretacion visual', table_cell_style)],
    [Paragraph('Texto a Voz (TTS)', table_cell_style), 
     Paragraph('zai.tts.synthesize()', table_cell_style), 
     Paragraph('Accesibilidad, lectura de instrucciones de tests', table_cell_style)],
    [Paragraph('Voz a Texto (ASR)', table_cell_style), 
     Paragraph('zai.asr.transcribe()', table_cell_style), 
     Paragraph('Dictado de notas clinicas, transcripcion de sesiones', table_cell_style)],
    [Paragraph('Generacion de Imagenes', table_cell_style), 
     Paragraph('zai.images.generations.create()', table_cell_style), 
     Paragraph('Material estimulo para tests proyectivos', table_cell_style)],
]
sdk_table = Table(sdk_data, colWidths=[1.5*inch, 2*inch, 2.5*inch])
sdk_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(sdk_table)
story.append(Paragraph("Tabla 6. Capacidades del SDK z-ai-web-dev-sdk disponibles", caption_style))

story.append(Paragraph("<b>5.2 Consideraciones para Reactivacion de Genkit</b>", h2_style))
story.append(Paragraph(
    "Para reactivar la infraestructura de Genkit existente, seria necesario configurar la variable de entorno GEMINI_API_KEY con una clave API valida de Google AI. Los archivos de configuracion tendrian que ser renombrados eliminando la extension .bak, y el codigo que invoca generateWiscReport() tendria que actualizarse para manejar correctamente las respuestas del modelo.",
    body_style
))

story.append(Paragraph(
    "Alternativamente, podria migrarse la implementacion al SDK z-ai-web-dev-sdk ya instalado, lo que eliminaria la dependencia de Genkit y Google AI, simplificando la arquitectura del sistema. Esta migracion permitiria aprovechar las capacidades multimodales del SDK para futuras expansiones como el analisis de imagenes o procesamiento de voz.",
    body_style
))

# ============================================
# SECTION 6: RECOMENDACIONES
# ============================================
story.append(Paragraph("<b>6. RECOMENDACIONES</b>", h1_style))

story.append(Paragraph("<b>6.1 Prioridad Inmediata: Reactivacion de WISC Report Flow</b>", h2_style))
story.append(Paragraph(
    "Se recomienda como prioridad inmediata la reactivacion del flujo de generacion de informes WISC-V/WAIS-IV. Esta funcionalidad ya esta completamente desarrollada y probada, y su reactivacion proporcionaria un beneficio tangible inmediato. Los pasos requeridos incluyen configurar la variable GEMINI_API_KEY, renombrar los archivos .bak a sus nombres originales, y realizar pruebas de integracion.",
    body_style
))

story.append(Paragraph("<b>6.2 Prioridad Alta: Migracion a z-ai-web-dev-sdk</b>", h2_style))
story.append(Paragraph(
    "Se recomienda evaluar la migracion de la infraestructura de IA de Genkit al SDK z-ai-web-dev-sdk ya instalado. Esta migracion simplificaria la arquitectura al eliminar una dependencia adicional, consolidaria todas las capacidades de IA en un unico SDK, y habilitaria funcionalidades multimodales futuras como procesamiento de voz y vision artificial.",
    body_style
))

story.append(Paragraph("<b>6.3 Prioridad Media: Generacion de Impresion Diagnostica</b>", h2_style))
story.append(Paragraph(
    "Se recomienda implementar la generacion automatica de impresion diagnostica como siguiente funcionalidad de IA. Esta implementacion tendria alto impacto en la eficiencia del flujo de trabajo clinico y aprovecharia la infraestructura de IA ya establecida. El prompt podria disenarse para integrar multiples fuentes de datos: puntajes de screening emocional, indices neuropsicologicos, resultados de conductas de riesgo, y antecedentes relevantes del estudiante.",
    body_style
))

story.append(Paragraph("<b>6.4 Consideraciones Eticas</b>", h2_style))
story.append(Paragraph(
    "Es fundamental mantener el disclaimer deontologico existente que aclara que los resultados constituyen una impresion diagnostica provisional, no un diagnostico definitivo. Las sugerencias generadas por IA deben presentarse siempre como herramientas de apoyo para el clinico, nunca como sustitutos del juicio profesional. Se recomienda implementar un flujo de revision donde el clinico deba aprobar explicitamente cualquier contenido generado por IA antes de que se incorpore al expediente.",
    body_style
))

# ============================================
# SECTION 7: CONCLUSION
# ============================================
story.append(Paragraph("<b>7. CONCLUSION</b>", h1_style))

story.append(Paragraph(
    "El sistema PIGEC-130 cuenta con una arquitectura de inteligencia artificial completamente desarrollada pero actualmente deshabilitada. Los archivos de configuracion y flujos de IA existen en el repositorio, lo que representa una oportunidad significativa para reactivar funcionalidades de alto valor con minima inversion adicional. La infraestructura basada en Genkit y Google AI (Gemini) esta lista para su uso, requiriendo unicamente la configuracion de credenciales API.",
    body_style
))

story.append(Paragraph(
    "El analisis ha identificado multiples funciones que actualmente simulan capacidades de IA mediante algoritmos basados en reglas. Aunque estas implementaciones son funcionales y transparentes, carecen de la adaptabilidad y capacidad generativa que proporcionaria la inteligencia artificial verdadera. La migracion al SDK z-ai-web-dev-sdk podria simplificar la arquitectura y habilitar capacidades multimodales futuras.",
    body_style
))

story.append(Paragraph(
    "Las funciones proyectadas para implementacion con IA tienen el potencial de mejorar significativamente la eficiencia del flujo de trabajo clinico, la calidad de la documentacion, y la deteccion temprana de factores de riesgo. Se recomienda priorizar la reactivacion del flujo WISC-V/WAIS-IV como accion inmediata, seguida de la implementacion de generacion automatica de impresion diagnostica como siguiente funcionalidad de alto impacto.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF generado exitosamente")
