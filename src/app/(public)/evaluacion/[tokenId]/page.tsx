'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowRight, FileText, User, Shield, Check, AlertCircle, 
    CreditCard, Loader2, LogOut, ChevronRight, CheckCircle2,
    Send, Save, AlertTriangle, AlertOctagon, RefreshCw
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, Timestamp, addDoc, updateDoc, doc, limit } from 'firebase/firestore';
import { validarMatricula, vincularExpediente, type MatriculaRegistro } from '@/lib/matricula-service';

// ============================================
// CATÁLOGO COMPLETO DE PRUEBAS
// ============================================

interface Pregunta {
    id: string;
    texto: string;
    opciones?: { value: string; label: string; puntaje?: number }[];
    tipo: 'opcion' | 'texto' | 'select' | 'fecha' | 'numero';
    requerido?: boolean;
}

interface Prueba {
    id: string;
    nombre: string;
    descripcion: string;
    instrucciones: string;
    preguntas: Pregunta[];
    obligatoria?: boolean;
}

const PRUEBAS_CATALOGO: Record<string, Prueba> = {
    // ============================================
    // FICHA DE IDENTIFICACIÓN - MEJORADA
    // ============================================
    'ficha-id': {
        id: 'ficha-id',
        nombre: 'Ficha de Identificación',
        descripcion: 'Datos demográficos y sociofamiliares',
        instrucciones: 'Por favor complete todos los campos. Esta información es confidencial y necesaria para su evaluación.',
        obligatoria: true,
        preguntas: [
            { id: 'fecha_nacimiento', texto: 'Fecha de nacimiento:', tipo: 'fecha', requerido: true },
            { id: 'lugar_nacimiento', texto: 'Lugar de nacimiento:', tipo: 'select', requerido: true, opciones: [
                { value: 'mochicahui', label: 'Mochicahui' },
                { value: 'el_fuerte', label: 'El Fuerte' },
                { value: 'los_mochis', label: 'Los Mochis' },
                { value: 'guasave', label: 'Guasave' },
                { value: 'culiacan', label: 'Culiacán' },
                { value: 'otro_sinaloa', label: 'Otro municipio de Sinaloa' },
                { value: 'otro_estado', label: 'Otro estado de México' }
            ]},
            { id: 'domicilio', texto: 'Domicilio actual (calle, número, colonia):', tipo: 'texto', requerido: true },
            { id: 'telefono_personal', texto: 'Teléfono personal (celular):', tipo: 'numero', requerido: true },
            { id: 'telefono_emergencia', texto: 'Teléfono de contacto de emergencia:', tipo: 'numero', requerido: true },
            { id: 'nombre_tutor', texto: 'Nombre completo del padre/madre/tutor:', tipo: 'texto', requerido: true },
            { id: 'ocupacion_tutor', texto: 'Ocupación del padre/madre/tutor:', tipo: 'select', requerido: true, opciones: [
                { value: 'agricultor', label: 'Agricultor/Campesino' },
                { value: 'comerciante', label: 'Comerciante' },
                { value: 'empleado', label: 'Empleado' },
                { value: 'obrero', label: 'Obrero' },
                { value: 'profesionista', label: 'Profesionista' },
                { value: 'ama_casa', label: 'Ama de casa' },
                { value: 'jornalero', label: 'Jornalero' },
                { value: 'empresario', label: 'Empresario' },
                { value: 'desempleado', label: 'Desempleado' },
                { value: 'otro', label: 'Otro' }
            ]},
            { id: 'vive_con', texto: '¿Con quién vive actualmente?', tipo: 'select', requerido: true, opciones: [
                { value: 'padres', label: 'Ambos padres' },
                { value: 'madre', label: 'Solo madre' },
                { value: 'padre', label: 'Solo padre' },
                { value: 'tutor', label: 'Tutor/abuelos/tíos' },
                { value: 'solo', label: 'Vivo solo/a' },
                { value: 'pareja', label: 'Con mi pareja' },
                { value: 'otros', label: 'Otros' }
            ]},
            { id: 'hermanos', texto: 'Número de hermanos:', tipo: 'select', requerido: true, opciones: [
                { value: '0', label: 'Ninguno (hijo único)' },
                { value: '1', label: '1 hermano/a' },
                { value: '2', label: '2 hermanos/as' },
                { value: '3', label: '3 hermanos/as' },
                { value: '4', label: '4 hermanos/as' },
                { value: '5', label: '5 hermanos/as' },
                { value: 'mas_5', label: 'Más de 5 hermanos/as' }
            ]},
            { id: 'lugar_hermanos', texto: 'Lugar que ocupa entre hermanos:', tipo: 'select', requerido: true, opciones: [
                { value: 'mayor', label: 'El mayor' },
                { value: 'medio', label: 'El mediano/intermedio' },
                { value: 'menor', label: 'El menor' },
                { value: 'unico', label: 'Hijo único' }
            ]},
            { id: 'estado_civil_padres', texto: 'Estado civil de los padres:', tipo: 'select', requerido: true, opciones: [
                { value: 'casados', label: 'Casados' },
                { value: 'union_libre', label: 'Unión libre' },
                { value: 'divorciados', label: 'Divorciados' },
                { value: 'separados', label: 'Separados' },
                { value: 'viudo', label: 'Uno de ellos falleció' },
                { value: 'soltero', label: 'Madre/padre soltero' }
            ]},
            { id: 'enfermedades', texto: '¿Padece alguna enfermedad crónica?', tipo: 'select', requerido: true, opciones: [
                { value: 'no', label: 'No' },
                { value: 'diabetes', label: 'Diabetes' },
                { value: 'asma', label: 'Asma' },
                { value: 'epilepsia', label: 'Epilepsia' },
                { value: 'hipertension', label: 'Hipertensión' },
                { value: 'cardiaca', label: 'Enfermedad cardíaca' },
                { value: 'gastrica', label: 'Gastritis/Úlcera' },
                { value: 'otra', label: 'Otra' }
            ]},
            { id: 'enfermedad_cual', texto: 'Si seleccionó "Otra", especifique:', tipo: 'texto', requerido: false },
            { id: 'medicamentos', texto: '¿Toma algún medicamento de forma permanente?', tipo: 'select', requerido: true, opciones: [
                { value: 'no', label: 'No' },
                { value: 'si', label: 'Sí' }
            ]},
            { id: 'medicamento_cual', texto: 'Si toma medicamentos, ¿cuál/es?:', tipo: 'texto', requerido: false },
            { id: 'discapacidad', texto: '¿Tiene alguna discapacidad o condición especial?', tipo: 'select', requerido: true, opciones: [
                { value: 'no', label: 'No' },
                { value: 'visual', label: 'Visual' },
                { value: 'auditiva', label: 'Auditiva' },
                { value: 'motriz', label: 'Motriz' },
                { value: 'intelectual', label: 'Intelectual' },
                { value: ' aprendizaje', label: 'Dificultad de aprendizaje' },
                { value: 'otra', label: 'Otra' }
            ]},
            { id: 'antecedentes_mental', texto: '¿Hay antecedentes de problemas de salud mental en su familia?', tipo: 'select', requerido: true, opciones: [
                { value: 'no', label: 'No' },
                { value: 'si', label: 'Sí' },
                { value: 'desconoce', label: 'Lo desconozco' }
            ]},
            { id: 'antecedente_cual', texto: 'Si hay antecedentes, ¿cuál?:', tipo: 'select', requerido: false, opciones: [
                { value: 'depresion', label: 'Depresión' },
                { value: 'ansiedad', label: 'Ansiedad' },
                { value: 'bipolar', label: 'Trastorno bipolar' },
                { value: 'esquizofrenia', label: 'Esquizofrenia' },
                { value: 'alcoholismo', label: 'Alcoholismo' },
                { value: 'drogas', label: 'Adicción a sustancias' },
                { value: 'otro', label: 'Otro' }
            ]},
            { id: 'motivo_ingreso', texto: '¿Cuál fue su motivo principal para ingresar al CBTA?', tipo: 'select', requerido: true, opciones: [
                { value: 'interes', label: 'Interés por la carrera técnica' },
                { value: 'familia', label: 'Decisión familiar' },
                { value: 'segunda_opcion', label: 'Como segunda opción' },
                { value: 'ubicacion', label: 'Cercanía al domicilio' },
                { value: 'economico', label: 'Razones económicas' },
                { value: 'otro', label: 'Otro' }
            ]},
            { id: 'expectativas', texto: '¿Cuáles son sus expectativas profesionales futuras?', tipo: 'select', requerido: true, opciones: [
                { value: 'trabajar_carrera', label: 'Trabajar en mi carrera técnica' },
                { value: 'universidad', label: 'Continuar estudios universitarios' },
                { value: 'emprender', label: 'Emprender mi propio negocio' },
                { value: 'trabajar_estudiar', label: 'Trabajar y estudiar' },
                { value: 'no_se', label: 'Aún no lo sé' },
                { value: 'otro', label: 'Otro' }
            ]},
            { id: 'pasatiempos', texto: '¿Qué actividades realiza en su tiempo libre?', tipo: 'select', requerido: true, opciones: [
                { value: 'deportes', label: 'Deportes' },
                { value: 'musica', label: 'Música' },
                { value: 'videojuegos', label: 'Videojuegos' },
                { value: 'leer', label: 'Leer' },
                { value: 'redes_sociales', label: 'Redes sociales' },
                { value: 'trabajar', label: 'Trabajar' },
                { value: 'familia', label: 'Convivir con familia' },
                { value: 'arte', label: 'Actividades artísticas' },
                { value: 'otro', label: 'Otro' }
            ]},
            { id: 'trabaja', texto: '¿Trabaja actualmente?', tipo: 'select', requerido: true, opciones: [
                { value: 'no', label: 'No' },
                { value: 'tiempo_parcial', label: 'Sí, medio tiempo' },
                { value: 'tiempo_completo', label: 'Sí, tiempo completo' },
                { value: 'fines_semana', label: 'Sí, solo fines de semana' },
                { value: 'vacaciones', label: 'Solo en vacaciones' }
            ]},
        ]
    },
    
    // ============================================
    // CHTE - HÁBITOS DE ESTUDIO
    // ============================================
    'chte': {
        id: 'chte',
        nombre: 'CHTE - Hábitos de Estudio',
        descripcion: 'Evaluación de estrategias de planificación y estudio',
        instrucciones: 'Responda según su comportamiento habitual en sus sesiones de estudio. No hay respuestas correctas o incorrectas.',
        preguntas: [
            { id: 'q1', texto: 'Hago un plan o un horario para mis horas de estudio.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q2', texto: 'Tengo un lugar fijo y adecuado para estudiar, libre de distracciones.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q3', texto: 'Cuando leo un texto, subrayo las ideas principales o hago anotaciones al margen.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q4', texto: 'Priorizo las tareas más difíciles para cuando estoy más descansado.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q5', texto: 'Reviso mis apuntes después de clase para asegurarme de que los entiendo.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q6', texto: 'Hago resúmenes o esquemas para organizar la información.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q7', texto: 'Me preparo con anticipación para los exámenes (no estudio solo el día anterior).', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q8', texto: 'Busco información adicional cuando no entiendo un tema.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q9', texto: 'Evito distracciones (celular, redes sociales) mientras estudio.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
            { id: 'q10', texto: 'Establezco metas específicas para cada sesión de estudio.', tipo: 'opcion', opciones: [
                { value: '5', label: 'Siempre', puntaje: 5 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '3', label: 'A veces', puntaje: 3 },
                { value: '2', label: 'Rara vez', puntaje: 2 },
                { value: '1', label: 'Nunca', puntaje: 1 }
            ]},
        ]
    },
    
    // ============================================
    // PHQ-9 - DEPRESIÓN
    // ============================================
    'phq-9': {
        id: 'phq-9',
        nombre: 'PHQ-9 - Tamizaje de Depresión',
        descripcion: 'Cuestionario de salud del paciente para detección de depresión',
        instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia ha tenido los siguientes problemas? Responda con sinceridad.',
        preguntas: [
            { id: 'q1', texto: 'Poco interés o placer en hacer cosas.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q2', texto: 'Se ha sentido desanimado/a, deprimido/a o sin esperanza.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q3', texto: 'Ha tenido dificultad para quedarse o seguir dormido/a, o ha dormido demasiado.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q4', texto: 'Se ha sentido cansado/a o con poca energía.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q5', texto: 'Ha perdido el apetito o ha estado comiendo en exceso.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q6', texto: 'Se ha sentido mal consigo mismo/a, o ha sentido que es un fracaso o que ha decepcionado a su familia o a sí mismo/a.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q7', texto: 'Ha tenido dificultad para concentrarse en cosas como leer el periódico o ver televisión.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q8', texto: 'Se ha movido o hablado tan lento que otras personas podrían haberlo notado, o al contrario, estaba tan inquieto/a que se movía más de lo habitual.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q9', texto: 'Ha tenido pensamientos de que sería mejor estar muerto/a o de lastimarse de alguna manera.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
        ]
    },
    
    // ============================================
    // GAD-7 - ANSIEDAD
    // ============================================
    'gad-7': {
        id: 'gad-7',
        nombre: 'GAD-7 - Tamizaje de Ansiedad',
        descripcion: 'Cuestionario generalizado de ansiedad',
        instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia ha tenido los siguientes problemas?',
        preguntas: [
            { id: 'q1', texto: 'Se ha sentido nervioso/a, ansioso/a o con los nervios de punta.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q2', texto: 'No ha podido dejar de preocuparse o controlar la preocupación.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q3', texto: 'Se ha preocupado demasiado por diferentes cosas.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q4', texto: 'Ha tenido dificultad para relajarse.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q5', texto: 'Se ha sentido tan inquieto/a que le era difícil quedarse sentado/a.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q6', texto: 'Se ha sentido fácilmente irritado/a o molesto/a.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
            { id: 'q7', texto: 'Ha sentido miedo como si algo terrible pudiera suceder.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Ningún día (0)', puntaje: 0 },
                { value: '1', label: 'Varios días (1)', puntaje: 1 },
                { value: '2', label: 'Más de la mitad de los días (2)', puntaje: 2 },
                { value: '3', label: 'Casi todos los días (3)', puntaje: 3 }
            ]},
        ]
    },
    
    // ============================================
    // BAI - ANSIEDAD DE BECK
    // ============================================
    'bai': {
        id: 'bai',
        nombre: 'BAI - Inventario de Ansiedad de Beck',
        descripcion: 'Evaluación de severidad de ansiedad',
        instrucciones: 'A continuación se presentan síntomas de ansiedad. Indique cuánto le han afectado en la última semana.',
        preguntas: [
            { id: 'q1', texto: 'Entumecimiento u hormigueo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q2', texto: 'Sensación de calor.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q3', texto: 'Temblores en las piernas.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q4', texto: 'Incapacidad para relajarse.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q5', texto: 'Miedo a que ocurra lo peor.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q6', texto: 'Mareo o aturdimiento.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q7', texto: 'Latidos del corazón fuertes y rápidos.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q8', texto: 'Inestabilidad.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q9', texto: 'Aterrorizado/a.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q10', texto: 'Nerviosismo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q11', texto: 'Sensación de ahogo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q12', texto: 'Manos temblorosas.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q13', texto: 'Inquietud.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q14', texto: 'Miedo a perder el control.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q15', texto: 'Dificultad para respirar.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q16', texto: 'Miedo a morir.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q17', texto: 'Miedo a desmayarse.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q18', texto: 'Sudoración.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q19', texto: 'Náuseas o malestar abdominal.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q20', texto: 'Rubor facial.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
            { id: 'q21', texto: 'Escalofríos.', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me ha afectado', puntaje: 0 },
                { value: '1', label: 'Levemente', puntaje: 1 },
                { value: '2', label: 'Moderadamente', puntaje: 2 },
                { value: '3', label: 'Severamente', puntaje: 3 }
            ]},
        ]
    },
    
    // ============================================
    // BDI-II - DEPRESIÓN DE BECK
    // ============================================
    'bdi-ii': {
        id: 'bdi-ii',
        nombre: 'BDI-II - Inventario de Depresión de Beck',
        descripcion: 'Evaluación de severidad de síntomas depresivos',
        instrucciones: 'Este cuestionario consiste en grupos de afirmaciones. Lea cada grupo y seleccione la que mejor describa cómo se ha sentido durante las últimas dos semanas.',
        preguntas: [
            { id: 'q1', texto: 'Tristeza:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me siento triste', puntaje: 0 },
                { value: '1', label: 'Me siento triste gran parte del tiempo', puntaje: 1 },
                { value: '2', label: 'Me siento triste todo el tiempo', puntaje: 2 },
                { value: '3', label: 'Me siento tan triste que no puedo soportarlo', puntaje: 3 }
            ]},
            { id: 'q2', texto: 'Pesimismo:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No estoy desanimado sobre mi futuro', puntaje: 0 },
                { value: '1', label: 'Me siento más desanimado sobre mi futuro que antes', puntaje: 1 },
                { value: '2', label: 'No espero que las cosas funcionen para mí', puntaje: 2 },
                { value: '3', label: 'Siento que mi futuro no tiene esperanza', puntaje: 3 }
            ]},
            { id: 'q3', texto: 'Fracaso:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me siento como un fracaso', puntaje: 0 },
                { value: '1', label: 'He fracasado más de lo que debería', puntaje: 1 },
                { value: '2', label: 'Cuando miro hacia atrás, veo muchos fracasos', puntaje: 2 },
                { value: '3', label: 'Me siento como una persona totalmente fracasada', puntaje: 3 }
            ]},
            { id: 'q4', texto: 'Pérdida de placer:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Obtengo tanto placer como siempre', puntaje: 0 },
                { value: '1', label: 'No obtengo tanto placer como antes', puntaje: 1 },
                { value: '2', label: 'Obtengo muy poco placer de las cosas que disfrutaba', puntaje: 2 },
                { value: '3', label: 'No puedo obtener placer de las cosas que disfrutaba', puntaje: 3 }
            ]},
            { id: 'q5', texto: 'Sentimientos de culpa:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me siento particularmente culpable', puntaje: 0 },
                { value: '1', label: 'Me siento culpable por muchas cosas', puntaje: 1 },
                { value: '2', label: 'Me siento bastante culpable la mayor parte del tiempo', puntaje: 2 },
                { value: '3', label: 'Me siento culpable todo el tiempo', puntaje: 3 }
            ]},
            { id: 'q6', texto: 'Sentimientos de castigo:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No siento que esté siendo castigado/a', puntaje: 0 },
                { value: '1', label: 'Siento que puedo ser castigado/a', puntaje: 1 },
                { value: '2', label: 'Espero ser castigado/a', puntaje: 2 },
                { value: '3', label: 'Siento que estoy siendo castigado/a', puntaje: 3 }
            ]},
            { id: 'q7', texto: 'Disconformidad con uno mismo:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Me siento igual que siempre', puntaje: 0 },
                { value: '1', label: 'He perdido confianza en mí mismo/a', puntaje: 1 },
                { value: '2', label: 'Estoy decepcionado/a conmigo mismo/a', puntaje: 2 },
                { value: '3', label: 'No me gusto a mí mismo/a', puntaje: 3 }
            ]},
            { id: 'q8', texto: 'Autocrítica:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No me critico ni me culpo más de lo habitual', puntaje: 0 },
                { value: '1', label: 'Estoy más crítico conmigo mismo/a que antes', puntaje: 1 },
                { value: '2', label: 'Me critico a mí mismo/a por todos mis errores', puntaje: 2 },
                { value: '3', label: 'Me culpo por todo lo malo que sucede', puntaje: 3 }
            ]},
            { id: 'q9', texto: 'Pensamientos o deseos suicidas:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No tengo pensamientos de matarme', puntaje: 0 },
                { value: '1', label: 'He tenido pensamientos de matarme, pero no lo haría', puntaje: 1 },
                { value: '2', label: 'Me gustaría matarme', puntaje: 2 },
                { value: '3', label: 'Me mataría si tuviera la oportunidad', puntaje: 3 }
            ]},
            { id: 'q10', texto: 'Llanto:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No lloro más de lo habitual', puntaje: 0 },
                { value: '1', label: 'Lloro más de lo que solía hacerlo', puntaje: 1 },
                { value: '2', label: 'Lloro por cualquier pequeña cosa', puntaje: 2 },
                { value: '3', label: 'Quisiera poder llorar pero no puedo', puntaje: 3 }
            ]},
            { id: 'q11', texto: 'Agitación:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No estoy más agitado/a que antes', puntaje: 0 },
                { value: '1', label: 'Me siento más agitado/a que antes', puntaje: 1 },
                { value: '2', label: 'Me siento tan agitado/a que es difícil quedarme quieto/a', puntaje: 2 },
                { value: '3', label: 'Estoy tan agitado/a que no puedo quedarme quieto/a', puntaje: 3 }
            ]},
            { id: 'q12', texto: 'Pérdida de interés:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No he perdido el interés en otras actividades o personas', puntaje: 0 },
                { value: '1', label: 'Estoy menos interesado/a en otras personas que antes', puntaje: 1 },
                { value: '2', label: 'He perdido casi todo interés en otras personas', puntaje: 2 },
                { value: '3', label: 'Es difícil interesarme en algo', puntaje: 3 }
            ]},
            { id: 'q13', texto: 'Indecisión:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Tomo decisiones tan bien como siempre', puntaje: 0 },
                { value: '1', label: 'Me cuesta más tomar decisiones que antes', puntaje: 1 },
                { value: '2', label: 'Tengo mucha dificultad para tomar decisiones', puntaje: 2 },
                { value: '3', label: 'Tengo problemas para tomar cualquier decisión', puntaje: 3 }
            ]},
            { id: 'q14', texto: 'Desvalorización:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No siento que no valga nada', puntaje: 0 },
                { value: '1', label: 'No me considero tan valioso/a como antes', puntaje: 1 },
                { value: '2', label: 'Siento que no valgo nada comparado con otros', puntaje: 2 },
                { value: '3', label: 'Siento que soy completamente inútil', puntaje: 3 }
            ]},
            { id: 'q15', texto: 'Pérdida de energía:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Tengo tanta energía como siempre', puntaje: 0 },
                { value: '1', label: 'Tengo menos energía que antes', puntaje: 1 },
                { value: '2', label: 'No tengo suficiente energía para hacer mucho', puntaje: 2 },
                { value: '3', label: 'No tengo energía para hacer nada', puntaje: 3 }
            ]},
            { id: 'q16', texto: 'Cambios en los patrones de sueño:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No he notado cambios en mi sueño', puntaje: 0 },
                { value: '1', label: 'Duermo un poco más de lo habitual', puntaje: 1 },
                { value: '2', label: 'Duermo mucho más de lo habitual', puntaje: 2 },
                { value: '3', label: 'Duermo la mayor parte del día', puntaje: 3 }
            ]},
            { id: 'q17', texto: 'Irritabilidad:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No estoy más irritable que de costumbre', puntaje: 0 },
                { value: '1', label: 'Estoy más irritable que de costumbre', puntaje: 1 },
                { value: '2', label: 'Estoy mucho más irritable que de costumbre', puntaje: 2 },
                { value: '3', label: 'Estoy irritable todo el tiempo', puntaje: 3 }
            ]},
            { id: 'q18', texto: 'Cambios en el apetito:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No he notado cambios en mi apetito', puntaje: 0 },
                { value: '1', label: 'Mi apetito es un poco menor que de costumbre', puntaje: 1 },
                { value: '2', label: 'Mi apetito es mucho menor que antes', puntaje: 2 },
                { value: '3', label: 'No tengo apetito en absoluto', puntaje: 3 }
            ]},
            { id: 'q19', texto: 'Dificultad de concentración:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Puedo concentrarme tan bien como siempre', puntaje: 0 },
                { value: '1', label: 'No puedo concentrarme tan bien como antes', puntaje: 1 },
                { value: '2', label: 'Es difícil mantener la concentración en algo', puntaje: 2 },
                { value: '3', label: 'No puedo concentrarme en nada', puntaje: 3 }
            ]},
            { id: 'q20', texto: 'Cansancio o fatiga:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No estoy más cansado/a que de costumbre', puntaje: 0 },
                { value: '1', label: 'Me canso más fácilmente que de costumbre', puntaje: 1 },
                { value: '2', label: 'Estoy demasiado cansado/a para hacer muchas cosas', puntaje: 2 },
                { value: '3', label: 'Estoy demasiado cansado/a para hacer cualquier cosa', puntaje: 3 }
            ]},
            { id: 'q21', texto: 'Pérdida de interés en el sexo:', tipo: 'opcion', opciones: [
                { value: '0', label: 'No he notado cambios recientes en mi interés sexual', puntaje: 0 },
                { value: '1', label: 'Estoy menos interesado/a en el sexo que antes', puntaje: 1 },
                { value: '2', label: 'Estoy mucho menos interesado/a en el sexo', puntaje: 2 },
                { value: '3', label: 'He perdido completamente el interés en el sexo', puntaje: 3 }
            ]},
        ]
    },
    
    // ============================================
    // HADS - ESCALA HOSPITALARIA DE ANSIEDAD Y DEPRESIÓN
    // ============================================
    'hads': {
        id: 'hads',
        nombre: 'HADS - Escala Hospitalaria',
        descripcion: 'Detección de ansiedad y depresión en contexto hospitalario',
        instrucciones: 'Responda según cómo se ha sentido durante la última semana.',
        preguntas: [
            { id: 'q1', texto: 'Me siento tenso/a o "con los nervios de punta":', tipo: 'opcion', opciones: [
                { value: '0', label: 'La mayor parte del tiempo', puntaje: 3 },
                { value: '1', label: 'Muchas veces', puntaje: 2 },
                { value: '2', label: 'Algunas veces', puntaje: 1 },
                { value: '3', label: 'En ninguna ocasión', puntaje: 0 }
            ]},
            { id: 'q2', texto: 'Disfruto de las mismas cosas que antes:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Definitivamente igual que antes', puntaje: 0 },
                { value: '1', label: 'No tanto como antes', puntaje: 1 },
                { value: '2', label: 'Solo un poco', puntaje: 2 },
                { value: '3', label: 'Casi nada', puntaje: 3 }
            ]},
            { id: 'q3', texto: 'Tengo una sensación de miedo, como si algo terrible fuera a suceder:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Definitivamente y bastante grave', puntaje: 3 },
                { value: '1', label: 'Sí, pero no muy grave', puntaje: 2 },
                { value: '2', label: 'Un poco, pero no me preocupa', puntaje: 1 },
                { value: '3', label: 'En absoluto', puntaje: 0 }
            ]},
            { id: 'q4', texto: 'Puedo reír y ver el lado divertido de las cosas:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Igual que siempre', puntaje: 0 },
                { value: '1', label: 'No tanto como antes', puntaje: 1 },
                { value: '2', label: 'Definitivamente menos que antes', puntaje: 2 },
                { value: '3', label: 'En absoluto', puntaje: 3 }
            ]},
            { id: 'q5', texto: 'Tengo la cabeza llena de preocupaciones:', tipo: 'opcion', opciones: [
                { value: '0', label: 'La mayor parte del tiempo', puntaje: 3 },
                { value: '1', label: 'Muchas veces', puntaje: 2 },
                { value: '2', label: 'Algunas veces', puntaje: 1 },
                { value: '3', label: 'En ninguna ocasión', puntaje: 0 }
            ]},
            { id: 'q6', texto: 'Me siento alegre:', tipo: 'opcion', opciones: [
                { value: '0', label: 'En ninguna ocasión', puntaje: 3 },
                { value: '1', label: 'Algunas veces', puntaje: 2 },
                { value: '2', label: 'Muchas veces', puntaje: 1 },
                { value: '3', label: 'La mayor parte del tiempo', puntaje: 0 }
            ]},
            { id: 'q7', texto: 'Puedo sentarme tranquilo/a y relajado/a:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Definitivamente', puntaje: 0 },
                { value: '1', label: 'Por lo general', puntaje: 1 },
                { value: '2', label: 'No muy a menudo', puntaje: 2 },
                { value: '3', label: 'En absoluto', puntaje: 3 }
            ]},
            { id: 'q8', texto: 'Tengo la sensación de que todo me cuesta trabajo:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Todo el tiempo', puntaje: 3 },
                { value: '1', label: 'La mayor parte del tiempo', puntaje: 2 },
                { value: '2', label: 'Algunas veces', puntaje: 1 },
                { value: '3', label: 'En ninguna ocasión', puntaje: 0 }
            ]},
            { id: 'q9', texto: 'Tengo una sensación de miedo en el estómago:', tipo: 'opcion', opciones: [
                { value: '0', label: 'En ninguna ocasión', puntaje: 0 },
                { value: '1', label: 'Algunas veces', puntaje: 1 },
                { value: '2', label: 'Muchas veces', puntaje: 2 },
                { value: '3', label: 'La mayor parte del tiempo', puntaje: 3 }
            ]},
            { id: 'q10', texto: 'He perdido interés por mi apariencia personal:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Totalmente', puntaje: 3 },
                { value: '1', label: 'Bastante', puntaje: 2 },
                { value: '2', label: 'Un poco', puntaje: 1 },
                { value: '3', label: 'Igual que siempre', puntaje: 0 }
            ]},
            { id: 'q11', texto: 'Me siento inquieto/a como si no pudiera parar:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Muchísimo', puntaje: 3 },
                { value: '1', label: 'Bastante', puntaje: 2 },
                { value: '2', label: 'Algo', puntaje: 1 },
                { value: '3', label: 'En absoluto', puntaje: 0 }
            ]},
            { id: 'q12', texto: 'Me siento optimista respecto al futuro:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Igual que siempre', puntaje: 0 },
                { value: '1', label: 'Menos que antes', puntaje: 1 },
                { value: '2', label: 'Mucho menos que antes', puntaje: 2 },
                { value: '3', label: 'En absoluto', puntaje: 3 }
            ]},
            { id: 'q13', texto: 'Tengo ataques de pánico:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Muchísimos', puntaje: 3 },
                { value: '1', label: 'Bastantes', puntaje: 2 },
                { value: '2', label: 'Algunos', puntaje: 1 },
                { value: '3', label: 'En absoluto', puntaje: 0 }
            ]},
            { id: 'q14', texto: 'Puedo disfrutar de un buen libro, programa de radio o TV:', tipo: 'opcion', opciones: [
                { value: '0', label: 'Muchas veces', puntaje: 0 },
                { value: '1', label: 'Algunas veces', puntaje: 1 },
                { value: '2', label: 'Muy pocas veces', puntaje: 2 },
                { value: '3', label: 'En ninguna ocasión', puntaje: 3 }
            ]},
        ]
    },
    
    // ============================================
    // BHS - ESCALA DE DESESPERANZA DE BECK
    // ============================================
    'bhs': {
        id: 'bhs',
        nombre: 'BHS - Escala de Desesperanza',
        descripcion: 'Evaluación del nivel de desesperanza',
        instrucciones: 'Lea cada afirmación y seleccione Verdadero o Falso según cómo se ha sentido durante la última semana.',
        preguntas: [
            { id: 'q1', texto: 'Espero el futuro con esperanza y entusiasmo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q2', texto: 'Podría rendirme porque no puedo hacer que las cosas salgan bien para mí.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q3', texto: 'Cuando las cosas van mal, me ayuda saber que no pueden seguir así siempre.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q4', texto: 'No puedo imaginar cómo será mi vida en 10 años.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q5', texto: 'Tengo tiempo para lograr las cosas que más deseo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q6', texto: 'En el futuro, espero tener éxito en lo que más me interesa.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q7', texto: 'Mi futuro me parece oscuro.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q8', texto: 'Espero más cosas buenas de la vida que las que probablemente obtendré.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q9', texto: 'Simplemente no tengo la suerte de conseguir lo que quiero.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q10', texto: 'Mis pasadas experiencias han preparado el camino para mi futuro.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q11', texto: 'Todo lo que puedo ver por delante es desagradable más que agradable.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q12', texto: 'No espero conseguir lo que realmente deseo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q13', texto: 'Cuando miro hacia el futuro, espero ser más feliz de lo que soy ahora.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q14', texto: 'Las cosas simplemente no funcionarán como yo quiero.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q15', texto: 'Tengo mucha confianza de que las cosas saldrán bien para mí.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q16', texto: 'Nunca consigo lo que quiero, así que es absurdo desear cualquier cosa.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q17', texto: 'Es poco probable que consiga satisfacción real en el futuro.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q18', texto: 'El futuro me parece vago e incierto.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
            { id: 'q19', texto: 'Espero más buenos días que malos.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 0 },
                { value: '1', label: 'Falso', puntaje: 1 }
            ]},
            { id: 'q20', texto: 'Es inútil intentar conseguir algo que deseo porque probablemente no lo conseguiré.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Verdadero', puntaje: 1 },
                { value: '1', label: 'Falso', puntaje: 0 }
            ]},
        ]
    },
    
    // ============================================
    // CDFR - FACTORES DE RIESGO
    // ============================================
    'cdfr': {
        id: 'cdfr',
        nombre: 'CDFR - Cuestionario de Factores de Riesgo',
        descripcion: 'Evaluación de factores de riesgo psicosocial',
        instrucciones: 'Responda cada pregunta de manera honesta. Esta información es confidencial.',
        preguntas: [
            { id: 'q1', texto: '¿Ha experimentado algún evento estresante importante en los últimos 6 meses?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No' },
                { value: '1', label: 'Sí, uno' },
                { value: '2', label: 'Sí, varios' }
            ]},
            { id: 'q2', texto: '¿Cómo describiría su relación con sus padres/tutores?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Muy buena' },
                { value: '1', label: 'Buena' },
                { value: '2', label: 'Regular' },
                { value: '3', label: 'Mala' }
            ]},
            { id: 'q3', texto: '¿Ha consumido alcohol en el último mes?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No' },
                { value: '1', label: 'Una o dos veces' },
                { value: '2', label: 'Varias veces' },
                { value: '3', label: 'Frecuentemente' }
            ]},
            { id: 'q4', texto: '¿Ha tenido pensamientos de hacerte daño?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca' },
                { value: '1', label: 'Rara vez' },
                { value: '2', label: 'Algunas veces' },
                { value: '3', label: 'Frecuentemente' }
            ]},
            { id: 'q5', texto: '¿Tiene alguien con quien hablar de sus problemas?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Sí, varias personas' },
                { value: '1', label: 'Sí, una persona' },
                { value: '2', label: 'No estoy seguro/a' },
                { value: '3', label: 'No' }
            ]},
            { id: 'q6', texto: '¿Cómo calificaría su rendimiento escolar actual?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Excelente' },
                { value: '1', label: 'Bueno' },
                { value: '2', label: 'Regular' },
                { value: '3', label: 'Bajo' }
            ]},
            { id: 'q7', texto: '¿Ha experimentado violencia o abuso?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No' },
                { value: '1', label: 'Una vez' },
                { value: '2', label: 'Varias veces' }
            ]},
            { id: 'q8', texto: '¿Se siente apoyado/a por su familia?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Totalmente' },
                { value: '1', label: 'Bastante' },
                { value: '2', label: 'Poco' },
                { value: '3', label: 'Nada' }
            ]},
            { id: 'q9', texto: '¿Ha tenido problemas de conducta en la escuela?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No' },
                { value: '1', label: 'Algunas veces' },
                { value: '2', label: 'Frecuentemente' }
            ]},
            { id: 'q10', texto: '¿Se ha sentido muy triste o deprimido/a por más de dos semanas?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No' },
                { value: '1', label: 'Una vez' },
                { value: '2', label: 'Varias veces' },
                { value: '3', label: 'Constantemente' }
            ]},
        ]
    },
    
    // ============================================
    // IPA - PENSAMIENTOS AUTOMÁTICOS
    // ============================================
    'ipa': {
        id: 'ipa',
        nombre: 'IPA - Inventario de Pensamientos Automáticos',
        descripcion: 'Evaluación de distorsiones cognitivas',
        instrucciones: 'Indique con qué frecuencia tiene cada tipo de pensamiento.',
        preguntas: [
            { id: 'q1', texto: 'Pienso que las personas me están criticando.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q2', texto: 'Pienso que algo terrible va a suceder.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q3', texto: 'Pienso que no tengo suerte.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q4', texto: 'Pienso que soy un fracaso.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q5', texto: 'Pienso que no puedo cambiar las cosas.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q6', texto: 'Pienso que no puedo hacer nada bien.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q7', texto: 'Pienso que no me gusta como soy.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q8', texto: 'Pienso que la gente no me quiere.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q9', texto: 'Pienso que no soy tan inteligente como los demás.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
            { id: 'q10', texto: 'Pienso que todo es mi culpa.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Casi nunca', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Casi siempre', puntaje: 4 },
                { value: '5', label: 'Siempre', puntaje: 5 }
            ]},
        ]
    },
    
    // ============================================
    // ASSIST - CONSUMO DE SUSTANCIAS
    // ============================================
    'assist': {
        id: 'assist',
        nombre: 'ASSIST - Detección de Consumo de Sustancias',
        descripcion: 'Cuestionario para detección de uso de sustancias',
        instrucciones: 'Responda las siguientes preguntas sobre el consumo de sustancias. Sea honesto/a, esta información es confidencial.',
        preguntas: [
            { id: 'q1', texto: '¿Con qué frecuencia ha consumido bebidas alcohólicas?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '2', label: 'Una o dos veces', puntaje: 2 },
                { value: '3', label: 'Mensualmente', puntaje: 3 },
                { value: '4', label: 'Semanalmente', puntaje: 4 },
                { value: '6', label: 'Diariamente', puntaje: 6 }
            ]},
            { id: 'q2', texto: '¿Con qué frecuencia ha fumado tabaco?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '2', label: 'Una o dos veces', puntaje: 2 },
                { value: '3', label: 'Mensualmente', puntaje: 3 },
                { value: '4', label: 'Semanalmente', puntaje: 4 },
                { value: '6', label: 'Diariamente', puntaje: 6 }
            ]},
            { id: 'q3', texto: '¿Con qué frecuencia ha consumido cannabis (marihuana)?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '2', label: 'Una o dos veces', puntaje: 2 },
                { value: '3', label: 'Mensualmente', puntaje: 3 },
                { value: '4', label: 'Semanalmente', puntaje: 4 },
                { value: '6', label: 'Diariamente', puntaje: 6 }
            ]},
            { id: 'q4', texto: '¿Con qué frecuencia ha usado cocaína?', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '2', label: 'Una o dos veces', puntaje: 2 },
                { value: '3', label: 'Mensualmente', puntaje: 3 },
                { value: '4', label: 'Semanalmente', puntaje: 4 },
                { value: '6', label: 'Diariamente', puntaje: 6 }
            ]},
            { id: 'q5', texto: '¿Alguien ha expresado preocupación por su consumo de alcohol u otras sustancias?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No, nunca', puntaje: 0 },
                { value: '3', label: 'Sí, en los últimos 3 meses', puntaje: 3 },
                { value: '6', label: 'Sí, pero no en los últimos 3 meses', puntaje: 6 }
            ]},
            { id: 'q6', texto: '¿Ha intentado alguna vez dejar o controlar el consumo de sustancias sin éxito?', tipo: 'opcion', opciones: [
                { value: '0', label: 'No', puntaje: 0 },
                { value: '3', label: 'Sí, en los últimos 3 meses', puntaje: 3 },
                { value: '6', label: 'Sí, pero no en los últimos 3 meses', puntaje: 6 }
            ]},
        ]
    },
    
    // ============================================
    // EBMA - MOTIVACIÓN ACADÉMICA
    // ============================================
    'ebma': {
        id: 'ebma',
        nombre: 'EBMA - Escala de Motivación Académica',
        descripcion: 'Evaluación de motivación intrínseca y extrínseca',
        instrucciones: 'Indique en qué medida está de acuerdo con cada afirmación.',
        preguntas: [
            { id: 'q1', texto: 'Estudio porque disfruto aprendiendo cosas nuevas.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q2', texto: 'Estudio porque quiero tener un buen trabajo en el futuro.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q3', texto: 'Estudio porque mis padres/familia esperan que lo haga.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q4', texto: 'Me siento satisfecho/a cuando aprendo algo nuevo en clase.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q5', texto: 'Estudio para no reprobar las materias.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q6', texto: 'Me gustaría que las clases fueran más interesantes.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q7', texto: 'Pienso que lo que aprendo me será útil en mi vida.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
            { id: 'q8', texto: 'Estudio porque quiero demostrar que puedo ser exitoso/a.', tipo: 'opcion', opciones: [
                { value: '1', label: 'Totalmente en desacuerdo', puntaje: 1 },
                { value: '2', label: 'En desacuerdo', puntaje: 2 },
                { value: '3', label: 'Neutral', puntaje: 3 },
                { value: '4', label: 'De acuerdo', puntaje: 4 },
                { value: '5', label: 'Totalmente de acuerdo', puntaje: 5 }
            ]},
        ]
    },
    
    // ============================================
    // LIRA - RIESGO ACADÉMICO
    // ============================================
    'lira': {
        id: 'lira',
        nombre: 'LIRA - Riesgo Académico',
        descripcion: 'Identificación de factores de riesgo académico',
        instrucciones: 'Indique con qué frecuencia experimenta cada situación.',
        preguntas: [
            { id: 'q1', texto: 'Tengo dificultad para entender lo que explican los maestros.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q2', texto: 'Me cuesta trabajo poner atención en clase.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q3', texto: 'Falto a clases con frecuencia.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q4', texto: 'No entrego mis tareas a tiempo.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q5', texto: 'Tengo problemas para organizarme con mis estudios.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q6', texto: 'Me siento desmotivado/a para estudiar.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q7', texto: 'Tengo problemas con mis compañeros.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
            { id: 'q8', texto: 'Mis calificaciones han bajado últimamente.', tipo: 'opcion', opciones: [
                { value: '0', label: 'Nunca', puntaje: 0 },
                { value: '1', label: 'Rara vez', puntaje: 1 },
                { value: '2', label: 'A veces', puntaje: 2 },
                { value: '3', label: 'Con frecuencia', puntaje: 3 },
                { value: '4', label: 'Siempre', puntaje: 4 }
            ]},
        ]
    },
};

// Nombres amigables para pruebas que no tienen definición completa
const testNames: Record<string, string> = {
    'ficha-id': 'Ficha de Identificación',
    'bdi-ii': 'BDI-II (Depresión)',
    'bai': 'BAI (Ansiedad)',
    'phq-9': 'PHQ-9 (Depresión)',
    'gad-7': 'GAD-7 (Ansiedad)',
    'hads': 'HADS (Ansiedad/Depresión)',
    'bhs': 'BHS (Desesperanza)',
    'ssi': 'SSI (Ideación Suicida)',
    'columbia': 'Columbia C-SSRS',
    'plutchik': 'Plutchik (Riesgo Suicida)',
    'idare': 'IDARE/STAI (Ansiedad)',
    'lira': 'LIRA (Riesgo Académico)',
    'goca': 'GOCA (Observación)',
    'ipa': 'IPA (Pensamientos Automáticos)',
    'cdfr': 'CDFR (Factores de Riesgo)',
    'assist': 'ASSIST (Sustancias)',
    'ebma': 'EBMA (Motivación)',
    'chte': 'CHTE (Hábitos de Estudio)',
};

// ============================================
// FUNCIONES AUXILIARES PARA GUARDADO
// ============================================

// Guardar en localStorage como respaldo
function guardarEnLocalStorage(tipo: string, datos: any) {
    try {
        const key = `pigec_evaluacion_${tipo}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
            ...datos,
            fechaLocal: new Date().toISOString(),
            guardadoEn: 'localStorage'
        });
        localStorage.setItem(key, JSON.stringify(existing));
        console.log(`[localStorage] Guardado: ${key}`, datos);
        return true;
    } catch (error) {
        console.error('[localStorage] Error al guardar:', error);
        return false;
    }
}

// Obtener datos de prueba de localStorage
function obtenerDeLocalStorage(tipo: string) {
    try {
        const key = `pigec_evaluacion_${tipo}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        return [];
    }
}

// Limpiar datos de prueba de localStorage
function limpiarLocalStorage() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('pigec_evaluacion_')) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        return false;
    }
}

interface SessionData {
    id: string;
    name: string;
    tests: string[];
    groups: string[];
    status: string;
    expiresAt?: Date;
}

export default function EvaluacionPage() {
    const params = useParams();
    const tokenId = params.tokenId as string;

    // Estados
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Identificación
    const [step, setStep] = useState<'matricula' | 'consentimiento' | 'evaluacion' | 'completado'>('matricula');
    const [matriculaInput, setMatriculaInput] = useState('');
    const [validandoMatricula, setValidandoMatricula] = useState(false);
    const [estudiante, setEstudiante] = useState<MatriculaRegistro | null>(null);
    const [matriculaError, setMatriculaError] = useState<string | null>(null);
    
    // Consentimiento
    const [isConsented, setIsConsented] = useState(false);
    
    // Evaluación
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [completedTests, setCompletedTests] = useState<string[]>([]);
    const [expedienteId, setExpedienteId] = useState<string | null>(null);
    const [respuestasActuales, setRespuestasActuales] = useState<Record<string, string>>({});
    const [guardando, setGuardando] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, any>>({});
    const [savedToLocalStorage, setSavedToLocalStorage] = useState(false);
    
    // Estado para diálogo de prueba repetida
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [existingTestDocId, setExistingTestDocId] = useState<string | null>(null);
    const [pendingTestSave, setPendingTestSave] = useState(false);

    // Cargar datos de la sesión
    useEffect(() => {
        const loadSession = async () => {
            if (!db) {
                setError('Base de datos no disponible');
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'evaluation_sessions'),
                    where('id', '==', tokenId)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setError('Sesión de evaluación no encontrada o expirada');
                } else {
                    const data = snapshot.docs[0].data();
                    
                    // Asegurar que 'ficha-id' sea siempre la primera prueba
                    let tests = data.tests || [];
                    if (tests.includes('ficha-id')) {
                        tests = ['ficha-id', ...tests.filter((t: string) => t !== 'ficha-id')];
                    } else {
                        tests = ['ficha-id', ...tests];
                    }
                    
                    // Filtrar pruebas que no existen en el catálogo
                    tests = tests.filter((t: string) => PRUEBAS_CATALOGO[t]);
                    
                    setSession({
                        id: data.id,
                        name: data.name,
                        tests: tests,
                        groups: data.groups || [],
                        status: data.status,
                        expiresAt: data.expiresAt?.toDate()
                    });
                }
            } catch (err) {
                console.error('Error cargando sesión:', err);
                setError('Error al cargar la sesión');
            }
            setLoading(false);
        };

        loadSession();
    }, [tokenId]);

    // Validar matrícula
    const handleValidarMatricula = async () => {
        if (!matriculaInput.trim()) {
            setMatriculaError('Ingrese su matrícula');
            return;
        }

        setValidandoMatricula(true);
        setMatriculaError(null);

        try {
            const matriculaData = await validarMatricula(matriculaInput.trim().toUpperCase());
            
            if (matriculaData) {
                setEstudiante(matriculaData);
                setStep('consentimiento');
            } else {
                setMatriculaError('Matrícula no encontrada. Verifique e intente nuevamente.');
            }
        } catch (err) {
            console.error('Error validando matrícula:', err);
            setMatriculaError('Error al validar la matrícula');
        }
        
        setValidandoMatricula(false);
    };

    // Crear expediente y comenzar evaluación
    const handleIniciarEvaluacion = async () => {
        if (!estudiante || !session) return;

        try {
            // PRIMERO: Verificar si ya existe un expediente para esta matrícula y sesión
            const expedientesQuery = query(
                collection(db!, 'expedientes'),
                where('matricula', '==', estudiante.matricula),
                where('sessionId', '==', session.id),
                limit(1)
            );
            
            const expedientesExistentes = await getDocs(expedientesQuery);
            
            if (!expedientesExistentes.empty) {
                // Ya existe un expediente
                const expedienteExistente = expedientesExistentes.docs[0];
                const expedienteData = expedienteExistente.data();
                
                console.log('[Firestore] Expediente existente encontrado:', expedienteExistente.id, 'Estado:', expedienteData.estado);
                
                if (expedienteData.estado === 'completado') {
                    // Ya completó la evaluación
                    alert('Ya ha completado esta evaluación anteriormente. No es necesario volver a realizarla.');
                    return;
                }
                
                // Estaba en progreso, recuperar pruebas ya completadas
                setExpedienteId(expedienteExistente.id);
                
                // Buscar pruebas ya completadas
                const resultadosQuery = query(
                    collection(db!, 'test_results'),
                    where('matricula', '==', estudiante.matricula),
                    where('sessionId', '==', session.id)
                );
                const resultadosExistentes = await getDocs(resultadosQuery);
                
                const pruebasCompletadas: string[] = [];
                const resultadosMap: Record<string, any> = {};
                
                resultadosExistentes.docs.forEach(doc => {
                    const data = doc.data();
                    pruebasCompletadas.push(data.testId);
                    resultadosMap[data.testId] = data;
                });
                
                setCompletedTests(pruebasCompletadas);
                setTestResults(resultadosMap);
                
                // Calcular el índice de la siguiente prueba
                const siguienteIndex = pruebasCompletadas.length;
                if (siguienteIndex < session.tests.length) {
                    setCurrentTestIndex(siguienteIndex);
                } else {
                    // Todas las pruebas estaban completas pero el expediente no se marcó como completado
                    // Actualizar el expediente
                    await updateDoc(doc(db!, 'expedientes', expedienteExistente.id), {
                        estado: 'completado',
                        fechaCompletado: Timestamp.now(),
                        testsCompletados: session.tests.length
                    });
                    alert('Ya ha completado todas las pruebas de esta evaluación.');
                    return;
                }
                
                setStep('evaluacion');
                return;
            }

            // NO existe expediente, crear uno nuevo
            const expedienteData = {
                matricula: estudiante.matricula,
                nombreCompleto: estudiante.nombreCompleto,
                grupoId: estudiante.grupoId,
                grupoNombre: estudiante.grupoNombre,
                sessionId: session.id,
                sessionName: session.name,
                fechaCreacion: Timestamp.now(),
                consentimiento: true,
                fechaConsentimiento: Timestamp.now(),
                estado: 'en_progreso',
                testsTotal: session.tests.length,
                testsCompletados: 0
            };

            // Intentar guardar en Firestore
            let expedienteRef;
            try {
                expedienteRef = await addDoc(collection(db!, 'expedientes'), expedienteData);
                setExpedienteId(expedienteRef.id);
                console.log('[Firestore] Expediente creado:', expedienteRef.id);
                
                // Vincular expediente a la matrícula
                await vincularExpediente(estudiante.matricula, expedienteRef.id);
            } catch (firestoreError) {
                console.error('[Firestore] Error al crear expediente:', firestoreError);
                // Guardar en localStorage como respaldo
                const localId = `local_${Date.now()}`;
                setExpedienteId(localId);
                guardarEnLocalStorage('expedientes', {
                    id: localId,
                    ...expedienteData,
                    fechaCreacion: new Date().toISOString()
                });
            }

            setStep('evaluacion');
        } catch (err) {
            console.error('Error iniciando evaluación:', err);
            alert('Error al iniciar la evaluación. Intente nuevamente.');
        }
    };

    // Guardar respuesta de prueba actual
    const handleGuardarRespuesta = (preguntaId: string, valor: string) => {
        setRespuestasActuales(prev => ({
            ...prev,
            [preguntaId]: valor
        }));
    };

    // Verificar si todas las preguntas requeridas están respondidas
    const preguntasRequeridasRespondidas = (prueba: Prueba) => {
        return prueba.preguntas
            .filter(p => p.requerido !== false)
            .every(p => respuestasActuales[p.id] && respuestasActuales[p.id].trim() !== '');
    };

    // Calcular puntaje de la prueba
    const calcularPuntaje = (prueba: Prueba) => {
        let total = 0;
        prueba.preguntas.forEach(p => {
            if (p.opciones) {
                const opcion = p.opciones.find(o => o.value === respuestasActuales[p.id]);
                if (opcion && opcion.puntaje !== undefined) {
                    total += opcion.puntaje;
                }
            }
        });
        return total;
    };

    // Verificar si una prueba ya fue aplicada al consultante
    const verificarPruebaExistente = async (testId: string): Promise<{ existe: boolean; docId: string | null; data: any }> => {
        if (!db || !estudiante || !session) {
            return { existe: false, docId: null, data: null };
        }

        try {
            // Buscar si ya existe un resultado para este test, matricula y sesión
            const q = query(
                collection(db, 'test_results'),
                where('testId', '==', testId),
                where('matricula', '==', estudiante.matricula),
                where('sessionId', '==', session.id),
                limit(1)
            );
            
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                const docData = snapshot.docs[0];
                return { 
                    existe: true, 
                    docId: docData.id, 
                    data: docData.data() 
                };
            }
        } catch (error) {
            console.error('Error verificando prueba existente:', error);
        }
        
        return { existe: false, docId: null, data: null };
    };

    // Guardar resultado de prueba y avanzar
    const handleSiguientePrueba = async (forzarGuardado: boolean = false) => {
        if (!session || !estudiante) return;

        const currentTestId = session.tests[currentTestIndex];
        const prueba = PRUEBAS_CATALOGO[currentTestId];

        // Si no es forzado, verificar si ya existe
        if (!forzarGuardado) {
            const { existe, docId, data } = await verificarPruebaExistente(currentTestId);
            
            if (existe && docId) {
                // Mostrar diálogo de confirmación
                setExistingTestDocId(docId);
                setShowDuplicateDialog(true);
                return;
            }
        }

        setGuardando(true);
        setShowDuplicateDialog(false);

        try {
            // Preparar resultado
            const resultado = {
                testId: currentTestId,
                testName: testNames[currentTestId] || currentTestId,
                expedienteId: expedienteId,
                matricula: estudiante?.matricula,
                nombreCompleto: estudiante?.nombreCompleto,
                grupoId: estudiante?.grupoId,
                grupoNombre: estudiante?.grupoNombre,
                sessionId: session?.id,
                sessionName: session?.name,
                respuestas: { ...respuestasActuales },
                puntaje: prueba ? calcularPuntaje(prueba) : null,
                fechaCompletado: new Date().toISOString(),
                esActualizacion: !!existingTestDocId,
            };

            // Guardar en localStorage siempre como respaldo
            guardarEnLocalStorage('resultados', resultado);
            setSavedToLocalStorage(true);

            // Intentar guardar en Firestore
            try {
                if (existingTestDocId) {
                    // Actualizar documento existente
                    await updateDoc(doc(db!, 'test_results', existingTestDocId), {
                        ...resultado,
                        fechaCompletado: Timestamp.now(),
                        fechaActualizacion: Timestamp.now()
                    });
                    console.log('[Firestore] Resultado actualizado:', currentTestId, 'Doc:', existingTestDocId);
                    setExistingTestDocId(null);
                } else {
                    // Crear nuevo documento
                    await addDoc(collection(db!, 'test_results'), {
                        ...resultado,
                        fechaCompletado: Timestamp.now()
                    });
                    console.log('[Firestore] Resultado guardado:', currentTestId);
                }
            } catch (firestoreError) {
                console.error('[Firestore] Error al guardar resultado:', firestoreError);
            }

            // Guardar en estado local
            setTestResults(prev => ({
                ...prev,
                [currentTestId]: resultado
            }));

            // Marcar como completado
            setCompletedTests(prev => [...prev, currentTestId]);

            // Avanzar a la siguiente prueba o completar
            if (currentTestIndex < session.tests.length - 1) {
                setCurrentTestIndex(prev => prev + 1);
                setRespuestasActuales({});
            } else {
                // Actualizar expediente como completado
                const expedienteFinal = {
                    estado: 'completado',
                    fechaCompletado: Timestamp.now(),
                    testsCompletados: session.tests.length,
                    resultados: testResults
                };

                try {
                    if (expedienteId && !expedienteId.startsWith('local_')) {
                        await updateDoc(doc(db!, 'expedientes', expedienteId), expedienteFinal);
                        console.log('[Firestore] Expediente actualizado como completado');
                    }
                } catch (err) {
                    console.error('[Firestore] Error actualizando expediente:', err);
                }

                // Guardar expediente final en localStorage
                guardarEnLocalStorage('expedientes_completados', {
                    expedienteId,
                    matricula: estudiante?.matricula,
                    nombre: estudiante?.nombreCompleto,
                    testsCompletados: session.tests.length,
                    fechaCompletado: new Date().toISOString()
                });

                setStep('completado');
            }
        } catch (err) {
            console.error('Error guardando resultado:', err);
            alert('Error al guardar. Los datos se han guardado localmente.');
        }

        setGuardando(false);
    };

    // Renderizado de estados
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando sesión de evaluación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
                        <p className="text-red-600">{error}</p>
                        <p className="text-sm text-red-500 mt-4">
                            Contacte al personal de orientación si cree que esto es un error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // MATRÍCULA
    if (step === 'matricula') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">PIGEC-130</CardTitle>
                        <CardDescription>
                            {session?.name || 'Sistema de Evaluación Psicométrica'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="matricula">Ingrese su Matrícula</Label>
                            <Input
                                id="matricula"
                                placeholder="Ej: CBTA-2026-G1A-001"
                                value={matriculaInput}
                                onChange={(e) => setMatriculaInput(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleValidarMatricula()}
                                className="font-mono text-center text-lg"
                            />
                            {matriculaError && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {matriculaError}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Su matrícula le fue proporcionada por su tutor o el departamento de orientación
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full" 
                            onClick={handleValidarMatricula}
                            disabled={validandoMatricula}
                        >
                            {validandoMatricula ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    Continuar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // CONSENTIMIENTO
    if (step === 'consentimiento' && estudiante) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Bienvenido/a</CardTitle>
                                <p className="text-lg font-semibold text-gray-700">{estudiante.nombreCompleto}</p>
                                <p className="text-sm text-gray-500">{estudiante.grupoNombre}</p>
                            </div>
                        </div>
                        <CardDescription className="flex items-center gap-2 text-amber-700">
                            <Shield className="h-4 w-4" />
                            Consentimiento Informado Digital
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                            <p className="text-sm text-blue-800">
                                <strong>Sesión:</strong> {session?.name}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                <strong>Pruebas a realizar:</strong> {session?.tests.length || 0}
                            </p>
                        </div>

                        <div className="text-sm text-gray-700 space-y-3">
                            <p>
                                Usted está a punto de realizar una evaluación psicométrica como parte del 
                                programa de detección temprana y apoyo del CBTA 130.
                            </p>
                            <p>
                                <strong>Confidencialidad:</strong> Los datos recopilados serán tratados con 
                                estricta confidencialidad por el personal autorizado, conforme a la Ley Federal 
                                de Protección de Datos Personales.
                            </p>
                            <p>
                                <strong>Propósito:</strong> Los resultados se utilizarán para generar orientación 
                                y, si es necesario, canalizarlo al servicio adecuado. Esto no constituye un 
                                tratamiento psicológico.
                            </p>
                            <p>
                                <strong>Consentimiento previo:</strong> Al continuar, usted confirma que fue 
                                informado sobre estos procesos al momento de su ingreso al CBTA 130.
                            </p>
                        </div>

                        <div className="flex items-start space-x-3 pt-4 border-t">
                            <Checkbox
                                id="consent"
                                checked={isConsented}
                                onCheckedChange={(checked) => setIsConsented(!!checked)}
                            />
                            <Label htmlFor="consent" className="text-sm cursor-pointer">
                                He leído y comprendo la información anterior. Acepto participar en esta evaluación.
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep('matricula')}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Usar otra matrícula
                        </Button>
                        <Button onClick={handleIniciarEvaluacion} disabled={!isConsented}>
                            Iniciar Evaluación
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // EVALUACIÓN
    if (step === 'evaluacion' && session) {
        const currentTestId = session.tests[currentTestIndex];
        const prueba = PRUEBAS_CATALOGO[currentTestId];
        const progress = ((completedTests.length) / session.tests.length) * 100;
        const esUltimaPrueba = currentTestIndex === session.tests.length - 1;
        const preguntasRequeridas = prueba?.preguntas.filter(p => p.requerido !== false) || [];
        const respondidas = preguntasRequeridas.filter(p => respuestasActuales[p.id]?.trim()).length;

        return (
            <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
                {/* Diálogo de confirmación para prueba repetida */}
                {showDuplicateDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full border-amber-300 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-800">
                                    <AlertOctagon className="h-5 w-5" />
                                    Prueba Ya Aplicada
                                </CardTitle>
                                <CardDescription className="text-amber-700">
                                    Esta prueba ya fue registrada anteriormente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        <strong>Prueba:</strong> {testNames[currentTestId] || currentTestId}
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        <strong>Consultante:</strong> {estudiante?.nombreCompleto}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700">
                                    Ya existe un registro de esta prueba para este consultante. 
                                    Si continúa, el resultado anterior será reemplazado con los nuevos datos.
                                </p>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-800">
                                        <strong>Nota:</strong> Esto es útil cuando una prueba anterior quedó incompleta 
                                        o se necesita actualizar el resultado.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2 justify-end">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowDuplicateDialog(false);
                                        setExistingTestDocId(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-700"
                                    onClick={() => handleSiguientePrueba(true)}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Actualizar Resultado
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
                
                <div className="max-w-3xl mx-auto">
                    {/* Header con progreso */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">
                                    {session.name}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {estudiante?.nombreCompleto} • {estudiante?.matricula}
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {completedTests.length + 1} de {session.tests.length}
                            </Badge>
                        </div>
                        <Progress value={progress} className="h-3" />
                    </div>

                    {/* Lista de pruebas completadas/pendientes */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {session.tests.map((testId, index) => (
                            <Badge
                                key={testId}
                                variant={completedTests.includes(testId) ? 'default' : index === currentTestIndex ? 'secondary' : 'outline'}
                                className={`cursor-default ${completedTests.includes(testId) ? 'bg-green-500 hover:bg-green-600' : index === currentTestIndex ? 'bg-blue-500 text-white' : 'opacity-60'}`}
                            >
                                {completedTests.includes(testId) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {testNames[testId] || testId}
                            </Badge>
                        ))}
                    </div>

                    {/* Formulario actual */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {testNames[currentTestId] || 'Evaluación'}
                            </CardTitle>
                            <CardDescription>
                                {prueba?.instrucciones || 'Complete todas las preguntas.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {prueba ? (
                                <div className="space-y-6">
                                    {prueba.preguntas.map((pregunta, index) => (
                                        <div key={pregunta.id} className="p-4 border rounded-lg bg-gray-50/80">
                                            <p className="font-medium mb-3 text-gray-800">
                                                {index + 1}. {pregunta.texto}
                                                {pregunta.requerido !== false && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            
                                            {pregunta.tipo === 'opcion' && pregunta.opciones ? (
                                                <div className="space-y-2">
                                                    {pregunta.opciones.map((opcion) => (
                                                        <label 
                                                            key={opcion.value}
                                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                                                respuestasActuales[pregunta.id] === opcion.value 
                                                                    ? 'border-blue-500 bg-blue-50' 
                                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={pregunta.id}
                                                                value={opcion.value}
                                                                checked={respuestasActuales[pregunta.id] === opcion.value}
                                                                onChange={(e) => handleGuardarRespuesta(pregunta.id, e.target.value)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                                                respuestasActuales[pregunta.id] === opcion.value 
                                                                    ? 'border-blue-500 bg-blue-500' 
                                                                    : 'border-gray-300'
                                                            }`}>
                                                                {respuestasActuales[pregunta.id] === opcion.value && (
                                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm">{opcion.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : pregunta.tipo === 'select' && pregunta.opciones ? (
                                                <Select
                                                    value={respuestasActuales[pregunta.id] || ''}
                                                    onValueChange={(value) => handleGuardarRespuesta(pregunta.id, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una opción..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pregunta.opciones.map((opcion) => (
                                                            <SelectItem key={opcion.value} value={opcion.value}>
                                                                {opcion.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : pregunta.tipo === 'fecha' ? (
                                                <Input
                                                    type="date"
                                                    value={respuestasActuales[pregunta.id] || ''}
                                                    onChange={(e) => handleGuardarRespuesta(pregunta.id, e.target.value)}
                                                    className="max-w-xs"
                                                />
                                            ) : pregunta.tipo === 'numero' ? (
                                                <Input
                                                    type="tel"
                                                    value={respuestasActuales[pregunta.id] || ''}
                                                    onChange={(e) => handleGuardarRespuesta(pregunta.id, e.target.value)}
                                                    placeholder="Ingrese el número..."
                                                    className="max-w-xs"
                                                />
                                            ) : (
                                                <Textarea
                                                    value={respuestasActuales[pregunta.id] || ''}
                                                    onChange={(e) => handleGuardarRespuesta(pregunta.id, e.target.value)}
                                                    placeholder="Escriba su respuesta..."
                                                    className="min-h-[80px]"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                                    <p>Esta prueba aún no está configurada en el sistema.</p>
                                    <p className="text-sm mt-2">Puede omitirla si así lo desea.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                            <p className="text-sm text-gray-500">
                                {prueba && preguntasRequeridasRespondidas(prueba) ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <Check className="h-4 w-4" /> Listo para continuar
                                    </span>
                                ) : (
                                    `${respondidas} de ${preguntasRequeridas.length} respuestas requeridas`
                                )}
                            </p>
                            <Button 
                                onClick={handleSiguientePrueba}
                                disabled={guardando || (prueba && !preguntasRequeridasRespondidas(prueba))}
                                className="min-w-[180px]"
                            >
                                {guardando ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : esUltimaPrueba ? (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Finalizar Evaluación
                                    </>
                                ) : (
                                    <>
                                        Siguiente Prueba
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    // COMPLETADO
    if (step === 'completado') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            ¡Evaluación Completada!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Gracias por completar todas las evaluaciones, {estudiante?.nombreCompleto?.split(' ')[0]}.
                        </p>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                            <p className="text-sm text-green-800">
                                Sus respuestas han sido enviadas de forma segura. 
                                El equipo de orientación revisará sus resultados y se comunicará con usted si es necesario.
                            </p>
                        </div>
                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                            <p><strong>Matrícula:</strong> {estudiante?.matricula}</p>
                            <p><strong>Pruebas completadas:</strong> {completedTests.length}</p>
                            <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <strong>Recuerde:</strong> Si tiene alguna duda o necesita apoyo, 
                                puede acudir al departamento de orientación en cualquier momento.
                            </p>
                        </div>
                        <p className="mt-6 text-xs text-gray-400">
                            Ya puede cerrar esta ventana.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}
