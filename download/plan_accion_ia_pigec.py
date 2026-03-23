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

registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

doc = SimpleDocTemplate(
    "/home/z/my-project/download/plan_accion_ia_pigec.pdf",
    pagesize=letter,
    title="Plan de Accion - Implementacion de IA en PIGEC-130",
    author="Z.ai",
    creator="Z.ai",
    subject="Plan de accion estrategico para implementar funciones de inteligencia artificial en el sistema PIGEC-130"
)

# Styles
cover_title = ParagraphStyle('CoverTitle', fontName='Microsoft YaHei', fontSize=26, leading=36, alignment=TA_CENTER, spaceAfter=16)
cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='SimHei', fontSize=14, leading=22, alignment=TA_CENTER, spaceAfter=30)
h1 = ParagraphStyle('H1', fontName='Microsoft YaHei', fontSize=14, leading=20, alignment=TA_LEFT, spaceBefore=16, spaceAfter=10, textColor=colors.HexColor('#1F4E79'))
h2 = ParagraphStyle('H2', fontName='Microsoft YaHei', fontSize=12, leading=18, alignment=TA_LEFT, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#2E75B6'))
h3 = ParagraphStyle('H3', fontName='SimHei', fontSize=11, leading=16, alignment=TA_LEFT, spaceBefore=8, spaceAfter=4)
body = ParagraphStyle('Body', fontName='SimHei', fontSize=10, leading=16, alignment=TA_JUSTIFY, spaceAfter=8, firstLineIndent=20, wordWrap='CJK')
body_ni = ParagraphStyle('BodyNI', fontName='SimHei', fontSize=10, leading=16, alignment=TA_JUSTIFY, spaceAfter=8, wordWrap='CJK')
bullet = ParagraphStyle('Bullet', fontName='SimHei', fontSize=10, leading=16, alignment=TA_LEFT, spaceAfter=4, leftIndent=20, bulletIndent=10, wordWrap='CJK')
th = ParagraphStyle('TH', fontName='SimHei', fontSize=9, textColor=colors.white, alignment=TA_CENTER)
tc = ParagraphStyle('TC', fontName='SimHei', fontSize=8.5, alignment=TA_LEFT, leading=13, wordWrap='CJK')
tc_c = ParagraphStyle('TCC', fontName='SimHei', fontSize=8.5, alignment=TA_CENTER, leading=13, wordWrap='CJK')
caption = ParagraphStyle('Caption', fontName='SimHei', fontSize=8.5, alignment=TA_CENTER, spaceBefore=4, spaceAfter=12)

story = []

# COVER
story.append(Spacer(1, 70))
story.append(Paragraph("PLAN DE ACCION", cover_title))
story.append(Paragraph("Implementacion de Inteligencia Artificial", cover_title))
story.append(Paragraph("Sistema PIGEC-130", cover_title))
story.append(Spacer(1, 24))
story.append(Paragraph("Estrategia de Desarrollo por Fases", cover_subtitle))
story.append(Spacer(1, 40))
story.append(Paragraph("Documento de Planificacion Estrategica", ParagraphStyle('CD', fontName='SimHei', fontSize=11, leading=18, alignment=TA_CENTER)))
story.append(Paragraph("Marzo 2026", ParagraphStyle('CD2', fontName='SimHei', fontSize=11, leading=16, alignment=TA_CENTER)))
story.append(PageBreak())

# 1. RESUMEN EJECUTIVO
story.append(Paragraph("<b>1. RESUMEN EJECUTIVO</b>", h1))
story.append(Paragraph(
    "Este documento presenta el plan de accion estrategico para implementar funcionalidades de inteligencia artificial en el sistema PIGEC-130. El plan se estructura en cuatro fases progresivas que permiten obtener valor desde las primeras semanas mientras se construye una arquitectura robusta y escalable para el largo plazo. La estrategia aprovecha la infraestructura existente, minimiza riesgos y prioriza las funcionalidades de mayor impacto clinico.",
    body
))

story.append(Paragraph(
    "El plan contempla un horizonte de 12 semanas distribuidas en cuatro fases: reactivacion de infraestructura existente, migracion tecnologica, desarrollo de nuevas funcionalidades y optimizacion avanzada. El enfoque incremental permite validar cada etapa antes de avanzar a la siguiente, reduciendo riesgos y facilitando ajustes tempranos.",
    body
))

# Timeline summary
story.append(Spacer(1, 10))
timeline = [
    [Paragraph('<b>Fase</b>', th), Paragraph('<b>Nombre</b>', th), Paragraph('<b>Duracion</b>', th), Paragraph('<b>Objetivo Principal</b>', th)],
    [Paragraph('1', tc_c), Paragraph('Reactivacion', tc), Paragraph('2 semanas', tc_c), Paragraph('Habilitar IA existente para informes WISC', tc)],
    [Paragraph('2', tc_c), Paragraph('Migracion SDK', tc), Paragraph('3 semanas', tc_c), Paragraph('Unificar infraestructura en z-ai-web-dev-sdk', tc)],
    [Paragraph('3', tc_c), Paragraph('Nuevas Funciones', tc), Paragraph('4 semanas', tc_c), Paragraph('Impresion diagnostica y alertas inteligentes', tc)],
    [Paragraph('4', tc_c), Paragraph('Optimizacion', tc), Paragraph('3 semanas', tc_c), Paragraph('Funciones avanzadas y refinamiento', tc)],
]
t = Table(timeline, colWidths=[0.6*inch, 1.4*inch, 1*inch, 3*inch])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#D4EDDA')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFF3CD')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#CCE5FF')),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F8D7DA')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(t)
story.append(Paragraph("Tabla 1. Resumen del plan de accion por fases", caption))

# 2. FASE 1
story.append(Paragraph("<b>2. FASE 1: REACTIVACION DE INFRAESTRUCTURA (Semanas 1-2)</b>", h1))
story.append(Paragraph(
    "La primera fase se enfoca en reactivar la infraestructura de IA existente que actualmente se encuentra deshabilitada. Esta es la accion de mayor retorno de inversion con menor esfuerzo, ya que el codigo ya esta desarrollado y probado.",
    body
))

story.append(Paragraph("<b>2.1 Objetivos Especificos</b>", h2))
story.append(Paragraph("- Reactivar el flujo de generacion de informes WISC-V/WAIS-IV", bullet))
story.append(Paragraph("- Habilitar la generacion automatica de sintesis diagnosticas", bullet))
story.append(Paragraph("- Validar el funcionamiento de la integracion con Google AI", bullet))
story.append(Paragraph("- Documentar el proceso para futuras referencias", bullet))

story.append(Paragraph("<b>2.2 Acciones Detalladas</b>", h2))

actions1 = [
    [Paragraph('<b>Accion</b>', th), Paragraph('<b>Descripcion</b>', th), Paragraph('<b>Responsable</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('1.1', tc_c), Paragraph('Obtener credenciales API de Google AI Studio (GEMINI_API_KEY)', tc), Paragraph('DevOps/Admin', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('1.2', tc_c), Paragraph('Configurar variable de entorno en el proyecto', tc), Paragraph('Desarrollador', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('1.3', tc_c), Paragraph('Renombrar genkit.ts.bak a genkit.ts', tc), Paragraph('Desarrollador', tc), Paragraph('0.25 dias', tc_c)],
    [Paragraph('1.4', tc_c), Paragraph('Renombrar wisc-report-flow.ts.bak a wisc-report-flow.ts', tc), Paragraph('Desarrollador', tc), Paragraph('0.25 dias', tc_c)],
    [Paragraph('1.5', tc_c), Paragraph('Actualizar importaciones en WISC-VScoringConsole.tsx', tc), Paragraph('Desarrollador', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('1.6', tc_c), Paragraph('Realizar pruebas de integracion end-to-end', tc), Paragraph('QA', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('1.7', tc_c), Paragraph('Documentar configuracion y proceso', tc), Paragraph('Desarrollador', tc), Paragraph('0.5 dias', tc_c)],
]
t1 = Table(actions1, colWidths=[0.6*inch, 2.8*inch, 1.2*inch, 0.9*inch])
t1.setStyle(TableStyle([
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
story.append(t1)
story.append(Paragraph("Tabla 2. Acciones detalladas de la Fase 1", caption))

story.append(Paragraph("<b>2.3 Criterios de Exito</b>", h2))
story.append(Paragraph("- El flujo generateWiscReport() responde correctamente con datos de prueba", bullet))
story.append(Paragraph("- La sintesis diagnostica generada es coherente con los puntajes ingresados", bullet))
story.append(Paragraph("- El informe PDF se genera e incluye la sintesis de IA", bullet))
story.append(Paragraph("- El tiempo de respuesta es menor a 10 segundos", bullet))

story.append(Paragraph("<b>2.4 Riesgos y Mitigacion</b>", h2))
risks1 = [
    [Paragraph('<b>Riesgo</b>', th), Paragraph('<b>Probabilidad</b>', th), Paragraph('<b>Impacto</b>', th), Paragraph('<b>Mitigacion</b>', th)],
    [Paragraph('API key no disponible', tc), Paragraph('Baja', tc_c), Paragraph('Alto', tc_c), Paragraph('Coordinar con Google AI Studio con anticipacion', tc)],
    [Paragraph('Cambios en API de Gemini', tc), Paragraph('Media', tc_c), Paragraph('Medio', tc_c), Paragraph('Verificar documentacion actualizada antes de implementar', tc)],
    [Paragraph('Costos de API inesperados', tc), Paragraph('Media', tc_c), Paragraph('Medio', tc_c), Paragraph('Configurar alertas de presupuesto y limites de uso', tc)],
]
tr1 = Table(risks1, colWidths=[1.5*inch, 1*inch, 0.8*inch, 2.7*inch])
tr1.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B0000')),
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
story.append(tr1)
story.append(Paragraph("Tabla 3. Matriz de riesgos - Fase 1", caption))

# 3. FASE 2
story.append(Paragraph("<b>3. FASE 2: MIGRACION A Z-AI-WEB-DEV-SDK (Semanas 3-5)</b>", h1))
story.append(Paragraph(
    "La segunda fase consiste en migrar la infraestructura de IA de Genkit al SDK z-ai-web-dev-sdk que ya se encuentra instalado en el proyecto. Esta migracion simplificara la arquitectura, eliminara dependencias externas adicionales y habilitara capacidades multimodales para futuras expansiones.",
    body
))

story.append(Paragraph("<b>3.1 Justificacion Tecnica</b>", h2))
story.append(Paragraph(
    "El SDK z-ai-web-dev-sdk ofrece varias ventajas sobre la arquitectura actual basada en Genkit: consolidacion de todas las capacidades de IA en un unico proveedor, eliminacion de la dependencia de Genkit (reduciendo superficie de ataque), acceso a funcionalidades adicionales como procesamiento de voz y vision, y mejor integracion con el ecosistema del proyecto.",
    body
))

story.append(Paragraph("<b>3.2 Arquitectura Propuesta</b>", h2))
story.append(Paragraph(
    "Se propone crear un modulo centralizado de IA en src/lib/ai-service.ts que encapsule todas las llamadas al SDK. Este modulo expondra funciones especificas del dominio como generateDiagnosticImpression(), generateTreatmentPlan() y analyzeRiskPatterns(), abstrayendo los detalles de implementacion del resto de la aplicacion.",
    body
))

story.append(Paragraph("<b>3.3 Acciones Detalladas</b>", h2))
actions2 = [
    [Paragraph('<b>Accion</b>', th), Paragraph('<b>Descripcion</b>', th), Paragraph('<b>Responsable</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('2.1', tc_c), Paragraph('Crear src/lib/ai-service.ts con inicializacion del SDK', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('2.2', tc_c), Paragraph('Implementar funcion generateWiscReport() con z-ai', tc), Paragraph('Desarrollador', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('2.3', tc_c), Paragraph('Migrar prompts existentes al nuevo formato', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('2.4', tc_c), Paragraph('Crear tests unitarios para ai-service', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('2.5', tc_c), Paragraph('Actualizar WISC-VScoringConsole para usar nuevo servicio', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('2.6', tc_c), Paragraph('Eliminar dependencias de Genkit y archivos .bak', tc), Paragraph('Desarrollador', tc), Paragraph('0.5 dias', tc_c)],
    [Paragraph('2.7', tc_c), Paragraph('Pruebas de regresion completas', tc), Paragraph('QA', tc), Paragraph('1.5 dias', tc_c)],
]
t2 = Table(actions2, colWidths=[0.6*inch, 2.8*inch, 1.2*inch, 0.9*inch])
t2.setStyle(TableStyle([
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
story.append(t2)
story.append(Paragraph("Tabla 4. Acciones detalladas de la Fase 2", caption))

story.append(Paragraph("<b>3.4 Estructura de Modulo Propuesta</b>", h2))
story.append(Paragraph(
    "El modulo ai-service.ts debera implementar las siguientes funciones principales: initializeAI() para configurar la instancia del SDK, generateWiscReport(input) para generar informes de evaluaciones Wechsler, generateDiagnosticImpression(clinicalData) para crear impresiones diagnosticas, generateTreatmentPlan(analysisData) para planes de tratamiento, y analyzeRiskPatterns(historyData) para deteccion de patrones.",
    body
))

# 4. FASE 3
story.append(Paragraph("<b>4. FASE 3: NUEVAS FUNCIONALIDADES (Semanas 6-9)</b>", h1))
story.append(Paragraph(
    "La tercera fase implementa nuevas funcionalidades de IA que proporcionaran valor significativo al flujo de trabajo clinico. Se priorizan las funciones de mayor impacto y menor complejidad tecnica.",
    body
))

story.append(Paragraph("<b>4.1 Funcionalidad 1: Generacion de Impresion Diagnostica</b>", h2))
story.append(Paragraph(
    "Esta funcionalidad integrara automaticamente los resultados de todas las pruebas aplicadas para generar una propuesta de impresion diagnostica. El clinico podra revisar, editar y aprobar la propuesta antes de guardarla en el expediente.",
    body
))

story.append(Paragraph("<b>Entradas requeridas:</b>", h3))
story.append(Paragraph("- Puntajes de screening emocional (BDI-II, BAI, GAD-7, PHQ-9)", bullet))
story.append(Paragraph("- Escalas de riesgo suicida (SSI, Columbia, Plutchik)", bullet))
story.append(Paragraph("- Indices neuropsicologicos (MT, AS, VP)", bullet))
story.append(Paragraph("- Resultados ASSIST y conductas autolesivas", bullet))
story.append(Paragraph("- Antecedentes relevantes del estudiante", bullet))

story.append(Paragraph("<b>Salida esperada:</b>", h3))
story.append(Paragraph(
    "Un texto narrativo de 2-3 parrafos que integre los hallazgos, identifique patrones clinicos significativos, proponga hipotesis diagnosticas provisionales y sugiera areas de atencion prioritaria. El formato debe ser consistente con el estilo clinico profesional.",
    body_ni
))

story.append(Paragraph("<b>4.2 Funcionalidad 2: Alertas Inteligentes de Riesgo</b>", h2))
story.append(Paragraph(
    "Sistema de monitoreo que detecta patrones de riesgo que podrian pasar desapercibidos en evaluaciones individuales. Incluye deteccion de tendencias de deterioro, identificacion de combinaciones de factores de riesgo, y alertas contextuales basadas en el perfil del estudiante.",
    body
))

story.append(Paragraph("<b>4.3 Funcionalidad 3: Mejora del Generador PIEI</b>", h2))
story.append(Paragraph(
    "Transformar el actual algoritmo basado en reglas en un sistema de IA que pueda generar adaptaciones educativas mas personalizadas y contextuales, considerando no solo los puntajes sino tambien las caracteristicas individuales del estudiante y el entorno educativo.",
    body
))

story.append(Paragraph("<b>4.4 Acciones Detalladas</b>", h2))
actions3 = [
    [Paragraph('<b>Accion</b>', th), Paragraph('<b>Descripcion</b>', th), Paragraph('<b>Responsable</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('3.1', tc_c), Paragraph('Disenar prompt para generacion de impresion diagnostica', tc), Paragraph('Clinico + Dev', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('3.2', tc_c), Paragraph('Implementar generateDiagnosticImpression() en ai-service', tc), Paragraph('Desarrollador', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('3.3', tc_c), Paragraph('Integrar en ClinicalAssessmentForm', tc), Paragraph('Desarrollador', tc), Paragraph('1.5 dias', tc_c)],
    [Paragraph('3.4', tc_c), Paragraph('Desarrollar sistema de alertas inteligentes', tc), Paragraph('Desarrollador', tc), Paragraph('3 dias', tc_c)],
    [Paragraph('3.5', tc_c), Paragraph('Mejorar generador PIEI con IA', tc), Paragraph('Desarrollador', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('3.6', tc_c), Paragraph('Implementar flujo de revision/aprobacion', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('3.7', tc_c), Paragraph('Pruebas de usabilidad con usuarios clinicos', tc), Paragraph('QA + Clinico', tc), Paragraph('1.5 dias', tc_c)],
]
t3 = Table(actions3, colWidths=[0.6*inch, 2.8*inch, 1.2*inch, 0.9*inch])
t3.setStyle(TableStyle([
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
story.append(t3)
story.append(Paragraph("Tabla 5. Acciones detalladas de la Fase 3", caption))

# 5. FASE 4
story.append(Paragraph("<b>5. FASE 4: OPTIMIZACION Y FUNCIONES AVANZADAS (Semanas 10-12)</b>", h1))
story.append(Paragraph(
    "La cuarta fase se enfoca en optimizar las implementaciones existentes, refinar la calidad de las salidas de IA y desarrollar funcionalidades avanzadas que aprovechen las capacidades multimodales del SDK.",
    body
))

story.append(Paragraph("<b>5.1 Funcionalidades Avanzadas</b>", h2))

story.append(Paragraph("<b>5.1.1 Transcripcion de Sesiones (ASR)</b>", h3))
story.append(Paragraph(
    "Implementar la capacidad de transcribir automaticamente sesiones clinicas grabadas utilizando el modulo ASR del SDK. Las transcripciones podran convertirse automaticamente en notas SOAP, reduciendo significativamente el tiempo de documentacion.",
    body
))

story.append(Paragraph("<b>5.1.2 Generador de Planes de Tratamiento Personalizados</b>", h3))
story.append(Paragraph(
    "Reemplazar el actual template estatico con un sistema de IA que genere planes de tratamiento verdaderamente personalizados, considerando el perfil clinico completo, las preferencias del paciente, los recursos disponibles y la evidencia cientifica mas reciente.",
    body
))

story.append(Paragraph("<b>5.1.3 Analisis de Tendencias Temporales</b>", h3))
story.append(Paragraph(
    "Implementar visualizaciones y analisis de IA que identifiquen patrones de cambio a lo largo del tiempo, predigan posibles deterioros y sugieran intervenciones preventivas basadas en datos historicos.",
    body
))

story.append(Paragraph("<b>5.2 Optimizaciones</b>", h2))
story.append(Paragraph("- Implementar cache de respuestas de IA para casos similares", bullet))
story.append(Paragraph("- Optimizar prompts para reducir tokens y costos", bullet))
story.append(Paragraph("- Implementar sistema de feedback para mejorar calidad", bullet))
story.append(Paragraph("- Desarrollar metricas de calidad de salidas de IA", bullet))

story.append(Paragraph("<b>5.3 Acciones Detalladas</b>", h2))
actions4 = [
    [Paragraph('<b>Accion</b>', th), Paragraph('<b>Descripcion</b>', th), Paragraph('<b>Responsable</b>', th), Paragraph('<b>Tiempo</b>', th)],
    [Paragraph('4.1', tc_c), Paragraph('Implementar integracion ASR para transcripcion', tc), Paragraph('Desarrollador', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('4.2', tc_c), Paragraph('Desarrollar generador de planes personalizado', tc), Paragraph('Desarrollador', tc), Paragraph('2 dias', tc_c)],
    [Paragraph('4.3', tc_c), Paragraph('Implementar sistema de cache inteligente', tc), Paragraph('Desarrollador', tc), Paragraph('1.5 dias', tc_c)],
    [Paragraph('4.4', tc_c), Paragraph('Optimizar prompts basandose en uso real', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
    [Paragraph('4.5', tc_c), Paragraph('Implementar sistema de feedback y mejora continua', tc), Paragraph('Desarrollador', tc), Paragraph('1.5 dias', tc_c)],
    [Paragraph('4.6', tc_c), Paragraph('Documentacion final y capacitacion', tc), Paragraph('Desarrollador', tc), Paragraph('1 dia', tc_c)],
]
t4 = Table(actions4, colWidths=[0.6*inch, 2.8*inch, 1.2*inch, 0.9*inch])
t4.setStyle(TableStyle([
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
story.append(t4)
story.append(Paragraph("Tabla 6. Acciones detalladas de la Fase 4", caption))

# 6. RECURSOS
story.append(Paragraph("<b>6. RECURSOS NECESARIOS</b>", h1))

story.append(Paragraph("<b>6.1 Recursos Humanos</b>", h2))
resources = [
    [Paragraph('<b>Rol</b>', th), Paragraph('<b>Dedicacion</b>', th), Paragraph('<b>Responsabilidades</b>', th)],
    [Paragraph('Desarrollador Full Stack', tc), Paragraph('Tiempo completo', tc_c), Paragraph('Implementacion tecnica, integracion, pruebas', tc)],
    [Paragraph('Especialista Clinico', tc), Paragraph('20% tiempo', tc_c), Paragraph('Revision de prompts, validacion de contenido, feedback', tc)],
    [Paragraph('QA/Tester', tc), Paragraph('30% tiempo', tc_c), Paragraph('Pruebas funcionales, regresion, usabilidad', tc)],
    [Paragraph('DevOps', tc), Paragraph('10% tiempo', tc_c), Paragraph('Configuracion de API keys, monitoreo, despliegue', tc)],
]
tr = Table(resources, colWidths=[1.5*inch, 1.2*inch, 3.3*inch])
tr.setStyle(TableStyle([
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
story.append(Spacer(1, 8))
story.append(tr)
story.append(Paragraph("Tabla 7. Recursos humanos requeridos", caption))

story.append(Paragraph("<b>6.2 Recursos Tecnicos</b>", h2))
story.append(Paragraph("- API key de Google AI Studio (Gemini) con cuota suficiente", bullet))
story.append(Paragraph("- Entorno de desarrollo con acceso a internet para APIs", bullet))
story.append(Paragraph("- Repositorio Git con branching strategy definida", bullet))
story.append(Paragraph("- Entorno de staging para pruebas antes de produccion", bullet))

story.append(Paragraph("<b>6.3 Estimacion de Costos</b>", h2))
costs = [
    [Paragraph('<b>Concepto</b>', th), Paragraph('<b>Costo Estimado</b>', th), Paragraph('<b>Notas</b>', th)],
    [Paragraph('API Gemini 1.5 Flash', tc), Paragraph('$20-50 USD/mes', tc_c), Paragraph('Depende del volumen de uso', tc)],
    [Paragraph('Horas de desarrollo', tc), Paragraph('480 horas', tc_c), Paragraph('12 semanas x 40 horas', tc)],
    [Paragraph('Infraestructura', tc), Paragraph('$0', tc_c), Paragraph('Sin cambios requeridos', tc)],
]
tcost = Table(costs, colWidths=[1.8*inch, 1.5*inch, 2.7*inch])
tcost.setStyle(TableStyle([
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
story.append(Spacer(1, 8))
story.append(tcost)
story.append(Paragraph("Tabla 8. Estimacion de costos", caption))

# 7. CONSIDERACIONES ETICAS
story.append(Paragraph("<b>7. CONSIDERACIONES ETICAS Y DE SEGURIDAD</b>", h1))

story.append(Paragraph("<b>7.1 Principios Eticos Fundamentales</b>", h2))
story.append(Paragraph(
    "Toda implementacion de IA en el sistema PIGEC-130 debe adherirse a principios eticos estrictos. El rol de la IA es asistir, no reemplazar el juicio clinico profesional. Todas las sugerencias generadas por IA deben ser revisadas y aprobadas explicitamente por un profesional calificado antes de incorporarse al expediente clinico.",
    body
))

story.append(Paragraph("<b>7.2 Medidas de Seguridad</b>", h2))
story.append(Paragraph("- Ningun dato sensible se envia a modelos de IA sin consentimiento", bullet))
story.append(Paragraph("- Los outputs de IA se marcan claramente como sugerencias", bullet))
story.append(Paragraph("- Se mantiene registro de auditoria de todas las interacciones con IA", bullet))
story.append(Paragraph("- El disclaimer deontologico existente se mantiene visible", bullet))
story.append(Paragraph("- Los clinicos pueden rechazar sugerencias de IA sin penalizacion", bullet))

story.append(Paragraph("<b>7.3 Transparencia con Usuarios</b>", h2))
story.append(Paragraph(
    "Los usuarios del sistema deben ser informados claramente cuando interactuan con funcionalidades de IA. Las interfaces deben incluir indicadores visuales que distingan entre contenido generado por humanos y sugerencias de IA. Los documentos generados deben incluir notas que indiquen el uso de asistencia de IA en su elaboracion.",
    body
))

# 8. CRONOGRAMA
story.append(Paragraph("<b>8. CRONOGRAMA CONSOLIDADO</b>", h1))

schedule = [
    [Paragraph('<b>Semana</b>', th), Paragraph('<b>Fase</b>', th), Paragraph('<b>Entregables</b>', th), Paragraph('<b>Hitos</b>', th)],
    [Paragraph('1', tc_c), Paragraph('Fase 1', tc_c), Paragraph('Configuracion API, reactivacion archivos', tc), Paragraph('Entorno listo para IA', tc)],
    [Paragraph('2', tc_c), Paragraph('Fase 1', tc_c), Paragraph('Integracion WISC, pruebas', tc), Paragraph('Informes WISC con IA funcionando', tc)],
    [Paragraph('3-4', tc_c), Paragraph('Fase 2', tc_c), Paragraph('Modulo ai-service, migracion', tc), Paragraph('Nueva arquitectura operativa', tc)],
    [Paragraph('5', tc_c), Paragraph('Fase 2', tc_c), Paragraph('Tests, limpieza codigo', tc), Paragraph('Genkit eliminado del proyecto', tc)],
    [Paragraph('6-7', tc_c), Paragraph('Fase 3', tc_c), Paragraph('Impresion diagnostica, alertas', tc), Paragraph('Nuevas funciones de IA activas', tc)],
    [Paragraph('8-9', tc_c), Paragraph('Fase 3', tc_c), Paragraph('PIEI mejorado, pruebas usabilidad', tc), Paragraph('Funcionalidades validadas', tc)],
    [Paragraph('10-11', tc_c), Paragraph('Fase 4', tc_c), Paragraph('ASR, planes personalizados, cache', tc), Paragraph('Funciones avanzadas listas', tc)],
    [Paragraph('12', tc_c), Paragraph('Fase 4', tc_c), Paragraph('Optimizacion, documentacion', tc), Paragraph('Proyecto completado', tc)],
]
ts = Table(schedule, colWidths=[0.7*inch, 0.8*inch, 2.3*inch, 2.2*inch])
ts.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 2), colors.HexColor('#D4EDDA')),
    ('BACKGROUND', (0, 3), (-1, 5), colors.HexColor('#FFF3CD')),
    ('BACKGROUND', (0, 6), (-1, 8), colors.HexColor('#CCE5FF')),
    ('BACKGROUND', (0, 9), (-1, 10), colors.HexColor('#F8D7DA')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 8))
story.append(ts)
story.append(Paragraph("Tabla 9. Cronograma consolidado del proyecto", caption))

# 9. CONCLUSION
story.append(Paragraph("<b>9. CONCLUSION</b>", h1))
story.append(Paragraph(
    "Este plan de accion proporciona una hoja de ruta clara y ejecutable para implementar funcionalidades de inteligencia artificial en el sistema PIGEC-130. La estrategia de cuatro fases permite obtener valor desde las primeras semanas mientras se construye una base solida para expansiones futuras.",
    body
))

story.append(Paragraph(
    "El enfoque incremental minimiza riesgos al validar cada etapa antes de avanzar. La reactivacion de la infraestructura existente en la Fase 1 proporciona retorno inmediato con minima inversion. La migracion al SDK z-ai-web-dev-sdk en la Fase 2 simplifica la arquitectura a largo plazo. Las nuevas funcionalidades de la Fase 3 mejoran significativamente el flujo de trabajo clinico. Finalmente, la Fase 4 habilita capacidades avanzadas que posicionan al sistema como referente en tecnologia de evaluacion psicometrica.",
    body
))

story.append(Paragraph(
    "La adherencia a principios eticos, la transparencia con los usuarios y el mantenimiento del juicio clinico profesional como autoridad final garantizan que la implementacion de IA mejore sin comprometer la calidad y seguridad del servicio clinico.",
    body
))

doc.build(story)
print("PDF generado exitosamente")
