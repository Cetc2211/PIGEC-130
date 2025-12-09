export type LikertScaleOption = {
  value: number;
  label: string;
};

export type Question = {
  id: string;
  text: string;
  type: 'likert' | 'open';
  options?: LikertScaleOption[]; // Opciones específicas para esta pregunta
  includeInScore?: boolean; // Por defecto es true. Si es false, no se suma al score.
  scoring?: { // Lógica de puntuación personalizada por coincidencia
    type: 'match';
    value: number;
  } | {
    type: 'aq-10';
    agreesIsOne: boolean; // Si es true, "De acuerdo" da 1 punto. Si es false, "En desacuerdo" da 1 punto.
  };
  scoringDirection?: 'Directa' | 'Inversa'; // Para puntuación directa o inversa
};

export type Interpretation = {
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Moderada-Grave' | 'Alta' | 'Mínima' | 'Grave' | 'Bajo' | 'Moderado' | 'Alto' | 'Positivo' | 'Negativo' | 'Optimista' | 'Intermedio' | 'Pesimista' | 'Vulnerabilidad Depresiva' | 'Vulnerabilidad Ansiosa' | 'Mixta/Típica' | 'Específico y Vívido' | 'Genérico/Ambiguo' | 'Abstracto/Vision de Túnel';
    summary: string;
}

export type InterpretationRule = {
    from: number;
    to: number;
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Moderada-Grave' | 'Alta' | 'Mínima' | 'Grave' | 'Bajo' | 'Moderado' | 'Alto' | 'Positivo' | 'Negativo' | 'Optimista' | 'Intermedio' | 'Pesimista' | 'Vulnerabilidad Depresiva' | 'Vulnerabilidad Ansiosa' | 'Mixta/Típica' | 'Específico y Vívido' | 'Genérico/Ambiguo' | 'Abstracto/Vision de Túnel';
    summary: string;
};

export type QuestionnaireSection = {
  sectionId: string;
  name: string;
  instructions?: string;
  likertScale: LikertScaleOption[];
  questions: Question[];
};

export type Questionnaire = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  // Un cuestionario puede tener una o más secciones.
  sections: QuestionnaireSection[]; 
  // La interpretación puede ser más compleja y depender de la sección, por ahora se mantiene global.
  interpretationData: InterpretationRule[]; 
};


const questionnairesData: Questionnaire[] = [
  {
    id: 'phq-9',
    name: 'Cuestionario de Salud del Paciente (PHQ-9)',
    description: 'Instrumento de 9 ítems para el cribado, diagnóstico y medición de la severidad de la depresión mayor, basado en criterios del DSM.',
    category: 'Tamizaje Inicial de Seguridad y Severidad (T-I S)',
    subcategory: 'Seguridad y Severidad',
    sections: [
      {
        sectionId: 'main',
        name: 'PHQ-9 (Ítems de Severidad)',
        instructions: 'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias por cualquiera de los siguientes problemas?',
        likertScale: [
          { "value": 0, "label": "Nunca" },
          { "value": 1, "label": "Varios días" },
          { "value": 2, "label": "Más de la mitad de días" },
          { "value": 3, "label": "Casi todos los días" }
        ],
        questions: [
          { id: 'phq9_q1', text: 'Poco interés o placer en hacer cosas', type: 'likert' },
          { id: 'phq9_q2', text: 'Se ha sentido decaído, deprimido o sin esperanzas', type: 'likert' },
          { id: 'phq9_q3', text: 'Dificultad para dormir o permanecer dormido, o dormir demasiado', type: 'likert' },
          { id: 'phq9_q4', text: 'Se ha sentido cansado o con poca energía', type: 'likert' },
          { id: 'phq9_q5', text: 'Sin apetito o ha comido en exceso', type: 'likert' },
          { id: 'phq9_q6', text: 'Se ha sentido mal con usted mismo, que es un fracaso o que ha quedado mal con usted mismo o su familia', type: 'likert' },
          { id: 'phq9_q7', text: 'Dificultad para concentrarse en cosas como leer el periódico o ver TV', type: 'likert' },
          { id: 'phq9_q8', text: '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? O lo contrario, muy inquieto o agitado, moviéndose más de lo usual', type: 'likert' },
          { id: 'phq9_q9', text: 'Pensamientos de que estaría mejor muerto o de lastimarse de alguna manera', type: 'likert' }
        ]
      },
      {
        sectionId: 'functional',
        name: 'Pregunta de Deterioro Funcional',
        instructions: 'Esta pregunta evalúa cómo los problemas han afectado su funcionamiento diario.',
        likertScale: [],
        questions: [
          {
            id: 'phq9_q10',
            text: 'Si marcó cualquiera de estos problemas, ¿qué tanta dificultad le han dado estos problemas para hacer su trabajo, encargarse de las tareas del hogar, o llevarse bien con otras personas?',
            type: 'likert',
            includeInScore: false,
            options: [
              { "value": 0, "label": "Ninguna dificultad" },
              { "value": 1, "label": "Algo de dificultad" },
              { "value": 2, "label": "Mucha dificultad" },
              { "value": 3, "label": "Extrema dificultad" }
            ]
          }
        ]
      }
    ],
    interpretationData: [
      { from: 0, to: 4, severity: 'Mínima', summary: "Depresión mínima. Monitoreo clínico o sin intervención." },
      { from: 5, to: 9, severity: 'Leve', summary: "Depresión leve. Seguimiento/apoyo; considerar tratamiento si persiste." },
      { from: 10, to: 14, severity: 'Moderada', summary: "Depresión moderada. Considerar tratamiento con psicoterapia o medicación." },
      { from: 15, to: 19, severity: 'Moderada-Grave', summary: "Depresión moderadamente severa. Tratamiento activo: psicoterapia más medicación." },
      { from: 20, to: 27, severity: 'Grave', summary: "Depresión severa. Tratamiento inmediato e intensivo." }
    ]
  },
  {
    id: 'gad-7',
    name: 'Trastorno de Ansiedad Generalizada (GAD-7)',
    description: 'Una herramienta de 7 preguntas para la detección, cribado y medición de la severidad del Trastorno de Ansiedad Generalizada (TAG).',
    category: 'Tamizaje Inicial de Seguridad y Severidad (T-I S)',
    subcategory: 'Seguridad y Severidad',
    sections: [{
      sectionId: 'main',
      name: 'Escala de Ansiedad Generalizada GAD-7',
      instructions: 'Durante las últimas 2 semanas, ¿qué tan seguido le han molestado los siguientes problemas?',
      likertScale: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Varios días' },
        { value: 2, label: 'Más de la mitad de días' },
        { value: 3, label: 'Casi todos los días' }
      ],
      questions: [
        { id: 'gad-7_q1', text: 'Sentirse nervioso, ansioso o con los nervios de punta', type: 'likert' },
        { id: 'gad-7_q2', text: 'No poder dejar de preocuparse o controlar la preocupación', type: 'likert' },
        { id: 'gad-7_q3', text: 'Preocuparse demasiado por diferentes cosas', type: 'likert' },
        { id: 'gad-7_q4', text: 'Dificultad para relajarse', type: 'likert' },
        { id: 'gad-7_q5', text: 'Estar tan inquieto que es difícil permanecer sentado', type: 'likert' },
        { id: 'gad-7_q6', text: 'Molestarse o ponerse irritable fácilmente', type: 'likert' },
        { id: 'gad-7_q7', text: 'Sentir miedo como si algo terrible fuera a suceder', type: 'likert' }
      ],
    }],
    interpretationData: [
      { from: 0, to: 4, severity: 'Mínima', summary: 'Ansiedad no significativa.' },
      { from: 5, to: 9, severity: 'Leve', summary: 'Ansiedad leve. Sugiere monitoreo.' },
      { from: 10, to: 14, severity: 'Moderada', summary: 'Ansiedad moderada. Consistente con un posible Trastorno de Ansiedad Generalizada (TAG).' },
      { from: 15, to: 21, severity: 'Grave', summary: 'Ansiedad grave. Alta preocupación que interfiere con el funcionamiento (Criterio D del TAG, DSM-5-TR).' }
    ]
  },
  {
    id: 'bai',
    name: 'Inventario de Ansiedad de Beck (BAI)',
    description: 'Cuestionario de 21 ítems que mide la severidad de los síntomas de ansiedad física y cognitiva experimentados durante la última semana.',
    category: 'Tamizaje Inicial de Seguridad y Severidad (T-I S)',
    subcategory: 'Soporte y Diferencial',
    sections: [{
      sectionId: 'main',
      name: 'Inventario de Ansiedad de Beck',
      instructions: "Indique cuánto le ha molestado cada síntoma durante la última semana, incluyendo hoy, marcando con una X en el espacio correspondiente.",
      likertScale: [
        { "value": 0, "label": "NADA" },
        { "value": 1, "label": "LEVE" },
        { "value": 2, "label": "MODERADO" },
        { "value": 3, "label": "SEVERO" }
      ],
      questions: [
        { "id": "bai_q1", "text": "Entumecimiento u hormigueo", "type": "likert" },
        { "id": "bai_q2", "text": "Sensación de calor", "type": "likert" },
        { "id": "bai_q3", "text": "Temblor en las piernas", "type": "likert" },
        { "id": "bai_q4", "text": "Incapacidad para relajarse", "type": "likert" },
        { "id": "bai_q5", "text": "Miedo a que suceda lo peor", "type": "likert" },
        { "id": "bai_q6", "text": "Mareo o aturdimiento", "type": "likert" },
        { "id": "bai_q7", "text": "Palpitaciones o taquicardia", "type": "likert" },
        { "id": "bai_q8", "text": "Sensación de inestabilidad", "type": "likert" },
        { "id": "bai_q9", "text": "Sensación de terror", "type": "likert" },
        { "id": "bai_q10", "text": "Nerviosismo", "type": "likert" },
        { "id": "bai_q11", "text": "Sensación de ahogo", "type": "likert" },
        { "id": "bai_q12", "text": "Temblor de manos", "type": "likert" },
        { "id": "bai_q13", "text": "Temblor generalizado o estremecimiento", "type": "likert" },
        { "id": "bai_q14", "text": "Miedo a perder el control", "type": "likert" },
        { "id": "bai_q15", "text": "Dificultad para respirar", "type": "likert" },
        { "id": "bai_q16", "text": "Miedo a morir", "type": "likert" },
        { "id": "bai_q17", "text": "Asustado", "type": "likert" },
        { "id": "bai_q18", "text": "Indigestión o malestar abdominal", "type": "likert" },
        { "id": "bai_q19", "text": "Sensación de desmayo", "type": "likert" },
        { "id": "bai_q20", "text": "Rubor facial", "type": "likert" },
        { "id": "bai_q21", "text": "Sudoración (no debida al calor)", "type": "likert" }
      ],
    }],
    interpretationData: [
      { from: 0, to: 9, severity: 'Baja', summary: 'Ansiedad muy baja o ausente.' },
      { from: 10, to: 15, severity: 'Leve', summary: 'Ansiedad leve.' },
      { from: 16, to: 25, severity: 'Moderada', summary: 'Ansiedad moderada. Sugiere T. de Ansiedad específico (p. ej., T. de Pánico).' },
      { from: 26, to: 63, severity: 'Alta', summary: 'Ansiedad grave. Alta activación fisiológica y malestar significativo.' },
    ]
  },
  {
    name: "Cociente de Espectro Autista (AQ-10)",
    id: "aq-10",
    description: "Cuestionario de 10 ítems para el cribado rápido de rasgos del espectro autista en adultos.",
    category: "Tamizaje Inicial de Seguridad y Severidad (T-I S)",
    subcategory: "Soporte y Diferencial",
    sections: [{
        sectionId: "main",
        name: "AQ-10",
        instructions: "Responda a las siguientes afirmaciones según qué tan bien describen su experiencia.",
        likertScale: [
            { value: 3, label: "Totalmente de acuerdo" },
            { value: 2, label: "Ligeramente de acuerdo" },
            { value: 1, label: "Ligeramente en desacuerdo" },
            { value: 0, label: "Totalmente en desacuerdo" },
        ],
        questions: [
            { id: "aq10_q1", text: "Frecuentemente noto pequeños sonidos que otros no notan.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: true } },
            { id: "aq10_q2", text: "Usualmente me concentro más en la imagen general que en los pequeños detalles.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q3", text: "Encuentro fácil hacer más de una cosa a la vez.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q4", text: "Si hay una interrupción, puedo volver a lo que estaba haciendo muy rápidamente.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q5", text: "Encuentro fácil 'leer entre líneas' cuando alguien me habla.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q6", text: "Sé cómo saber si alguien que me escucha se está aburriendo.", type: 'likert', scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q7", text: "Cuando leo una historia, encuentro difícil imaginar cómo se ven los personajes.", type: "likert", scoring: { type: 'aq-10', agreesIsOne: true } },
            { id: "aq10_q8", text: "Me gusta coleccionar información sobre categorías de cosas (p. ej., tipos de carros, pájaros, trenes, plantas).", type: "likert", scoring: { type: 'aq-10', agreesIsOne: true } },
            { id: 'aq10_q9', text: "Encuentro fácil entender lo que otras personas están pensando o sintiendo.", type: "likert", scoring: { type: 'aq-10', agreesIsOne: false } },
            { id: "aq10_q10", text: "Encuentro difícil entender la intención de las personas.", type: "likert", scoring: { type: 'aq-10', agreesIsOne: true } },
        ]
    }],
    interpretationData: [
        { from: 0, to: 5, severity: 'Negativo', summary: 'Cribado negativo para rasgos del Espectro Autista.' },
        { from: 6, to: 10, severity: 'Positivo', summary: 'Cribado positivo. Se requiere una Evaluación Diagnóstica Integral de TEA.' },
    ]
  },
  {
    id: 'ssi',
    name: 'Escala de Ideación Suicida de Beck (SSI)',
    description: 'Escala de 21 ítems que evalúa la severidad y características de la ideación suicida actual. Es heteroaplicada.',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Riesgo y Diagnóstico',
    sections: [{
      sectionId: 'main',
      name: 'Escala de Ideación Suicida de Beck (Ítems 1-19)',
      instructions: "Elija la afirmación en cada grupo que mejor describa sus sentimientos y pensamientos durante la última semana, incluyendo hoy.",
      likertScale: [], // Opciones por pregunta
      questions: [
        { id: 'ssi_q1', type: 'likert', text: 'DESEO DE VIVIR', options: [
          { value: 0, label: 'Moderado a fuerte' }, { value: 1, label: 'Débil' }, { value: 2, label: 'Ninguno' }
        ]},
        { id: 'ssi_q2', type: 'likert', text: 'DESEO DE MORIR', options: [
          { value: 0, label: 'Ninguno' }, { value: 1, label: 'Débil' }, { value: 2, label: 'Moderado a fuerte' }
        ]},
        { id: 'ssi_q3', type: 'likert', text: 'RAZONES PARA VIVIR/MORIR', options: [
          { value: 0, label: 'Las razones para vivir superan las de morir' }, { value: 1, label: 'Iguales' }, { value: 2, label: 'Las razones para morir superan las de vivir' }
        ]},
        { id: 'ssi_q4', type: 'likert', text: 'DESEO DE INTENTAR SUICIDIO ACTIVO', options: [
          { value: 0, label: 'Ninguno' }, { value: 1, label: 'Débil' }, { value: 2, label: 'Moderado a fuerte' }
        ]},
        { id: 'ssi_q5', type: 'likert', text: 'DESEO SUICIDA PASIVO', options: [
          { value: 0, label: 'Tomaría precauciones para salvar su vida' }, { value: 1, label: 'Dejaría vida/muerte al azar' }, { value: 2, label: 'Evitaría pasos para salvar su vida' }
        ]},
        { id: 'ssi_q6', type: 'likert', text: 'DIMENSIÓN TEMPORAL', options: [
          { value: 0, label: 'Breve, períodos pasajeros' }, { value: 1, label: 'Períodos más largos' }, { value: 2, label: 'Continuo o casi continuo' }
        ]},
        { id: 'ssi_q7', type: 'likert', text: 'FRECUENCIA', options: [
          { value: 0, label: 'Rara, ocasional' }, { value: 1, label: 'Intermitente' }, { value: 2, label: 'Persistente o continuo' }
        ]},
        { id: 'ssi_q8', type: 'likert', text: 'ACTITUD HACIA LA IDEACIÓN', options: [
          { value: 0, label: 'Rechazo' }, { value: 1, label: 'Ambivalente, indiferente' }, { value: 2, label: 'Aceptación' }
        ]},
        { id: 'ssi_q9', type: 'likert', text: 'CONTROL SOBRE LA ACCIÓN SUICIDA', options: [
          { value: 0, label: 'Tiene control/no lo haría' }, { value: 1, label: 'Inseguro del control' }, { value: 2, label: 'No tiene control' }
        ]},
        { id: 'ssi_q10', type: 'likert', text: 'FACTORES DISUASIVOS', options: [
          { value: 0, label: 'No lo intentaría por familia, religión, etc.' }, { value: 1, label: 'Cierta preocupación por disuasivos' }, { value: 2, label: 'Mínima o ninguna preocupación' }
        ]},
        { id: 'ssi_q11', type: 'likert', text: 'RAZONES DEL INTENTO CONTEMPLADO', options: [
          { value: 0, label: 'Manipular, llamar atención' }, { value: 1, label: 'Combinación de 0 y 2' }, { value: 2, label: 'Escape, finalizar problemas' }
        ]},
        { id: 'ssi_q12', type: 'likert', text: 'MÉTODO: ESPECIFICIDAD/PLANIFICACIÓN', options: [
          { value: 0, label: 'No considerado' }, { value: 1, label: 'Considerado pero no elaborado' }, { value: 2, label: 'Elaborado y detallado' }
        ]},
        { id: 'ssi_q13', type: 'likert', text: 'MÉTODO: DISPONIBILIDAD/OPORTUNIDAD', options: [
          { value: 0, label: 'Método no disponible, no hay oportunidad' }, { value: 1, label: 'Método tomaría tiempo/esfuerzo' }, { value: 2, label: 'Método disponible/oportunidad presente o anticipada' }
        ]},
        { id: 'ssi_q14', type: "likert", text: "SENTIDO DE 'CAPACIDAD'", options: [
          { value: 0, label: 'No tiene valor, muy débil' }, { value: 1, label: 'Inseguro del valor' }, { value: 2, label: 'Seguro de tener valor' }
        ]},
        { id: 'ssi_q15', type: 'likert', text: 'EXPECTATIVA/ANTICIPACIÓN DEL INTENTO', options: [
          { value: 0, label: 'No' }, { value: 1, label: 'Incierto' }, { value: 2, label: 'Sí' }
        ]},
        { id: 'ssi_q16', type: 'likert', text: 'PREPARACIÓN REAL', options: [
          { value: 0, label: 'Ninguna' }, { value: 1, label: 'Parcial (empezar nota)' }, { value: 2, label: 'Completa (nota terminada, arreglos)' }
        ]},
        { id: 'ssi_q17', type: 'likert', text: 'NOTA SUICIDA', options: [
          { value: 0, label: 'No escribió nota' }, { value: 1, label: 'Empezada pero no terminada' }, { value: 2, label: 'Nota completa' }
        ]},
        { id: 'ssi_q18', type: 'likert', text: 'ACTOS FINALES', options: [
          { value: 0, label: 'Ninguno' }, { value: 1, label: 'Pensamientos o algunos arreglos' }, { value: 2, label: 'Arreglos definitivos' }
        ]},
        { id: 'ssi_q19', type: 'likert', text: 'ENGAÑO/OCULTAMIENTO', options: [
          { value: 0, label: 'Reveló ideas abiertamente' }, { value: 1, label: 'Evitó el tema' }, { value: 2, label: 'Engañó, ocultó' }
        ]},
      ]
    }, {
      sectionId: 'informativo',
      name: 'Sección Informativa (No se suma a la puntuación)',
      instructions: 'Las siguientes preguntas son para fines informativos.',
      likertScale: [],
      questions: [
        { id: 'ssi_q20', type: 'likert', text: 'INTENTOS PREVIOS', includeInScore: false, options: [
          { value: 0, label: 'Ninguno' }, { value: 1, label: 'Uno' }, { value: 2, label: 'Más de uno' }
        ]},
        { id: 'ssi_q21', type: 'likert', text: 'INTENCIÓN DE MORIR EN ÚLTIMO INTENTO', includeInScore: false, options: [
          { value: 0, label: 'Baja' }, { value: 1, label: 'Moderada, ambivalente' }, { value: 2, label: 'Alta' }
        ]}
      ]
    }],
    interpretationData: [
      { from: 0, to: 1, severity: 'Mínima', summary: 'Ideación vaga o ausente.' },
      { from: 2, to: 5, severity: 'Leve', summary: 'Ideación activa (deseo de morir) sin plan específico.' },
      { from: 6, to: 15, severity: 'Moderada', summary: 'Ideación significativa con algunos planes o métodos considerados.' },
      { from: 16, to: 38, severity: 'Grave', summary: 'Ideación grave con plan estructurado, intención alta y/o intentos no letales previos. Activación de Protocolo de Crisis (Perfil D).' }
    ]
  },
  {
    id: 'bdi-ii',
    name: 'Inventario de Depresión de Beck-II (BDI-II)',
    description: 'Cuestionario de 21 ítems para evaluar la severidad de los síntomas de depresión en las últimas dos semanas.',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Riesgo y Diagnóstico',
    sections: [{
      sectionId: 'main',
      name: 'Inventario de Depresión de Beck-II',
      instructions: "Lea con atención cada grupo de afirmaciones y elija la afirmación de cada grupo que mejor describa el modo como se ha sentido durante las últimas dos semanas, incluyendo el día de hoy.",
      likertScale: [], // Opciones por pregunta
      questions: [
        { id: 'bdi_q1', type: 'likert', text: 'TRISTEZA', options: [
          { value: 0, label: 'No me siento triste' },
          { value: 1, label: 'Me siento triste gran parte del tiempo' },
          { value: 2, label: 'Estoy triste todo el tiempo' },
          { value: 3, label: 'Estoy tan triste o infeliz que no puedo soportarlo' }
        ]},
        { id: 'bdi_q2', type: 'likert', text: 'PESIMISMO', options: [
          { value: 0, label: 'No estoy desalentado respecto a mi futuro' },
          { value: 1, label: 'Me siento más desalentado respecto a mi futuro que antes' },
          { value: 2, label: 'No espero que las cosas funcionen para mí' },
          { value: 3, label: 'Siento que mi futuro es desesperanzador y que sólo empeorará' }
        ]},
        { id: 'bdi_q3', type: 'likert', text: 'FRACASO', options: [
          { value: 0, label: 'No me siento como un fracasado' },
          { value: 1, label: 'He fracasado más de lo que debería' },
          { value: 2, label: 'Cuando miro hacia atrás veo muchos fracasos' },
          { value: 3, label: 'Siento que como persona soy un fracaso total' }
        ]},
        { id: 'bdi_q4', type: 'likert', text: 'PÉRDIDA DE PLACER', options: [
          { value: 0, label: 'Obtengo tanto placer como siempre de las cosas que disfruto' },
          { value: 1, label: 'No disfruto de las cosas tanto como antes' },
          { value: 2, label: 'Obtengo muy poco placer de las cosas que solía disfrutar' },
          { value: 3, label: 'No obtengo ningún placer de las cosas que solía disfrutar' }
        ]},
        { id: 'bdi_q5', type: 'likert', text: 'SENTIMIENTOS DE CULPA', options: [
          { value: 0, label: 'No me siento particularmente culpable' },
          { value: 1, label: 'Me siento culpable respecto a muchas cosas que he hecho o debería haber hecho' },
          { value: 2, label: 'Me siento bastante culpable la mayor parte del tiempo' },
          { value: 3, label: 'Me siento culpable todo el tiempo' }
        ]},
        { id: 'bdi_q6', type: 'likert', text: 'SENTIMIENTOS DE CASTIGO', options: [
          { value: 0, label: 'No siento que esté siendo castigado' },
          { value: 1, label: 'Siento que podría ser castigado' },
          { value: 2, label: 'Espero ser castigado' },
          { value: 3, label: 'Siento que estoy siendo castigado' }
        ]},
        { id: 'bdi_q7', type: 'likert', text: 'DISCONFORMIDAD CON UNO MISMO', options: [
          { value: 0, label: 'Me siento igual respecto a mí mismo que siempre' },
          { value: 1, label: 'He perdido confianza en mí mismo' },
          { value: 2, label: 'Estoy decepcionado de mí mismo' },
          { value: 3, label: 'No me gusto a mí mismo' }
        ]},
        { id: 'bdi_q8', type: 'likert', text: 'AUTOCRÍTICA', options: [
          { value: 0, label: 'No me critico o culpo más de lo que habitual' },
          { value: 1, label: 'Soy más crítico conmigo mismo de lo que solía ser' },
          { value: 2, label: 'Me critico por todos mis errores' },
          { value: 3, label: 'Me culpo por todo lo malo que sucede' }
        ]},
        { id: 'bdi_q9', type: 'likert', text: 'PENSAMIENTOS O DESEOS SUICIDAS', options: [
          { value: 0, label: 'No tengo ningún pensamiento de suicidio' },
          { value: 1, label: 'Tengo pensamientos de suicidio, pero no los llevaría a cabo' },
          { value: 2, label: 'Me gustaría suicidarme' },
          { value: 3, label: 'Me suicidaría si tuviera la oportunidad' }
        ]},
        { id: 'bdi_q10', type: 'likert', text: 'LLANTO', options: [
          { value: 0, label: 'No lloro más de lo habitual' },
          { value: 1, label: 'Lloro más de lo que solía hacerlo' },
          { value: 2, label: 'Lloro por cualquier pequeñez' },
          { value: 3, label: 'Siento ganas de llorar pero no puedo' }
        ]},
        { id: 'bdi_q11', type: 'likert', text: 'AGITACIÓN', options: [
          { value: 0, label: 'No estoy más inquieto o nervioso que lo habitual' },
          { value: 1, label: 'Me siento más inquieto o nervioso que lo habitual' },
          { value: 2, label: 'Estoy tan inquieto que me es difícil quedarme quieto' },
          { value: 3, label: 'Estoy tan inquieto que tengo que estar moviéndome o haciendo algo' }
        ]},
        { id: 'bdi_q12', type: 'likert', text: 'PÉRDIDA DE INTERÉS', options: [
          { value: 0, label: 'No he perdido interés en otras personas o actividades' },
          { value: 1, label: 'Estoy menos interesado en otras personas o cosas que antes' },
          { value: 2, label: 'He perdido casi todo el interés en otras personas o cosas' },
          { value: 3, label: 'Me es difícil interesarme en algo' }
        ]},
        { id: 'bdi_q13', type: 'likert', text: 'INDECISIÓN', options: [
          { value: 0, label: 'Tomo decisiones tan bien como siempre' },
          { value: 1, label: 'Me resulta más difícil tomar decisiones que lo habitual' },
          { value: 2, label: 'Tengo mucha más dificultad para tomar decisiones que lo habitual' },
          { value: 3, label: 'Tengo problemas para tomar cualquier decisión' }
        ]},
        { id: 'bdi_q14', type: 'likert', text: 'DESVALORIZACIÓN', options: [
          { value: 0, label: 'No siento que sea inútil' },
          { value: 1, label: 'No me considero tan valioso y útil como solía ser' },
          { value: 2, label: 'Me siento más inútil comparado con otras personas' },
          { value: 3, label: 'Me siento completamente inútil' }
        ]},
        { id: 'bdi_q15', type: 'likert', text: 'PÉRDIDA DE ENERGÍA', options: [
          { value: 0, label: 'Tengo tanta energía como siempre' },
          { value: 1, label: 'Tengo menos energía de la que solía tener' },
          { value: 2, label: 'No tengo suficiente energía para hacer muchas cosas' },
          { value: 3, label: 'No tengo energía para hacer nada' }
        ]},
        { id: 'bdi_q16', type: 'likert', text: 'CAMBIOS EN EL PATRÓN DE SUEÑO', options: [
          { value: 0, label: 'No he experimentado ningún cambio en mi patrón de sueño' },
          { value: 1, label: 'Duermo algo más de lo habitual / Duermo algo menos de lo habitual' },
          { value: 2, label: 'Duermo mucho más de lo habitual / Duermo mucho menos de lo habitual' },
          { value: 3, label: 'Duermo la mayor parte del día / Me despierto 1-2 horas más temprano y no puedo volver a dormir' }
        ]},
        { id: 'bdi_q17', type: 'likert', text: 'IRRITABILIDAD', options: [
          { value: 0, label: 'No estoy más irritable que lo habitual' },
          { value: 1, label: 'Estoy más irritable que lo habitual' },
          { value: 2, label: 'Estoy mucho más irritable que lo habitual' },
          { value: 3, label: 'Estoy irritable todo el tiempo' }
        ]},
        { id: 'bdi_q18', type: 'likert', text: 'CAMBIOS EN EL APETITO', options: [
          { value: 0, label: 'No he experimentado ningún cambio en mi apetito' },
          { value: 1, label: 'Mi apetito es algo menor de lo habitual / Mi apetito es algo mayor de lo habitual' },
          { value: 2, label: 'Mi apetito es mucho menor que antes / Mi apetito es mucho mayor que antes' },
          { value: 3, label: 'No tengo apetito en absoluto / Tengo ganas de comer todo el tiempo' }
        ]},
        { id: 'bdi_q19', type: 'likert', text: 'DIFICULTAD DE CONCENTRACIÓN', options: [
          { value: 0, label: 'Puedo concentrarme tan bien como siempre' },
          { value: 1, label: 'No puedo concentrarme tan bien como antes' },
          { value: 2, label: 'Me es difícil concentrarme en algo por mucho tiempo' },
          { value: 3, label: 'No puedo concentrarme en nada' }
        ]},
        { id: 'bdi_q20', type: 'likert', text: 'CANSANCIO O FATIGA', options: [
          { value: 0, label: 'No estoy más cansado o fatigado que lo habitual' },
          { value: 1, label: 'Me canso o fatigo más fácilmente que lo habitual' },
          { value: 2, label: 'Estoy demasiado cansado o fatigado para hacer muchas cosas que solía hacer' },
          { value: 3, label: 'Estoy demasiado cansado o fatigado para hacer la mayoría de las cosas que solía hacer' }
        ]},
        { id: 'bdi_q21', type: 'likert', text: 'PÉRDIDA DE INTERÉS EN EL SEXO', options: [
          { value: 0, label: 'No he notado ningún cambio reciente en mi interés por el sexo' },
          { value: 1, label: 'Estoy menos interesado en el sexo de lo que solía estar' },
          { value: 2, label: 'Estoy mucho menos interesado en el sexo ahora' },
          { value: 3, label: 'He perdido completamente el interés en el sexo' }
        ]}
      ]
    }],
    interpretationData: [
      { from: 0, to: 13, severity: 'Mínima', summary: 'Sin depresión significativa o Subumbral.' },
      { from: 14, to: 19, severity: 'Leve', summary: 'Síntomas leves de depresión.' },
      { from: 20, to: 28, severity: 'Moderada', summary: 'Síntomas moderados de depresión. Se requiere atención clínica.' },
      { from: 29, to: 63, severity: 'Grave', summary: 'Síntomas graves de depresión. Posible indicador de TDM.' },
    ]
  },
  {
    id: 'bhs',
    name: 'Escala de Desesperanza de Beck (BHS)',
    description: 'Instrumento de 20 ítems de Verdadero/Falso para medir el grado de expectativas negativas sobre el futuro (desesperanza).',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Mecanismos Cognitivo-Conductuales',
    sections: [{
      sectionId: 'main',
      name: 'Escala de Desesperanza de Beck',
      instructions: "Lea las siguientes afirmaciones y marque si son VERDADERAS o FALSAS para usted durante la última semana.",
      likertScale: [
        { "value": 0, "label": "FALSO" },
        { "value": 1, "label": "VERDADERO" }
      ],
      questions: [
        { id: 'bhs_q1', text: 'Veo el futuro con esperanza y entusiasmo', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q2', text: 'Quizá debería abandonar todo porque no puedo hacer las cosas mejor', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q3', text: 'Cuando las cosas están mal, me ayuda pensar que no será así para siempre', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q4', text: 'No puedo imaginar cómo será mi vida dentro de 10 años', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q5', text: 'Tengo tiempo suficiente para realizar las cosas que más deseo hacer', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q6', text: 'En el futuro, espero tener éxito en lo que más me importa', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q7', text: 'Mi futuro me parece oscuro', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q8', text: 'Espero que me sucedan más cosas buenas que al resto de la gente', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q9', text: 'No tengo suerte y no hay razón para creer que la tendré en el futuro', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q10', text: 'Mis experiencias pasadas me han preparado bien para el futuro', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q11', text: 'Todo lo que puedo ver por delante es más desagradable que agradable', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q12', text: 'No espero conseguir lo que realmente quiero', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q13', text: 'Cuando pienso en el futuro, espero ser más feliz de lo que soy ahora', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q14', text: 'Las cosas nunca van a marchar de la forma que yo quiero', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q15', text: 'Tengo gran fe en el futuro', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q16', text: 'Nunca consigo lo que quiero, así que es absurdo querer algo', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q17', text: 'Es muy poco probable que en el futuro logre una satisfacción real', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q18', text: 'El futuro me parece vago e incierto', type: 'likert', scoring: { type: 'match', value: 1 } },
        { id: 'bhs_q19', text: 'Se pueden esperar más épocas buenas que malas', type: 'likert', scoring: { type: 'match', value: 0 } },
        { id: 'bhs_q20', text: 'Es inútil tratar de conseguir algo que deseo porque probablemente no lo conseguiré', type: 'likert', scoring: { type: 'match', value: 1 } }
      ],
    }],
    interpretationData: [
      { from: 0, to: 3, severity: 'Mínima', summary: 'Desesperanza mínima (normal). Las expectativas hacia el futuro son equilibradas o positivas.' },
      { from: 4, to: 8, severity: 'Leve', summary: 'Desesperanza leve. No presenta riesgo inminente de suicidio por este factor.' },
      { from: 9, to: 14, severity: 'Moderada', summary: 'Desesperanza moderada. Factor de riesgo significativo para la cronicidad y la conducta suicida.' },
      { from: 15, to: 20, severity: 'Grave', summary: 'Desesperanza severa. Predominio de expectativas pesimistas, indicando un riesgo suicida alto.' }
    ]
  },
  {
    id: 'bis-bas',
    name: 'Escalas de Activación/Inhibición Conductual (BIS/BAS)',
    description: 'Mide la sensibilidad de los sistemas de inhibición (BIS) y activación (BAS) conductual, dos sistemas neurobiológicos fundamentales de la personalidad.',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Mecanismos Cognitivo-Conductuales',
    sections: [
        {
            sectionId: 'bis',
            name: 'Escala BIS (Sensibilidad al Castigo)',
            instructions: 'Para cada afirmación, indique qué tan de acuerdo está.',
            likertScale: [
                { value: 1, label: 'Muy en desacuerdo' },
                { value: 2, label: 'Algo en desacuerdo' },
                { value: 3, label: 'Algo de acuerdo' },
                { value: 4, label: 'Muy de acuerdo' }
            ],
            questions: [
                { id: 'bisbas_q1', text: 'Si pienso que algo desagradable va a pasar, normalmente me pongo muy tenso/a.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q2', text: 'Criticas y regaños me duelen bastante.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q3', text: 'Me siento muy preocupado/a o tenso/a cuando creo que he hecho algo mal.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q4', text: 'Soy una persona bastante preocupada.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q5', text: 'Incluso si algo malo me pasa, rara vez me afecta mucho.', type: 'likert', scoringDirection: 'Inversa' },
                { id: 'bisbas_q6', text: 'Me siento ansioso/a cuando voy a ser criticado/a.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q7', text: 'Tengo muy pocas preocupaciones.', type: 'likert', scoringDirection: 'Inversa' }
            ]
        },
        {
            sectionId: 'bas',
            name: 'Escala BAS (Sensibilidad a la Recompensa)',
            instructions: 'Para cada afirmación, indique qué tan de acuerdo está.',
            likertScale: [
                { value: 1, label: 'Muy en desacuerdo' },
                { value: 2, label: 'Algo en desacuerdo' },
                { value: 3, label: 'Algo de acuerdo' },
                { value: 4, label: 'Muy de acuerdo' }
            ],
            questions: [
                { id: 'bisbas_q8', text: 'Cuando consigo algo que quiero, me siento emocionado/a y con energía.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q9', text: 'Cuando estoy haciendo algo que me gusta, me involucro mucho.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q10', text: 'Haría cualquier cosa por conseguir las cosas que me gustan.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q11', text: 'Me entusiasma y me excita mucho cuando estoy buscando cosas buenas.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q12', text: 'Cuando veo una oportunidad para algo que me gusta, me emociono inmediatamente.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q13', text: 'Busco la emoción y las nuevas sensaciones.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q14', text: 'Me encanta probar cosas nuevas.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q15', text: 'Me aburro fácilmente.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q16', text: 'Me dejo llevar por el momento.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q17', text: 'Hago lo que sea para obtener las cosas que quiero.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q18', text: 'Cuando las cosas buenas me suceden, me afecta fuertemente.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q19', text: 'Es más importante para mí actuar en el momento que pensar en el futuro.', type: 'likert', scoringDirection: 'Directa' },
                { id: 'bisbas_q20', text: 'A menudo hago cosas por capricho.', type: 'likert', scoringDirection: 'Directa' }
            ]
        }
    ],
    interpretationData: [
        { from: 0, to: 100, severity: 'Vulnerabilidad Depresiva', summary: 'La interpretación depende de la combinación de puntuaciones BIS y BAS.' }
    ]
  },
  {
    id: 'ymrs',
    name: 'Escala de Manía de Young (YMRS)',
    description: 'Instrumento de 11 ítems para evaluar la severidad de los síntomas maníacos. Es heteroaplicada por el clínico.',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Riesgo y Diagnóstico',
    sections: [{
        sectionId: 'main',
        name: 'YMRS',
        instructions: 'Evalúe al paciente y califique la severidad de cada síntoma durante las últimas 48 horas.',
        likertScale: [], // Custom options per question
        questions: [
            {
                id: 'ymrs_q1', text: '1. Estado de ánimo elevado', type: 'likert',
                options: [
                    { value: 0, label: 'Ausente' },
                    { value: 1, label: 'Levemente o posiblemente elevado' },
                    { value: 2, label: 'Elevación definida; optimista, alegre' },
                    { value: 3, label: 'Elevado, inapropiadamente eufórico' },
                    { value: 4, label: 'Riendo, cantando; claramente eufórico' }
                ]
            },
            {
                id: 'ymrs_q2', text: '2. Aumento de la actividad motora y energía', type: 'likert',
                options: [
                    { value: 0, label: 'Ausente' },
                    { value: 1, label: 'Algo aumentado' },
                    { value: 2, label: 'Aumento evidente; inquietud' },
                    { value: 3, label: 'Hiperactividad excesiva' },
                    { value: 4, label: 'Constantemente activo, sin descanso' }
                ]
            },
            {
                id: 'ymrs_q3', text: '3. Interés sexual', type: 'likert',
                options: [
                    { value: 0, label: 'Normal, no aumentado' },
                    { value: 1, label: 'Levemente aumentado' },
                    { value: 2, label: 'Definidamente aumentado' },
                    { value: 3, label: 'Ideas y actos sexuales espontáneos' },
                    { value: 4, label: 'Absorto en planes y actos sexuales' }
                ]
            },
            {
                id: 'ymrs_q4', text: '4. Sueño', type: 'likert',
                options: [
                    { value: 0, label: 'No reducido' },
                    { value: 1, label: 'Disminución de hasta un 25% del tiempo habitual' },
                    { value: 2, label: 'Disminución de hasta un 50% del tiempo habitual' },
                    { value: 3, label: 'Disminución de más del 75% del tiempo habitual' },
                    { value: 4, label: 'Niega necesidad de dormir' }
                ]
            },
            {
                id: 'ymrs_q5', text: '5. Irritabilidad', type: 'likert',
                options: [
                    { value: 0, label: 'Ausente' }, { value: 1, label: 'Subjetivamente aumentada' },
                    { value: 2, label: 'Irritable, pero no altera la entrevista' }, { value: 3, label: '' },
                    { value: 4, label: 'Hostil, se queja, no coopera' }, { value: 5, label: '' },
                    { value: 6, label: 'Amenazante, requiere control' }, { value: 7, label: '' },
                    { value: 8, label: 'Agresivo, destructivo' }
                ]
            },
            {
                id: 'ymrs_q6', text: '6. Habla (Tasa y Cantidad)', type: 'likert',
                options: [
                    { value: 0, label: 'Normal' }, { value: 1, label: 'Algo hablador' },
                    { value: 2, label: 'Hablador, difícil de interrumpir' }, { value: 3, label: '' },
                    { value: 4, label: 'Verborreico, ocupa la entrevista' }, { value: 5, label: '' },
                    { value: 6, label: 'Ininteligible por la velocidad' }, { value: 7, label: '' },
                    { value: 8, label: 'Imposible de interrumpir, continuo' }
                ]
            },
            {
                id: 'ymrs_q7', text: '7. Trastornos del pensamiento', type: 'likert',
                options: [
                    { value: 0, label: 'Ausentes' },
                    { value: 1, label: 'Circunstancial, distraído' },
                    { value: 2, label: 'Fuga de ideas, tangencial' },
                    { value: 3, label: 'Asociaciones laxas, difícil de seguir' },
                    { value: 4, label: 'Incoherente, incomprensible' }
                ]
            },
            {
                id: 'ymrs_q8', text: '8. Contenido del Pensamiento', type: 'likert',
                options: [
                    { value: 0, label: 'Normal' },
                    { value: 1, label: 'Planes ambiciosos, nuevos intereses' },
                    { value: 2, label: 'Proyectos grandiosos, sin confianza en sí mismo' }, { value: 3, label: '' },
                    { value: 4, label: 'Ideas de grandeza' }, { value: 5, label: '' },
                    { value: 6, label: 'Ideas delirantes de grandeza' }, { value: 7, label: '' },
                    { value: 8, label: 'Delirios bizarros, alucinaciones' }
                ]
            },
            {
                id: 'ymrs_q9', text: '9. Conducta disruptiva/agresiva', type: 'likert',
                options: [
                    { value: 0, label: 'Ausente, cooperador' }, { value: 1, label: 'Sarcástico, impaciente' },
                    { value: 2, label: 'Exigente, demandante' }, { value: 3, label: '' },
                    { value: 4, label: 'Amenaza verbal, intimida' }, { value: 5, label: '' },
                    { value: 6, label: 'Agresión física leve, destructivo' }, { value: 7, label: '' },
                    { value: 8, label: 'Violencia física franca' }
                ]
            },
            {
                id: 'ymrs_q10', text: '10. Apariencia', type: 'likert',
                options: [
                    { value: 0, label: 'Normal, bien aseado' },
                    { value: 1, label: 'Algo descuidado' },
                    { value: 2, label: 'Mal aseado, moderadamente desaliñado' },
                    { value: 3, label: 'Muy desaliñado, ropa llamativa' },
                    { value: 4, label: 'Completamente desaliñado, decorado' }
                ]
            },
            {
                id: 'ymrs_q11', text: '11. Insight (Conciencia de enfermedad)', type: 'likert',
                options: [
                    { value: 0, label: 'Presente, admite enfermedad' },
                    { value: 1, label: 'Admite posible enfermedad' },
                    { value: 2, label: 'Admite cambios conductuales, pero los niega como enfermedad' },
                    { value: 3, label: 'Niega cambios conductuales' },
                    { value: 4, label: 'Completamente ausente' }
                ]
            }
        ]
    }],
    interpretationData: [
        { from: 0, to: 6, severity: 'Mínima', summary: 'Sin síntomas maníacos significativos. Descarte de manía/hipomanía exitoso.' },
        { from: 7, to: 12, severity: 'Leve', summary: 'Síntomas subumbrales. Requiere vigilancia activa y monitoreo para descartar T. Bipolar II.' },
        { from: 13, to: 24, severity: 'Moderada', summary: 'Episodio Hipomaníaco probable. Indicador clave de T. Bipolar II (DSM-5).' },
        { from: 25, to: 60, severity: 'Grave', summary: 'Episodio Maníaco o Mixto Grave probable. Indicador clave de T. Bipolar I (DSM-5).' }
    ]
  },
  {
    name: "Cuestionario de Pensamientos Automáticos (ATQ-30)",
    id: 'atq-30',
    description: 'Mide la frecuencia de 30 pensamientos automáticos negativos específicos asociados con la depresión.',
    category: 'Evaluación de Sesgos Cognitivos',
    subcategory: 'Pensamientos Automáticos',
    sections: [{
      sectionId: 'main',
      name: 'Cuestionario de Pensamientos Automáticos (ATQ-30)',
      instructions: 'Indique con qué frecuencia ha tenido cada uno de estos pensamientos durante la última semana.',
      likertScale: [
        { value: 1, label: 'Nunca' },
        { value: 2, label: 'Algunas veces' },
        { value: 3, label: 'A menudo' },
        { value: 4, label: 'La mayor parte del tiempo' },
        { value: 5, label: 'Todo el tiempo' },
      ],
      questions: [
        { id: 'atq_1', text: 'Me siento como un fracaso.', type: 'likert' },
        { id: 'atq_2', text: 'No soy bueno/a.', type: 'likert' },
        { id: 'atq_3', text: '¿Por qué no puedo ser como los demás?', type: 'likert' },
        { id: 'atq_4', text: 'Mi vida no va como yo quiero.', type: 'likert' },
        { id: 'atq_5', text: 'Desearía ser una mejor persona.', type: 'likert' },
        { id: 'atq_6', text: 'Estoy tan decepcionado/a de mí mismo/a.', type: 'likert' },
        { id: 'atq_7', text: 'Nada me sale bien.', type: 'likert' },
        { id: 'atq_8', text: 'Odio mi vida.', type: 'likert' },
        { id: 'atq_9', text: 'No puedo terminar nada.', type: 'likert' },
        { id: 'atq_10', text: 'Soy un perdedor/a.', type: 'likert' },
        { id: 'atq_11', text: 'Mi futuro es oscuro.', type: 'likert' },
        { id: 'atq_12', text: 'Es mi culpa.', type: 'likert' },
        { id: 'atq_13', text: 'No valgo nada.', type: 'likert' },
        { id: 'atq_14', text: 'No puedo seguir adelante.', type: 'likert' },
        { id: 'atq_15', text: 'No voy a superar esto.', type: 'likert' },
        { id: 'atq_16', text: 'Desearía estar en otro lugar.', type: 'likert' },
        { id: 'atq_17', text: 'No puedo levantarme y ponerme en marcha.', type: 'likert' },
        { id: 'atq_18', text: '¿Qué me pasa?', type: 'likert' },
        { id: 'atq_19', text: 'Desearía estar muerto/a.', type: 'likert' },
        { id: 'atq_20', text: 'No puedo soportarlo más.', type: 'likert' },
        { id: 'atq_21', text: 'Soy un inútil.', type: 'likert' },
        { id: 'atq_22', text: 'La gente estaría mejor sin mí.', type: 'likert' },
        { id: 'atq_23', text: 'Soy un desastre.', type: 'likert' },
        { id: 'atq_24', text: 'Mi vida es un desastre.', type: 'likert' },
        { id: 'atq_25', text: 'Soy un cobarde.', type: 'likert' },
        { id: 'atq_26', text: 'No puedo pensar con claridad.', type: 'likert' },
        { id: 'atq_27', text: 'Me culpo por todo.', type: 'likert' },
        { id: 'atq_28', text: 'No tengo control sobre mi vida.', type: 'likert' },
        { id: 'atq_29', text: 'Me siento tan indefenso/a.', type: 'likert' },
        { id: 'atq_30', text: 'Algo tiene que cambiar.', type: 'likert' }
      ]
    }],
    interpretationData: [
      { from: 30, to: 60, severity: 'Leve', summary: 'Presencia de PANs que se activan bajo estrés leve.' },
      { from: 61, to: 90, severity: 'Moderada', summary: 'Frecuencia significativa de PANs y autocrítica. Foco principal para la Reestructuración Cognitiva.' },
      { from: 91, to: 120, severity: 'Alta', summary: 'Alta frecuencia de PANs y diálogos internos negativos intrusivos, manteniendo la sintomatología (Perfil A, B).' },
      { from: 121, to: 150, severity: 'Grave', summary: 'Frecuencia extrema de PANs. Se requiere Reestructuración Cognitiva urgente.' }
    ]
  },
  {
    name: 'Escala de Actitudes Disfuncionales (DAS)',
    id: 'das',
    description: 'Mide esquemas cognitivos y creencias irracionales subyacentes, como la necesidad de aprobación o el perfeccionismo.',
    category: 'Evaluación de Sesgos Cognitivos',
    subcategory: 'Creencias y Esquemas',
    sections: [{
      sectionId: 'main',
      name: 'Escala de Actitudes Disfuncionales',
      instructions: 'Indique su grado de acuerdo con las siguientes afirmaciones.',
      likertScale: [
        { value: 1, label: 'Totalmente en desacuerdo' },
        { value: 2, label: 'Bastante en desacuerdo' },
        { value: 3, label: 'Ligeramente en desacuerdo' },
        { value: 4, label: 'Indiferente' },
        { value: 5, label: 'Ligeramente de acuerdo' },
        { value: 6, label: 'Bastante de acuerdo' },
        { value: 7, label: 'Totalmente de acuerdo' },
      ],
      questions: [
        { id: 'das_q1', text: 'Es difícil ser feliz si no eres guapo, inteligente, rico y creativo.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q2', text: 'Mi valor como persona depende en gran medida de lo que otros piensen de mí.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q3', text: 'Si cometo un error, es probable que la gente me menosprecie.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q4', text: 'Si no puedo hacer algo bien, no debería hacerlo en absoluto.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q5', text: 'No puedo ser feliz si no le gusto a todo el mundo.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q6', text: 'Es mejor abandonar las propias necesidades que disgustar a los demás.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q7', text: 'Debo tener éxito en todo lo que emprendo.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q8', text: 'Si alguien a quien quiero me rechaza, significa que no soy digno de ser amado.', type: 'likert', scoringDirection: 'Directa' },
        { id: 'das_q9', text: 'Mi felicidad depende más de los demás que de mí mismo.', type: 'likert', scoringDirection: 'Inversa' },
        { id: 'das_q10', text: 'Si no soy el mejor en mi trabajo, entonces soy un fracasado.', type: 'likert', scoringDirection: 'Directa' }
      ],
    }],
    interpretationData: [
      { from: 10, to: 100, severity: 'Baja', summary: 'Esquemas cognitivos predominantemente funcionales.' },
      { from: 101, to: 150, severity: 'Moderada', summary: 'Rigidez cognitiva moderada. Requiere identificación y flexibilización de reglas.' },
      { from: 151, to: 240, severity: 'Alta', summary: 'Rigidez cognitiva alta. Implica que el paciente basa su valía en reglas rígidas y disfuncionales (ej. Perfeccionismo, dependencia). Foco de la TCC.' }
    ]
  },
  {
    name: "Cuestionario de Estilo Atribucional (ASQ)",
    id: "asq",
    description: "Mide cómo una persona explica las causas de los eventos, revelando sesgos pesimistas u optimistas.",
    category: "Evaluación de Sesgos Cognitivos",
    subcategory: "Estilo Atribucional",
    sections: [
        {
            sectionId: "negativos",
            name: "Situaciones Negativas",
            instructions: "Imagina que te ocurren las siguientes situaciones. Escribe la causa principal y luego califícala.",
            likertScale: [
                { value: 1, label: "Totalmente debido a otras personas/circunstancias" }, { value: 7, label: "Totalmente debido a mí" }
            ],
            questions: [
                { id: "asq_neg1_cause", text: "Situación: Tienes una discusión importante con un amigo/a.", type: "open", includeInScore: false },
                { id: "asq_neg1_internal", text: "¿La causa es debida a ti o a factores externos?", type: "likert" },
                { id: "asq_neg1_stable", text: "¿Esta causa estará siempre presente en tu vida?", type: "likert", options: [{ value: 1, label: "Nunca estará presente" }, { value: 7, label: "Siempre estará presente" }] },
                { id: "asq_neg1_global", text: "¿Esta causa afecta solo a esta situación o a otras áreas de tu vida?", type: "likert", options: [{ value: 1, label: "Solo afecta esta situación" }, { value: 7, label: "Afecta todas las áreas de mi vida" }] },
            ]
        },
        {
            sectionId: "positivos",
            name: "Situaciones Positivas",
            instructions: "Imagina que te ocurren las siguientes situaciones. Escribe la causa principal y luego califícala.",
            likertScale: [
                { value: 1, label: "Totalmente debido a otras personas/circunstancias" }, { value: 7, label: "Totalmente debido a mí" }
            ],
            questions: [
                 { id: "asq_pos1_cause", text: "Situación: Recibes un elogio por un trabajo bien hecho.", type: "open", includeInScore: false },
                { id: "asq_pos1_internal", text: "¿La causa es debida a ti o a factores externos?", type: "likert" },
                { id: "asq_pos1_stable", text: "¿Esta causa estará siempre presente en tu vida?", type: 'likert', options: [{ value: 1, label: "Nunca estará presente" }, { value: 7, label: "Siempre estará presente" }] },
                { id: "asq_pos1_global", text: "¿Esta causa afecta solo a esta situación o a otras áreas de tu vida?", type: 'likert', options: [{ value: 1, label: "Solo afecta esta situación" }, { value: 7, label: "Afecta todas las áreas de mi vida" }] },
            ]
        }
    ],
    interpretationData: [
        { from: 1, to: 3, severity: 'Optimista', summary: 'Atribución de fracasos a causas externas y específicas.' },
        { from: 4, to: 5, severity: 'Intermedio', summary: 'Estilo atribucional flexible. El sesgo aparece bajo estrés.' },
        { from: 6, to: 7, severity: 'Pesimista', summary: 'Alta atribución a causas internas, estables y globales. Indica Sesgo Atribucional Crónico.' }
    ]
  },
  {
    name: 'Escala de Estilos de Respuesta (RRS)',
    id: 'rrs',
    description: 'Mide los estilos de respuesta cognitiva a los estados de ánimo deprimidos, incluyendo la Rumiación y la Reflexión.',
    category: 'Evaluación de Sesgos Cognitivos',
    subcategory: 'Estilos de Respuesta Cognitiva',
    sections: [
      {
        sectionId: 'rumination',
        name: 'Subescala de Rumiación',
        instructions: 'Indique con qué frecuencia piensa o hace lo siguiente cuando se siente triste, decaído o deprimido.',
        likertScale: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' }
        ],
        questions: [
          { id: 'rrs_r1', text: 'Pienso en lo solo/a que me siento.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r2', text: 'Pienso "¿Por qué estoy así?".', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r3', text: 'Pienso en mis sentimientos de fatiga y malestar.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r4', text: 'Pienso en lo mucho que me gustaría que mis sentimientos desaparecieran.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r5', text: 'Pienso "¿Por qué tengo problemas que otras personas no tienen?".', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r6', text: 'Pienso en lo pasivo/a e inmotivado/a que me siento.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r7', text: 'Analizo los acontecimientos recientes para tratar de entender por qué estoy deprimido/a.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r8', text: 'Pienso "¿Por qué no puedo manejar mejor las cosas?".', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r9', text: 'Me aíslo y pienso en las razones por las que me siento así.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r10', text: 'Analizo mi personalidad para tratar de entenderme.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r11', text: 'Repaso una y otra vez en mi mente cómo me siento.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_r12', text: 'Voy a un lugar solo/a para pensar en mis sentimientos.', type: 'likert', scoringDirection: 'Directa' },
        ]
      },
      {
        sectionId: 'reflection',
        name: 'Subescala de Reflexión y Distracción',
        instructions: 'Indique con qué frecuencia piensa o hace lo siguiente cuando se siente triste, decaído o deprimido.',
        likertScale: [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'A menudo' },
          { value: 4, label: 'Casi siempre' }
        ],
        questions: [
          { id: 'rrs_d1', text: 'Hago algo que disfruto.', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'rrs_d2', text: 'Pienso en lo difícil que es concentrarse.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_d3', text: 'Pienso en que podría estar haciéndolo mejor.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_d4', text: 'Escribo lo que estoy pensando y lo analizo.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_d5', text: 'Me recuerdo a mí mismo/a todas las cosas que tengo que hacer.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_d6', text: 'Me culpo por sentirme así.', type: 'likert', scoringDirection: 'Directa' },
          { id: 'rrs_d7', text: 'Pido ayuda a mis amigos para mis problemas.', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'rrs_d8', text: 'Me ocupo de otras actividades para no pensar en cómo me siento.', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'rrs_d9', text: 'Voy al cine, de compras, o hago otras cosas para distraerme.', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'rrs_d10', text: 'Pienso en lo mal que me siento.', type: 'likert', scoringDirection: 'Directa' }
        ]
      }
    ],
    interpretationData: [
      { from: 12, to: 20, severity: 'Baja', summary: 'Rumiación adaptativa o baja. Sin tendencia a quedarse atrapado en el malestar.' },
      { from: 21, to: 30, severity: 'Moderada', summary: 'Rumiación elevada. Riesgo de cronicidad y mantenimiento del Trastorno Depresivo (Perfil B).' },
      { from: 31, to: 48, severity: 'Alta', summary: 'Rumiación crónica y desadaptativa. Mecanismo de evitación cognitiva que requiere técnicas de mindfulness y Terapia de Activación Conductual.' }
    ]
  },
  {
    name: "Prueba de Especificidad de Metas Futuras (MRFI/FGST)",
    id: "mrfi-fgst",
    description: "Mide la capacidad de un individuo para generar fantasías futuras específicas y vívidas, un factor protector contra la desesperanza.",
    category: "Evaluación de Sesgos Cognitivos",
    subcategory: "Pensamiento Futuro",
    sections: [{
      sectionId: 'main',
      name: 'Calificación de la Calidad de la Fantasía Futura',
      instructions: "Después de pedirle al paciente que describa una meta futura positiva, califique la calidad de su respuesta.",
      likertScale: [],
      questions: [
        {
          id: 'quality_score',
          text: 'Instrucción para el clínico: Pida al paciente que describa una meta futura positiva. Evalúe la calidad de la respuesta y puntúe según las siguientes opciones.',
          type: 'likert',
          options: [
            { value: 0, label: 'Específico y Vívido: Describe una meta clara, con detalles sensoriales y un plan concreto.' },
            { value: 1, label: 'Genérico/Ambiguo: Nombra una meta (ej. "ser feliz"), pero sin detalles concretos ni pasos para lograrla.' },
            { value: 2, label: 'Abstracto/Visión de Túnel: Incapaz de generar una meta positiva o solo describe la evitación de un estado negativo.' }
          ]
        }
      ],
    }],
    interpretationData: [
      { from: 0, to: 0, severity: 'Específico y Vívido', summary: 'Alta constructibilidad y especificidad de metas futuras. Factor protector.' },
      { from: 1, to: 1, severity: 'Genérico/Ambiguo', summary: 'Capacidad para nombrar metas futuras, pero sin detalles vívidos o específicos (Ej. "Espero estar mejor").' },
      { from: 2, to: 2, severity: 'Abstracto/Vision de Túnel', summary: 'Incapacidad para generar metas o fantasías futuras positivas. Predominio de temas negativos o evitación.' }
    ]
  },
  {
    id: 'plutchik-srs',
    name: 'Escala de Riesgo Suicida de Plutchik',
    description: 'Cuestionario de 15 ítems de respuesta Sí/No diseñado para evaluar la probabilidad de riesgo suicida en pacientes.',
    category: 'Evaluación Profunda de Mecanismos (Post-Tamizaje)',
    subcategory: 'Riesgo y Diagnóstico',
    sections: [{
      sectionId: 'main',
      name: 'Escala de Riesgo Suicida de Plutchik',
      instructions: 'Las siguientes preguntas tratan sobre cosas que usted ha sentido o hecho. Por favor conteste cada pregunta con SÍ o NO.',
      likertScale: [
        { "value": 0, "label": "NO" },
        { "value": 1, "label": "SÍ" }
      ],
      questions: [
        { id: 'plutchik_q1', text: '¿Toma de forma habitual algún medicamento como aspirinas o pastillas para dormir?', type: 'likert' },
        { id: 'plutchik_q2', text: '¿Tiene dificultades para conciliar el sueño?', type: 'likert' },
        { id: 'plutchik_q3', text: '¿A veces nota que podría perder el control sobre sí mismo?', type: 'likert' },
        { id: 'plutchik_q4', text: '¿Tiene poco interés en relacionarse con la gente?', type: 'likert' },
        { id: 'plutchik_q5', text: '¿Ve su futuro con más pesimismo que optimismo?', type: 'likert' },
        { id: 'plutchik_q6', text: '¿Se ha sentido alguna vez inútil o sin valor?', type: 'likert' },
        { id: 'plutchik_q7', text: '¿Ve su futuro sin ninguna esperanza?', type: 'likert' },
        { id: 'plutchik_q8', text: '¿Se ha sentido alguna vez tan fracasado que solo quería meterse en la cama y abandonarlo todo?', type: 'likert' },
        { id: 'plutchik_q9', text: '¿Está deprimido ahora?', type: 'likert' },
        { id: 'plutchik_q10', text: '¿Está usted separado, divorciado o viudo?', type: 'likert' },
        { id: 'plutchik_q11', text: '¿Sabe si alguien de su familia ha intentado suicidarse alguna vez?', type: 'likert' },
        { id: 'plutchik_q12', text: '¿Ha pensado alguna vez en suicidarse?', type: 'likert' },
        { id: 'plutchik_q13', text: '¿Le ha comentado a alguien, en alguna ocasión, que quería suicidarse?', type: 'likert' },
        { id: 'plutchik_q14', text: '¿Ha intentado alguna vez quitarse la vida?', type: 'likert' },
        { id: 'plutchik_q15', text: '¿Siente a menudo ganas de llorar?', type: 'likert' }
      ]
    }],
    interpretationData: [
      { from: 0, to: 4, severity: 'Baja', summary: 'Sin riesgo. Seguimiento normal.' },
      { from: 5, to: 6, severity: 'Leve', summary: 'Riesgo leve. Seguimiento cercano.' },
      { from: 7, to: 8, severity: 'Moderada', summary: 'Riesgo moderado. Evaluación clínica completa.' },
      { from: 9, to: 15, severity: 'Alta', summary: 'Riesgo alto. Intervención urgente y plan de seguridad.' }
    ]
  },
];

// Almacenamiento en memoria para cuestionarios personalizados
const customQuestionnaires: Map<string, Questionnaire> = new Map();

export function getAllQuestionnaires(): Questionnaire[] {
  return [...questionnairesData, ...Array.from(customQuestionnaires.values())];
}

export function saveCustomQuestionnaire(questionnaire: Omit<Questionnaire, 'id'>): Questionnaire {
  const id = `custom-${customQuestionnaires.size + 1}-${Date.now()}`;
  const newQuestionnaire = { ...questionnaire, id };
  customQuestionnaires.set(id, newQuestionnaire);
  // Re-export or update the main list
  return newQuestionnaire;
}

export function getQuestionnaire(id: string): Questionnaire | undefined {
    return getAllQuestionnaires().find(q => q.id === id);
}

export function getInterpretation(questionnaireId: string, score: number): Interpretation {
    const questionnaire = getQuestionnaire(questionnaireId);
    if (!questionnaire) {
        return { severity: 'Baja', summary: 'No se encontró el cuestionario.' };
    }
    
    // Esta función ahora es muy simple y puede que no funcione para IDARE.
    // Necesitaría ser expandida para manejar múltiples puntuaciones.
    if (questionnaire.interpretationData) {
        const rule = questionnaire.interpretationData.find(i => score >= i.from && score <= i.to);
        if (rule) {
            return { severity: rule.severity, summary: rule.summary };
        }

        const maxRule = questionnaire.interpretationData.reduce((max, r) => r.to > max.to ? r : max, questionnaire.interpretationData[0]);
        if (score > maxRule.to) {
            return { severity: maxRule.severity, summary: maxRule.summary };
        }

        return { severity: 'Baja', summary: 'La puntuación está fuera del rango de interpretación definido.' };
    }

    return { severity: 'Baja', summary: 'No se encontraron reglas de interpretación para esta escala.' };
}


