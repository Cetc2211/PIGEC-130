export type LikertScaleOption = {
  value: number;
  label: string;
};

export type Question = {
  id: string;
  text: string;
  type: 'likert' | 'open'; // Added type
};

export type Interpretation = {
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Alta';
    summary: string;
}

export type InterpretationRule = {
    from: number;
    to: number;
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Alta';
    summary: string;
};


export type Questionnaire = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  questions: Question[];
  likertScale: LikertScaleOption[];
  interpretationData: InterpretationRule[];
};


const defaultLikertScale: LikertScaleOption[] = [
  { value: 0, label: 'Para nada' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

export const questionnaires: Questionnaire[] = [
  {
    id: 'gad-7',
    name: 'Ansiedad GAD-7',
    description: 'Una herramienta de 7 preguntas para la detección del Trastorno de Ansiedad Generalizada.',
    category: 'Estado de Ánimo',
    subcategory: 'Ansiedad',
    likertScale: defaultLikertScale,
    questions: [
      { id: 'q1', text: 'Sentirse nervioso/a, ansioso/a o con los nervios de punta', type: 'likert' },
      { id: 'q2', text: 'No poder detener o controlar la preocupación', type: 'likert' },
      { id: 'q3', text: 'Preocuparse demasiado por diferentes cosas', type: 'likert' },
      { id: 'q4', text: 'Dificultad para relajarse', type: 'likert' },
      { id: 'q5', text: 'Estar tan inquieto/a que es difícil quedarse quieto/a', type: 'likert' },
      { id: 'q6', text: 'Ponerse fácilmente irritable o enfadado/a', type: 'likert' },
      { id: 'q7', text: 'Sentir miedo, como si algo horrible pudiera pasar', type: 'likert' },
    ],
    interpretationData: [
        { from: 0, to: 4, severity: 'Baja', summary: 'Ansiedad mínima. Es probable que los síntomas sean transitorios y no causen una angustia significativa.' },
        { from: 5, to: 9, severity: 'Leve', summary: 'Ansiedad leve. Puede experimentar algunos síntomas, pero generalmente son manejables.' },
        { from: 10, to: 14, severity: 'Moderada', summary: 'Ansiedad moderada. Los síntomas son frecuentes y causan un deterioro notable en el funcionamiento diario.' },
        { from: 15, to: 21, severity: 'Alta', summary: 'Ansiedad severa. Los síntomas son persistentes, angustiantes e interfieren significativamente con la vida diaria.' },
    ],
  },
  {
    id: 'phq-9',
    name: 'Depresión PHQ-9',
    description: 'Una herramienta de 9 preguntas para detectar la depresión y monitorear su gravedad.',
    category: 'Estado de Ánimo',
    subcategory: 'Depresión',
    likertScale: defaultLikertScale,
    questions: [
        { id: 'q1', text: 'Poco interés o placer en hacer las cosas', type: 'likert' },
        { id: 'q2', text: 'Sentirse desanimado/a, deprimido/a o sin esperanza', type: 'likert' },
        { id: 'q3', text: 'Problemas para dormir o permanecer dormido/a, o dormir demasiado', type: 'likert' },
        { id: 'q4', text: 'Sentirse cansado/a o con poca energía', type: 'likert' },
        { id: 'q5', text: 'Poco apetito o comer en exceso', type: 'likert' },
        { id: 'q6', text: 'Sentirse mal consigo mismo/a, o que es un fracaso o ha decepcionado a su familia o a usted mismo/a', type: 'likert' },
        { id: 'q7', text: 'Dificultad para concentrarse en cosas, como leer el periódico o ver la televisión', type: 'likert' },
        { id: 'q8', text: 'Moverse o hablar tan lento que otras personas podrían haberlo notado. O lo contrario: estar tan inquieto/a o agitado/a que se ha estado moviendo mucho más de lo habitual', type: 'likert' },
        { id: 'q9', text: 'Pensamientos de que estaría mejor muerto/a, o de hacerse daño de alguna manera', type: 'likert' }
    ],
    interpretationData: [
        { from: 0, to: 4, severity: 'Baja', summary: 'Depresión mínima. Es poco probable que sea clínicamente significativa.' },
        { from: 5, to: 9, severity: 'Leve', summary: 'Depresión leve. Monitorear los síntomas; considerar tratamiento si persisten.' },
        { from: 10, to: 14, severity: 'Moderada', summary: 'Depresión moderada. Es probable que se justifique el tratamiento.' },
        { from: 15, to: 19, severity: 'Moderada', summary: 'Depresión moderadamente severa. Se recomienda encarecidamente el tratamiento activo.' },
        { from: 20, to: 27, severity: 'Alta', summary: 'Depresión severa. Se necesita intervención y tratamiento inmediatos.' },
    ],
  },
  {
    id: 'psc-10',
    name: 'Estrés Percibido PSS-10',
    description: 'Una escala de 10 ítems que mide el grado en que las situaciones de la vida se evalúan como estresantes.',
    category: 'Estado de Ánimo',
    subcategory: 'Estrés',
    likertScale: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Casi nunca' },
        { value: 2, label: 'A veces' },
        { value: 3, label: 'Con bastante frecuencia' },
        { value: 4, label: 'Muy a menudo' },
    ],
    questions: [
        { id: 'q1', text: 'En el último mes, ¿con qué frecuencia ha estado molesto/a por algo que sucedió inesperadamente?', type: 'likert' },
        { id: 'q2', text: 'En el último mes, ¿con qué frecuencia ha sentido que no podía controlar las cosas importantes de su vida?', type: 'likert' },
        { id: 'q3', text: 'En el último mes, ¿con qué frecuencia se ha sentido nervioso/a y estresado/a?', type: 'likert' },
        { id: 'q4', text: 'En el último mes, ¿con qué frecuencia se ha sentido seguro/a de su capacidad para manejar sus problemas personales?', type: 'likert' },
        { id: 'q5', text: 'En el último mes, ¿con qué frecuencia ha sentido que las cosas le iban bien?', type: 'likert' },
        { id: 'q6', text: 'En el último mes, ¿con qué frecuencia ha descubierto que no podía hacer frente a todas las cosas que tenía que hacer?', type: 'likert' },
        { id: 'q7', text: 'En el último mes, ¿con qué frecuencia ha sido capaz de controlar las irritaciones en su vida?', type: 'likert' },
        { id: 'q8', text: 'En el último mes, ¿con qué frecuencia ha sentido que estaba al tanto de las cosas?', type: 'likert' },
        { id: 'q9', text: 'En el último mes, ¿con qué frecuencia se ha enfadado por cosas que estaban fuera de su control?', type: 'likert' },
        { id: 'q10', text: 'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulaban tanto que no podía superarlas?', type: 'likert' }
    ],
    interpretationData: [
        // Nota: Para PSS-10, las preguntas 4, 5, 7 y 8 tienen puntuación inversa.
        // Esta interpretación simple no tiene en cuenta la puntuación inversa. La lógica de puntuación debe manejarlo.
        { from: 0, to: 13, severity: 'Baja', summary: 'Bajo estrés percibido. Indica buenos mecanismos de afrontamiento y resiliencia.' },
        { from: 14, to: 26, severity: 'Moderada', summary: 'Estrés percibido moderado. Experimenta algunas dificultades para manejar los estresores de la vida.' },
        { from: 27, to: 40, severity: 'Alta', summary: 'Alto estrés percibido. Indica una dificultad significativa para hacer frente a los eventos de la vida, puede requerir apoyo.' },
    ]
  },
  {
    id: 'goca',
    name: 'Guía de Observación Conductual en Aula (GOCA)',
    description: 'Instrumento para que los docentes observen y registren la frecuencia de conductas clave relacionadas con la atención, motivación, estado emocional y rendimiento del estudiante en el aula.',
    category: 'Conductual',
    subcategory: 'Observación en Aula',
    likertScale: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Raramente' },
        { value: 2, label: 'A veces' },
        { value: 3, label: 'Frecuentemente' },
        { value: 4, label: 'Siempre' },
    ],
    questions: [
      // SECCIÓN I: INDICADORES DE ATENCIÓN Y CONCENTRACIÓN
      { id: 'goca_q1', text: 'Se distrae fácilmente con ruidos externos (conversaciones, ruidos del pasillo)', type: 'likert' },
      { id: 'goca_q2', text: 'Necesita que se le repitan las instrucciones varias veces', type: 'likert' },
      { id: 'goca_q3', text: 'Deja actividades o ejercicios incompletos en clase', type: 'likert' },
      { id: 'goca_q4', text: 'Parece estar "soñando despierto" o con la mirada perdida', type: 'likert' },
      { id: 'goca_q5', text: 'Pierde o no encuentra sus materiales escolares', type: 'likert' },
      { id: 'goca_q6', text: 'Muestra dificultad para seguir explicaciones de más de 5 minutos', type: 'likert' },
      { id: 'goca_q7', text: 'Se levanta de su asiento sin permiso o necesidad', type: 'likert' },
      { id: 'goca_q8', text: 'Juega con objetos (lápiz, celular, etc.) durante la clase', type: 'likert' },
      // SECCIÓN II: INDICADORES DE PARTICIPACIÓN Y MOTIVACIÓN
      { id: 'goca_q9', text: 'Evita participar cuando se le pregunta directamente', type: 'likert' },
      { id: 'goca_q10', text: 'No trae los materiales necesarios para la clase', type: 'likert' },
      { id: 'goca_q11', text: 'Expresa comentarios negativos sobre la materia o escuela', type: 'likert' },
      { id: 'goca_q12', text: 'Se muestra apático o desinteresado en las actividades', type: 'likert' },
      { id: 'goca_q13', text: 'No completa las tareas asignadas para casa', type: 'likert' },
      { id: 'goca_q14', text: 'Evita actividades que requieren esfuerzo mental sostenido', type: 'likert' },
      { id: 'goca_q15', text: 'No toma apuntes durante la clase', type: 'likert' },
      { id: 'goca_q16', text: 'Llega tarde a clase sin justificación', type: 'likert' },
      // SECCIÓN III: INDICADORES EMOCIONALES Y CONDUCTUALES
      { id: 'goca_q17', text: 'Se observa triste, cabizbajo o con expresión de tristeza', type: 'likert' },
      { id: 'goca_q18', text: 'Muestra irritabilidad o se enoja con facilidad', type: 'likert' },
      { id: 'goca_q19', text: 'Se aísla de sus compañeros durante actividades grupales', type: 'likert' },
      { id: 'goca_q20', text: 'Presenta signos visibles de ansiedad (mueve piernas, muerde uñas)', type: 'likert' },
      { id: 'goca_q21', text: 'Muestra cambios bruscos de humor durante la clase', type: 'likert' },
      { id: 'goca_q22', text: 'Se queja frecuentemente de dolores o malestares físicos', type: 'likert' },
      { id: 'goca_q23', text: 'Llora o parece a punto de llorar', type: 'likert' },
      { id: 'goca_q24', text: 'Muestra conductas agresivas verbales o físicas', type: 'likert' },
      // SECCIÓN IV: INDICADORES DE RENDIMIENTO
      { id: 'goca_q25', text: 'Ha mostrado disminución notable en la calidad de sus trabajos', type: 'likert' },
      { id: 'goca_q26', text: 'Tiene dificultad para comprender conceptos nuevos', type: 'likert' },
      { id: 'goca_q27', text: 'Comete errores frecuentes por aparente descuido', type: 'likert' },
      { id: 'goca_q28', text: 'Su rendimiento es muy inconsistente (días buenos y malos)', type: 'likert' },
      { id: 'goca_q29', text: 'No termina los exámenes en el tiempo establecido', type: 'likert' },
      { id: 'goca_q30', text: 'Evita hacer preguntas cuando tiene dudas', type: 'likert' },
      { id: 'goca_q31', text: 'Sus calificaciones han bajado significativamente', type: 'likert' },
      { id: 'goca_q32', text: 'Copia trabajos o tareas de compañeros', type: 'likert' },
      // SECCIÓN V: INDICADORES FÍSICOS Y DE SALUD
      { id: 'goca_q33', text: 'Se observa cansado o con sueño durante la clase', type: 'likert' },
      { id: 'goca_q34', text: 'Presenta aspecto descuidado o higiene personal deficiente', type: 'likert' },
      { id: 'goca_q35', text: 'Menciona que no ha desayunado o comido', type: 'likert' },
      { id: 'goca_q36', text: 'Presenta signos que podrían indicar consumo de sustancias', type: 'likert' },
      { id: 'goca_q37', text: 'Se queja de problemas de visión o audición', type: 'likert' },
      { id: 'goca_q38', text: 'Muestra pérdida o aumento significativo de peso', type: 'likert' },
      { id: 'goca_q39', text: 'Presenta lesiones visibles frecuentes', type: 'likert' },
      { id: 'goca_q40', text: 'Solicita permisos frecuentes para ir al baño o enfermería', type: 'likert' },
      // SECCIÓN VI: INDICADORES POSITIVOS (FACTORES PROTECTORES)
      { id: 'goca_q41', text: 'Muestra interés en algún tema específico de la materia', type: 'likert' },
      { id: 'goca_q42', text: 'Tiene al menos un amigo cercano en clase', type: 'likert' },
      { id: 'goca_q43', text: 'Responde positivamente al reconocimiento o elogio', type: 'likert' },
      { id: 'goca_q44', text: 'Muestra habilidades en algún área específica', type: 'likert' },
      { id: 'goca_q45', text: 'Busca ayuda cuando la necesita', type: 'likert' },
    ],
    interpretationData: [
        { from: 0, to: 40, severity: 'Baja', summary: 'Sin indicadores significativos de riesgo.' },
        { from: 41, to: 80, severity: 'Moderada', summary: 'Señales de alerta moderadas. Se recomienda seguimiento.' },
        { from: 81, to: 120, severity: 'Moderada', summary: 'Múltiples indicadores de riesgo. Se debe referir a Orientación Educativa.' },
        { from: 121, to: 180, severity: 'Alta', summary: 'Situación crítica. Se requiere intervención inmediata.' },
    ]
  }
];


// Almacenamiento en memoria para cuestionarios personalizados
const customQuestionnaires: Map<string, Questionnaire> = new Map();

export function saveCustomQuestionnaire(questionnaire: Omit<Questionnaire, 'id'>): Questionnaire {
  const id = `custom-${customQuestionnaires.size + 1}-${Date.now()}`;
  const newQuestionnaire = { ...questionnaire, id };
  customQuestionnaires.set(id, newQuestionnaire);
  return newQuestionnaire;
}

export function getAllQuestionnaires(): Questionnaire[] {
  return [...questionnaires, ...Array.from(customQuestionnaires.values())];
}

export function getQuestionnaire(id: string): Questionnaire | undefined {
    return getAllQuestionnaires().find(q => q.id === id);
}

export function getInterpretation(questionnaireId: string, score: number): Interpretation {
    const questionnaire = getQuestionnaire(questionnaireId);
    if (!questionnaire) {
        return { severity: 'Baja', summary: 'No se encontró el cuestionario.' };
    }
    
    if (questionnaire.interpretationData) {
        const rule = questionnaire.interpretationData.find(i => score >= i.from && score <= i.to);
        if (rule) {
            return { severity: rule.severity, summary: rule.summary };
        }

        // Handle scores potentially higher than the max "to"
        const maxRule = questionnaire.interpretationData.reduce((max, r) => r.to > max.to ? r : max, questionnaire.interpretationData[0]);
        if (score > maxRule.to) {
            return { severity: maxRule.severity, summary: maxRule.summary };
        }

        return { severity: 'Baja', summary: 'La puntuación está fuera del rango de interpretación definido.' };
    }

    return { severity: 'Baja', summary: 'No se encontraron reglas de interpretación para esta escala.' };
}
