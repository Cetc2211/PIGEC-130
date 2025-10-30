export type LikertScaleOption = {
  value: number;
  label: string;
};

export type Question = {
  id: string;
  text: string;
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
    likertScale: defaultLikertScale,
    questions: [
      { id: 'q1', text: 'Sentirse nervioso/a, ansioso/a o con los nervios de punta' },
      { id: 'q2', text: 'No poder detener o controlar la preocupación' },
      { id: 'q3', text: 'Preocuparse demasiado por diferentes cosas' },
      { id: 'q4', text: 'Dificultad para relajarse' },
      { id: 'q5', text: 'Estar tan inquieto/a que es difícil quedarse quieto/a' },
      { id: 'q6', text: 'Ponerse fácilmente irritable o enfadado/a' },
      { id: 'q7', text: 'Sentir miedo, como si algo horrible pudiera pasar' },
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
    likertScale: defaultLikertScale,
    questions: [
        { id: 'q1', text: 'Poco interés o placer en hacer las cosas' },
        { id: 'q2', text: 'Sentirse desanimado/a, deprimido/a o sin esperanza' },
        { id: 'q3', text: 'Problemas para dormir o permanecer dormido/a, o dormir demasiado' },
        { id: 'q4', text: 'Sentirse cansado/a o con poca energía' },
        { id: 'q5', text: 'Poco apetito o comer en exceso' },
        { id: 'q6', text: 'Sentirse mal consigo mismo/a, o que es un fracaso o ha decepcionado a su familia o a usted mismo/a' },
        { id: 'q7', text: 'Dificultad para concentrarse en cosas, como leer el periódico o ver la televisión' },
        { id: 'q8', text: 'Moverse o hablar tan lento que otras personas podrían haberlo notado. O lo contrario: estar tan inquieto/a o agitado/a que se ha estado moviendo mucho más de lo habitual' },
        { id: 'q9', text: 'Pensamientos de que estaría mejor muerto/a, o de hacerse daño de alguna manera' }
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
    likertScale: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Casi nunca' },
        { value: 2, label: 'A veces' },
        { value: 3, label: 'Con bastante frecuencia' },
        { value: 4, label: 'Muy a menudo' },
    ],
    questions: [
        { id: 'q1', text: 'En el último mes, ¿con qué frecuencia ha estado molesto/a por algo que sucedió inesperadamente?' },
        { id: 'q2', text: 'En el último mes, ¿con qué frecuencia ha sentido que no podía controlar las cosas importantes de su vida?' },
        { id: 'q3', text: 'En el último mes, ¿con qué frecuencia se ha sentido nervioso/a y estresado/a?' },
        { id: 'q4', text: 'En el último mes, ¿con qué frecuencia se ha sentido seguro/a de su capacidad para manejar sus problemas personales?' },
        { id: 'q5', text: 'En el último mes, ¿con qué frecuencia ha sentido que las cosas le iban bien?' },
        { id: 'q6', text: 'En el último mes, ¿con qué frecuencia ha descubierto que no podía hacer frente a todas las cosas que tenía que hacer?' },
        { id: 'q7', text: 'En el último mes, ¿con qué frecuencia ha sido capaz de controlar las irritaciones en su vida?' },
        { id: 'q8', text: 'En el último mes, ¿con qué frecuencia ha sentido que estaba al tanto de las cosas?' },
        { id: 'q9', text: 'En el último mes, ¿con qué frecuencia se ha enfadado por cosas que estaban fuera de su control?' },
        { id: 'q10', text: 'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulaban tanto que no podía superarlas?' }
    ],
    interpretationData: [
        // Nota: Para PSS-10, las preguntas 4, 5, 7 y 8 tienen puntuación inversa.
        // Esta interpretación simple no tiene en cuenta la puntuación inversa. La lógica de puntuación debe manejarlo.
        { from: 0, to: 13, severity: 'Baja', summary: 'Bajo estrés percibido. Indica buenos mecanismos de afrontamiento y resiliencia.' },
        { from: 14, to: 26, severity: 'Moderada', summary: 'Estrés percibido moderado. Experimenta algunas dificultades para manejar los estresores de la vida.' },
        { from: 27, to: 40, severity: 'Alta', summary: 'Alto estrés percibido. Indica una dificultad significativa para hacer frente a los eventos de la vida, puede requerir apoyo.' },
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
