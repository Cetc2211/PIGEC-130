'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import { calculateRisk } from '@/lib/risk-analysis';
import RiskIndicator from '@/components/RiskIndicator';
import FichaIdentificacionForm from '@/components/FichaIdentificacionForm';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  FolderOpen,
  Plus,
  Search,
  Filter,
  FileSearch,
  UserPlus,
  Loader2,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getExpedientes,
  crearExpediente,
  getNivelLabel,
  getNivelShort,
  getNivelColor,
  getEstadoLabel,
  defaultFichaIdentificacion,
  type Expediente,
  type FiltroExpediente,
  type OrigenExpediente,
  type FichaIdentificacionData,
} from '@/lib/expediente-service';

const filtros: { value: FiltroExpediente; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'nivel_1', label: 'Nivel 1' },
  { value: 'nivel_2', label: 'Nivel 2' },
  { value: 'nivel_3', label: 'Nivel 3' },
  { value: 'abierto', label: 'Abiertos' },
  { value: 'en_seguimiento', label: 'En Seguimiento' },
  { value: 'concluido', label: 'Concluidos' },
];

export default function ExpedientesPage() {
  const { role } = useSession();
  const { toast } = useToast();
  const [filtro, setFiltro] = useState<FiltroExpediente>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // Counter para forzar recálculo de la lista al crear/borrar expedientes
  const [listVersion, setListVersion] = useState(0);

  // Formulario de Ficha de Identificación (modo controlado)
  const [fichaData, setFichaData] = useState<FichaIdentificacionData>({
    ...defaultFichaIdentificacion,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FichaIdentificacionData, string>>>({});

  const expedientes = useMemo(() => {
    return getExpedientes(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, listVersion]);

  const expedientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return expedientes;
    const term = busqueda.toLowerCase();
    return expedientes.filter(
      (exp) =>
        exp.studentName.toLowerCase().includes(term) ||
        exp.groupName.toLowerCase().includes(term)
    );
  }, [expedientes, busqueda]);

  /** Validar campos obligatorios de la Ficha de Identificación */
  const validateFicha = (): boolean => {
    const errors: Partial<Record<keyof FichaIdentificacionData, string>> = {};

    if (!fichaData.fullName.trim()) {
      errors.fullName = 'El nombre del estudiante es obligatorio.';
    }
    if (!fichaData.birthDate) {
      errors.birthDate = 'La fecha de nacimiento es obligatoria.';
    }
    if (!fichaData.sexo) {
      errors.sexo = 'Selecciona el sexo.';
    }
    if (!fichaData.group.trim()) {
      errors.group = 'El grupo es obligatorio.';
    }
    if (!fichaData.semester || isNaN(parseInt(fichaData.semester))) {
      errors.semester = 'Ingresa el semestre.';
    }
    if (!fichaData.celular.trim()) {
      errors.celular = 'El número celular es obligatorio.';
    }
    if (!fichaData.livingWith) {
      errors.livingWith = 'Selecciona con quién vives.';
    }
    if (!fichaData.motherName.trim()) {
      errors.motherName = 'El nombre de la madre o tutor(a) es obligatorio.';
    }
    if (!fichaData.motherPhone.trim()) {
      errors.motherPhone = 'El teléfono de la madre o tutor(a) es obligatorio.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Calcular edad a partir de la fecha de nacimiento */
  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleCrearExpediente = async () => {
    if (!validateFicha()) {
      toast({
        variant: 'destructive',
        title: 'Ficha incompleta',
        description: 'Completa todos los campos obligatorios marcados con *.',
      });
      return;
    }

    setIsCreating(true);
    try {
      crearExpediente({
        studentId: `manual-${Date.now()}`,
        studentName: fichaData.fullName.trim(),
        groupName: fichaData.group.trim(),
        semester: parseInt(fichaData.semester) || 1,
        gpa: 0, // Se actualiza con datos académicos después
        absences: 0, // Se actualiza con datos académicos después
        origen: 'registro_manual' as OrigenExpediente,
        creadoPor: 'usuario@demo.com',
        fichaIdentificacion: { ...fichaData },
      });

      toast({
        title: 'Expediente creado',
        description: `Se creó el expediente de ${fichaData.fullName.trim()} con la Ficha de Identificación completa.`,
      });

      // Limpiar formulario y forzar recarga de la lista
      setFichaData({ ...defaultFichaIdentificacion });
      setFormErrors({});
      setIsCreateDialogOpen(false);
      setListVersion((v) => v + 1);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el expediente.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (role === 'loading') {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            Expedientes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {role === 'Clinico'
              ? 'Expedientes clínicos y educativos de los estudiantes evaluados.'
              : 'Expedientes educativos y PIEI de los estudiantes asignados.'}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setFormErrors({});
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Expediente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[720px] max-h-[92vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-blue-600" />
                Nuevo Expediente — Ficha de Identificación
              </DialogTitle>
              <DialogDescription>
                Completa la Ficha de Identificación del estudiante para crear su expediente.
                Los datos clínicos y evaluaciones se agregarán conforme se apliquen instrumentos.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-2">
              <FichaIdentificacionForm
                values={fichaData}
                onChange={setFichaData}
                errors={formErrors}
                disabled={isCreating}
              />
            </div>
            <DialogFooter className="mt-4 pt-4 border-t">
              <DialogClose asChild>
                <Button variant="outline" disabled={isCreating}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={handleCrearExpediente} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Expediente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o grupo..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroExpediente)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filtros.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen de filtros */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-xs">
          {expedientesFiltrados.length} expediente{expedientesFiltrados.length !== 1 ? 's' : ''}
        </Badge>
        {filtro !== 'todos' && (
          <Badge variant="secondary" className="text-xs">
            Filtro: {filtros.find((f) => f.value === filtro)?.label}
          </Badge>
        )}
        {busqueda && (
          <Badge variant="secondary" className="text-xs">
            Búsqueda: &quot;{busqueda}&quot;
          </Badge>
        )}
      </div>

      {/* Tabla de expedientes */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[280px]">Estudiante</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Nivel MTSS</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Evaluaciones</TableHead>
                  {role === 'Clinico' && (
                    <>
                      <TableHead>Riesgo (IRC)</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Faltas</TableHead>
                    </>
                  )}
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expedientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role === 'Clinico' ? 9 : 6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <FileSearch className="h-8 w-8" />
                        <p>No se encontraron expedientes</p>
                        <p className="text-xs">
                          {filtro !== 'todos' || busqueda
                            ? 'Intenta cambiar los filtros o crear un nuevo expediente.'
                            : 'Aún no hay expedientes. Crea uno nuevo o evalúa un grupo.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  expedientesFiltrados.map((expediente) => {
                    const isHighRisk =
                      expediente.suicideRiskLevel === 'Alto' ||
                      expediente.suicideRiskLevel === 'Crítico';
                    const isDemo = expediente.origen === 'demo';
                    const tieneFicha = !!expediente.fichaIdentificacion;
                    const nivelColor = getNivelColor(expediente.nivel);

                    // Calcular IRC si no existe
                    let irc = expediente.irc;
                    let nivelRiesgo = expediente.nivelRiesgo;
                    let riesgoColor: 'green' | 'yellow' | 'red' = 'green';
                    if (!irc) {
                      const ausentismo_norm = expediente.academicData.absences / 100;
                      const bajo_rendimiento_bin = expediente.academicData.gpa < 7.0 ? 1 : 0;
                      const ansiedad_norm = (expediente.ansiedadScore || 0) / 21;
                      const riskResult = calculateRisk({ ausentismo_norm, bajo_rendimiento_bin, ansiedad_norm });
                      irc = riskResult.IRC;
                      nivelRiesgo = riskResult.nivelRiesgo;
                      riesgoColor = riskResult.color;
                    } else {
                      riesgoColor =
                        expediente.nivelRiesgo?.includes('Rojo') ? 'red' :
                        expediente.nivelRiesgo?.includes('Amarillo') ? 'yellow' : 'green';
                    }

                    const linkHref =
                      role === 'Clinico'
                        ? `/clinica/expediente/${expediente.studentId}`
                        : `/educativa/estudiante/${expediente.studentId}`;
                    const buttonText = role === 'Clinico' ? 'Abrir Expediente' : 'Ver PIEI';

                    return (
                      <TableRow key={expediente.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{expediente.studentName}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {isDemo && (
                                  <Badge variant="outline" className="text-[10px] text-gray-400">
                                    Demo
                                  </Badge>
                                )}
                                {tieneFicha && (
                                  <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-200">
                                    Ficha ✓
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {expediente.groupName} · {expediente.semester}°
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-[11px]',
                              nivelColor === 'green' && 'bg-green-100 text-green-700 border-green-200',
                              nivelColor === 'yellow' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                              nivelColor === 'red' && 'bg-red-100 text-red-700 border-red-200'
                            )}
                            variant="outline"
                          >
                            {getNivelShort(expediente.nivel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[11px]',
                              expediente.estado === 'en_seguimiento' && 'bg-blue-100 text-blue-700 border-blue-200',
                              expediente.estado === 'concluido' && 'bg-gray-100 text-gray-700 border-gray-200',
                              expediente.estado === 'abierto' && 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            )}
                          >
                            {getEstadoLabel(expediente.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {expediente.evaluaciones.length > 0
                            ? `${expediente.evaluaciones.length} aplicada${expediente.evaluaciones.length !== 1 ? 's' : ''}`
                            : 'Sin evaluaciones'}
                        </TableCell>
                        {role === 'Clinico' && (
                          <>
                            <TableCell>
                              <RiskIndicator irc={irc!} nivel={nivelRiesgo!} color={riesgoColor} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {expediente.academicData.gpa > 0
                                ? expediente.academicData.gpa.toFixed(1)
                                : '—'}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {expediente.academicData.absences > 0
                                ? `${expediente.academicData.absences.toFixed(0)}%`
                                : '—'}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="text-center">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className={cn(
                              'font-semibold',
                              isHighRisk && role === 'Clinico' && 'text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700'
                            )}
                          >
                            <Link href={linkHref}>
                              {isHighRisk && role === 'Clinico' && <AlertTriangle className="mr-1 h-3.5 w-3.5" />}
                              {buttonText}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
