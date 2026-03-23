# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.units import cm

pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')

doc = SimpleDocTemplate(
    "/home/z/my-project/download/plan_accion_revisado_ia_pigec.pdf",
    pagesize=letter,
    title="Plan de Accion Revisado - IA en PIGEC-130",
    author="Z.ai",
    creator="Z.ai",
    subject="Plan de accion priorizando funcionalidad inmediata con tests operativos"
)

cover_title = ParagraphStyle('CoverTitle', fontName='Microsoft YaHei', fontSize=26, leading=36, alignment=TA_CENTER)
cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='SimHei', fontSize=14, leading=22, alignment=TA_CENTER, spaceAfter=30)
h1 = ParagraphStyle('H1', fontName='Microsoft YaHei', fontSize=14, leading=20, spaceBefore=16, spaceAfter=10, textColor=colors.HexColor('#1F4E79'))
h2 = ParagraphStyle('H2', fontName='Microsoft YaHei', fontSize=12, leading=18, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#2E75B6'))
h3 = ParagraphStyle('H3', fontName='SimHei', fontSize=11, leading=16, spaceBefore=8, spaceAfter=4)
body = ParagraphStyle('Body', fontName='SimHei', fontSize=10, leading=16, alignment=TA_JUSTIFY, spaceAfter=8, firstLineIndent=20, wordWrap='CJK')
body_ni = ParagraphStyle('BodyNI', fontName='SimHei', fontSize=10, leading=16, alignment=TA_JUSTIFY, spaceAfter=8, wordWrap='CJK')
bullet = ParagraphStyle('Bullet', fontName='SimHei', fontSize=10, leading=16, spaceAfter=4, leftIndent=20, bulletIndent=10, wordWrap='CJK')
th = ParagraphStyle('TH', fontName='SimHei', fontSize=9, textColor=colors.white, alignment=TA_CENTER)
tc = ParagraphStyle('TC', fontName='SimHei', fontSize=8.5, alignment=TA_LEFT, leading=13, wordWrap='CJK')
tc_c = ParagraphStyle('TCC', fontName='SimHei', fontSize=8.5, alignment=TA_CENTER, leading=13, wordWrap='CJK')
caption = ParagraphStyle('Caption', fontName='SimHei', fontSize=8.5, alignment=TA_CENTER, spaceBefore=4, spaceAfter=12)

story = []

# COVER
story.append(Spacer(1, 70))
story.append(Paragraph("PLAN DE ACCION REVISADO", cover_title))
story.append(Paragraph("Implementacion de IA Priorizando", cover_title))
story.append(Paragraph("Funcionalidad Inmediata", cover_title))
story.append(Spacer(1, 24))
story.append(Paragraph("Sistema PIGEC-130 - Enfoque Pragmatico", cover_subtitle))
story.append(Spacer(1, 40))
story.append(Paragraph("Aprovechando tests operativos para valor inmediato", ParagraphStyle('CD', fontName='SimHei', fontSize=11, alignment=TA_CENTER)))
story.append(Paragraph("Marzo 2026", ParagraphStyle('CD2', fontName='SimHei', fontSize=11, alignment=TA_CENTER)))
story.append(PageBreak())

# 1. JUSTIFICACION DEL CAMBIO
story.append(Paragraph("<b>1. JUSTIFICACION DEL CAMBIO DE ENFOQUE</b>", h1))
story.append(Paragraph(
    "Durante el analisis del sistema se identifico que la Consola de Aplicacion WISC-V/WAIS-IV no esta completa: faltan estimulos visuales, materiales de aplicacion y otras herramientas necesarias para su funcionamiento integral. Reactivar el flujo de IA para informes WISC no aportaria valor inmediato porque el test no es funcional.",
    body
))

story.append(Paragraph(
    "Sin embargo, el sistema cuenta con 19 formularios de pruebas psicometricas completamente operativos que pueden aprovecharse de inmediato para implementar funciones de IA de alto valor clinico. Este plan revisado prioriza estas funcionalidades para obtener una aplicacion funcional con inteligencia artificial en el menor tiempo posible.",
    body
))

# Tests disponibles
story.append(Paragraph("<b>1.1 Tests Disponibles y Funcionales</b>", h2))
tests = [
    [Paragraph('<b>Categoria</b>', th), Paragraph('<b>Tests Operativos</b>', th), Paragraph('<b>Variables para IA</b>', th)],
    [Paragraph('Screening Emocional', tc), Paragraph('GAD-7, PHQ-9, BDI-II, BAI, HADS, IDARE', tc), Paragraph('Puntajes de ansiedad, depresion, rasgo-estado', tc)],
    [Paragraph('Riesgo Suicida', tc), Paragraph('SSI, Columbia C-SSRS, Plutchik, BHS', tc), Paragraph('Ideacion, severidad, desesperanza', tc)],
    [Paragraph('Conductas Riesgo', tc), Paragraph('ASSIST, CDFR, LIRA', tc), Paragraph('Consumo sustancias, factores riesgo', tc)],
    [Paragraph('Academicos', tc), Paragraph('CHTE, GOCA, EBMA, IPA', tc), Paragraph('Habitos estudio, motivacion, pensamientos auto', tc)],
    [Paragraph('Identificacion', tc), Paragraph('Ficha de Identificacion', tc), Paragraph('Datos demograficos, contexto familiar', tc)],
]
tt = Table(tests, colWidths=[3.5*cm, 5.5*cm, 6*cm])
tt.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#D4EDDA')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 10))
story.append(tt)
story.append(Paragraph("Tabla 1. Tests psicometricos operativos disponibles para IA", caption))

# 2. PLAN REVISADO
story.append(Paragraph("<b>2. PLAN DE ACCION REVISADO (8 SEMANAS)</b>", h1))
story.append(Paragraph(
    "El plan se reduce a 8 semanas enfocadas en implementar funciones de IA que aporten valor inmediato utilizando las pruebas ya funcionales. Se pospone la integracion WISC/WAIS para una segunda fase cuando el test este completo.",
    body
))

# Timeline
timeline = [
    [Paragraph('<b>Fase</b>', th), Paragraph('<b>Nombre</b>', th), Paragraph('<b>Semanas</b>', th), Paragraph('<b>Entregable Principal</b>', th)],
    [Paragraph('1', tc_c), Paragraph('Infraestructura IA', tc), Paragraph('1-2', tc_c), Paragraph('Modulo ai-service operativo con z-ai-sdk', tc)],
    [Paragraph('2', tc_c), Paragraph('Impresion Diagnostica', tc), Paragraph('3-4', tc_c), Paragraph('Generacion automatica de impresiones', tc)],
    [Paragraph('3', tc_c), Paragraph('Alertas y Planes', tc), Paragraph('5-6', tc_c), Paragraph('Alertas inteligentes y planes personalizados', tc)],
    [Paragraph('4', tc_c), Paragraph('Integracion y Pruebas', tc), Paragraph('7-8', tc_c), Paragraph('Sistema IA completamente integrado', tc)],
]
t = Table(timeline, colWidths=[1.5*cm, 4*cm, 2.2*cm, 7.3*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#CCE5FF')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#D4EDDA')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FFF3CD')),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F8D7DA')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(Spacer(1, 10))
story.append(t)
story.append(Paragraph("Tabla 2. Fases del plan revisado", caption))

# 3. FASE 1
story.append(Paragraph("<b>3. FASE 1: INFRAESTRUCTURA IA (Semanas 1-2)</b>", h1))
story.append(Paragraph(
    "Se creara un modulo centralizado de IA utilizando el SDK z-ai-web-dev-sdk ya instalado en el proyecto. Este enfoque evita la dependencia de Genkit y aprovecha la infraestructura existente.",
    body
))

story.append(Paragraph("<b>3.1 Arquitectura Propuesta</b>", h2))
story.append(Paragraph(
    "Se creara el archivo src/lib/ai-service.ts que encapsulara todas las llamadas al SDK. Este modulo expondra funciones especificas del dominio clinico, abstrayendo los detalles tecnicos del resto de la aplicacion.",
    body
))

story.append(Paragraph("<b>3.2 Estructura del Modulo</b>", h2))
story.append(Paragraph("- initializeAI() - Configura la instancia del SDK", bullet))
story.append(Paragraph("- generateDiagnosticImpression(data) - Genera impresion diagnostica", bullet))
story.append(Paragraph("- generateTreatmentPlan(data) - Genera plan de tratamiento personalizado", bullet))
story.append(Paragraph("- generatePIEISuggestions(data) - Genera adaptaciones educativas", bullet))
story.append(Paragraph("- analyzeRiskPatterns(data) - Analiza patrones de riesgo", bullet))

story.append(Paragraph("<b>3.3 Acciones</b>", h2))
actions1 = [
    [Paragraph('<b>#</b>', th), Paragraph('<b>Accion</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('1.1', tc_c), Paragraph('Crear archivo src/lib/ai-service.ts con inicializacion del SDK', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('1.2', tc_c), Paragraph('Implementar funcion generateDiagnosticImpression()', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('1.3', tc_c), Paragraph('Disenar prompt especializado para impresiones clinicas', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('1.4', tc_c), Paragraph('Crear tests unitarios basicos', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('1.5', tc_c), Paragraph('Pruebas de integracion con datos de prueba', tc), Paragraph('0.5 dias', tc_c)],
]
ta1 = Table(actions1, colWidths=[1.2*cm, 11.3*cm, 2.5*cm])
ta1.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 8))
story.append(ta1)
story.append(Paragraph("Tabla 3. Acciones Fase 1", caption))

# 4. FASE 2
story.append(Paragraph("<b>4. FASE 2: GENERACION DE IMPRESION DIAGNOSTICA (Semanas 3-4)</b>", h1))
story.append(Paragraph(
    "Esta es la funcionalidad de mayor impacto inmediato. El clinico podra presionar un boton para que la IA analice todos los resultados de pruebas aplicadas y genere una propuesta de impresion diagnostica que podra editar y aprobar.",
    body
))

story.append(Paragraph("<b>4.1 Datos de Entrada</b>", h2))
story.append(Paragraph(
    "La funcion recibira todos los puntajes de las pruebas aplicadas al estudiante: BDI-II y PHQ-9 para depresion, BAI y GAD-7 para ansiedad, SSI/Columbia/Plutchik para riesgo suicida, ASSIST para consumo de sustancias, CHTE/LIRA para factores academicos, y datos de la ficha de identificacion para contexto.",
    body
))

story.append(Paragraph("<b>4.2 Integracion en UI</b>", h2))
story.append(Paragraph(
    "Se agregara un boton 'Generar Impresion Diagnostica (IA)' en el modulo de Evaluacion Clinica, especificamente en la seccion IV (Impresion Diagnostica). Al presionarlo, se mostrara un indicador de carga y el resultado aparecera en el textarea, donde el clinico podra editarlo antes de guardar.",
    body
))

story.append(Paragraph("<b>4.3 Acciones</b>", h2))
actions2 = [
    [Paragraph('<b>#</b>', th), Paragraph('<b>Accion</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('2.1', tc_c), Paragraph('Refinar prompt con clinico especialista', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('2.2', tc_c), Paragraph('Implementar llamada a IA desde ClinicalAssessmentForm', tc), Paragraph('1.5 dias', tc_c)],
    [Paragraph('2.3', tc_c), Paragraph('Agregar indicadores de carga y manejo de errores', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('2.4', tc_c), Paragraph('Implementar flujo de edicion/aprobacion', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('2.5', tc_c), Paragraph('Pruebas con casos reales y ajustes', tc), Paragraph('1 dia', tc_c)],
]
ta2 = Table(actions2, colWidths=[1.2*cm, 11.3*cm, 2.5*cm])
ta2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 8))
story.append(ta2)
story.append(Paragraph("Tabla 4. Acciones Fase 2", caption))

# 5. FASE 3
story.append(Paragraph("<b>5. FASE 3: ALERTAS INTELIGENTES Y PLANES (Semanas 5-6)</b>", h1))

story.append(Paragraph("<b>5.1 Sistema de Alertas Inteligentes</b>", h2))
story.append(Paragraph(
    "Se implementara un sistema que analice combinaciones de puntajes para detectar patrones de riesgo que podrian pasar desapercibidos en evaluaciones individuales. El sistema generara alertas contextuales que aparecen en el dashboard del expediente.",
    body
))

story.append(Paragraph("<b>Ejemplos de alertas:</b>", h3))
story.append(Paragraph("- 'Combinacion de alto riesgo: BDI-II severo + SSI elevado + desesperanza moderada'", bullet))
story.append(Paragraph("- 'Patron ansioso-depresivo con deterioro academico - requiere intervencion integrada'", bullet))
story.append(Paragraph("- 'Factores protectores bajos + multiples factores de riesgo - monitoreo cercano'", bullet))

story.append(Paragraph("<b>5.2 Generador de Planes de Tratamiento</b>", h2))
story.append(Paragraph(
    "Se reemplazara el template estatico actual por un sistema de IA que genere planes personalizados basados en: perfil clinico completo del estudiante, funcion de la conducta problema identificada, nivel de riesgo, recursos disponibles, y preferencias del estudiante si estan documentadas.",
    body
))

story.append(Paragraph("<b>5.3 Mejora del PIEI</b>", h2))
story.append(Paragraph(
    "El actual generador de PIEI utiliza reglas fijas. Se mejorara con IA para generar adaptaciones mas contextuales, considerando no solo los puntajes sino tambien las caracteristicas individuales del estudiante, el entorno educativo especifico, y los recursos disponibles en la institucion.",
    body
))

story.append(Paragraph("<b>5.4 Acciones</b>", h2))
actions3 = [
    [Paragraph('<b>#</b>', th), Paragraph('<b>Accion</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('3.1', tc_c), Paragraph('Implementar analyzeRiskPatterns() en ai-service', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('3.2', tc_c), Paragraph('Integrar alertas en dashboard de expedientes', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('3.3', tc_c), Paragraph('Implementar generateTreatmentPlan() personalizado', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('3.4', tc_c), Paragraph('Mejorar PIEIGenerator con IA', tc), Paragraph('1.5 dias', tc_c)],
    [Paragraph('3.5', tc_c), Paragraph('Pruebas de integracion', tc), Paragraph('1 dia', tc_c)],
]
ta3 = Table(actions3, colWidths=[1.2*cm, 11.3*cm, 2.5*cm])
ta3.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 8))
story.append(ta3)
story.append(Paragraph("Tabla 5. Acciones Fase 3", caption))

# 6. FASE 4
story.append(Paragraph("<b>6. FASE 4: INTEGRACION Y PRUEBAS (Semanas 7-8)</b>", h1))
story.append(Paragraph(
    "La fase final se enfoca en consolidar todas las implementaciones, realizar pruebas exhaustivas y preparar el sistema para produccion.",
    body
))

story.append(Paragraph("<b>6.1 Actividades</b>", h2))
story.append(Paragraph("- Pruebas de integracion end-to-end de todas las funciones de IA", bullet))
story.append(Paragraph("- Pruebas de usabilidad con usuarios clinicos reales", bullet))
story.append(Paragraph("- Optimizacion de prompts basada en feedback", bullet))
story.append(Paragraph("- Documentacion de usuario final", bullet))
story.append(Paragraph("- Capacitacion al equipo clinico", bullet))
story.append(Paragraph("- Monitoreo de costos y calidad de respuestas", bullet))

story.append(Paragraph("<b>6.2 Criterios de Aceptacion</b>", h2))
story.append(Paragraph("- Las impresiones diagnosticas son coherentes con los datos de entrada", bullet))
story.append(Paragraph("- Las alertas identifican correctamente patrones de riesgo", bullet))
story.append(Paragraph("- Los planes de tratamiento son relevantes y aplicables", bullet))
story.append(Paragraph("- El tiempo de respuesta es menor a 15 segundos", bullet))
story.append(Paragraph("- Los clinicos pueden editar/rechazar sugerencias sin friccion", bullet))

# 7. ROADMAP FUTURO
story.append(Paragraph("<b>7. ROADMAP POST-IMPLEMENTACION</b>", h1))
story.append(Paragraph(
    "Una vez completada la implementacion inicial, se pueden planificar las siguientes expansiones:",
    body
))

future = [
    [Paragraph('<b>Fase Futura</b>', th), Paragraph('<b>Funcionalidad</b>', th), Paragraph('<b>Precondicion</b>', th)],
    [Paragraph('Fase 5', tc_c), Paragraph('IA para informes WISC-V/WAIS-IV', tc), Paragraph('Consola de aplicacion completa', tc)],
    [Paragraph('Fase 6', tc_c), Paragraph('Transcripcion de sesiones (ASR)', tc), Paragraph('Fases 1-4 completadas', tc)],
    [Paragraph('Fase 7', tc_c), Paragraph('Analisis de tendencias temporales', tc), Paragraph('Datos historicos suficientes', tc)],
    [Paragraph('Fase 8', tc_c), Paragraph('Chatbot de apoyo clinico', tc), Paragraph('Fases 1-4 completadas', tc)],
]
tf = Table(future, colWidths=[2.5*cm, 6.5*cm, 6*cm])
tf.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6C757D')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8F9FA')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 10))
story.append(tf)
story.append(Paragraph("Tabla 6. Roadmap de expansiones futuras", caption))

# 8. CONCLUSION
story.append(Paragraph("<b>8. CONCLUSION</b>", h1))
story.append(Paragraph(
    "Este plan revisado prioriza la funcionalidad inmediata aprovechando las 19 pruebas psicometricas que ya estan operativas en el sistema. En 8 semanas se puede tener un sistema con capacidades de IA que aporten valor real al flujo de trabajo clinico.",
    body
))

story.append(Paragraph(
    "La generacion automatica de impresion diagnostica es la funcionalidad de mayor impacto porque integra todas las pruebas existentes y reduce significativamente el tiempo de documentacion. Las alertas inteligentes mejoraran la deteccion temprana de casos de alto riesgo. Los planes de tratamiento personalizados y el PIEI mejorado completaran el ecosistema de apoyo clinico.",
    body
))

story.append(Paragraph(
    "La integracion de IA para WISC-V/WAIS-IV se pospone para cuando la consola de aplicacion este completa, asegurando que cada funcionalidad de IA tenga un test funcional que la respalde.",
    body
))

doc.build(story)
print("PDF generado exitosamente")
