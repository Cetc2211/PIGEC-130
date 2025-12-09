export type LikertScaleOption = {
  value: number;
  label: string;
};

export type Question = {
  id: string;
  text: string;
  type: 'likert' | 'open';
  options?: LikertScaleOption[]; // Opciones específicas para esta pregunta
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
    id: 'bdi-ii',
    name: 'Inventario de Depresión de Beck-II',
    description: 'Cuestionario de 21 ítems para evaluar la severidad de los síntomas de depresión en las últimas dos semanas.',
    category: 'Estado de Ánimo',
    subcategory: 'Depresión',
    likertScale: [], // No usa una escala global
    questions: [
      { id: 'q1', text: 'TRISTEZA', type: 'likert', options: [
        { value: 0, label: 'No me siento triste' },
        { value: 1, label: 'Me siento triste gran parte del tiempo' },
        { value: 2, label: 'Estoy triste todo el tiempo' },
        { value: 3, label: 'Estoy tan triste o infeliz que no puedo soportarlo' }
      ]},
      { id: 'q2', text: 'PESIMISMO', type: 'likert', options: [
        { value: 0, label: 'No estoy desalentado respecto a mi futuro' },
        { value: 1, label: 'Me siento más desalentado respecto a mi futuro que antes' },
        { value: 2, label: 'No espero que las cosas funcionen para mí' },
        { value: 3, label: 'Siento que mi futuro es desesperanzador y que sólo empeorará' }
      ]},
      { id: 'q3', text: 'FRACASO', type: 'likert', options: [
        { value: 0, label: 'No me siento como un fracasado' },
        { value: 1, label: 'He fracasado más de lo que debería' },
        { value: 2, label: 'Cuando miro hacia atrás veo muchos fracasos' },
        { value: 3, label: 'Siento que como persona soy un fracaso total' }
      ]},
      { id: 'q4', text: 'PÉRDIDA DE PLACER', type: 'likert', options: [
        { value: 0, label: 'Obtengo tanto placer como siempre de las cosas que disfruto' },
        { value: 1, label: 'No disfruto de las cosas tanto como antes' },
        { value: 2, label: 'Obtengo muy poco placer de las cosas que solía disfrutar' },
        { value: 3, label: 'No obtengo ningún placer de las cosas que solía disfrutar' }
      ]},
      { id: 'q5', text: 'SENTIMIENTOS DE CULPA', type: 'likert', options: [
        { value: 0, label: 'No me siento particularmente culpable' },
        { value: 1, label: 'Me siento culpable respecto a muchas cosas que he hecho o debería haber hecho' },
        { value: 2, label: 'Me siento bastante culpable la mayor parte del tiempo' },
        { value: 3, label: 'Me siento culpable todo el tiempo' }
      ]},
      { id: 'q6', text: 'SENTIMIENTOS DE CASTIGO', type: 'likert', options: [
        { value: 0, label: 'No siento que esté siendo castigado' },
        { value: 1, label: 'Siento que podría ser castigado' },
        { value: 2, label: 'Espero ser castigado' },
        { value: 3, label: 'Siento que estoy siendo castigado' }
      ]},
      { id: 'q7', text: 'DISCONFORMIDAD CON UNO MISMO', type: 'likert', options: [
        { value: 0, label: 'Me siento igual respecto a mí mismo que siempre' },
        { value: 1, label: 'He perdido confianza en mí mismo' },
        { value: 2, label: 'Estoy decepcionado de mí mismo' },
        { value: 3, label: 'No me gusto a mí mismo' }
      ]},
      { id: 'q8', text: 'AUTOCRÍTICA', type: 'likert', options: [
        { value: 0, label: 'No me critico o culpo más de lo habitual' },
        { value: 1, label: 'Soy más crítico conmigo mismo de lo que solía ser' },
        { value: 2, label: 'Me critico por todos mis errores' },
        { value: 3, label: 'Me culpo por todo lo malo que sucede' }
      ]},
      { id: 'q9', text: 'PENSAMIENTOS O DESEOS SUICIDAS', type: 'likert', options: [
        { value: 0, label: 'No tengo ningún pensamiento de suicidio' },
        { value: 1, label: 'Tengo pensamientos de suicidio, pero no los llevaría a cabo' },
        { value: 2, label: 'Me gustaría suicidarme' },
        { value: 3, label: 'Me suicidaría si tuviera la oportunidad' }
      ]},
      { id: 'q10', text: 'LLANTO', type: 'likert', options: [
        { value: 0, label: 'No lloro más de lo habitual' },
        { value: 1, label: 'Lloro más de lo que solía hacerlo' },
        { value: 2, label: 'Lloro por cualquier pequeñez' },
        { value: 3, label: 'Siento ganas de llorar pero no puedo' }
      ]},
      { id: 'q11', text: 'AGITACIÓN', type: 'likert', options: [
        { value: 0, label: 'No estoy más inquieto o nervioso que lo habitual' },
        { value: 1, label: 'Me siento más inquieto o nervioso que lo habitual' },
        { value: 2, label: 'Estoy tan inquieto que me es difícil quedarme quieto' },
        { value: 3, label: 'Estoy tan inquieto que tengo que estar moviéndome o haciendo algo' }
      ]},
      { id: 'q12', text: 'PÉRDIDA DE INTERÉS', type: 'likert', options: [
        { value: 0, label: 'No he perdido interés en otras personas o actividades' },
        { value: 1, label: 'Estoy menos interesado en otras personas o cosas que antes' },
        { value: 2, label: 'He perdido casi todo el interés en otras personas o cosas' },
        { value: 3, label: 'Me es difícil interesarme en algo' }
      ]},
      { id: 'q13', text: 'INDECISIÓN', type: 'likert', options: [
        { value: 0, label: 'Tomo decisiones tan bien como siempre' },
        { value: 1, label: 'Me resulta más difícil tomar decisiones que lo habitual' },
        { value: 2, label: 'Tengo mucha más dificultad para tomar decisiones que lo habitual' },
        { value: 3, label: 'Tengo problemas para tomar cualquier decisión' }
      ]},
      { id: 'q14', text: 'DESVALORIZACIÓN', type: 'likert', options: [
        { value: 0, label: 'No siento que sea inútil' },
        { value: 1, label: 'No me considero tan valioso y útil como solía ser' },
        { value: 2, label: 'Me siento más inútil comparado con otras personas' },
        { value: 3, label: 'Me siento completamente inútil' }
      ]},
      { id: 'q15', text: 'PÉRDIDA DE ENERGÍA', type: 'likert', options: [
        { value: 0, label: 'Tengo tanta energía como siempre' },
        { value: 1, label: 'Tengo menos energía de la que solía tener' },
        { value: 2, label: 'No tengo suficiente energía para hacer muchas cosas' },
        { value: 3, label: 'No tengo energía para hacer nada' }
      ]},
      { id: 'q16', text: 'CAMBIOS EN EL PATRÓN DE SUEÑO', type: 'likert', options: [
        { value: 0, label: 'No he experimentado ningún cambio en mi patrón de sueño' },
        { value: 1, label: 'Duermo algo más de lo habitual / Duermo algo menos de lo habitual' },
        { value: 2, label: 'Duermo mucho más de lo habitual / Duermo mucho menos de lo habitual' },
        { value: 3, label: 'Duermo la mayor parte del día / Me despierto 1-2 horas más temprano y no puedo volver a dormir' }
      ]},
      { id: 'q17', text: 'IRRITABILIDAD', type: 'likert', options: [
        { value: 0, label: 'No estoy más irritable que lo habitual' },
        { value: 1, label: 'Estoy más irritable que lo habitual' },
        { value: 2, label: 'Estoy mucho más irritable que lo habitual' },
        { value: 3, label: 'Estoy irritable todo el tiempo' }
      ]},
      { id: 'q18', text: 'CAMBIOS EN EL APETITO', type: 'likert', options: [
        { value: 0, label: 'No he experimentado ningún cambio en mi apetito' },
        { value: 1, label: 'Mi apetito es algo menor de lo habitual / Mi apetito es algo mayor de lo habitual' },
        { value: 2, label: 'Mi apetito es mucho menor que antes / Mi apetito es mucho mayor que antes' },
        { value: 3, label: 'No tengo apetito en absoluto / Tengo ganas de comer todo el tiempo' }
      ]},
      { id: 'q19', text: 'DIFICULTAD DE CONCENTRACIÓN', type: 'likert', options: [
        { value: 0, label: 'Puedo concentrarme tan bien como siempre' },
        { value: 1, label: 'No puedo concentrarme tan bien como antes' },
        { value: 2, label: 'Me es difícil concentrarme en algo por mucho tiempo' },
        { value: 3, label: 'No puedo concentrarme en nada' }
      ]},
      { id: 'q20', text: 'CANSANCIO O FATIGA', type: 'likert', options: [
        { value: 0, label: 'No estoy más cansado o fatigado que lo habitual' },
        { value: 1, label: 'Me canso o fatigo más fácilmente que lo habitual' },
        { value: 2, label: 'Estoy demasiado cansado o fatigado para hacer muchas cosas que solía hacer' },
        { value: 3, label: 'Estoy demasiado cansado o fatigado para hacer la mayoría de las cosas que solía hacer' }
      ]},
      { id: 'q21', text: 'PÉRDIDA DE INTERÉS EN EL SEXO', type: 'likert', options: [
        { value: 0, label: 'No he notado ningún cambio reciente en mi interés por el sexo' },
        { value: 1, label: 'Estoy menos interesado en el sexo de lo que solía estar' },
        { value: 2, label: 'Estoy mucho menos interesado en el sexo ahora' },
        { value: 3, label: 'He perdido completamente el interés en el sexo' }
      ]}
    ],
    interpretationData: [
      { from: 0, to: 13, severity: 'Baja', summary: 'Sintomatología depresiva mínima. Los síntomas son bajos o inexistentes.' },
      { from: 14, to: 19, severity: 'Leve', summary: 'Sintomatología depresiva leve. Puede que experimente algunos síntomas que no son severos.' },
      { from: 20, to: 28, severity: 'Moderada', summary: 'Sintomatología depresiva moderada. Se experimentan varios síntomas que pueden interferir con el funcionamiento diario.' },
      { from: 29, to: 63, severity: 'Alta', summary: 'Sintomatología depresiva severa. Los síntomas son intensos y persistentes, afectando significativamente la vida diaria.' }
    ]
  },
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
