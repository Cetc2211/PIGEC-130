'use client';

import { useState, useEffect } from 'react';
import StudentDashboard from '@/components/student-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, GraduationCap, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Activity, ShieldAlert, BarChart3
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getStudents } from '@/lib/store';

// Componente de estadísticas generales
function DashboardStats() {
  const [stats, setStats] = useState({
    totalGrupos: 0,
    totalEvaluaciones: 0,
    estudiantesRiesgoCritico: 0,
    estudiantesRiesgoAlto: 0,
    estudiantesRiesgoMedio: 0,
    estudiantesRiesgoBajo: 0,
    expedientesCompletados: 0,
    expedientesEnProgreso: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      
      // Estadísticas de datos locales (ejemplo)
      const localStudents = getStudents();
      
      let riesgoCritico = 0;
      let riesgoAlto = 0;
      let riesgoMedio = 0;
      let riesgoBajo = 0;
      
      localStudents.forEach(s => {
        switch(s.suicideRiskLevel) {
          case 'Crítico': riesgoCritico++; break;
          case 'Alto': riesgoAlto++; break;
          case 'Medio': riesgoMedio++; break;
          default: riesgoBajo++;
        }
      });

      // Estadísticas de Firebase
      let totalGrupos = 0;
      let totalEvaluaciones = 0;
      let expedientesCompletados = 0;
      let expedientesEnProgreso = 0;

      if (db) {
        try {
          // Contar grupos
          const gruposSnapshot = await getDocs(collection(db, 'official_groups'));
          totalGrupos = gruposSnapshot.size;

          // Contar expedientes
          const expedientesSnapshot = await getDocs(collection(db, 'expedientes'));
          totalEvaluaciones = expedientesSnapshot.size;
          
          expedientesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.estado === 'completado') {
              expedientesCompletados++;
            } else {
              expedientesEnProgreso++;
            }
          });
        } catch (error) {
          console.error('Error fetching Firebase stats:', error);
        }
      }

      setStats({
        totalGrupos,
        totalEvaluaciones,
        estudiantesRiesgoCritico: riesgoCritico,
        estudiantesRiesgoAlto: riesgoAlto,
        estudiantesRiesgoMedio: riesgoMedio,
        estudiantesRiesgoBajo: riesgoBajo,
        expedientesCompletados,
        expedientesEnProgreso
      });
      
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Grupos Evaluados</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalGrupos}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Expedientes Totales</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEvaluaciones}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.expedientesCompletados} completados
              </Badge>
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                {stats.expedientesEnProgreso} en progreso
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Casos de Riesgo Crítico</p>
                <p className="text-3xl font-bold text-red-600">{stats.estudiantesRiesgoCritico}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full animate-pulse">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Casos de Riesgo Alto</p>
                <p className="text-3xl font-bold text-orange-600">{stats.estudiantesRiesgoAlto}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requieren seguimiento cercano</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de riesgo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Distribución de Niveles de Riesgo
          </CardTitle>
          <CardDescription>
            Clasificación de estudiantes según el Índice de Riesgo Compuesto (IRC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Crítico */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-red-600">{stats.estudiantesRiesgoCritico}</div>
              <Badge className="mt-2 bg-red-600">CRÍTICO</Badge>
              <p className="text-xs text-gray-500 mt-2">Nivel 3 - Intervención inmediata</p>
            </div>
            
            {/* Alto */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-orange-600">{stats.estudiantesRiesgoAlto}</div>
              <Badge className="mt-2 bg-orange-500">ALTO</Badge>
              <p className="text-xs text-gray-500 mt-2">Nivel 3 - Seguimiento cercano</p>
            </div>
            
            {/* Medio */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-amber-600">{stats.estudiantesRiesgoMedio}</div>
              <Badge className="mt-2 bg-amber-500">MEDIO</Badge>
              <p className="text-xs text-gray-500 mt-2">Nivel 2 - Intervención grupal</p>
            </div>
            
            {/* Bajo */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-green-600">{stats.estudiantesRiesgoBajo}</div>
              <Badge className="mt-2 bg-green-500">BAJO</Badge>
              <p className="text-xs text-gray-500 mt-2">Nivel 1 - Prevención universal</p>
            </div>
          </div>
          
          {/* Barra de progreso visual */}
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {stats.estudiantesRiesgoCritico > 0 && (
                <div 
                  className="bg-red-600" 
                  style={{ width: `${(stats.estudiantesRiesgoCritico / (stats.estudiantesRiesgoCritico + stats.estudiantesRiesgoAlto + stats.estudiantesRiesgoMedio + stats.estudiantesRiesgoBajo)) * 100}%` }}
                />
              )}
              {stats.estudiantesRiesgoAlto > 0 && (
                <div 
                  className="bg-orange-500" 
                  style={{ width: `${(stats.estudiantesRiesgoAlto / (stats.estudiantesRiesgoCritico + stats.estudiantesRiesgoAlto + stats.estudiantesRiesgoMedio + stats.estudiantesRiesgoBajo)) * 100}%` }}
                />
              )}
              {stats.estudiantesRiesgoMedio > 0 && (
                <div 
                  className="bg-amber-500" 
                  style={{ width: `${(stats.estudiantesRiesgoMedio / (stats.estudiantesRiesgoCritico + stats.estudiantesRiesgoAlto + stats.estudiantesRiesgoMedio + stats.estudiantesRiesgoBajo)) * 100}%` }}
                />
              )}
              {stats.estudiantesRiesgoBajo > 0 && (
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(stats.estudiantesRiesgoBajo / (stats.estudiantesRiesgoCritico + stats.estudiantesRiesgoAlto + stats.estudiantesRiesgoMedio + stats.estudiantesRiesgoBajo)) * 100}%` }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel de Control - Sistema de Detección Temprana
          </h1>
          <p className="text-gray-500">
            Resumen general del programa de prevención e intervención (PIGEC-130)
          </p>
        </div>
        
        {/* Estadísticas generales */}
        <DashboardStats />
        
        {/* Tabla de estudiantes con riesgo */}
        <div className="bg-white rounded-xl shadow-sm border">
          <StudentDashboard />
        </div>
      </main>
    </div>
  );
}
