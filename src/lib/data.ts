export type LikertScaleOption = {
  value: number;
  label: string;
};

export type Question = {
  id: string;
  text: string;
};

export type Questionnaire = {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  likertScale: LikertScaleOption[];
};

export type Interpretation = {
    severity: 'Low' | 'Mild' | 'Moderate' | 'High';
    summary: string;
}

const defaultLikertScale: LikertScaleOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const questionnaires: Questionnaire[] = [
  {
    id: 'gad-7',
    name: 'GAD-7 Anxiety',
    description: 'A 7-question screening tool for Generalized Anxiety Disorder.',
    likertScale: defaultLikertScale,
    questions: [
      { id: 'q1', text: 'Feeling nervous, anxious, or on edge' },
      { id: 'q2', text: 'Not being able to stop or control worrying' },
      { id: 'q3', text: 'Worrying too much about different things' },
      { id: 'q4', text: 'Trouble relaxing' },
      { id: 'q5', text: 'Being so restless that it is hard to sit still' },
      { id: 'q6', text: 'Becoming easily annoyed or irritable' },
      { id: 'q7', text: 'Feeling afraid, as if something awful might happen' },
    ],
  },
  {
    id: 'phq-9',
    name: 'PHQ-9 Depression',
    description: 'A 9-question tool to screen for depression and monitor severity.',
    likertScale: defaultLikertScale,
    questions: [
        { id: 'q1', text: 'Little interest or pleasure in doing things' },
        { id: 'q2', text: 'Feeling down, depressed, or hopeless' },
        { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
        { id: 'q4', text: 'Feeling tired or having little energy' },
        { id: 'q5', text: 'Poor appetite or overeating' },
        { id: 'q6', text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down' },
        { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
        { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual' },
        { id: 'q9', text: 'Thoughts that you would be better off dead, or of hurting yourself in some way' }
    ],
  },
  {
    id: 'psc-10',
    name: 'PSS-10 Perceived Stress',
    description: 'A 10-item scale that measures the degree to which situations in one\'s life are appraised as stressful.',
    likertScale: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Almost Never' },
        { value: 2, label: 'Sometimes' },
        { value: 3, label: 'Fairly Often' },
        { value: 4, label: 'Very Often' },
    ],
    questions: [
        { id: 'q1', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?' },
        { id: 'q2', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?' },
        { id: 'q3', text: 'In the last month, how often have you felt nervous and stressed?' },
        { id: 'q4', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?' },
        { id: 'q5', text: 'In the last month, how often have you felt that things were going your way?' },
        { id: 'q6', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?' },
        { id: 'q7', text: 'In the last month, how often have you been able to control irritations in your life?' },
        { id: 'q8', text: 'In the last month, how often have you felt that you were on top of things?' },
        { id: 'q9', text: 'In the last month, how often have you been angered because of things that were outside of your control?' },
        { id: 'q10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?' }
    ]
  }
];


const interpretations: Record<string, (score: number) => Interpretation> = {
    'gad-7': (score: number): Interpretation => {
        if (score <= 4) return { severity: 'Low', summary: 'Minimal anxiety. Symptoms are likely transient and not causing significant distress.' };
        if (score <= 9) return { severity: 'Mild', summary: 'Mild anxiety. May experience some symptoms, but they are generally manageable.' };
        if (score <= 14) return { severity: 'Moderate', summary: 'Moderate anxiety. Symptoms are frequent and cause noticeable impairment in daily functioning.' };
        return { severity: 'High', summary: 'Severe anxiety. Symptoms are persistent, distressing, and significantly interfere with daily life.' };
    },
    'phq-9': (score: number): Interpretation => {
        if (score <= 4) return { severity: 'Low', summary: 'Minimal depression. Unlikely to be clinically significant.' };
        if (score <= 9) return { severity: 'Mild', summary: 'Mild depression. Monitor symptoms; consider treatment if they persist.' };
        if (score <= 14) return { severity: 'Moderate', summary: 'Moderate depression. Treatment is likely warranted.' };
        if (score <= 19) return { severity: 'Moderate', summary: 'Moderately severe depression. Active treatment is strongly recommended.' };
        return { severity: 'High', summary: 'Severe depression. Immediate intervention and treatment are necessary.' };
    },
    'psc-10': (score: number): Interpretation => {
        if (score <= 13) return { severity: 'Low', summary: 'Low perceived stress. Indicates good coping mechanisms and resilience.' };
        if (score <= 26) return { severity: 'Moderate', summary: 'Moderate perceived stress. Experiencing some difficulties in managing life stressors.' };
        return { severity: 'High', summary: 'High perceived stress. Indicates significant difficulty in coping with life events, may require support.' };
    }
}

export function getInterpretation(questionnaireId: string, score: number): Interpretation {
    const interpretFunc = interpretations[questionnaireId];
    if (interpretFunc) {
        return interpretFunc(score);
    }
    return { severity: 'Low', summary: 'No interpretation rules found for this scale.' };
}
