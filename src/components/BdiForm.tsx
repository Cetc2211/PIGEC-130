'use client';

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const bdiItems = [
    {
        id: 'item1',
        title: '1. Tristeza',
        options: [
            { value: 0, text: 'No me siento triste.' },
            { value: 1, text: 'Me siento triste gran parte del tiempo.' },
            { value: 2, text: 'Estoy triste todo el tiempo.' },
            { value: 3, text: 'Estoy tan triste o infeliz que no puedo soportarlo.' },
        ],
    },
    {
        id: 'item2',
        title: '2. Pesimismo',
        options: [
            { value: 0, text: 'No estoy desanimado respecto a mi futuro.' },
            { value: 1, text: 'Me siento más desanimado respecto a mi futuro que lo que solía estarlo.' },
            { value: 2, text: 'No espero que las cosas funcionen para mí.' },
            { value: 3, text: 'Siento que mi futuro es desesperanzador y que solo empeorará.' },
        ],
    },
    {
        id: 'item3',
        title: '3. Sentimientos de Fracaso',
        options: [
            { value: 0, text: 'No me siento como un fracasado.' },
            { value: 1, text: 'He fracasado más de lo que debería.' },
            { value: 2, text: 'Cuando miro hacia atrás, veo muchos fracasos.' },
            { value: 3, text: 'Siento que como persona soy un completo fracaso.' },
        ],
    },
];


export default function BdiForm() {
    return (
        <div className="p-1 space-y-6">
            <p className="text-sm text-center text-gray-600">Por favor, lea cada grupo de afirmaciones cuidadosamente. Luego, elija la afirmación en cada grupo que mejor describa la manera en que se ha sentido durante las ÚLTIMAS DOS SEMANAS, INCLUYENDO HOY.</p>
            {bdiItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg bg-gray-50/80">
                    <p className="font-bold text-lg mb-3 text-gray-800">{item.title}</p>
                    <RadioGroup name={item.id} className="space-y-3">
                        {item.options.map(opt => (
                             <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                                <RadioGroupItem value={String(opt.value)} id={`${item.id}-${opt.value}`} />
                                <Label htmlFor={`${item.id}-${opt.value}`} className="font-normal cursor-pointer">
                                    {opt.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}
        </div>
    );
}