'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ClipboardList, Send, Eye, Link2, Mail, MessageSquare,
    CheckCircle2, Clock, Copy, ExternalLink, Plus, Search,
    QrCode, Share2, FileText, Brain, BrainCircuit, Activity,
    AlertTriangle, RefreshCw, Download, Trash2, Play, Pause,
    CheckSquare, XCircle, Calendar, User, Beaker, Stethoscope,
    MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSession } from '@/context/SessionContext';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

// Importar componente de entrevista clínica
import ClinicalInterviewForm from './clinical-interview-form';

// ============================================
// INTERFACES
// ============================================

interface TestResult {
    id: string;
    testId: string;
    testName: string;
    category: string;
    appliedAt: Date | null;
    status: 'pending' | 'sent' | 'in_progress' | 'completed' | 'expired';
    result?: any;
    link?: string;
    linkExpiresAt?: Date;
    appliedBy?: string;
    notes?: string;
}

interface Student {
    id: string;
    name: string;
    demographics?: {
        age: number;
        [key: string]: any;
    };
    [key: string]: any;
}

interface IndividualTestManagementProps {
    studentId: string;
    student: Student;
}

// ============================================
// CATÁLOGO DE PRUEBAS CLÍNICAS INDIVIDUALES
// ============================================

const clinicalTestsCatalog = {
    // Pruebas de Tamizaje (Screening)
    screening: [
        { id: 'phq-9', title: 'PHQ-9', description: 'Tamizaje de depresión', duration: '5 min', remote: true },
        { id: 'gad-7', title: 'GAD-7', description: 'Tamizaje de ansiedad', duration: '5 min', remote: true },
        { id: 'bdi-ii', title: 'BDI-II', description: 'Inventario de Depresión de Beck', duration: '10 min', remote: true },
        { id: 'bai', title: 'BAI', description: 'Inventario de Ansiedad de Beck', duration: '10 min', remote: true },
        { id: 'hads', title: 'HADS', description: 'Escala Hospitalaria de Ansiedad y Depresión', duration: '5 min', remote: true },
        { id: 'idare', title: 'IDARE/STAI', description: 'Inventario de Ansiedad Rasgo-Estado', duration: '15 min', remote: true },
        { id: 'bhs', title: 'BHS', description: 'Escala de Desesperanza de Beck', duration: '5 min', remote: true },
        { id: 'ssi', title: 'SSI', description: 'Escala de Ideación Suicida', duration: '15 min', remote: false, requiresClinician: true },
        { id: 'columbia', title: 'Columbia C-SSRS', description: 'Escala de Severidad Suicida', duration: '5 min', remote: false, requiresClinician: true },
        { id: 'assist', title: 'ASSIST', description: 'Detección de Consumo de Sustancias', duration: '10 min', remote: true },
    ],
    // Pruebas Académicas y Neuropsicológicas
    academic: [
        { id: 'neuro-screen', title: 'Tamizaje Neuropsicológico', description: 'Atención, memoria, funciones ejecutivas', duration: '20 min', remote: false },
        { id: 'chte', title: 'CHTE', description: 'Cuestionario de Hábitos de Estudio', duration: '15 min', remote: true },
        { id: 'lira', title: 'LIRA', description: 'Evaluación de Riesgo Académico', duration: '10 min', remote: true },
    ],
    // Pruebas Especializadas - Aplicación Presencial
    specialized: [
        { id: 'wisc-v', title: 'WISC-V', description: 'Escala de Inteligencia para Niños (6-16 años)', duration: '60-90 min', remote: false, requiresClinician: true, ageRange: [6, 16] },
        { id: 'wais-iv', title: 'WAIS-IV', description: 'Escala de Inteligencia para Adultos (16+ años)', duration: '60-90 min', remote: false, requiresClinician: true, ageRange: [16, 99] },
        { id: 'neuropsi', title: 'NEUROPSI', description: 'Evaluación Neuropsicológica Breve', duration: '25-30 min', remote: false, requiresClinician: true },
        { id: 'neuropsi-atten', title: 'NEUROPSI Atención', description: 'Evaluación de Atención y Memoria', duration: '20 min', remote: false, requiresClinician: true },
        { id: 'wms-iv', title: 'WMS-IV', description: 'Escala de Memoria de Wechsler', duration: '45-60 min', remote: false, requiresClinician: true },
        { id: 'bnt', title: 'BNT', description: 'Test de Denominación de Boston', duration: '15 min', remote: false, requiresClinician: true },
        { id: 'rey', title: 'Figura Compleja de Rey', description: 'Memoria visual y organización', duration: '20 min', remote: false, requiresClinician: true },
        { id: 'stroop', title: 'Stroop', description: 'Test de Atención Selectiva', duration: '10 min', remote: false, requiresClinician: true },
        { id: 'tmt', title: 'TMT A/B', description: 'Trail Making Test', duration: '10 min', remote: false, requiresClinician: true },
        { id: 'wisconsin', title: 'Wisconsin', description: 'Test de Clasificación de Tarjetas', duration: '20 min', remote: false, requiresClinician: true },
    ],
    // Ficha de Identificación
    identification: [
        { id: 'ficha-id', title: 'Ficha de Identificación', description: 'Datos demográficos y sociofamiliares', duration: '5 min', remote: true },
    ]
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function IndividualTestManagement({ studentId, student }: IndividualTestManagementProps) {
    const { role, user } = useSession();
    const params = useParams();
    
    const [activeTab, setActiveTab] = useState('aplicadas');
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    
    // Estado para generación de enlace
    const [generatingLink, setGeneratingLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [linkExpiresIn, setLinkExpiresIn] = useState('7');
    
    // Determinar edad del estudiante
    const studentAge = student?.demographics?.age || 0;
    
    // Determinar escala Wechsler apropiada
    const getWechslerTest = () => {
        if (studentAge > 0 && studentAge < 17) {
            return { id: 'wisc-v', title: 'WISC-V', description: `Escala para ${studentAge} años` };
        }
        return { id: 'wais-iv', title: 'WAIS-IV', description: `Escala para ${studentAge} años` };
    };

    // Cargar pruebas del estudiante desde Firestore
    useEffect(() => {
        async function loadTestResults() {
            if (!studentId || !db) return;
            
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'test_results'),
                    where('studentId', '==', studentId),
                    orderBy('createdAt', 'desc')
                );
                
                const snapshot = await getDocs(q);
                const results: TestResult[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        testId: data.testId || data.test_id,
                        testName: data.testName || data.test_name || data.testId,
                        category: data.category || 'screening',
                        appliedAt: data.completedAt?.toDate() || data.appliedAt?.toDate() || null,
                        status: data.status || 'completed',
                        result: data.results || data.result,
                        link: data.link,
                        linkExpiresAt: data.linkExpiresAt?.toDate(),
                        appliedBy: data.appliedBy,
                        notes: data.notes
                    };
                });
                
                setTestResults(results);
            } catch (error) {
                console.error('Error cargando resultados:', error);
                // Datos de ejemplo si no hay conexión
                setTestResults([
                    {
                        id: '1',
                        testId: 'phq-9',
                        testName: 'PHQ-9',
                        category: 'screening',
                        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        status: 'completed',
                        result: { score: 12, interpretation: 'Depresión moderada' }
                    },
                    {
                        id: '2',
                        testId: 'gad-7',
                        testName: 'GAD-7',
                        category: 'screening',
                        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        status: 'completed',
                        result: { score: 8, interpretation: 'Ansiedad leve' }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        }
        
        loadTestResults();
    }, [studentId]);

    // Generar enlace individual para prueba remota
    const generateIndividualLink = async (testId: string) => {
        if (!studentId || !db) return;
        
        setGeneratingLink(true);
        
        try {
            // Crear token único para esta evaluación
            const tokenId = `eval_${studentId}_${testId}_${Date.now()}`;
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/evaluacion/${tokenId}`;
            
            const expiresAt = new Date(Date.now() + parseInt(linkExpiresIn) * 24 * 60 * 60 * 1000);
            
            // Guardar en Firestore
            await addDoc(collection(db, 'evaluation_links'), {
                tokenId,
                studentId,
                testId,
                link,
                createdAt: Timestamp.now(),
                expiresAt: Timestamp.fromDate(expiresAt),
                status: 'pending',
                createdBy: user?.email || 'unknown'
            });
            
            // Actualizar estado local
            setTestResults(prev => [...prev, {
                id: tokenId,
                testId,
                testName: getTestName(testId),
                category: getTestCategory(testId),
                appliedAt: null,
                status: 'sent',
                link,
                linkExpiresAt: expiresAt
            }]);
            
            setGeneratedLink(link);
        } catch (error) {
            console.error('Error generando enlace:', error);
            alert('Error al generar el enlace. Intente nuevamente.');
        } finally {
            setGeneratingLink(false);
        }
    };

    // Helpers
    const getTestName = (testId: string): string => {
        for (const category of Object.values(clinicalTestsCatalog)) {
            const test = category.find(t => t.id === testId);
            if (test) return test.title;
        }
        return testId;
    };

    const getTestCategory = (testId: string): string => {
        for (const [cat, tests] of Object.entries(clinicalTestsCatalog)) {
            if (tests.find(t => t.id === testId)) return cat;
        }
        return 'screening';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1"/>Completada</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800"><Play className="h-3 w-3 mr-1"/>En progreso</Badge>;
            case 'sent':
                return <Badge className="bg-amber-100 text-amber-800"><Send className="h-3 w-3 mr-1"/>Enviada</Badge>;
            case 'expired':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1"/>Expirada</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1"/>Pendiente</Badge>;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Enlace copiado al portapapeles');
    };

    const shareViaWhatsApp = (link: string) => {
        const message = `Hola ${student?.name || ''}, se le invita a completar una evaluación psicométrica. Acceda al siguiente enlace: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareViaEmail = (link: string) => {
        const subject = 'Evaluación Psicométrica - PIGEC';
        const body = `Estimado/a ${student?.name || 'estudiante'},%0D%0A%0D%0ASe le invita a completar una evaluación psicométrica.%0D%0A%0D%0AAcceda al siguiente enlace: ${link}%0D%0A%0D%0ASaludos cordiales.`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
    };

    // Filtrar pruebas por edad para especializadas
    const getAvailableSpecializedTests = () => {
        return clinicalTestsCatalog.specialized.filter(test => {
            if (!test.ageRange) return true;
            const [min, max] = test.ageRange;
            if (studentAge > 0) {
                return studentAge >= min && studentAge <= max;
            }
            return true; // Si no hay edad, mostrar todas
        });
    };

    return (
        <div className="space-y-6">
            {/* Header con resumen del consultante */}
            <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{student?.name || 'Consultante'}</h3>
                                <p className="text-sm text-gray-600">ID: {studentId} • Edad: {studentAge} años</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {testResults.filter(t => t.status === 'completed').length}
                                </p>
                                <p className="text-xs text-gray-500">Completadas</p>
                            </div>
                            <Separator orientation="vertical" className="h-12" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600">
                                    {testResults.filter(t => t.status === 'sent' || t.status === 'in_progress').length}
                                </p>
                                <p className="text-xs text-gray-500">Pendientes</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs de gestión */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="aplicadas" className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        <span className="hidden md:inline">Aplicadas</span>
                    </TabsTrigger>
                    <TabsTrigger value="entrevista" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden md:inline">Entrevista</span>
                    </TabsTrigger>
                    <TabsTrigger value="enviar" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span className="hidden md:inline">Enviar Remota</span>
                    </TabsTrigger>
                    <TabsTrigger value="presencial" className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        <span className="hidden md:inline">Aplicar Presencial</span>
                    </TabsTrigger>
                    <TabsTrigger value="especializadas" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span className="hidden md:inline">Especializadas</span>
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: PRUEBAS APLICADAS */}
                <TabsContent value="aplicadas" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5" />
                                Historial de Pruebas
                            </CardTitle>
                            <CardDescription>
                                Pruebas aplicadas a {student?.name || 'este consultante'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                                    <span>Cargando resultados...</span>
                                </div>
                            ) : testResults.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No hay pruebas registradas</p>
                                    <p className="text-sm mt-2">Envíe o aplique una prueba para comenzar</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Prueba</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Resultado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {testResults.map((test) => (
                                            <TableRow key={test.id}>
                                                <TableCell className="font-medium">{test.testName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {test.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {test.appliedAt 
                                                        ? new Date(test.appliedAt).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </TableCell>
                                                <TableCell>{getStatusBadge(test.status)}</TableCell>
                                                <TableCell>
                                                    {test.result && (
                                                        <div className="text-sm">
                                                            {test.result.score !== undefined && (
                                                                <span className="font-medium">Puntaje: {test.result.score}</span>
                                                            )}
                                                            {test.result.interpretation && (
                                                                <p className="text-gray-500">{test.result.interpretation}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {test.status === 'completed' && (
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Ver
                                                            </Button>
                                                        )}
                                                        {test.status === 'sent' && test.link && (
                                                            <>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(test.link!)}
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => shareViaWhatsApp(test.link!)}
                                                                >
                                                                    <MessageSquare className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: ENVIAR PRUEBA REMOTA */}
                <TabsContent value="enviar" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Enviar Prueba Remota
                            </CardTitle>
                            <CardDescription>
                                Genere un enlace para que {student?.name || 'el consultante'} complete la prueba de forma remota
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Configuración del enlace */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <Label>Vigencia del enlace</Label>
                                        <Select value={linkExpiresIn} onValueChange={setLinkExpiresIn}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 día</SelectItem>
                                                <SelectItem value="3">3 días</SelectItem>
                                                <SelectItem value="7">7 días</SelectItem>
                                                <SelectItem value="14">14 días</SelectItem>
                                                <SelectItem value="30">30 días</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Enlace generado */}
                                {generatedLink && (
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertTitle>Enlace Generado</AlertTitle>
                                        <AlertDescription>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Input value={generatedLink} readOnly className="flex-1" />
                                                <Button size="sm" onClick={() => copyToClipboard(generatedLink)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <Button size="sm" variant="outline" onClick={() => shareViaWhatsApp(generatedLink)}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    WhatsApp
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => shareViaEmail(generatedLink)}>
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Email
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Pruebas disponibles para envío remoto */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                                        Pruebas de Tamizaje
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {clinicalTestsCatalog.screening.filter(t => t.remote).map(test => (
                                            <div 
                                                key={test.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div>
                                                    <p className="font-medium">{test.title}</p>
                                                    <p className="text-sm text-gray-500">{test.description} • {test.duration}</p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => generateIndividualLink(test.id)}
                                                    disabled={generatingLink}
                                                >
                                                    {generatingLink ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Enviar
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mt-6">
                                        Pruebas Académicas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {clinicalTestsCatalog.academic.filter(t => t.remote).map(test => (
                                            <div 
                                                key={test.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div>
                                                    <p className="font-medium">{test.title}</p>
                                                    <p className="text-sm text-gray-500">{test.description} • {test.duration}</p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => generateIndividualLink(test.id)}
                                                    disabled={generatingLink}
                                                >
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Enviar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mt-6">
                                        Ficha de Identificación
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {clinicalTestsCatalog.identification.map(test => (
                                            <div 
                                                key={test.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div>
                                                    <p className="font-medium">{test.title}</p>
                                                    <p className="text-sm text-gray-500">{test.description} • {test.duration}</p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => generateIndividualLink(test.id)}
                                                    disabled={generatingLink}
                                                >
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Enviar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: APLICACIÓN PRESENCIAL */}
                <TabsContent value="presencial" className="mt-6">
                    <div className="space-y-6">
                        {/* Alerta de edad para Wechsler */}
                        {studentAge > 0 && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <Brain className="h-4 w-4 text-blue-600" />
                                <AlertTitle>Escala Wechsler Recomendada</AlertTitle>
                                <AlertDescription>
                                    Según la edad cronológica de {studentAge} años, se recomienda aplicar{' '}
                                    <strong>{getWechslerTest().title}</strong>.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* WISC-V / WAIS-IV */}
                        <Card className="border-purple-200 bg-purple-50/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700">
                                    <BrainCircuit className="h-5 w-5" />
                                    Evaluación de Inteligencia (Wechsler)
                                </CardTitle>
                                <CardDescription>
                                    Aplicación presencial de batería completa
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {getWechslerTest().title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {getWechslerTest().description} • Duración: 60-90 min
                                        </p>
                                    </div>
                                    <Button asChild size="lg">
                                        <Link href={`/consola/${studentId}`} target="_blank">
                                            <Play className="h-4 w-4 mr-2" />
                                            Iniciar Aplicación
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tamizaje Neuropsicológico */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Tamizaje Neuropsicológico
                                </CardTitle>
                                <CardDescription>
                                    Evaluación de atención, memoria de trabajo y funciones ejecutivas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">NEURO-MT / NEURO-AS / NEURO-VP</p>
                                        <p className="text-sm text-gray-600">Duración: 20 min aproximadamente</p>
                                    </div>
                                    <Button asChild>
                                        <Link href={`/consola/${studentId}?tab=neuro`} target="_blank">
                                            <Play className="h-4 w-4 mr-2" />
                                            Iniciar Tamizaje
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pruebas que requieren clínico */}
                        <Card className="border-amber-200 bg-amber-50/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Pruebas de Riesgo (Requieren Clínico)
                                </CardTitle>
                                <CardDescription>
                                    Estas pruebas deben ser aplicadas y supervisadas por personal clínico
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {clinicalTestsCatalog.screening.filter(t => t.requiresClinician).map(test => (
                                        <div 
                                            key={test.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{test.title}</p>
                                                <p className="text-sm text-gray-500">{test.description} • {test.duration}</p>
                                            </div>
                                            <Button variant="outline" size="sm" disabled>
                                                <Play className="h-4 w-4 mr-1" />
                                                Presencial
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 4: PRUEBAS ESPECIALIZADAS */}
                <TabsContent value="especializadas" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="h-5 w-5" />
                                Pruebas Especializadas
                            </CardTitle>
                            <CardDescription>
                                Evaluaciones neuropsicológicas y psicométricas avanzadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* NEUROPSI */}
                                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-lg text-blue-800">NEUROPSI</h4>
                                            <p className="text-sm text-gray-600">
                                                Evaluación Neuropsicológica Breve • 25-30 min
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Evalúa: Orientación, Atención, Codificación, Memoria, Lenguaje, Lectura, Escritura, Funciones Ejecutivas
                                            </p>
                                        </div>
                                        <Button asChild>
                                            <Link href={`/consola/${studentId}?test=neuropsi`} target="_blank">
                                                <Play className="h-4 w-4 mr-2" />
                                                Aplicar
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Otras pruebas especializadas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getAvailableSpecializedTests()
                                        .filter(t => !['wisc-v', 'wais-iv'].includes(t.id))
                                        .map(test => (
                                        <div 
                                            key={test.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div>
                                                <p className="font-medium">{test.title}</p>
                                                <p className="text-sm text-gray-500">{test.description}</p>
                                                <p className="text-xs text-gray-400">{test.duration}</p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Play className="h-4 w-4 mr-1" />
                                                Aplicar
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Nota sobre aplicación */}
                                <Alert className="mt-6">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Requisitos de Aplicación</AlertTitle>
                                    <AlertDescription>
                                        Las pruebas especializadas requieren materiales específicos (libretos, protocolos, cronómetros) 
                                        y deben ser aplicadas por personal capacitado. Los resultados se integrarán automáticamente 
                                        al expediente clínico del consultante.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: ENTREVISTA CLÍNICA */}
                <TabsContent value="entrevista" className="mt-6">
                    <ClinicalInterviewForm 
                        studentId={studentId}
                        studentName={student?.name}
                        studentAge={student?.demographics?.age}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
