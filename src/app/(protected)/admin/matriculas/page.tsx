'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, CreditCard, Users, RefreshCw, Download, Copy, CheckCircle, Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp
} from 'firebase/firestore';

// ============================================
// TIPOS
// ============================================

interface MatriculaRegistro {
  id: string;
  matricula: string;
  nombreCompleto: string;
  grupoId: string;
  grupoNombre: string;
  semestre: number;
  periodo: string;
  expedienteId?: string;
  fechaAsignacion: Date;
  evaluacionesCompletadas: number;
  activo: boolean;
  telefono?: string;
  email?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MatriculasPage() {
  const [matriculas, setMatriculas] = useState<MatriculaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [grupos, setGrupos] = useState<{ id: string; nombre: string }[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    cargarMatriculas();
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

  const cargarMatriculas = async () => {
    setLoading(true);

    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'matriculas_estudiantes'),
        orderBy('matricula', 'asc')
      );

      const snapshot = await getDocs(q);

      const matriculasObtenidas: MatriculaRegistro[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          matricula: data.matricula || '',
          nombreCompleto: data.nombreCompleto || '',
          grupoId: data.grupoId || '',
          grupoNombre: data.grupoNombre || '',
          semestre: data.semestre || 1,
          periodo: data.periodo || '',
          expedienteId: data.expedienteId,
          fechaAsignacion: data.fechaAsignacion?.toDate() || new Date(),
          evaluacionesCompletadas: data.evaluacionesCompletadas || 0,
          activo: data.activo ?? true,
          telefono: data.telefono,
          email: data.email
        };
      });

      setMatriculas(matriculasObtenidas);
    } catch (error) {
      console.error('Error cargando matrículas:', error);
    }

    setLoading(false);
  };

  const copiarMatricula = (matricula: string) => {
    navigator.clipboard.writeText(matricula);
    setCopiado(matricula);
    setTimeout(() => setCopiado(null), 2000);
  };

  const matriculasFiltradas = matriculas.filter(mat => {
    const coincideBusqueda = 
      mat.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
      mat.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideGrupo = filtroGrupo === 'todos' || mat.grupoId === filtroGrupo;

    return coincideBusqueda && coincideGrupo;
  });

  // Agrupar por grupo para resumen
  const resumenPorGrupo = matriculas.reduce((acc, mat) => {
    if (!acc[mat.grupoNombre]) {
      acc[mat.grupoNombre] = { total: 0, evaluados: 0 };
    }
    acc[mat.grupoNombre].total++;
    if (mat.evaluacionesCompletadas > 0) {
      acc[mat.grupoNombre].evaluados++;
    }
    return acc;
  }, {} as Record<string, { total: number; evaluados: number }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matrículas Generadas</h1>
          <p className="text-gray-500">Control de matrículas asignadas a estudiantes</p>
        </div>
        <Button variant="outline" onClick={cargarMatriculas}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{matriculas.length}</p>
                <p className="text-sm text-gray-500">Total matrículas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {matriculas.filter(m => m.evaluacionesCompletadas > 0).length}
                </p>
                <p className="text-sm text-gray-500">Han evaluado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">
                  {matriculas.filter(m => m.evaluacionesCompletadas === 0).length}
                </p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(resumenPorGrupo).length}</p>
                <p className="text-sm text-gray-500">Grupos</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Tabla de matrículas */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span>Cargando matrículas...</span>
          </CardContent>
        </Card>
      ) : matriculasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No se encontraron matrículas</p>
            <p className="text-sm mt-2">Las matrículas aparecerán cuando se generen desde Gestión de Pruebas</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Evaluaciones</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasFiltradas.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell className="font-mono font-medium">
                        {mat.matricula}
                      </TableCell>
                      <TableCell>{mat.nombreCompleto}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mat.grupoNombre}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {mat.evaluacionesCompletadas > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Evaluó
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {mat.evaluacionesCompletadas}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copiarMatricula(mat.matricula)}
                        >
                          {copiado === mat.matricula ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
