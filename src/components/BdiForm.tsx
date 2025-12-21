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
    {
        id: 'item4',
        title: '4. Pérdida de Placer',
        options: [
            { value: 0, text: 'Obtengo tanto placer como siempre por las cosas que disfruto.' },
            { value: 1, text: 'No disfruto de las cosas tanto como solía hacerlo.' },
            { value: 2, text: 'Obtengo muy poco placer de las cosas que solía disfrutar.' },
            { value: 3, text: 'No obtengo ningún placer de las cosas que solía disfrutar.' },
        ],
    },
    {
        id: 'item5',
        title: '5. Sentimientos de Culpa',
        options: [
            { value: 0, text: 'No me siento particularmente culpable.' },
            { value: 1, text: 'Me siento culpable por muchas cosas que he hecho o debería haber hecho.' },
            { value: 2, text: 'Me siento bastante culpable la mayor parte del tiempo.' },
            { value: 3, text: 'Me siento culpable todo el tiempo.' },
        ],
    },
    {
        id: 'item6',
        title: '6. Sentimientos de Castigo',
        options: [
            { value: 0, text: 'No siento que esté siendo castigado.' },
            { value: 1, text: 'Siento que puedo ser castigado.' },
            { value: 2, text: 'Espero ser castigado.' },
            { value: 3, text: 'Siento que estoy siendo castigado.' },
        ],
    },
    {
        id: 'item7',
        title: '7. Disconformidad con uno mismo',
        options: [
            { value: 0, text: 'Me siento acerca de mí mismo igual que siempre.' },
            { value: 1, text: 'He perdido la confianza en mí mismo.' },
            { value: 2, text: 'Estoy decepcionado conmigo mismo.' },
            { value: 3, text: 'No me gusto a mí mismo.' },
        ],
    },
    {
        id: 'item8',
        title: '8. Autocrítica',
        options: [
            { value: 0, text: 'No me critico ni me culpo más de lo habitual.' },
            { value: 1, text: 'Soy más crítico conmigo mismo de lo que solía ser.' },
            { value: 2, text: 'Critico todos mis defectos.' },
            { value: 3, text: 'Me culpo por todo lo malo que sucede.' },
        ],
    },
    {
        id: 'item9',
        title: '9. Pensamientos o Deseos Suicidas',
        options: [
            { value: 0, text: 'No tengo ningún pensamiento de suicidio.' },
            { value: 1, text: 'Tengo pensamientos de suicidio, pero no los llevaría a cabo.' },
            { value: 2, text: 'Me gustaría suicidarme.' },
            { value: 3, text: 'Me suicidaría si tuviera la oportunidad.' },
        ],
    },
    {
        id: 'item10',
        title: '10. Llanto',
        options: [
            { value: 0, text: 'No lloro más de lo que solía hacerlo.' },
            { value: 1, text: 'Lloro más de lo que solía hacerlo.' },
            { value: 2, text: 'Lloro por cualquier pequeña cosa.' },
            { value: 3, text: 'Siento ganas de llorar, pero no puedo.' },
        ],
    },
    {
        id: 'item11',
        title: '11. Agitación',
        options: [
            { value: 0, text: 'No estoy más inquieto o tenso de lo habitual.' },
            { value: 1, text: 'Me siento más inquieto o tenso de lo habitual.' },
            { value: 2, text: 'Estoy tan inquieto o agitado que me es difícil quedarme quieto.' },
            { value: 3, text: 'Estoy tan inquieto o agitado que tengo que estar siempre en movimiento o haciendo algo.' },
        ],
    },
    {
        id: 'item12',
        title: '12. Pérdida de Interés',
        options: [
            { value: 0, text: 'No he perdido el interés en otras personas o actividades.' },
            { value: 1, text: 'Estoy menos interesado en otras personas o cosas que antes.' },
            { value: 2, text: 'He perdido la mayor parte de mi interés en otras personas y tengo poco interés en otras cosas.' },
            { value: 3, text: 'He perdido todo interés en otras personas y no me importa nada de ellas.' },
        ],
    },
    {
        id: 'item13',
        title: '13. Indecisión',
        options: [
            { value: 0, text: 'Tomo decisiones tan bien como siempre.' },
            { value: 1, text: 'Encuentro más difícil tomar decisiones que de costumbre.' },
            { value: 2, text: 'Tengo mucha más dificultad para tomar decisiones que antes.' },
            { value: 3, text: 'Tengo problemas para tomar cualquier decisión.' },
        ],
    },
    {
        id: 'item14',
        title: '14. Devaluación',
        options: [
            { value: 0, text: 'No siento que no valga nada.' },
            { value: 1, text: 'No me considero tan valioso y útil como solía serlo.' },
            { value: 2, text: 'Me siento mucho menos valioso en comparación con otras personas.' },
            { value: 3, text: 'Me siento completamente inútil.' },
        ],
    },
    {
        id: 'item15',
        title: '15. Pérdida de Energía',
        options: [
            { value: 0, text: 'Tengo tanta energía como siempre.' },
            { value: 1, text: 'Tengo menos energía de la que solía tener.' },
            { value: 2, text: 'No tengo suficiente energía para hacer mucho.' },
            { value: 3, text: 'No tengo energía suficiente para hacer nada.' },
        ],
    },
    {
        id: 'item16',
        title: '16. Cambios en los Hábitos de Sueño',
        options: [
            { value: 0, text: 'No he experimentado ningún cambio en mis hábitos de sueño.' },
            { value: '1a', text: 'Duermo un poco más de lo habitual.' },
            { value: '1b', text: 'Duermo un poco menos de lo habitual.' },
            { value: '2a', text: 'Duermo mucho más de lo habitual.' },
            { value: '2b', text: 'Duermo mucho menos de lo habitual.' },
            { value: '3a', text: 'Duermo la mayor parte del día.' },
            { value: '3b', text: 'Me despierto 1-2 horas antes y no puedo volver a dormirme.' },
        ],
    },
    {
        id: 'item17',
        title: '17. Irritabilidad',
        options: [
            { value: 0, text: 'No estoy más irritable de lo habitual.' },
            { value: 1, text: 'Estoy más irritable de lo habitual.' },
            { value: 2, text: 'Estoy mucho más irritable de lo habitual.' },
            { value: 3, text: 'Estoy irritable todo el tiempo.' },
        ],
    },
    {
        id: 'item18',
        title: '18. Cambios en el Apetito',
        options: [
            { value: 0, text: 'No he experimentado ningún cambio en mi apetito.' },
            { value: '1a', text: 'Mi apetito es un poco menor de lo habitual.' },
            { value: '1b', text: 'Mi apetito es un poco mayor de lo habitual.' },
            { value: '2a', text: 'Mi apetito es mucho menor que antes.' },
            { value: '2b', text: 'Mi apetito es mucho mayor de lo habitual.' },
            { value: '3a', text: 'No tengo apetito en absoluto.' },
            { value: '3b', text: 'Quiero comer todo el día.' },
        ],
    },
    {
        id: 'item19',
        title: '19. Dificultad de Concentración',
        options: [
            { value: 0, text: 'Puedo concentrarme tan bien como siempre.' },
            { value: 1, text: 'No puedo concentrarme tan bien como de costumbre.' },
            { value: 2, text: 'Me es difícil mantener la mente en algo por mucho tiempo.' },
            { value: 3, text: 'No puedo concentrarme en nada.' },
        ],
    },
    {
        id: 'item20',
        title: '20. Cansancio o Fatiga',
        options: [
            { value: 0, text: 'No estoy más cansado o fatigado de lo habitual.' },
            { value: 1, text: 'Me canso o me fatigo más fácilmente de lo habitual.' },
            { value: 2, text: 'Estoy demasiado cansado o fatigado para hacer muchas de las cosas que solía hacer.' },
            { value: 3, text: 'Estoy demasiado cansado o fatigado para hacer la mayoría de las cosas que solía hacer.' },
        ],
    },
    {
        id: 'item21',
        title: '21. Pérdida de Interés en el Sexo',
        options: [
            { value: 0, text: 'No he notado ningún cambio reciente en mi interés por el sexo.' },
            { value: 1, text: 'Estoy menos interesado en el sexo de lo que solía estarlo.' },
            { value: 2, text: 'Estoy mucho menos interesado en el sexo ahora.' },
            { value: 3, text: 'He perdido por completo el interés en el sexo.' },
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
