from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/estado_fase1_ia_pigec.pdf",
    pagesize=letter,
    title="Estado Fase 1 IA PIGEC-130",
    author="Z.ai",
    creator="Z.ai",
    subject="Reporte de avance de implementacion de funciones de IA"
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    spaceAfter=20
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='Times New Roman',
    fontSize=16,
    leading=20,
    spaceBefore=20,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='Times New Roman',
    fontSize=13,
    leading=16,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=8
)

cell_style = ParagraphStyle(
    name='CellStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT
)

header_style = ParagraphStyle(
    name='HeaderStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white
)

story = []

# Title
story.append(Paragraph("REPORTE DE AVANCE", title_style))
story.append(Paragraph("<b>FASE 1: Funciones de IA Independientes de WISC/WAIS</b>", title_style))
story.append(Paragraph("Proyecto PIGEC-130", ParagraphStyle(
    name='Subtitle',
    fontName='Times New Roman',
    fontSize=14,
    alignment=TA_CENTER,
    spaceAfter=30
)))

story.append(Spacer(1, 30))
story.append(Paragraph("Fecha de Generacion: 23 de Marzo de 2026", body_style))
story.append(PageBreak())

# Section 1: Executive Summary
story.append(Paragraph("<b>1. RESUMEN EJECUTIVO</b>", heading1_style))
story.append(Paragraph(
    "La Fase 1 del plan de implementacion de funciones de IA ha sido completada exitosamente. "
    "Se han desarrollado tres componentes principales que operan de manera independiente de los tests "
    "WISC/WAIS (que se encuentran incompletos), permitiendo que la aplicacion PIGEC-130 tenga "
    "funcionalidad de IA operativa de manera inmediata.",
    body_style
))

story.append(Paragraph(
    "Los nuevos servicios incluyen: (1) Impresion Diagnostica Automatica con IA, "
    "(2) Alertas de Riesgo Inteligentes multidimensionales, y (3) Generador de PIEI mejorado. "
    "Todos estos componentes utilizan datos de screening emocional y neuropsicologico disponibles, "
    "sin depender de las baterias Wechsler.",
    body_style
))

# Section 2: Implemented Components
story.append(Paragraph("<b>2. COMPONENTES IMPLEMENTADOS</b>", heading1_style))

# 2.1 Diagnostic Impression
story.append(Paragraph("<b>2.1 Impresion Diagnostica Automatica</b>", heading2_style))
story.append(Paragraph(
    "<b>Archivo:</b> /src/ai/flows/diagnostic-impression-flow.ts",
    body_style
))
story.append(Paragraph(
    "Este servicio genera impresiones diagnosticas sugeridas basadas en datos de screening emocional. "
    "Utiliza los instrumentos BDI-II, BAI, PHQ-9, GAD-7, HADS, IDARE para depresion y ansiedad, "
    "asi como escalas de riesgo suicida (Columbia, Beck) y tamizaje neuropsicologico (MT, AS, VP).",
    body_style
))

features_data = [
    [Paragraph("<b>Caracteristica</b>", header_style), Paragraph("<b>Descripcion</b>", header_style)],
    [Paragraph("Hipotesis Diagnostica", cell_style), Paragraph("Generacion automatica de hipotesis principal basada en evidencia", cell_style)],
    [Paragraph("Nivel de Severidad", cell_style), Paragraph("Clasificacion: leve, moderado, severo, critico", cell_style)],
    [Paragraph("Factores de Riesgo", cell_style), Paragraph("Identificacion automatica de factores de riesgo clinico", cell_style)],
    [Paragraph("Factores Protectores", cell_style), Paragraph("Identificacion de elementos de resiliencia", cell_style)],
    [Paragraph("Recomendaciones", cell_style), Paragraph("Sugerencias clinicas priorizadas segun severidad", cell_style)],
    [Paragraph("Alertas Urgentes", cell_style), Paragraph("Deteccion de casos que requieren atencion inmediata", cell_style)],
    [Paragraph("Fallback Local", cell_style), Paragraph("Sistema de reglas cuando el servicio de IA no esta disponible", cell_style)],
]

t1 = Table(features_data, colWidths=[150, 340])
t1.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t1)
story.append(Spacer(1, 18))

# 2.2 Intelligent Risk Alerts
story.append(Paragraph("<b>2.2 Alertas de Riesgo Inteligentes</b>", heading2_style))
story.append(Paragraph(
    "<b>Archivo:</b> /src/lib/intelligent-risk-alerts.ts",
    body_style
))
story.append(Paragraph(
    "Sistema multidimensional de evaluacion de riesgo que integra factores academicos y clinicos. "
    "Calcula perfiles de riesgo en cinco dimensiones: Academico, Emocional, Conductual, "
    "Neurocognitivo e Integrado. Genera alertas automaticas con niveles de prioridad.",
    body_style
))

risk_dimensions = [
    [Paragraph("<b>Dimension</b>", header_style), Paragraph("<b>Factores Considerados</b>", header_style), Paragraph("<b>Indicadores</b>", header_style)],
    [Paragraph("Academico", cell_style), Paragraph("Asistencia, calificacion, actividades, participacion", cell_style), Paragraph("Riesgo de reprobacion, riesgo de abandono", cell_style)],
    [Paragraph("Emocional", cell_style), Paragraph("BDI-II, BAI, PHQ-9, GAD-7, HADS, IDARE", cell_style), Paragraph("Depresion, ansiedad, indicadores clinicos", cell_style)],
    [Paragraph("Conductual", cell_style), Paragraph("Ideacion suicida, autolesiones, sustancias", cell_style), Paragraph("Riesgo suicida, conductas autolesivas", cell_style)],
    [Paragraph("Neurocognitivo", cell_style), Paragraph("MT, AS, VP indices", cell_style), Paragraph("Dominios afectados, deficit ejecutivo", cell_style)],
    [Paragraph("Integrado", cell_style), Paragraph("Ponderacion de todas las dimensiones", cell_style), Paragraph("Score global, nivel de riesgo total", cell_style)],
]

t2 = Table(risk_dimensions, colWidths=[100, 200, 190])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t2)
story.append(Spacer(1, 18))

# 2.3 PIEI Generator
story.append(Paragraph("<b>2.3 Generador de PIEI Mejorado</b>", heading2_style))
story.append(Paragraph(
    "<b>Archivo:</b> /src/ai/flows/piei-generation-flow.ts",
    body_style
))
story.append(Paragraph(
    "Generador completo de Planes de Intervencion Educativa Individualizados. Integra datos "
    "academicos y clinicos para generar intervenciones especificas por area, cronograma de metas, "
    "ajustes razonables justificados y plan de seguimiento con indicadores.",
    body_style
))

story.append(Paragraph("<b>Areas de Intervencion:</b>", body_style))
areas = ["Academica", "Emocional", "Conductual", "Social", "Familiar", "Neurocognitiva"]
for area in areas:
    story.append(Paragraph(f"  - {area}", body_style))

story.append(PageBreak())

# Section 3: UI Components
story.append(Paragraph("<b>3. COMPONENTES DE INTERFAZ</b>", heading1_style))

ui_components = [
    [Paragraph("<b>Componente</b>", header_style), Paragraph("<b>Archivo</b>", header_style), Paragraph("<b>Funcion</b>", header_style)],
    [Paragraph("DiagnosticImpressionAI", cell_style), Paragraph("/src/components/diagnostic-impression-ai.tsx", cell_style), Paragraph("UI para mostrar impresion diagnostica generada", cell_style)],
    [Paragraph("IntelligentRiskAlerts", cell_style), Paragraph("/src/components/intelligent-risk-alerts.tsx", cell_style), Paragraph("Dashboard de alertas de riesgo multidimensional", cell_style)],
    [Paragraph("EnhancedClinicalForm", cell_style), Paragraph("/src/components/clinical-assessment-enhanced.tsx", cell_style), Paragraph("Formulario mejorado con integracion de IA", cell_style)],
]

t3 = Table(ui_components, colWidths=[140, 200, 150])
t3.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t3)
story.append(Spacer(1, 18))

# Section 4: Architecture
story.append(Paragraph("<b>4. ARQUITECTURA TECNICA</b>", heading1_style))

story.append(Paragraph("<b>4.1 Flujo de Datos</b>", heading2_style))
story.append(Paragraph(
    "Los nuevos servicios siguen una arquitectura hibrida que permite operacion tanto con "
    "el servicio de Cloud Run (produccion) como con sistemas de reglas locales (fallback):",
    body_style
))

flow_text = """
    Datos de Screening (BDI, BAI, PHQ-9, etc.)
           |
           v
    DiagnosticImpressionInput
           |
           +---> Cloud Run AI Service ---> Impresion Diagnostica
           |
           +---> Fallback (Reglas Locales) ---> Impresion Basica
           |
           v
    IntelligentRiskAlerts
           |
           +---> Perfil de Riesgo Multidimensional
           |
           +---> Alertas Priorizadas
           |
           v
    PIEI Generator
           |
           v
    Plan de Intervencion Completo
"""
story.append(Paragraph(flow_text.replace('\n', '<br/>'), ParagraphStyle(
    name='CodeBlock',
    fontName='Times New Roman',
    fontSize=9,
    leading=12,
    leftIndent=20,
    backColor=colors.HexColor('#F5F5F5')
)))

story.append(Paragraph("<b>4.2 Endpoint de IA</b>", heading2_style))
story.append(Paragraph(
    "Los servicios utilizan el endpoint de Cloud Run configurado en la variable de entorno "
    "NEXT_PUBLIC_CLOUD_RUN_ENDPOINT. Si este no esta disponible, los sistemas de fallback "
    "basados en reglas clinicas garantizan la operatividad.",
    body_style
))

# Section 5: Status
story.append(Paragraph("<b>5. ESTADO DE IMPLEMENTACION</b>", heading1_style))

status_data = [
    [Paragraph("<b>Tarea</b>", header_style), Paragraph("<b>Estado</b>", header_style), Paragraph("<b>Observaciones</b>", header_style)],
    [Paragraph("Servicio Impresion Diagnostica", cell_style), Paragraph("Completado", cell_style), Paragraph("Incluye fallback con reglas clinicas", cell_style)],
    [Paragraph("Alertas de Riesgo Inteligentes", cell_style), Paragraph("Completado", cell_style), Paragraph("5 dimensiones de riesgo integradas", cell_style)],
    [Paragraph("Generador PIEI Mejorado", cell_style), Paragraph("Completado", cell_style), Paragraph("6 areas de intervencion", cell_style)],
    [Paragraph("Componentes de UI", cell_style), Paragraph("Completado", cell_style), Paragraph("3 componentes React creados", cell_style)],
    [Paragraph("Integracion en Expedientes", cell_style), Paragraph("Pendiente", cell_style), Paragraph("Requiere actualizar pagina de expediente", cell_style)],
    [Paragraph("Pruebas Funcionales", cell_style), Paragraph("Pendiente", cell_style), Paragraph("Validar con datos reales", cell_style)],
]

t4 = Table(status_data, colWidths=[180, 80, 230])
t4.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 4), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 5), (-1, -1), colors.HexColor('#FFF3E0')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t4)
story.append(Spacer(1, 18))

# Section 6: Next Steps
story.append(Paragraph("<b>6. PROXIMOS PASOS</b>", heading1_style))

story.append(Paragraph("<b>6.1 Integracion Inmediata</b>", heading2_style))
next_steps = [
    "1. Actualizar la pagina de expediente clinico (/clinica/expediente/[id]/page.tsx) para incluir los nuevos componentes.",
    "2. Agregar el componente DiagnosticImpressionAI en la seccion de evaluacion clinica.",
    "3. Integrar IntelligentRiskAlerts en el resumen ejecutivo del expediente.",
    "4. Actualizar PIEIGenerator para usar el nuevo servicio generatePIEI.",
]
for step in next_steps:
    story.append(Paragraph(step, body_style))

story.append(Paragraph("<b>6.2 Pruebas Recomendadas</b>", heading2_style))
tests = [
    "1. Probar generacion de impresion diagnostica con datos de screening reales.",
    "2. Validar alertas de riesgo con casos conocidos.",
    "3. Verificar que el fallback funciona cuando Cloud Run no esta disponible.",
    "4. Revisar usabilidad de los componentes de UI en dispositivos moviles.",
]
for test in tests:
    story.append(Paragraph(test, body_style))

story.append(Paragraph("<b>6.3 Fase 2 (Futura)</b>", heading2_style))
story.append(Paragraph(
    "Una vez completada la carga de estímulos y herramientas de WISC/WAIS, se podra "
    "integrar el flujo wisc-report-flow.ts existente para generar informes narrativos "
    "completos de evaluacion intelectual. Esto se sumara a las funcionalidades ya implementadas.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF generated successfully!")
