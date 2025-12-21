'use client';

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const chteQuestions = [
    {
        id: 'q1',
        text: '1. ¿Hago un plan o un horario para mis horas de estudio?',
        domain: 'planificacion'
    },
    {
        id: 'q2',
        text: '2. ¿Tengo un lugar fijo y adecuado para estudiar, libre de distracciones?',
        domain: 'concentracion'
    },
    {
        id: 'q3',
        text: '3. Cuando leo un texto, ¿subrayo las ideas principales o hago anotaciones al margen?',
        domain: 'tomaDeApuntes'
    },
    {
        id: 'q4',
        text: '4. ¿Priorizo las tareas más difíciles para cuando estoy más descansado?',
        domain: 'planificacion'
    },
    {
        id: 'q5',
        text: '5. ¿Suelo revisar mis apuntes después de clase para asegurarme de que los entiendo?',
        domain: 'tomaDeApuntes'
    },
];

const options = [
    { value: 'siempre', label: 'Siempre' },
    { value: 'casi_siempre', label: 'Casi Siempre' },
    { value: 'a_veces', label: 'A Veces' },
    { value: 'rara_vez', label: 'Rara Vez' },
    { value: 'nunca', label: 'Nunca' },
]

export default function ChteForm() {
    return (
        <div className="p-1 space-y-8">
            {chteQuestions.map((q) => (
                <div key={q.id} className="p-4 border rounded-lg bg-gray-50/80">
                    <p className="font-semibold mb-4 text-gray-800">{q.text}</p>
                    <RadioGroup name={q.id} className="flex flex-wrap gap-x-6 gap-y-2">
                        {options.map(opt => (
                             <div key={opt.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                                <Label htmlFor={`${q.id}-${opt.value}`}>{opt.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}
        </div>
    );
}
