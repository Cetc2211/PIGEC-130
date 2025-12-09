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
  };
  scoringDirection?: 'Directa' | 'Inversa'; // Para puntuación directa o inversa
};

export type Interpretation = {
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Alta' | 'Mínima';
    summary: string;
}

export type InterpretationRule = {
    from: number;
    to: number;
    severity: 'Baja' | 'Leve' | 'Moderada' | 'Alta' | 'Mínima';
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


const questionnairesData: Omit<Questionnaire, 'id'>[] = [
  {
    name: 'Escala de Ansiedad y Depresión Hospitalaria (HADS)',
    id: 'hads',
    description: 'Instrumento de 14 ítems para detectar estados de ansiedad y depresión, centrándose en síntomas afectivos y no somáticos.',
    category: 'Estado de Ánimo',
    subcategory: 'Ansiedad y Depresión',
    sections: [
        {
            sectionId: 'ansiedad',
            name: 'Subescala de Ansiedad',
            instructions: 'Marque la respuesta que mejor describa cómo se ha sentido durante la última semana.',
            likertScale: [],
            questions: [
                { id: "hads_q1", text: "Me siento tenso o nervioso", type: "likert", options: [
                  { "value": 3, "label": "Casi todo el día" }, { "value": 2, "label": "Gran parte del día" },
                  { "value": 1, "label": "De vez en cuando" }, { "value": 0, "label": "Nunca" }
                ]},
                { id: "hads_q3", text: "Siento una especie de temor como si algo malo fuera a suceder", type: "likert", options: [
                  { "value": 3, "label": "Sí, y muy intenso" }, { "value": 2, "label": "Sí, pero no muy intenso" },
                  { "value": 1, "label": "Sí, pero no me preocupa" }, { "value": 0, "label": "No siento nada de eso" }
                ]},
                { id: "hads_q5", text: "Tengo la cabeza llena de preocupaciones", type: "likert", options: [
                  { "value": 3, "label": "Casi todo el día" }, { "value": 2, "label": "Gran parte del día" },
                  { "value": 1, "label": "De vez en cuando" }, { "value": 0, "label": "Nunca" }
                ]},
                { id: "hads_q7", text: "Soy capaz de permanecer sentado tranquilo y relajado", type: "likert", options: [
                  { "value": 0, "label": "Siempre" }, { "value": 1, "label": "A menudo" },
                  { "value": 2, "label": "Raras veces" }, { "value": 3, "label": "Nunca" }
                ]},
                { id: "hads_q9", text: "Experimento una desagradable sensación de 'nervios y hormigueos' en el estómago", type: "likert", options: [
                  { "value": 0, "label": "Nunca" }, { "value": 1, "label": "Sólo en algunas ocasiones" },
                  { "value": 2, "label": "A menudo" }, { "value": 3, "label": "Muy a menudo" }
                ]},
                { id: "hads_q11", text: "Me siento inquieto como si no pudiera parar de moverme", type: "likert", options: [
                  { "value": 3, "label": "Realmente mucho" }, { "value": 2, "label": "Bastante" },
                  { "value": 1, "label": "No mucho" }, { "value": 0, "label": "En absoluto" }
                ]},
                { id: "hads_q13", text: "Experimento de repente sensaciones de gran angustia o temor", type: "likert", options: [
                  { "value": 3, "label": "Muy a menudo" }, { "value": 2, "label": "Con cierta frecuencia" },
                  { "value": 1, "label": "Raramente" }, { "value": 0, "label": "Nunca" }
                ]}
            ]
        },
        {
            sectionId: 'depresion',
            name: 'Subescala de Depresión',
            instructions: 'Marque la respuesta que mejor describa cómo se ha sentido durante la última semana.',
            likertScale: [],
            questions: [
                { id: "hads_q2", text: "Sigo disfrutando de las cosas como siempre", type: "likert", options: [
                  { "value": 0, "label": "Ciertamente, igual que antes" }, { "value": 1, "label": "No tanto como antes" },
                  { "value": 2, "label": "Solamente un poco" }, { "value": 3, "label": "Ya no disfruto con nada" }
                ]},
                { id: "hads_q4", text: "Soy capaz de reírme y ver el lado gracioso de las cosas", type: "likert", options: [
                  { "value": 0, "label": "Igual que siempre" }, { "value": 1, "label": "Actualmente, algo menos" },
                  { "value": 2, "label": "Actualmente, mucho menos" }, { "value": 3, "label": "Actualmente, en absoluto" }
                ]},
                { id: "hads_q6", text: "Me siento alegre", type: "likert", options: [
                  { "value": 3, "label": "Nunca" }, { "value": 2, "label": "Muy pocas veces" },
                  { "value": 1, "label": "En algunas ocasiones" }, { "value": 0, "label": "Gran parte del día" }
                ]},
                { id: "hads_q8", text: "Me siento lento y torpe", type: "likert", options: [
                  { "value": 3, "label": "Gran parte del día" }, { "value": 2, "label": "A menudo" },
                  { "value": 1, "label": "A veces" }, { "value": 0, "label": "Nunca" }
                ]},
                { id: "hads_q10", text: "He perdido el interés por mi aspecto personal", type: "likert", options: [
                  { "value": 3, "label": "Completamente" }, { "value": 2, "label": "No me cuido como debería hacerlo" },
                  { "value": 1, "label": "Es posible que no me cuide como debiera" }, { "value": 0, "label": "Me cuido como siempre" }
                ]},
                { id: "hads_q12", text: "Espero las cosas con ilusión", type: "likert", options: [
                  { "value": 0, "label": "Como siempre" }, { "value": 1, "label": "Algo menos que antes" },
                  { "value": 2, "label": "Mucho menos que antes" }, { "value": 3, "label": "En absoluto" }
                ]},
                { id: "hads_q14", text: "Soy capaz de disfrutar con un buen libro o programa de TV", type: "likert", options: [
                  { "value": 0, "label": "A menudo" }, { "value": 1, "label": "Algunas veces" },
                  { "value": 2, "label": "Pocas veces" }, { "value": 3, "label": "Casi nunca" }
                ]}
            ]
        }
    ],
    interpretationData: [
        { from: 0, to: 7, severity: 'Baja', summary: 'Puntuación en rango normal, sin significación clínica.' },
        { from: 8, to: 10, severity: 'Leve', summary: 'Puntuación límite o dudosa. Sugiere reevaluación o exploración clínica.' },
        { from: 11, to: 21, severity: 'Alta', summary: 'Puntuación en rango clínico. Se considera un caso probable y se recomienda intervención.' }
    ]
  },
  {
    name: 'Inventario de Ansiedad Rasgo-Estado',
    id: 'idare',
    description: 'Instrumento de 40 ítems que mide dos componentes distintos de la ansiedad: Ansiedad Estado (transitoria) y Ansiedad Rasgo (disposición permanente).',
    category: 'Personalidad y Estado',
    subcategory: 'Ansiedad',
    sections: [
      {
        sectionId: 'estado',
        name: 'ANSIEDAD ESTADO (A-E)',
        instructions: 'Lea cada frase y marque el número que indique cómo se siente AHORA MISMO.',
        likertScale: [
          { "value": 1, "label": "NADA" },
          { "value": 2, "label": "POCO" },
          { "value": 3, "label": "REGULAR" },
          { "value": 4, "label": "MUCHO" }
        ],
        questions: [
          { id: 'q1', text: 'Me siento calmado', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q2', text: 'Me siento seguro', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q3', text: 'Estoy tenso', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q4', text: 'Estoy contrariado', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q5', text: 'Me siento a gusto', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q6', text: 'Me siento alterado', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q7', text: 'Estoy preocupado por posibles desgracias futuras', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q8', text: 'Me siento descansado', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q9', text: 'Me siento ansioso', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q10', text: 'Me siento cómodo', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q11', text: 'Me siento con confianza en mí mismo', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q12', text: 'Me siento nervioso', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q13', text: 'Estoy agitado', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q14', text: 'Me siento \'a punto de explotar\'', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q15', text: 'Me siento relajado', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q16', text: 'Me siento satisfecho', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q17', text: 'Estoy preocupado', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q18', text: 'Me siento muy aturdido y confuso', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q19', text: 'Me siento alegre', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q20', text: 'Me siento bien', scoringDirection: 'Inversa', type: 'likert' }
        ]
      },
      {
        sectionId: 'rasgo',
        name: 'ANSIEDAD RASGO (A-R)',
        instructions: 'Lea cada frase y marque el número que indique cómo se siente GENERALMENTE.',
        likertScale: [
          { "value": 1, "label": "CASI NUNCA" },
          { "value": 2, "label": "ALGUNAS VECES" },
          { "value": 3, "label": "FRECUENTEMENTE" },
          { "value": 4, "label": "CASI SIEMPRE" }
        ],
        questions: [
          { id: 'q21', text: 'Me siento bien', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q22', text: 'Me canso rápidamente', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q23', text: 'Siento ganas de llorar', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q24', text: 'Quisiera ser tan feliz como otros', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q25', text: 'Pierdo oportunidades por no decidirme rápido', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q26', text: 'Me siento descansado', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q27', text: 'Soy una persona tranquila, serena y sosegada', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q28', text: 'Siento que las dificultades se amontonan al punto de no superarlas', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q29', text: 'Me preocupo demasiado por cosas sin importancia', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q30', text: 'Soy feliz', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q31', text: 'Tomo las cosas muy a pecho', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q32', text: 'Me falta confianza en mí mismo', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q33', text: 'Me siento seguro', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q34', text: 'Trato de evitar enfrentar crisis o dificultades', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q35', text: 'Me siento melancólico', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q36', text: 'Me siento satisfecho', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q37', text: 'Algunas ideas poco importantes pasan por mi mente y me molestan', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q38', text: 'Me afectan tanto los desengaños que no me los puedo quitar de la cabeza', scoringDirection: 'Directa', type: 'likert' },
          { id: 'q39', text: 'Soy una persona estable', scoringDirection: 'Inversa', type: 'likert' },
          { id: 'q40', text: 'Cuando pienso en mis asuntos actuales me pongo tenso y alterado', scoringDirection: 'Directa', type: 'likert' }
        ]
      }
    ],
    interpretationData: [
      { from: 0, to: 32, severity: 'Baja', summary: 'Nivel de ansiedad bajo.' },
      { from: 33, to: 45, severity: 'Moderada', summary: 'Nivel de ansiedad promedio.' },
      { from: 46, to: 80, severity: 'Alta', summary: 'Nivel de ansiedad alto.' }
    ]
  },
  {
    id: 'bdi-ii',
    name: 'Inventario de Depresión de Beck-II',
    description: 'Cuestionario de 21 ítems para evaluar la severidad de los síntomas de depresión en las últimas dos semanas.',
    category: 'Estado de Ánimo',
    subcategory: 'Depresión',
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
          { value: 0, label: 'No me critico o culpo más de lo habitual' },
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
      { from: 0, to: 13, severity: 'Mínima', summary: 'Sintomatología depresiva mínima. Los síntomas son bajos o inexistentes.' },
      { from: 14, to: 19, severity: 'Leve', summary: 'Sintomatología depresiva leve. Puede que experimente algunos síntomas que no son severos.' },
      { from: 20, to: 28, severity: 'Moderada', summary: 'Sintomatología depresiva moderada. Se experimentan varios síntomas que pueden interferir con el funcionamiento diario.' },
      { from: 29, to: 63, severity: 'Alta', summary: 'Sintomatología depresiva severa. Los síntomas son intensos y persistentes, afectando significativamente la vida diaria.' }
    ]
  },
  {
    id: 'bai',
    name: 'Inventario de Ansiedad de Beck',
    description: 'Cuestionario de 21 ítems que mide la severidad de los síntomas de ansiedad física y cognitiva experimentados durante la última semana.',
    category: 'Estado de Ánimo',
    subcategory: 'Ansiedad',
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
      { from: 0, to: 7, severity: 'Baja', summary: 'Ansiedad normal. Los síntomas son mínimos o inexistentes.' },
      { from: 8, to: 15, severity: 'Leve', summary: 'Ansiedad leve. Los síntomas son notorios pero generalmente manejables.' },
      { from: 16, to: 25, severity: 'Moderada', summary: 'Ansiedad moderada. Los síntomas son frecuentes y pueden causar un deterioro notable.' },
      { from: 26, to: 63, severity: 'Alta', summary: 'Ansiedad severa. Los síntomas son intensos y persistentes, afectando significativamente la vida diaria.' }
    ]
  },
  {
    id: 'bhs',
    name: 'Escala de Desesperanza de Beck',
    description: 'Instrumento de 20 ítems de Verdadero/Falso para medir el grado de expectativas negativas sobre el futuro (desesperanza).',
    category: 'Estado de Ánimo',
    subcategory: 'Desesperanza',
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
      { from: 0, to: 3, severity: 'Baja', summary: 'Desesperanza mínima (normal). Las expectativas hacia el futuro son equilibradas o positivas.' },
      { from: 4, to: 8, severity: 'Leve', summary: 'Desesperanza leve. Hay presencia de algunas expectativas negativas, pero el riesgo suicida es bajo.' },
      { from: 9, to: 14, severity: 'Moderada', summary: 'Desesperanza moderada. Las expectativas negativas son significativas y están asociadas con un mayor riesgo de ideación suicida.' },
      { from: 15, to: 20, severity: 'Alta', summary: 'Desesperanza severa. Predominio de expectativas pesimistas, indicando un riesgo suicida alto.' }
    ]
  },
  {
    id: 'ssi',
    name: 'Escala de Ideación Suicida de Beck',
    description: 'Escala de 21 ítems que evalúa la severidad y características de la ideación suicida actual.',
    category: 'Riesgo Clínico',
    subcategory: 'Ideación Suicida',
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
      { from: 0, to: 5, severity: 'Baja', summary: 'Riesgo suicida bajo. Los síntomas de ideación son mínimos. Requiere seguimiento regular.' },
      { from: 6, to: 9, severity: 'Moderada', summary: 'Riesgo suicida moderado. La ideación es presente y requiere evaluación semanal e intervención prioritaria.' },
      { from: 10, to: 14, severity: 'Alta', summary: 'Riesgo suicida alto. La ideación es persistente, con planificación. Requiere plan de seguridad e intervención psiquiátrica urgente.' },
      { from: 15, to: 38, severity: 'Alta', summary: 'Riesgo suicida muy alto. Requiere intervención de crisis y consideración de hospitalización.' }
    ]
  },
  {
    id: 'gad-7',
    name: 'Escala de Ansiedad Generalizada GAD-7',
    description: 'Una herramienta de 7 preguntas para la detección, cribado y medición de la severidad del Trastorno de Ansiedad Generalizada (TAG).',
    category: 'Estado de Ánimo',
    subcategory: 'Ansiedad',
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
        { from: 0, to: 4, severity: 'Baja', summary: 'Ansiedad mínima. Los síntomas son transitorios y no requieren intervención clínica.' },
        { from: 5, to: 9, severity: 'Leve', summary: 'Ansiedad leve. Monitoreo y psicoeducación. Se recomienda reevaluar en 4 semanas.' },
        { from: 10, to: 14, severity: 'Moderada', summary: 'Ansiedad moderada. Posiblemente TAG o necesidad de TCC breve.' },
        { from: 15, to: 21, severity: 'Alta', summary: 'Ansiedad severa. Tratamiento recomendado con TCC estructurada y evaluación psiquiátrica.' }
    ]
  },
  {
    id: 'phq-9',
    name: 'Cuestionario de Salud del Paciente (PHQ-9)',
    description: 'Instrumento de 9 ítems para el cribado, diagnóstico y medición de la severidad de la depresión mayor, basado en criterios del DSM.',
    category: 'Estado de Ánimo',
    subcategory: 'Depresión',
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
      { "from": 0, "to": 4, "severity": 'Baja', "summary": "Depresión mínima. Monitoreo clínico o sin intervención." },
      { "from": 5, "to": 9, "severity": 'Leve', "summary": "Depresión leve. Seguimiento/apoyo; considerar tratamiento si persiste." },
      { "from": 10, "to": 14, "severity": 'Moderada', "summary": "Depresión moderada. Considerar tratamiento con psicoterapia o medicación." },
      { "from": 15, "to": 19, "severity": 'Moderada', "summary": "Depresión moderadamente severa. Tratamiento activo: psicoterapia más medicación." },
      { "from": 20, "to": 27, "severity": 'Alta', "summary": "Depresión severa. Tratamiento inmediato e intensivo." }
    ]
  },
  {
    name: 'Estrés Percibido PSS-10',
    id: 'pss-10',
    description: 'Una escala de 10 ítems que mide el grado en que las situaciones de la vida se evalúan como estresantes.',
    category: 'Estado de Ánimo',
    subcategory: 'Estrés',
    sections: [{
      sectionId: 'main',
      name: 'Estrés Percibido PSS-10',
      instructions: 'Las siguientes preguntas se refieren a sus sentimientos y pensamientos durante el último mes.',
      likertScale: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'A veces' },
          { value: 3, label: 'Con bastante frecuencia' },
          { value: 4, label: 'Muy a menudo' },
      ],
      questions: [
          { id: 'pss10_q1', text: 'En el último mes, ¿con qué frecuencia ha estado molesto/a por algo que sucedió inesperadamente?', type: 'likert', scoringDirection: 'Directa' },
          { id: 'pss10_q2', text: 'En el último mes, ¿con qué frecuencia ha sentido que no podía controlar las cosas importantes de su vida?', type: 'likert', scoringDirection: 'Directa' },
          { id: 'pss10_q3', text: 'En el último mes, ¿con qué frecuencia se ha sentido nervioso/a y estresado/a?', type: 'likert', scoringDirection: 'Directa' },
          { id: 'pss10_q4', text: 'En el último mes, ¿con qué frecuencia se ha sentido seguro/a de su capacidad para manejar sus problemas personales?', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'pss10_q5', text: 'En el último mes, ¿con qué frecuencia ha sentido que las cosas le iban bien?', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'pss10_q6', text: 'En el último mes, ¿con qué frecuencia ha descubierto que no podía hacer frente a todas las cosas que tenía que hacer?', type: 'likert', scoringDirection: 'Directa' },
          { id: 'pss10_q7', text: 'En el último mes, ¿con qué frecuencia ha sido capaz de controlar las irritaciones en su vida?', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'pss10_q8', text: 'En el último mes, ¿con qué frecuencia ha sentido que estaba al tanto de las cosas?', type: 'likert', scoringDirection: 'Inversa' },
          { id: 'pss10_q9', text: 'En el último mes, ¿con qué frecuencia se ha enfadado por cosas que estaban fuera de su control?', type: 'likert', scoringDirection: 'Directa' },
          { id: 'pss10_q10', text: 'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulaban tanto que no podía superarlas?', type: 'likert', scoringDirection: 'Directa' }
      ],
    }],
    interpretationData: [
        { from: 0, to: 13, severity: 'Baja', summary: 'Bajo estrés percibido. Indica buenos mecanismos de afrontamiento y resiliencia.' },
        { from: 14, to: 26, severity: 'Moderada', summary: 'Estrés percibido moderado. Experimenta algunas dificultades para manejar los estresores de la vida.' },
        { from: 27, to: 40, severity: 'Alta', summary: 'Alto estrés percibido. Indica una dificultad significativa para hacer frente a los eventos de la vida, puede requerir apoyo.' },
    ]
  },
  {
    name: 'Guía de Observación Conductual en Aula (GOCA)',
    id: 'goca',
    description: 'Instrumento para que los docentes observen y registren la frecuencia de conductas clave relacionadas con la atención, motivación, estado emocional y rendimiento del estudiante en el aula.',
    category: 'Conductual',
    subcategory: 'Observación en Aula',
    sections: [{
      sectionId: 'main',
      name: 'Guía de Observación Conductual en Aula (GOCA)',
      instructions: 'Observe al estudiante durante el período de clase y marque la frecuencia con la que se presenta cada una de las siguientes conductas.',
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
      ]
    }],
    interpretationData: [
        { from: 0, to: 40, severity: 'Baja', summary: 'Sin indicadores significativos de riesgo.' },
        { from: 41, to: 80, severity: 'Moderada', summary: 'Señales de alerta moderadas. Se recomienda seguimiento.' },
        { from: 81, to: 120, severity: 'Moderada', summary: 'Múltiples indicadores de riesgo. Se debe referir a Orientación Educativa.' },
        { from: 121, to: 180, severity: 'Alta', summary: 'Situación crítica. Se requiere intervención inmediata.' },
    ]
  },
  {
    name: 'Escala de Riesgo Suicida de Plutchik',
    id: 'plutchik-srs',
    description: 'Cuestionario de 15 ítems de respuesta Sí/No diseñado para evaluar la probabilidad de riesgo suicida en pacientes.',
    category: 'Riesgo Clínico',
    subcategory: 'Ideación y Comportamiento Suicida',
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
        { id: 'plutchik_q12', text: '¿Alguna vez se ha sentido tan enfadado que habría sido capaz de matar a alguien?', type: 'likert' },
        { id: 'plutchik_q13', text: '¿Ha pensado alguna vez en suicidarse?', type: 'likert' },
        { id: 'plutchik_q14', text: '¿Le ha comentado a alguien, en alguna ocasión, que quería suicidarse?', type: 'likert' },
        { id: 'plutchik_q15', text: '¿Ha intentado alguna vez quitarse la vida?', type: 'likert' }
      ]
    }],
    interpretationData: [
      { from: 0, to: 4, severity: 'Baja', summary: 'Sin riesgo. Seguimiento normal.' },
      { from: 5, to: 6, severity: 'Leve', summary: 'Riesgo leve. Seguimiento cercano.' },
      { from: 7, to: 8, severity: 'Moderada', summary: 'Riesgo moderado. Evaluación clínica completa.' },
      { from: 9, to: 15, severity: 'Alta', summary: 'Riesgo alto. Intervención urgente y plan de seguridad.' }
    ]
  }
];

const processedQuestionnaires = questionnairesData.map((q, index) => ({
  ...q,
  id: q.id || `${q.name.toLowerCase().replace(/\s/g, '-')}-${index}`
}));

// Almacenamiento en memoria para cuestionarios personalizados
const customQuestionnaires: Map<string, Questionnaire> = new Map();

export const questionnaires: Questionnaire[] = processedQuestionnaires;


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
