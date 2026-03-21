'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Share2,
  RefreshCw,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Heart,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

// ============================================
// TIPOS
// ============================================

interface ResultadoEvaluacion {
  id: string;
  studentId: string;
  testType: string;
  score: number;
  interpretation: string;
  date: Date;
  alerts?: string[];
}

interface PerfilGrupo {
  // CHTE - Hábitos de Estudio
  chtePlanificacion: number;
  chteConcentracion: number;
  chteEstrategias: number;

  // EBMA - Motivación
  motivacionIntrinseca: number;
  motivacionExtrinseca: number;
  amotivacion: number;

  // GAD-7 / PHQ-9
  ansiedadMinima: number;
  ansiedadLeve: number;
  ansiedadModerada: number;
  ansiedadGrave: number;

  depresionMinima: number;
  depresionLeve: number;
  depresionModerada: number;
  depresionGrave: number;

  // LIRA - Riesgo Académico
  riesgoAlto: number;
  riesgoMedio: number;
  riesgoBajo: number;

  // Alertas críticas
  alertasSuicida: number;
  alertasAnsiedadSevera: number;
  alertasDepresionSevera: number;
}

interface ExpedienteGrupal {
  grupoId: string;
  grupoNombre: string;
  fechaEvaluacion: Date;
  totalEstudiantes: number;
  tasaRespuesta: number;
  perfil: PerfilGrupo;
  recomendaciones: string[];
  casosAtencion: {
    nivel2: number;  // Segundo nivel de soporte
    nivel3: number;  // Tercer nivel (especializado)
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ExpedienteGrupalCardProps {
  grupoId: string;
  grupoNombre: string;
  totalEstudiantes: number;
}

export function ExpedienteGrupalCard({
  grupoId,
  grupoNombre,
  totalEstudiantes
}: ExpedienteGrupalCardProps) {
  const [expediente, setExpediente] = useState<ExpedienteGrupal | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (grupoId) {
      calcularExpediente();
    }
  }, [grupoId]);

  const calcularExpediente = async () => {
    setLoading(true);

    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // Obtener todos los resultados del grupo
      const q = query(
        collection(db, 'test_results'),
        where('grupoId', '==', grupoId)
      );

      const snapshot = await getDocs(q);
      const resultados: ResultadoEvaluacion[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as ResultadoEvaluacion[];

      if (resultados.length === 0) {
        setLoading(false);
        return;
      }

      // Calcular perfil del grupo
      const perfil = calcularPerfilGrupo(resultados, totalEstudiantes);

      // Generar recomendaciones
      const recomendaciones = generarRecomendaciones(perfil);

      // Identificar casos de atención
      const casosAtencion = identificarCasosAtencion(resultados);

      setExpediente({
        grupoId,
        grupoNombre,
        fechaEvaluacion: new Date(),
        totalEstudiantes,
        tasaRespuesta: Math.round((resultados.filter(r => r.testType === 'ficha').length / totalEstudiantes) * 100),
        perfil,
        recomendaciones,
        casosAtencion
      });
    } catch (error) {
      console.error('Error calculando expediente grupal:', error);
    }

    setLoading(false);
  };

  const calcularPerfilGrupo = (resultados: ResultadoEvaluacion[], total: number): PerfilGrupo => {
    // Valores por defecto
    const perfil: PerfilGrupo = {
      chtePlanificacion: 50,
      chteConcentracion: 50,
      chteEstrategias: 50,
      motivacionIntrinseca: 50,
      motivacionExtrinseca: 50,
      amotivacion: 20,
      ansiedadMinima: 60,
      ansiedadLeve: 25,
      ansiedadModerada: 12,
      ansiedadGrave: 3,
      depresionMinima: 60,
      depresionLeve: 25,
      depresionModerada: 12,
      depresionGrave: 3,
      riesgoAlto: 10,
      riesgoMedio: 30,
      riesgoBajo: 60,
      alertasSuicida: 0,
      alertasAnsiedadSevera: 0,
      alertasDepresionSevera: 0
    };

    // Agrupar por tipo de test
    const porTipo: Record<string, ResultadoEvaluacion[]> = {};
    resultados.forEach(r => {
      if (!porTipo[r.testType]) porTipo[r.testType] = [];
      porTipo[r.testType].push(r);
    });

    // Calcular promedios por tipo
    if (porTipo['GAD-7']) {
      const gad = porTipo['GAD-7'];
      perfil.ansiedadMinima = gad.filter(r => r.score <= 4).length / gad.length * 100;
      perfil.ansiedadLeve = gad.filter(r => r.score >= 5 && r.score <= 9).length / gad.length * 100;
      perfil.ansiedadModerada = gad.filter(r => r.score >= 10 && r.score <= 14).length / gad.length * 100;
      perfil.ansiedadGrave = gad.filter(r => r.score >= 15).length / gad.length * 100;
    }

    if (porTipo['PHQ-9']) {
      const phq = porTipo['PHQ-9'];
      perfil.depresionMinima = phq.filter(r => r.score <= 4).length / phq.length * 100;
      perfil.depresionLeve = phq.filter(r => r.score >= 5 && r.score <= 9).length / phq.length * 100;
      perfil.depresionModerada = phq.filter(r => r.score >= 10 && r.score <= 14).length / phq.length * 100;
      perfil.depresionGrave = phq.filter(r => r.score >= 15).length / phq.length * 100;
    }

    if (porTipo['EBMA']) {
      const ebma = porTipo['EBMA'];
      // Promedios de motivación (simplificado)
      perfil.motivacionIntrinseca = ebma.reduce((acc, r) => acc + (r.score / 5 * 100), 0) / ebma.length;
    }

    // Contar alertas críticas
    resultados.forEach(r => {
      if (r.alerts && r.alerts.length > 0) {
        r.alerts.forEach(alert => {
          if (alert.includes('suicid') || alert.includes('SSI')) {
            perfil.alertasSuicida++;
          }
          if (alert.includes('ansiedad severa') || alert.includes('GAD-7')) {
            perfil.alertasAnsiedadSevera++;
          }
          if (alert.includes('depresión severa') || alert.includes('PHQ-9')) {
            perfil.alertasDepresionSevera++;
          }
        });
      }
    });

    return perfil;
  };

  const generarRecomendaciones = (perfil: PerfilGrupo): string[] => {
    const recomendaciones: string[] = [];

    // Hábitos de estudio
    if (perfil.chteEstrategias < 40) {
      recomendaciones.push('Implementar talleres de técnicas de estudio y organización del tiempo.');
    }
    if (perfil.chtePlanificacion < 40) {
      recomendaciones.push('Introducir uso de agendas y planificadores académicos.');
    }

    // Motivación
    if (perfil.amotivacion > 30) {
      recomendaciones.push('Atender casos de amotivación mediante entrevistas individuales para identificar causas.');
    }
    if (perfil.motivacionIntrinseca > 60) {
      recomendaciones.push('Aprovechar la alta motivación intrínseca con proyectos autodirigidos y aprendizaje basado en problemas.');
    }

    // Salud mental
    if (perfil.ansiedadGrave > 5 || perfil.depresionGrave > 5) {
      recomendaciones.push('Coordinar con orientación seguimiento de casos con ansiedad/depresión grave detectados.');
    }
    if (perfil.alertasSuicida > 0) {
      recomendaciones.push(`⚠️ URGENTE: ${perfil.alertasSuicida} caso(s) con alerta de riesgo suicida detectados. Requieren evaluación clínica inmediata.`);
    }

    // Riesgo académico
    if (perfil.riesgoAlto > 15) {
      recomendaciones.push('Establecer programa de acompañamiento académico para estudiantes en alto riesgo.');
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push('El grupo presenta un perfil saludable. Continuar con las prácticas actuales y monitoreo periódico.');
    }

    return recomendaciones;
  };

  const identificarCasosAtencion = (resultados: ResultadoEvaluacion[]) => {
    let nivel2 = 0;
    let nivel3 = 0;

    // Agrupar por estudiante
    const porEstudiante: Record<string, ResultadoEvaluacion[]> = {};
    resultados.forEach(r => {
      if (!porEstudiante[r.studentId]) porEstudiante[r.studentId] = [];
      porEstudiante[r.studentId].push(r);
    });

    Object.entries(porEstudiante).forEach(([_, tests]) => {
      const tieneAlertas = tests.some(t => t.alerts && t.alerts.length > 0);
      const scoresAltos = tests.filter(t =>
        (t.testType === 'GAD-7' && t.score >= 10) ||
        (t.testType === 'PHQ-9' && t.score >= 10) ||
        (t.testType === 'BDI-II' && t.score >= 20)
      );

      if (tieneAlertas || scoresAltos.length >= 2) {
        nivel3++;
      } else if (scoresAltos.length === 1) {
        nivel2++;
      }
    });

    return { nivel2, nivel3 };
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Calculando perfil del grupo...</span>
        </CardContent>
      </Card>
    );
  }

  if (!expediente) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Aún no hay datos de evaluación para este grupo.</p>
          <p className="text-sm mt-2">Los resultados aparecerán cuando los estudiantes completen las evaluaciones.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{expediente.grupoNombre}</h2>
              <p className="text-blue-200">Expediente Psicopedagógico Grupal</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{expediente.tasaRespuesta}%</p>
              <p className="text-blue-200 text-sm">Tasa de respuesta</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas críticas */}
      {expediente.perfil.alertasSuicida > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">
                  ⚠️ {expediente.perfil.alertasSuicida} Alerta(s) de Riesgo Suicida
                </h3>
                <p className="text-red-600 text-sm">
                  Requieren evaluación clínica inmediata y consentimiento informado específico.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perfiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hábitos de Estudio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Hábitos de Estudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Planificación</span>
                <span>{expediente.perfil.chtePlanificacion.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.chtePlanificacion} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Concentración</span>
                <span>{expediente.perfil.chteConcentracion.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.chteConcentracion} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Estrategias</span>
                <span>{expediente.perfil.chteEstrategias.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.chteEstrategias} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Motivación */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              Motivación Académica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Intrínseca</span>
                <span>{expediente.perfil.motivacionIntrinseca.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.motivacionIntrinseca} className="h-2 bg-green-100 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Extrínseca</span>
                <span>{expediente.perfil.motivacionExtrinseca.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.motivacionExtrinseca} className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Amotivación</span>
                <span>{expediente.perfil.amotivacion.toFixed(0)}%</span>
              </div>
              <Progress value={expediente.perfil.amotivacion} className="h-2 bg-red-100 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Ansiedad */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-orange-600" />
              Niveles de Ansiedad (GAD-7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-700">{expediente.perfil.ansiedadMinima.toFixed(0)}%</p>
                <p className="text-xs text-green-600">Mínima</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <p className="text-lg font-bold text-yellow-700">{expediente.perfil.ansiedadLeve.toFixed(0)}%</p>
                <p className="text-xs text-yellow-600">Leve</p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-lg font-bold text-orange-700">{expediente.perfil.ansiedadModerada.toFixed(0)}%</p>
                <p className="text-xs text-orange-600">Moderada</p>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <p className="text-lg font-bold text-red-700">{expediente.perfil.ansiedadGrave.toFixed(0)}%</p>
                <p className="text-xs text-red-600">Grave</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Depresión */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-purple-600" />
              Niveles de Depresión (PHQ-9)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-700">{expediente.perfil.depresionMinima.toFixed(0)}%</p>
                <p className="text-xs text-green-600">Mínima</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <p className="text-lg font-bold text-yellow-700">{expediente.perfil.depresionLeve.toFixed(0)}%</p>
                <p className="text-xs text-yellow-600">Leve</p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-lg font-bold text-orange-700">{expediente.perfil.depresionModerada.toFixed(0)}%</p>
                <p className="text-xs text-orange-600">Moderada</p>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <p className="text-lg font-bold text-red-700">{expediente.perfil.depresionGrave.toFixed(0)}%</p>
                <p className="text-xs text-red-600">Grave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Casos de Atención */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Casos Identificados para Atención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-700">{expediente.casosAtencion.nivel2}</p>
              <p className="text-amber-600 font-medium">Segundo Nivel de Soporte</p>
              <p className="text-xs text-amber-500 mt-1">Intervención focalizada</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-700">{expediente.casosAtencion.nivel3}</p>
              <p className="text-red-600 font-medium">Tercer Nivel de Soporte</p>
              <p className="text-xs text-red-500 mt-1">Evaluación especializada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones Pedagógicas
          </CardTitle>
          <CardDescription>
            Sugerencias basadas en el perfil del grupo para docentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {expediente.recomendaciones.map((rec, idx) => (
              <li key={idx} className={`p-3 rounded-lg ${rec.includes('URGENTE') ? 'bg-red-50 text-red-800' : 'bg-gray-50'}`}>
                {rec.includes('URGENTE') ? '🚨' : '📌'} {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartir con Docentes
        </Button>
        <Button variant="outline" className="flex items-center gap-2" onClick={calcularExpediente}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
