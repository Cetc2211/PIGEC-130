'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    Save, FileDown, User, AlertTriangle, Heart, Brain, 
    GraduationCap, Users, Target, ClipboardList, AlertOctagon,
    Check, FileText
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// ============================================
// INTERFACES
// ============================================

interface ClinicalInterviewData {
    // Control
    expediente: string;
    fecha: string;
    entrevistador: string;
    
    // A. Ficha de Identificación
    nombre: string;
    edad: number | null;
    semestre: string;
    
    // B. Motivo de Consulta
    motivoConsulta: string;
    historiaProblema: string;
    
    // C. Contexto Familiar
    dinamiaFamiliar: string;
    
    // D. Historia Académica
    promedio: string;
    matDif: string;
    habitos: string;
    
    // E. Exploración Emocional
    animoScale: number | null;
    predominioEmocional: string;
    sintomas: {
        tristeza: boolean;
        llanto: boolean;
        anhedonia: boolean;
        fatiga: boolean;
        sueno: boolean;
        apetito: boolean;
        concentracion: boolean;
        culpa: boolean;
        ansiedad: boolean;
    };
    
    // Protocolo de Riesgo
    ideaMuerte: string;
    planSuicida: string;
    autolesiones: string;
    detalleRiesgo: string;
    
    // F. Conductas de Riesgo
    sustancias: {
        tabaco: { uso: boolean; frecuencia: string };
        alcohol: { uso: boolean; frecuencia: string };
        marihuana: { uso: boolean; frecuencia: string };
        otras: { uso: boolean; frecuencia: string };
    };
    otrosRiesgos: {
        sexual: boolean;
        violencia: boolean;
        redes: boolean;
        bullying: boolean;
        alimentario: boolean;
    };
    
    // G. Examen Mental
    emApariencia: string;
    emHabla: string;
    emOrientacion: string;
    emPensamiento: string;
    emJuicio: string;
    
    // H. Proyecto de Vida
    metasVida: string;
    
    // I. Formulación Clínica
    impDiagnostica: string;
    hipotesisDiag: string;
    riesgoGlobal: string;
    planIntervencion: string;
}

interface ClinicalInterviewFormProps {
    studentId: string;
    studentName?: string;
    studentAge?: number;
    onSave?: (data: ClinicalInterviewData) => void;
}

const defaultData: ClinicalInterviewData = {
    expediente: '',
    fecha: new Date().toISOString().split('T')[0],
    entrevistador: '',
    nombre: '',
    edad: null,
    semestre: '',
    motivoConsulta: '',
    historiaProblema: '',
    dinamiaFamiliar: '',
    promedio: '',
    matDif: '',
    habitos: '',
    animoScale: null,
    predominioEmocional: '',
    sintomas: {
        tristeza: false, llanto: false, anhedonia: false, fatiga: false,
        sueno: false, apetito: false, concentracion: false, culpa: false, ansiedad: false
    },
    ideaMuerte: 'Negada',
    planSuicida: 'Sin Plan',
    autolesiones: 'Niega',
    detalleRiesgo: '',
    sustancias: {
        tabaco: { uso: false, frecuencia: '' },
        alcohol: { uso: false, frecuencia: '' },
        marihuana: { uso: false, frecuencia: '' },
        otras: { uso: false, frecuencia: '' }
    },
    otrosRiesgos: {
        sexual: false, violencia: false, redes: false, bullying: false, alimentario: false
    },
    emApariencia: '',
    emHabla: '',
    emOrientacion: '',
    emPensamiento: '',
    emJuicio: '',
    metasVida: '',
    impDiagnostica: '',
    hipotesisDiag: '',
    riesgoGlobal: 'Bajo',
    planIntervencion: ''
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ClinicalInterviewForm({ 
    studentId, 
    studentName = '', 
    studentAge,
    onSave 
}: ClinicalInterviewFormProps) {
    const [data, setData] = useState<ClinicalInterviewData>({
        ...defaultData,
        nombre: studentName,
        edad: studentAge || null,
        expediente: studentId
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [interviewId, setInterviewId] = useState<string | null>(null);

    // Cargar entrevista existente
    useEffect(() => {
        async function loadInterview() {
            if (!studentId || !db) return;
            
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'clinical_interviews'),
                    where('studentId', '==', studentId),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0].data();
                    setInterviewId(snapshot.docs[0].id);
                    setData(prev => ({
                        ...prev,
                        ...docData,
                        sintomas: { ...prev.sintomas, ...docData.sintomas },
                        sustancias: { ...prev.sustancias, ...docData.sustancias },
                        otrosRiesgos: { ...prev.otrosRiesgos, ...docData.otrosRiesgos }
                    }));
                }
            } catch (error) {
                console.error('Error cargando entrevista:', error);
            }
            setLoading(false);
        }
        
        loadInterview();
    }, [studentId]);

    // Detectar riesgo
    const hasRisk = data.ideaMuerte !== 'Negada' || data.planSuicida !== 'Sin Plan';

    // Handlers
    const updateField = (field: keyof ClinicalInterviewData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const updateSintoma = (field: keyof ClinicalInterviewData['sintomas'], value: boolean) => {
        setData(prev => ({
            ...prev,
            sintomas: { ...prev.sintomas, [field]: value }
        }));
        setSaved(false);
    };

    const updateSustancia = (field: keyof ClinicalInterviewData['sustancias'], subField: 'uso' | 'frecuencia', value: any) => {
        setData(prev => ({
            ...prev,
            sustancias: {
                ...prev.sustancias,
                [field]: { ...prev.sustancias[field], [subField]: value }
            }
        }));
        setSaved(false);
    };

    const updateOtroRiesgo = (field: keyof ClinicalInterviewData['otrosRiesgos'], value: boolean) => {
        setData(prev => ({
            ...prev,
            otrosRiesgos: { ...prev.otrosRiesgos, [field]: value }
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!db) return;
        
        setLoading(true);
        try {
            const saveData = {
                ...data,
                studentId,
                updatedAt: Timestamp.now()
            };

            if (interviewId) {
                await updateDoc(doc(db, 'clinical_interviews', interviewId), saveData);
            } else {
                const ref = await addDoc(collection(db, 'clinical_interviews'), {
                    ...saveData,
                    createdAt: Timestamp.now()
                });
                setInterviewId(ref.id);
            }
            
            setSaved(true);
            onSave?.(data);
            
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error guardando entrevista:', error);
            alert('Error al guardar. Intente nuevamente.');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-slate-200">
                <CardHeader className="bg-slate-800 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        ENTREVISTA CLÍNICA PSICOPEDAGÓGICA INTEGRAL
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                        Centro de Bachillerato Tecnológico Agropecuario No. 130
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Expediente</Label>
                            <Input 
                                value={data.expediente} 
                                onChange={(e) => updateField('expediente', e.target.value)}
                                className="font-mono"
                            />
                        </div>
                        <div>
                            <Label>Fecha</Label>
                            <Input 
                                type="date" 
                                value={data.fecha}
                                onChange={(e) => updateField('fecha', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Entrevistador</Label>
                            <Input 
                                value={data.entrevistador}
                                onChange={(e) => updateField('entrevistador', e.target.value)}
                                placeholder="Nombre del clínico"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* A. FICHA DE IDENTIFICACIÓN */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        A. FICHA DE IDENTIFICACIÓN
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Label>Nombre del Estudiante</Label>
                            <Input 
                                value={data.nombre}
                                onChange={(e) => updateField('nombre', e.target.value)}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <Label>Edad</Label>
                            <Input 
                                type="number"
                                value={data.edad || ''}
                                onChange={(e) => updateField('edad', parseInt(e.target.value) || null)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Semestre y Grupo</Label>
                        <Input 
                            value={data.semestre}
                            onChange={(e) => updateField('semestre', e.target.value)}
                            placeholder="Ej: 3° Semestre, Grupo A"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* B. MOTIVO DE CONSULTA */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        B. MOTIVO DE CONSULTA
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div>
                        <Label>Motivo manifiesto (Lo que dice el estudiante)</Label>
                        <Textarea 
                            value={data.motivoConsulta}
                            onChange={(e) => updateField('motivoConsulta', e.target.value)}
                            placeholder="Describa el motivo..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label>Historia del Problema (Inicio, evolución, factores desencadenantes)</Label>
                        <Textarea 
                            value={data.historiaProblema}
                            onChange={(e) => updateField('historiaProblema', e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* C. CONTEXTO FAMILIAR */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        C. CONTEXTO FAMILIAR
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <Label>Dinámica Familiar (Estructura, comunicación, conflictos)</Label>
                    <Textarea 
                        value={data.dinamiaFamiliar}
                        onChange={(e) => updateField('dinamiaFamiliar', e.target.value)}
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* D. HISTORIA ACADÉMICA */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        D. HISTORIA ACADÉMICA
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Promedio Actual</Label>
                            <Input 
                                value={data.promedio}
                                onChange={(e) => updateField('promedio', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Materias con Dificultad</Label>
                            <Input 
                                value={data.matDif}
                                onChange={(e) => updateField('matDif', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Hábitos de Estudio y Actitud Escolar</Label>
                        <Textarea 
                            value={data.habitos}
                            onChange={(e) => updateField('habitos', e.target.value)}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* E. EXPLORACIÓN EMOCIONAL */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        E. EXPLORACIÓN EMOCIONAL
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Escala de Ánimo (1-10)</Label>
                            <Input 
                                type="number"
                                min={1}
                                max={10}
                                value={data.animoScale || ''}
                                onChange={(e) => updateField('animoScale', parseInt(e.target.value) || null)}
                            />
                        </div>
                        <div>
                            <Label>Estado Predominante</Label>
                            <Select 
                                value={data.predominioEmocional} 
                                onValueChange={(v) => updateField('predominioEmocional', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tristeza">Tristeza / Melancolía</SelectItem>
                                    <SelectItem value="Ansiedad">Ansiedad / Nerviosismo</SelectItem>
                                    <SelectItem value="Irritabilidad">Irritabilidad / Enojo</SelectItem>
                                    <SelectItem value="Apatía">Apatía / Indiferencia</SelectItem>
                                    <SelectItem value="Eutimico">Estable / Eutímico</SelectItem>
                                    <SelectItem value="Labil">Lábil / Cambiante</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Sintomatología presente (Últimas 2 semanas)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {[
                                { id: 'tristeza', label: 'Tristeza persistente' },
                                { id: 'llanto', label: 'Llanto fácil' },
                                { id: 'anhedonia', label: 'Anhedonia (Pérdida interés)' },
                                { id: 'fatiga', label: 'Fatiga / Baja energía' },
                                { id: 'sueno', label: 'Alteración del sueño' },
                                { id: 'apetito', label: 'Alteración del apetito' },
                                { id: 'concentracion', label: 'Dif. Concentración' },
                                { id: 'culpa', label: 'Culpa / Inutilidad' },
                                { id: 'ansiedad', label: 'Crisis de ansiedad' },
                            ].map((s) => (
                                <label key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                                    <Checkbox
                                        checked={data.sintomas[s.id as keyof typeof data.sintomas]}
                                        onCheckedChange={(v) => updateSintoma(s.id as keyof typeof data.sintomas, !!v)}
                                    />
                                    <span className="text-sm">{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* PROTOCOLO DE RIESGO */}
            <Card className={hasRisk ? 'border-red-500' : ''}>
                <CardHeader className={hasRisk ? 'bg-red-100' : 'bg-slate-100'}>
                    <CardTitle className={`text-base flex items-center gap-2 ${hasRisk ? 'text-red-700' : ''}`}>
                        <AlertOctagon className="h-4 w-4" />
                        ⚠️ PROTOCOLO DE RIESGO
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {hasRisk && (
                        <Alert variant="destructive" className="animate-pulse">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>ALERTA CLÍNICA ACTIVADA</AlertTitle>
                            <AlertDescription>
                                Evaluar necesidad de referencia psiquiátrica urgente.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Ideación Suicida</Label>
                            <Select 
                                value={data.ideaMuerte} 
                                onValueChange={(v) => updateField('ideaMuerte', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Negada">Negada</SelectItem>
                                    <SelectItem value="Pasiva">Pasiva (Deseo muerte)</SelectItem>
                                    <SelectItem value="Activa">Activa (Pensamientos)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Planificación</Label>
                            <Select 
                                value={data.planSuicida} 
                                onValueChange={(v) => updateField('planSuicida', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sin Plan">Sin Plan</SelectItem>
                                    <SelectItem value="Vago">Plan Inespecífico</SelectItem>
                                    <SelectItem value="Estructurado">Plan Estructurado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Autolesiones</Label>
                            <Select 
                                value={data.autolesiones} 
                                onValueChange={(v) => updateField('autolesiones', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Niega">Niega</SelectItem>
                                    <SelectItem value="Histórico">En el pasado</SelectItem>
                                    <SelectItem value="Reciente">Reciente/Actual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Detalles del Riesgo y Factores Protectores</Label>
                        <Textarea 
                            value={data.detalleRiesgo}
                            onChange={(e) => updateField('detalleRiesgo', e.target.value)}
                            placeholder="Describir frecuencia, método, intención y redes de apoyo..."
                            className={hasRisk ? 'border-red-300' : ''}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* F. CONDUCTAS DE RIESGO */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        F. CONDUCTAS DE RIESGO
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left p-2 w-1/3">Sustancia</th>
                                    <th className="text-center p-2 w-20">Uso</th>
                                    <th className="text-left p-2">Frecuencia y Patrón</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'tabaco', name: 'Tabaco / Vape' },
                                    { id: 'alcohol', name: 'Alcohol' },
                                    { id: 'marihuana', name: 'Marihuana' },
                                    { id: 'otras', name: 'Otras drogas' },
                                ].map((s) => (
                                    <tr key={s.id} className="border-t">
                                        <td className="p-2">{s.name}</td>
                                        <td className="p-2 text-center">
                                            <Checkbox
                                                checked={data.sustancias[s.id as keyof typeof data.sustancias].uso}
                                                onCheckedChange={(v) => updateSustancia(s.id as keyof typeof data.sustancias, 'uso', !!v)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                value={data.sustancias[s.id as keyof typeof data.sustancias].frecuencia}
                                                onChange={(e) => updateSustancia(s.id as keyof typeof data.sustancias, 'frecuencia', e.target.value)}
                                                placeholder="Frecuencia..."
                                                className="h-8"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div>
                        <Label>Otros Indicadores de Riesgo</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {[
                                { id: 'sexual', label: 'Conducta sexual riesgo' },
                                { id: 'violencia', label: 'Violencia/Pandillerismo' },
                                { id: 'redes', label: 'Ciberadicción' },
                                { id: 'bullying', label: 'Acoso Escolar' },
                                { id: 'alimentario', label: 'Trastorno Alimentario' },
                            ].map((r) => (
                                <label key={r.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                                    <Checkbox
                                        checked={data.otrosRiesgos[r.id as keyof typeof data.otrosRiesgos]}
                                        onCheckedChange={(v) => updateOtroRiesgo(r.id as keyof typeof data.otrosRiesgos, !!v)}
                                    />
                                    <span className="text-sm">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* G. EXAMEN MENTAL */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        G. EXAMEN MENTAL
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Apariencia/Aliño</Label>
                            <Input 
                                value={data.emApariencia}
                                onChange={(e) => updateField('emApariencia', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Lenguaje/Discurso</Label>
                            <Input 
                                value={data.emHabla}
                                onChange={(e) => updateField('emHabla', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Orientación (T/E/P)</Label>
                            <Input 
                                value={data.emOrientacion}
                                onChange={(e) => updateField('emOrientacion', e.target.value)}
                                placeholder="Tiempo/Espacio/Persona"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Curso Pensamiento</Label>
                            <Input 
                                value={data.emPensamiento}
                                onChange={(e) => updateField('emPensamiento', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Juicio/Insight</Label>
                            <Input 
                                value={data.emJuicio}
                                onChange={(e) => updateField('emJuicio', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* H. PROYECTO DE VIDA */}
            <Card>
                <CardHeader className="bg-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        H. PROYECTO DE VIDA
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <Label>Intereses y Metas a Futuro</Label>
                    <Textarea 
                        value={data.metasVida}
                        onChange={(e) => updateField('metasVida', e.target.value)}
                        rows={2}
                    />
                </CardContent>
            </Card>

            {/* I. FORMULACIÓN CLÍNICA */}
            <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                        <FileText className="h-4 w-4" />
                        I. FORMULACIÓN CLÍNICA
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div>
                        <Label>Impresión Diagnóstica (Síntesis del caso)</Label>
                        <Textarea 
                            value={data.impDiagnostica}
                            onChange={(e) => updateField('impDiagnostica', e.target.value)}
                            className="bg-blue-50 border-blue-200"
                            rows={3}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Hipótesis Diagnóstica (CIE-11 / DSM-5)</Label>
                            <Input 
                                value={data.hipotesisDiag}
                                onChange={(e) => updateField('hipotesisDiag', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Nivel de Riesgo Global</Label>
                            <Select 
                                value={data.riesgoGlobal} 
                                onValueChange={(v) => updateField('riesgoGlobal', v)}
                            >
                                <SelectTrigger className="font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bajo">🟢 Bajo</SelectItem>
                                    <SelectItem value="Moderado">🟡 Moderado</SelectItem>
                                    <SelectItem value="Alto">🟠 Alto</SelectItem>
                                    <SelectItem value="Inminente">🔴 Inminente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Plan de Intervención y Acuerdos</Label>
                        <Textarea 
                            value={data.planIntervencion}
                            onChange={(e) => updateField('planIntervencion', e.target.value)}
                            placeholder="Acciones a seguir, citatorios, canalización..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
                <Badge 
                    variant={saved ? "default" : "secondary"}
                    className={saved ? "bg-green-500" : ""}
                >
                    {saved ? (
                        <><Check className="h-3 w-3 mr-1" /> Guardado</>
                    ) : (
                        'Sin guardar'
                    )}
                </Badge>
                <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    {loading ? (
                        <span className="animate-pulse">Guardando...</span>
                    ) : (
                        <><Save className="h-4 w-4 mr-2" /> Guardar Entrevista</>
                    )}
                </Button>
            </div>
        </div>
    );
}
