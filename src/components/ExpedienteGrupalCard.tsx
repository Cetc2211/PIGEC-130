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
  BarChart3,
  Eye
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

interface ResultadoTest {
  id: string;
  testId: string;
  testName: string;
  matricula: string;
  nombreCompleto: string;
  grupoId: string;
  puntaje: number | null;
  respuestas: Record<string, string>;
  fechaCompletado: Date;
}

interface EstadisticasGrupo {
  totalEstudiantes: number;
  estudiantesEvaluados: number;
  tasaRespuesta: number;
  
  // Hábitos de estudio (CHTE)
  chtePromedio: number;
  
  // Motivación (EBMA)
  motivacionIntrinseca: number;
  motivacionExtrinseca: number;
  amotivacion: number;
  
  // Ansiedad (GAD-7) - Conteo por nivel
  ansiedadMinima: number;
  ansiedadLeve: number;
  ansiedadModerada: number;
  ansiedadGrave: number;
  
  // Depresión (PHQ-9) - Conteo por nivel
  depresionMinima: number;
  depresionLeve: number;
  depresionModerada: number;
  depresionGrave: number;
  
  // Casos de atención
  casosNivel2: number;
  casosNivel3: number;
  
  // Alertas
  alertasSuicida: number;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Interpretar puntaje GAD-7
function interpretarGAD7(puntaje: number): 'minima' | 'leve' | 'moderada' | 'grave' {
  if (puntaje <= 4) return 'minima';
  if (puntaje <= 9) return 'leve';
  if (puntaje <= 14) return 'moderada';
  return 'grave';
}

// Interpretar puntaje PHQ-9
function interpretarPHQ9(puntaje: number): 'minima' | 'leve' | 'moderada' | 'grave' {
  if (puntaje <= 4) return 'minima';
  if (puntaje <= 9) return 'leve';
  if (puntaje <= 14) return 'moderada';
  if (puntaje <= 19) return 'moderada';
  return 'grave';
}

// Calcular puntaje desde respuestas
function calcularPuntaje(respuestas: Record<string, string>, testId: string): number {
  let total = 0;
  
  Object.values(respuestas).forEach(valor => {
    const num = parseInt(valor);
    if (!isNaN(num)) {
      total += num;
    }
  });
  
  return total;
}

// Filtrar resultados duplicados, manteniendo solo el más reciente por estudiante y prueba
function filtrarResultadosMasRecientes(resultados: ResultadoTest[]): ResultadoTest[] {
  const mapaResultados = new Map<string, ResultadoTest>();
  
  // Crear clave única por matricula + testId
  resultados.forEach(resultado => {
    const clave = `${resultado.matricula}_${resultado.testId}`;
    const existente = mapaResultados.get(clave);
    
    if (!existente || resultado.fechaCompletado > existente.fechaCompletado) {
      mapaResultados.set(clave, resultado);
    }
  });
  
  return Array.from(mapaResultados.values());
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ExpedienteGrupalCardProps {
  grupoId: string;
  grupoNombre: string;
  totalEstudiantes: number;
  onViewExpedientes?: () => void;
}

export function ExpedienteGrupalCard({
  grupoId,
  grupoNombre,
  totalEstudiantes,
  onViewExpedientes
}: ExpedienteGrupalCardProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGrupo | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoTest[]>([]);

  useEffect(() => {
    if (grupoId) {
      cargarDatos();
    }
  }, [grupoId]);

  const cargarDatos = async () => {
    setLoading(true);

    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // Obtener todos los resultados del grupo desde test_results
      const q = query(
        collection(db, 'test_results'),
        where('grupoId', '==', grupoId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setEstadisticas(null);
        setLoading(false);
        return;
      }

      const resultadosObtenidos: ResultadoTest[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          testId: data.testId || '',
          testName: data.testName || '',
          matricula: data.matricula || '',
          nombreCompleto: data.nombreCompleto || '',
          grupoId: data.grupoId || '',
          puntaje: data.puntaje ?? null,
          respuestas: data.respuestas || {},
          fechaCompletado: data.fechaCompletado?.toDate() || new Date()
        };
      });

      setResultados(resultadosObtenidos);
      
      // Filtrar resultados duplicados (mantener solo el más reciente)
      const resultadosFiltrados = filtrarResultadosMasRecientes(resultadosObtenidos);
      console.log(`[ExpedienteGrupalCard] Resultados originales: ${resultadosObtenidos.length}, filtrados: ${resultadosFiltrados.length}`);
      
      // Calcular estadísticas con resultados filtrados
      const stats = calcularEstadisticas(resultadosFiltrados, totalEstudiantes);
      setEstadisticas(stats);

    } catch (error) {
      console.error('Error cargando datos del grupo:', error);
    }

    setLoading(false);
  };

  const calcularEstadisticas = (resultados: ResultadoTest[], total: number): EstadisticasGrupo => {
    // Identificar estudiantes únicos evaluados
    const estudiantesUnicos = new Set(resultados.map(r => r.matricula));
    const estudiantesEvaluados = estudiantesUnicos.size;
    
    // Inicializar estadísticas
    const stats: EstadisticasGrupo = {
      totalEstudiantes: total,
      estudiantesEvaluados,
      tasaRespuesta: total > 0 ? Math.round((estudiantesEvaluados / total) * 100) : 0,
      chtePromedio: 0,
      motivacionIntrinseca: 0,
      motivacionExtrinseca: 0,
      amotivacion: 0,
      ansiedadMinima: 0,
      ansiedadLeve: 0,
      ansiedadModerada: 0,
      ansiedadGrave: 0,
      depresionMinima: 0,
      depresionLeve: 0,
      depresionModerada: 0,
      depresionGrave: 0,
      casosNivel2: 0,
      casosNivel3: 0,
      alertasSuicida: 0
    };

    // Agrupar resultados por estudiante
    const porEstudiante: Record<string, ResultadoTest[]> = {};
    resultados.forEach(r => {
      if (!porEstudiante[r.matricula]) porEstudiante[r.matricula] = [];
      porEstudiante[r.matricula].push(r);
    });

    // Procesar cada estudiante
    Object.entries(porEstudiante).forEach(([matricula, tests]) => {
      let tieneAlertaGrave = false;
      let tieneAlertaModerada = false;

      tests.forEach(test => {
        const puntaje = test.puntaje ?? calcularPuntaje(test.respuestas, test.testId);

        // GAD-7 (Ansiedad)
        if (test.testId === 'gad-7') {
          const nivel = interpretarGAD7(puntaje);
          switch (nivel) {
            case 'minima': stats.ansiedadMinima++; break;
            case 'leve': stats.ansiedadLeve++; break;
            case 'moderada': 
              stats.ansiedadModerada++;
              tieneAlertaModerada = true;
              break;
            case 'grave': 
              stats.ansiedadGrave++;
              tieneAlertaGrave = true;
              break;
          }
        }

        // PHQ-9 (Depresión)
        if (test.testId === 'phq-9') {
          const nivel = interpretarPHQ9(puntaje);
          switch (nivel) {
            case 'minima': stats.depresionMinima++; break;
            case 'leve': stats.depresionLeve++; break;
            case 'moderada': 
              stats.depresionModerada++;
              tieneAlertaModerada = true;
              break;
            case 'grave': 
              stats.depresionGrave++;
              tieneAlertaGrave = true;
              break;
          }

          // Pregunta 9 del PHQ-9: ideación suicida
          const q9 = test.respuestas['q9'];
          if (q9 && (q9 === '2' || q9 === '3')) {
            stats.alertasSuicida++;
            tieneAlertaGrave = true;
          }
        }

        // BDI-II (Depresión de Beck)
        if (test.testId === 'bdi-ii') {
          if (puntaje >= 20) {
            // Depresión moderada a severa
            tieneAlertaModerada = true;
          }
          if (puntaje >= 30) {
            stats.depresionGrave++;
            tieneAlertaGrave = true;
          } else if (puntaje >= 20) {
            stats.depresionModerada++;
          } else if (puntaje >= 14) {
            stats.depresionLeve++;
          } else {
            stats.depresionMinima++;
          }
        }

        // BAI (Ansiedad de Beck)
        if (test.testId === 'bai') {
          if (puntaje >= 26) {
            stats.ansiedadGrave++;
            tieneAlertaGrave = true;
          } else if (puntaje >= 16) {
            stats.ansiedadModerada++;
            tieneAlertaModerada = true;
          } else if (puntaje >= 8) {
            stats.ansiedadLeve++;
          } else {
            stats.ansiedadMinima++;
          }
        }
      });

      // Clasificar estudiante en nivel de atención
      if (tieneAlertaGrave) {
        stats.casosNivel3++;
      } else if (tieneAlertaModerada) {
        stats.casosNivel2++;
      }
    });

    return stats;
  };

  const generarRecomendaciones = (): string[] => {
    if (!estadisticas) return [];

    const recomendaciones: string[] = [];

    // Salud mental
    if (estadisticas.ansiedadGrave > 0 || estadisticas.depresionGrave > 0) {
      recomendaciones.push(`📌 ${estadisticas.ansiedadGrave + estadisticas.depresionGrave} estudiante(s) con ansiedad/depresión grave detectados. Requieren seguimiento por orientación.`);
    }

    if (estadisticas.alertasSuicida > 0) {
      recomendaciones.push(`⚠️ URGENTE: ${estadisticas.alertasSuicida} estudiante(s) con indicadores de riesgo suicida. Requieren evaluación clínica inmediata.`);
    }

    if (estadisticas.casosNivel2 > 0) {
      recomendaciones.push(`📌 ${estadisticas.casosNivel2} estudiante(s) requieren intervención focalizada (Nivel 2).`);
    }

    if (estadisticas.casosNivel3 > 0) {
      recomendaciones.push(`📌 ${estadisticas.casosNivel3} estudiante(s) requieren evaluación especializada (Nivel 3).`);
    }

    if (estadisticas.tasaRespuesta < 50) {
      recomendaciones.push(`📌 Solo el ${estadisticas.tasaRespuesta}% de estudiantes han completado la evaluación. Considerar enviar recordatorios.`);
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push('El grupo presenta un perfil saludable. Continuar con las prácticas actuales y monitoreo periódico.');
    }

    return recomendaciones;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando datos del grupo...</span>
        </CardContent>
      </Card>
    );
  }

  if (!estadisticas) {
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

  const recomendaciones = generarRecomendaciones();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{grupoNombre}</h2>
              <p className="text-blue-200">Seguimiento de Evaluaciones</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{estadisticas.tasaRespuesta}%</p>
              <p className="text-blue-200 text-sm">Tasa de respuesta</p>
              <p className="text-blue-300 text-xs mt-1">
                {estadisticas.estudiantesEvaluados} de {estadisticas.totalEstudiantes} estudiantes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas críticas */}
      {estadisticas.alertasSuicida > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">
                  ⚠️ {estadisticas.alertasSuicida} Alerta(s) de Riesgo Suicida
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
        {/* Ansiedad */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-orange-600" />
              Niveles de Ansiedad
            </CardTitle>
            <CardDescription>
              Distribución de {estadisticas.estudiantesEvaluados} estudiante(s) evaluado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estadisticas.ansiedadMinima + estadisticas.ansiedadLeve + estadisticas.ansiedadModerada + estadisticas.ansiedadGrave > 0 ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-700">{estadisticas.ansiedadMinima}</p>
                  <p className="text-xs text-green-600">Mínima</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-lg font-bold text-yellow-700">{estadisticas.ansiedadLeve}</p>
                  <p className="text-xs text-yellow-600">Leve</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <p className="text-lg font-bold text-orange-700">{estadisticas.ansiedadModerada}</p>
                  <p className="text-xs text-orange-600">Moderada</p>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-lg font-bold text-red-700">{estadisticas.ansiedadGrave}</p>
                  <p className="text-xs text-red-600">Grave</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Sin datos de ansiedad</p>
            )}
          </CardContent>
        </Card>

        {/* Depresión */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-purple-600" />
              Niveles de Depresión
            </CardTitle>
            <CardDescription>
              Distribución de {estadisticas.estudiantesEvaluados} estudiante(s) evaluado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estadisticas.depresionMinima + estadisticas.depresionLeve + estadisticas.depresionModerada + estadisticas.depresionGrave > 0 ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-700">{estadisticas.depresionMinima}</p>
                  <p className="text-xs text-green-600">Mínima</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-lg font-bold text-yellow-700">{estadisticas.depresionLeve}</p>
                  <p className="text-xs text-yellow-600">Leve</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <p className="text-lg font-bold text-orange-700">{estadisticas.depresionModerada}</p>
                  <p className="text-xs text-orange-600">Moderada</p>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-lg font-bold text-red-700">{estadisticas.depresionGrave}</p>
                  <p className="text-xs text-red-600">Grave</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Sin datos de depresión</p>
            )}
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
              <p className="text-3xl font-bold text-amber-700">{estadisticas.casosNivel2}</p>
              <p className="text-amber-600 font-medium">Segundo Nivel de Soporte</p>
              <p className="text-xs text-amber-500 mt-1">Intervención focalizada</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-700">{estadisticas.casosNivel3}</p>
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
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recomendaciones.map((rec, idx) => (
              <li key={idx} className={`p-3 rounded-lg ${rec.includes('URGENTE') ? 'bg-red-50 text-red-800' : 'bg-gray-50'}`}>
                {rec.includes('URGENTE') ? '🚨' : '📌'} {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-2 flex-wrap">
        {onViewExpedientes && (
          <Button variant="default" className="flex items-center gap-2" onClick={onViewExpedientes}>
            <Eye className="h-4 w-4" />
            Ver Expedientes Individuales
          </Button>
        )}
        <Button variant="outline" className="flex items-center gap-2" onClick={cargarDatos}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
