'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Users, FileText, Calendar, ChevronRight, Eye, Download,
  AlertTriangle, CheckCircle, Clock, RefreshCw, ArrowLeft, Trash2, AlertOctagon
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';

// ============================================
// TIPOS
// ============================================

interface ExpedienteEstudiante {
  id: string;
  matricula: string;
  nombreCompleto: string;
  grupoId: string;
  grupoNombre: string;
  sessionId: string;
  sessionName: string;
  estado: 'en_progreso' | 'completado';
  testsCompletados: number;
  testsTotal: number;
  fechaCreacion: Date;
  fechaCompletado?: Date;
}

interface ResultadoTest {
  id: string;
  testId: string;
  testName: string;
  puntaje: number | null;
  respuestas: Record<string, string>;
  fechaCompletado: Date;
  sessionId?: string;
  esDuplicado?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<ExpedienteEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [grupos, setGrupos] = useState<{ id: string; nombre: string }[]>([]);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<ExpedienteEstudiante | null>(null);
  const [resultados, setResultados] = useState<ResultadoTest[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteExpedienteDialog, setShowDeleteExpedienteDialog] = useState(false);
  const [resultadosAEliminar, setResultadosAEliminar] = useState<ResultadoTest[]>([]);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarExpedientes();
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    if (!db) return;

    try {
      const q = query(collection(db, 'official_groups'));
      const snapshot = await getDocs(q);
      
      const gruposObtenidos = snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().name || `Grupo ${doc.id}`
      }));

      setGrupos(gruposObtenidos);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const cargarExpedientes = async () => {
    setLoading(true);

    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // Cargar TODOS los expedientes
      const expedientesSnapshot = await getDocs(collection(db, 'expedientes'));
      
      // Cargar TODOS los resultados de pruebas
      const resultadosSnapshot = await getDocs(collection(db, 'test_results'));
      
      // Crear un mapa de resultados por matrícula + sessionId
      const resultadosPorEstudianteSesion: Record<string, ResultadoTest[]> = {};
      
      resultadosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.matricula}_${data.sessionId}`;
        
        if (!resultadosPorEstudianteSesion[key]) {
          resultadosPorEstudianteSesion[key] = [];
        }
        
        resultadosPorEstudianteSesion[key].push({
          id: doc.id,
          testId: data.testId || '',
          testName: data.testName || '',
          puntaje: data.puntaje ?? null,
          respuestas: data.respuestas || {},
          fechaCompletado: data.fechaCompletado?.toDate() || new Date(),
          sessionId: data.sessionId
        });
      });

      // Agrupar expedientes por matrícula + sessionId (para evitar duplicados en la lista)
      const expedientesAgrupados: Record<string, ExpedienteEstudiante> = {};
      
      expedientesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.matricula}_${data.sessionId}`;
        
        if (!expedientesAgrupados[key]) {
          const resultadosEstudiante = resultadosPorEstudianteSesion[key] || [];
          
          expedientesAgrupados[key] = {
            id: doc.id,
            matricula: data.matricula || '',
            nombreCompleto: data.nombreCompleto || '',
            grupoId: data.grupoId || '',
            grupoNombre: data.grupoNombre || '',
            sessionId: data.sessionId || '',
            sessionName: data.sessionName || '',
            estado: data.estado || 'en_progreso',
            testsCompletados: resultadosEstudiante.length,
            testsTotal: data.testsTotal || 7,
            fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
            fechaCompletado: data.fechaCompletado?.toDate()
          };
        } else {
          const existente = expedientesAgrupados[key];
          const fechaExistente = existente.fechaCreacion.getTime();
          const fechaNueva = (data.fechaCreacion?.toDate() || new Date()).getTime();
          
          if (data.estado === 'completado' && existente.estado !== 'completado') {
            expedientesAgrupados[key] = {
              ...existente,
              id: doc.id,
              estado: 'completado',
              fechaCompletado: data.fechaCompletado?.toDate()
            };
          } else if (data.estado === existente.estado && fechaNueva > fechaExistente) {
            expedientesAgrupados[key] = {
              ...existente,
              id: doc.id,
              fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
              fechaCompletado: data.fechaCompletado?.toDate()
            };
          }
        }
      });

      // Convertir a array y ordenar por fecha
      const expedientesLista = Object.values(expedientesAgrupados).sort(
        (a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
      );

      setExpedientes(expedientesLista);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
    }

    setLoading(false);
  };

  // Cargar TODOS los resultados del expediente (sin filtrar duplicados)
  const cargarResultadosExpediente = async (expediente: ExpedienteEstudiante) => {
    if (!db) return;

    try {
      // Buscar resultados por matrícula Y sessionId
      const q = query(
        collection(db, 'test_results'),
        where('matricula', '==', expediente.matricula),
        where('sessionId', '==', expediente.sessionId)
      );

      const snapshot = await getDocs(q);

      const resultadosObtenidos: ResultadoTest[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          testId: data.testId || '',
          testName: data.testName || '',
          puntaje: data.puntaje ?? null,
          respuestas: data.respuestas || {},
          fechaCompletado: data.fechaCompletado?.toDate() || new Date()
        };
      });

      // Marcar duplicados
      const resultadosConDuplicados = marcarDuplicados(resultadosObtenidos);
      
      // Ordenar por testId y luego por fecha (más reciente primero)
      resultadosConDuplicados.sort((a, b) => {
        if (a.testId !== b.testId) {
          return a.testId.localeCompare(b.testId);
        }
        return b.fechaCompletado.getTime() - a.fechaCompletado.getTime();
      });

      setResultados(resultadosConDuplicados);
      setExpedienteSeleccionado(expediente);
    } catch (error) {
      console.error('Error cargando resultados:', error);
    }
  };

  // Marcar resultados duplicados (el más reciente NO se marca)
  const marcarDuplicados = (resultados: ResultadoTest[]): ResultadoTest[] => {
    const mapa = new Map<string, ResultadoTest[]>();
    
    resultados.forEach(resultado => {
      const existentes = mapa.get(resultado.testId) || [];
      existentes.push(resultado);
      mapa.set(resultado.testId, existentes);
    });
    
    const resultadosMarcados: ResultadoTest[] = [];
    
    mapa.forEach((tests) => {
      // Ordenar por fecha descendente
      tests.sort((a, b) => b.fechaCompletado.getTime() - a.fechaCompletado.getTime());
      
      tests.forEach((test, index) => {
        resultadosMarcados.push({
          ...test,
          esDuplicado: index > 0 // El primero (más reciente) no es duplicado
        });
      });
    });
    
    return resultadosMarcados;
  };

  // Contar duplicados
  const contarDuplicados = (): number => {
    return resultados.filter(r => r.esDuplicado).length;
  };

  // Eliminar resultados duplicados
  const eliminarDuplicados = async () => {
    if (!db) return;
    
    setEliminando(true);
    let eliminados = 0;
    
    try {
      const duplicados = resultados.filter(r => r.esDuplicado);
      
      for (const resultado of duplicados) {
        await deleteDoc(doc(db, 'test_results', resultado.id));
        eliminados++;
      }
      
      // Recargar resultados
      if (expedienteSeleccionado) {
        await cargarResultadosExpediente(expedienteSeleccionado);
      }
      
      setShowDeleteDialog(false);
      
      alert(`Se eliminaron ${eliminados} resultado(s) duplicado(s)`);
    } catch (error) {
      console.error('Error eliminando duplicados:', error);
      alert('Error al eliminar duplicados: ' + (error as Error).message);
    }
    
    setEliminando(false);
  };

  // Eliminar un resultado individual
  const eliminarResultadoIndividual = async (resultado: ResultadoTest) => {
    if (!db) return;
    
    if (!confirm(`¿Eliminar este resultado de ${resultado.testName}?`)) return;
    
    try {
      await deleteDoc(doc(db, 'test_results', resultado.id));
      
      // Recargar resultados
      if (expedienteSeleccionado) {
        await cargarResultadosExpediente(expedienteSeleccionado);
      }
      
      alert('Resultado eliminado');
    } catch (error) {
      console.error('Error eliminando resultado:', error);
      alert('Error al eliminar el resultado: ' + (error as Error).message);
    }
  };

  // Eliminar expediente completo
  const eliminarExpedienteCompleto = async () => {
    if (!db || !expedienteSeleccionado) return;
    
    setEliminando(true);
    
    try {
      // 1. Eliminar todos los resultados de test asociados
      const resultadosQuery = query(
        collection(db, 'test_results'),
        where('matricula', '==', expedienteSeleccionado.matricula),
        where('sessionId', '==', expedienteSeleccionado.sessionId)
      );
      
      const resultadosSnapshot = await getDocs(resultadosQuery);
      
      for (const docSnapshot of resultadosSnapshot.docs) {
        await deleteDoc(doc(db, 'test_results', docSnapshot.id));
      }
      
      // 2. Eliminar el expediente
      await deleteDoc(doc(db, 'expedientes', expedienteSeleccionado.id));
      
      // 3. Volver a la lista y recargar
      setShowDeleteExpedienteDialog(false);
      setExpedienteSeleccionado(null);
      setResultados([]);
      await cargarExpedientes();
      
      alert('Expediente eliminado completamente');
    } catch (error) {
      console.error('Error eliminando expediente:', error);
      alert('Error al eliminar el expediente: ' + (error as Error).message);
    }
    
    setEliminando(false);
  };

  const expedientesFiltrados = expedientes.filter(exp => {
    const coincideBusqueda = 
      exp.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
      exp.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideGrupo = filtroGrupo === 'todos' || exp.grupoId === filtroGrupo;

    return coincideBusqueda && coincideGrupo;
  });

  const interpretarPuntaje = (testId: string, puntaje: number | null): { nivel: string; color: string } => {
    if (puntaje === null) return { nivel: 'N/A', color: 'gray' };

    switch (testId) {
      case 'gad-7':
        if (puntaje <= 4) return { nivel: 'Ansiedad mínima', color: 'green' };
        if (puntaje <= 9) return { nivel: 'Ansiedad leve', color: 'yellow' };
        if (puntaje <= 14) return { nivel: 'Ansiedad moderada', color: 'orange' };
        return { nivel: 'Ansiedad grave', color: 'red' };

      case 'phq-9':
        if (puntaje <= 4) return { nivel: 'Depresión mínima', color: 'green' };
        if (puntaje <= 9) return { nivel: 'Depresión leve', color: 'yellow' };
        if (puntaje <= 14) return { nivel: 'Depresión moderada', color: 'orange' };
        if (puntaje <= 19) return { nivel: 'Depresión moderadamente severa', color: 'orange' };
        return { nivel: 'Depresión grave', color: 'red' };

      case 'bai':
        if (puntaje <= 7) return { nivel: 'Ansiedad mínima', color: 'green' };
        if (puntaje <= 15) return { nivel: 'Ansiedad leve', color: 'yellow' };
        if (puntaje <= 25) return { nivel: 'Ansiedad moderada', color: 'orange' };
        return { nivel: 'Ansiedad severa', color: 'red' };

      case 'bdi-ii':
        if (puntaje <= 10) return { nivel: 'Depresión mínima', color: 'green' };
        if (puntaje <= 16) return { nivel: 'Depresión leve', color: 'yellow' };
        if (puntaje <= 20) return { nivel: 'Depresión moderada', color: 'orange' };
        if (puntaje <= 30) return { nivel: 'Depresión severa', color: 'orange' };
        return { nivel: 'Depresión muy severa', color: 'red' };

      default:
        return { nivel: `Puntaje: ${puntaje}`, color: 'blue' };
    }
  };

  // Vista de detalle de expediente
  if (expedienteSeleccionado) {
    const duplicadosCount = contarDuplicados();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => {
              setExpedienteSeleccionado(null);
              setResultados([]);
            }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{expedienteSeleccionado.nombreCompleto}</h1>
              <p className="text-gray-500">{expedienteSeleccionado.matricula}</p>
            </div>
          </div>
          
          {/* Botón para eliminar expediente completo */}
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteExpedienteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Expediente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Grupo</p>
                  <p className="font-semibold">{expedienteSeleccionado.grupoNombre}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Sesión de evaluación</p>
                  <p className="font-semibold">{expedienteSeleccionado.sessionName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {expedienteSeleccionado.estado === 'completado' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge variant={expedienteSeleccionado.estado === 'completado' ? 'default' : 'secondary'}>
                    {expedienteSeleccionado.estado === 'completado' ? 'Completado' : 'En progreso'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>
                Pruebas Realizadas ({resultados.length})
                {duplicadosCount > 0 && (
                  <span className="text-amber-600 text-sm font-normal ml-2">
                    ({duplicadosCount} duplicado{duplicadosCount > 1 ? 's' : ''})
                  </span>
                )}
              </CardTitle>
              {duplicadosCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar {duplicadosCount} Duplicado{duplicadosCount > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {resultados.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay resultados de pruebas</p>
            ) : (
              <div className="space-y-3">
                {resultados.map((resultado) => {
                  const interpretacion = interpretarPuntaje(resultado.testId, resultado.puntaje);
                  return (
                    <div 
                      key={resultado.id} 
                      className={`p-4 border rounded-lg ${resultado.esDuplicado ? 'bg-amber-50 border-amber-200' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{resultado.testName}</h3>
                          {resultado.esDuplicado && (
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                              Duplicado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>
                            {interpretacion.nivel}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarResultadoIndividual(resultado);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Completado: {resultado.fechaCompletado.toLocaleDateString('es-MX')} a las {resultado.fechaCompletado.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {resultado.puntaje !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          Puntaje: {resultado.puntaje}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de confirmación para eliminar duplicados */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertOctagon className="h-5 w-5" />
                  Eliminar Resultados Duplicados
                </CardTitle>
                <CardDescription>
                  Se eliminarán {duplicadosCount} resultado(s) duplicado(s) antiguos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Se eliminarán los resultados marcados como "Duplicado".</strong>
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Se mantendrá el resultado más reciente de cada prueba.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={eliminando}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={eliminarDuplicados}
                  disabled={eliminando}
                >
                  {eliminando ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Duplicados
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Diálogo de confirmación para eliminar expediente completo */}
        {showDeleteExpedienteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertOctagon className="h-5 w-5" />
                  Eliminar Expediente Completo
                </CardTitle>
                <CardDescription>
                  Esta acción eliminará permanentemente el expediente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>¿Está seguro de eliminar el expediente de {expedienteSeleccionado?.nombreCompleto}?</strong>
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Se eliminarán:
                  </p>
                  <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                    <li>El registro del expediente</li>
                    <li>{resultados.length} resultado(s) de prueba(s)</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 font-semibold">
                  ⚠️ Esta acción NO se puede deshacer.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteExpedienteDialog(false)}
                  disabled={eliminando}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={eliminarExpedienteCompleto}
                  disabled={eliminando}
                >
                  {eliminando ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sí, Eliminar Todo
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Vista de lista de expedientes
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expedientes de Estudiantes</h1>
          <p className="text-gray-500">Resultados de evaluaciones psicométricas por estudiante</p>
        </div>
        <Button variant="outline" onClick={cargarExpedientes}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Matrícula o nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-64">
              <Label>Grupo</Label>
              <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grupos</SelectItem>
                  {grupos.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de expedientes */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span>Cargando expedientes...</span>
          </CardContent>
        </Card>
      ) : expedientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No se encontraron expedientes</p>
            <p className="text-sm mt-2">Los expedientes aparecerán cuando los estudiantes completen evaluaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expedientesFiltrados.map((exp) => (
            <Card key={exp.id} className="cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => cargarResultadosExpediente(exp)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{exp.nombreCompleto}</h3>
                      <p className="text-sm text-gray-500">{exp.matricula}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{exp.grupoNombre}</Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {exp.sessionName}
                        </Badge>
                        <Badge variant={exp.estado === 'completado' ? 'default' : 'secondary'}>
                          {exp.estado === 'completado' ? 'Completado' : 'En progreso'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {exp.testsCompletados}/{exp.testsTotal} pruebas
                    </p>
                    <p className="text-xs text-gray-400">
                      {exp.fechaCreacion.toLocaleDateString('es-MX')}
                    </p>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
