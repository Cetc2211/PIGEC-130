'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Terminal, AlertTriangle, Bug, RefreshCw, Trash2, Search, 
    Filter, Clock, FileText, ChevronDown, ChevronUp, Copy,
    CheckCircle, XCircle, AlertCircle, Info, Download,
    Calendar, User, Server, Code, MessageSquare, Database
} from "lucide-react";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { 
    collection, addDoc, query, orderBy, limit, 
    getDocs, deleteDoc, doc, where, Timestamp,
    updateDoc, writeBatch
} from 'firebase/firestore';

// ============================================
// INTERFACES
// ============================================

interface ErrorLog {
    id: string;
    timestamp: Date;
    type: 'error' | 'warning' | 'info' | 'critical';
    source: string;
    message: string;
    stack?: string;
    componentStack?: string;
    userAgent?: string;
    url?: string;
    userId?: string;
    userEmail?: string;
    additionalData?: Record<string, any>;
    resolved: boolean;
}

interface ErrorConsoleStats {
    totalErrors: number;
    criticalErrors: number;
    unresolvedErrors: number;
    errorsLast24h: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ErrorConsole() {
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
    const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'critical' | 'info'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showResolved, setShowResolved] = useState(false);
    const [stats, setStats] = useState<ErrorConsoleStats>({
        totalErrors: 0,
        criticalErrors: 0,
        unresolvedErrors: 0,
        errorsLast24h: 0
    });

    // Cargar errores desde Firestore
    const loadErrors = useCallback(async () => {
        // Primero intentar cargar desde localStorage (errores capturados localmente)
        const localErrors = getLocalErrors();
        
        if (!db) {
            // Sin Firebase: usar solo errores locales o mostrar vacío
            setErrors(localErrors);
            calculateStats(localErrors);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'error_logs'),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            
            const snapshot = await getDocs(q);
            const errorLogs: ErrorLog[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    type: data.type || 'error',
                    source: data.source || 'unknown',
                    message: data.message || 'Error desconocido',
                    stack: data.stack,
                    componentStack: data.componentStack,
                    userAgent: data.userAgent,
                    url: data.url,
                    userId: data.userId,
                    userEmail: data.userEmail,
                    additionalData: data.additionalData,
                    resolved: data.resolved || false
                };
            });
            
            // Combinar con errores locales
            const allErrors = [...localErrors, ...errorLogs];
            setErrors(allErrors);
            calculateStats(allErrors);
        } catch (error) {
            console.error('Error cargando logs:', error);
            setErrors(localErrors);
            calculateStats(localErrors);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Obtener errores locales del navegador
    const getLocalErrors = (): ErrorLog[] => {
        if (typeof window === 'undefined') return [];
        
        try {
            const stored = localStorage.getItem('pigec_error_logs');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map((e: any) => ({
                    ...e,
                    timestamp: new Date(e.timestamp)
                }));
            }
        } catch (e) {
            console.error('Error reading local errors:', e);
        }
        return [];
    };

    // Calcular estadísticas
    const calculateStats = (errorLogs: ErrorLog[]) => {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        setStats({
            totalErrors: errorLogs.length,
            criticalErrors: errorLogs.filter(e => e.type === 'critical').length,
            unresolvedErrors: errorLogs.filter(e => !e.resolved).length,
            errorsLast24h: errorLogs.filter(e => e.timestamp >= last24h).length
        });
    };

    // Generar errores de demostración
    const generateDemoErrors = (): ErrorLog[] => {
        return [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                type: 'critical',
                source: 'expediente/[id]/page.tsx',
                message: 'ClipboardList is not defined',
                stack: `ReferenceError: ClipboardList is not defined
    at ClinicalFilePage (expediente/[id]/page.tsx:205:18)
    at renderWithHooks (react-dom.development.js:14985:18)`,
                url: '/clinica/expediente/2024001',
                resolved: false
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                type: 'error',
                source: 'firebase.ts',
                message: 'Firebase: Error (auth/unauthorized-domain)',
                stack: `FirebaseError: Firebase: Error (auth/unauthorized-domain).
    at initializeAuth (firebase.ts:45:12)`,
                url: '/dashboard',
                resolved: false
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                type: 'warning',
                source: 'individual-test-management.tsx',
                message: 'getStudentById returned undefined for ID: 2024099',
                url: '/clinica/expediente/2024099',
                resolved: false
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                type: 'info',
                source: 'sessionContext.tsx',
                message: 'Session context initialized for user: admin@example.com',
                resolved: true
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                type: 'error',
                source: 'clinical-interview-form.tsx',
                message: 'Failed to save clinical interview: Missing required field "studentId"',
                stack: `Error: Missing required field "studentId"
    at saveInterview (clinical-interview-form.tsx:312:15)`,
                url: '/clinica/expediente/2024001',
                resolved: false
            }
        ];
    };

    // Marcar error como resuelto
    const resolveError = async (errorId: string) => {
        if (!db) {
            setErrors(prev => prev.map(e => 
                e.id === errorId ? { ...e, resolved: true } : e
            ));
            return;
        }

        try {
            await updateDoc(doc(db, 'error_logs', errorId), { resolved: true });
            setErrors(prev => prev.map(e => 
                e.id === errorId ? { ...e, resolved: true } : e
            ));
        } catch (error) {
            console.error('Error actualizando estado:', error);
        }
    };

    // Eliminar todos los errores
    const clearAllErrors = async () => {
        if (!db) {
            setErrors([]);
            return;
        }

        try {
            const batch = writeBatch(db);
            errors.forEach(error => {
                batch.delete(doc(db, 'error_logs', error.id));
            });
            await batch.commit();
            setErrors([]);
        } catch (error) {
            console.error('Error limpiando logs:', error);
        }
    };

    // Filtrar errores
    const filteredErrors = errors.filter(error => {
        if (filter !== 'all' && error.type !== filter) return false;
        if (!showResolved && error.resolved) return false;
        if (searchTerm && !error.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !error.source.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    // Formatear fecha
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Obtener icono según tipo
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    // Obtener badge según tipo
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'critical':
                return <Badge className="bg-red-600 text-white">CRÍTICO</Badge>;
            case 'error':
                return <Badge className="bg-red-500 text-white">ERROR</Badge>;
            case 'warning':
                return <Badge className="bg-amber-500 text-white">WARNING</Badge>;
            default:
                return <Badge className="bg-blue-500 text-white">INFO</Badge>;
        }
    };

    // Copiar al portapapeles
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Exportar errores
    const exportErrors = () => {
        const dataStr = JSON.stringify(filteredErrors, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error_logs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // Cargar errores al montar
    useEffect(() => {
        loadErrors();
    }, [loadErrors]);

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-red-200 bg-red-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Errores</p>
                                <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
                            </div>
                            <Bug className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-purple-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Críticos</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.criticalErrors}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Sin Resolver</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.unresolvedErrors}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Últimas 24h</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.errorsLast24h}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controles */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar errores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        
                        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="critical">Críticos</SelectItem>
                                <SelectItem value="error">Errores</SelectItem>
                                <SelectItem value="warning">Warnings</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant={showResolved ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowResolved(!showResolved)}
                        >
                            {showResolved ? 'Ocultar Resueltos' : 'Mostrar Resueltos'}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadErrors}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportErrors}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de errores */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        Consola de Errores
                    </CardTitle>
                    <CardDescription>
                        {filteredErrors.length} errores encontrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                            <span>Cargando logs...</span>
                        </div>
                    ) : filteredErrors.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p className="text-lg font-medium">¡No hay errores!</p>
                            <p className="text-sm">El sistema está funcionando correctamente</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3">
                                {filteredErrors.map((error) => (
                                    <div
                                        key={error.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            error.resolved 
                                                ? 'bg-green-50 border-green-200' 
                                                : error.type === 'critical'
                                                    ? 'bg-red-50 border-red-300 hover:bg-red-100'
                                                    : 'bg-white hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedError(error)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                {getTypeIcon(error.type)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getTypeBadge(error.type)}
                                                        {error.resolved && (
                                                            <Badge className="bg-green-500 text-white">RESUELTO</Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-sm truncate">
                                                        {error.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {error.source}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDate(error.timestamp)}
                                                        </span>
                                                        {error.url && (
                                                            <span className="flex items-center gap-1">
                                                                <Server className="h-3 w-3" />
                                                                {error.url}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resolveError(error.id);
                                                }}
                                                disabled={error.resolved}
                                            >
                                                {error.resolved ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Modal de detalle */}
            <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedError && getTypeIcon(selectedError.type)}
                            Detalle del Error
                        </DialogTitle>
                        <DialogDescription>
                            {selectedError?.source}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedError && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {getTypeBadge(selectedError.type)}
                                {selectedError.resolved && (
                                    <Badge className="bg-green-500 text-white">RESUELTO</Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Fecha y Hora</Label>
                                    <p className="font-medium">{formatDate(selectedError.timestamp)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Fuente</Label>
                                    <p className="font-medium font-mono text-sm">{selectedError.source}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-gray-500">Mensaje</Label>
                                <Alert className="mt-1">
                                    <AlertDescription className="font-mono text-sm">
                                        {selectedError.message}
                                    </AlertDescription>
                                </Alert>
                            </div>

                            {selectedError.url && (
                                <div>
                                    <Label className="text-xs text-gray-500">URL</Label>
                                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                                        {selectedError.url}
                                    </p>
                                </div>
                            )}

                            {selectedError.stack && (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs text-gray-500">Stack Trace</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(selectedError.stack!)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                        {selectedError.stack}
                                    </pre>
                                </div>
                            )}

                            {selectedError.userAgent && (
                                <div>
                                    <Label className="text-xs text-gray-500">User Agent</Label>
                                    <p className="text-xs bg-gray-100 p-2 rounded break-all">
                                        {selectedError.userAgent}
                                    </p>
                                </div>
                            )}

                            {selectedError.additionalData && (
                                <div>
                                    <Label className="text-xs text-gray-500">Datos Adicionales</Label>
                                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(selectedError.additionalData, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(JSON.stringify(selectedError, null, 2))}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar JSON
                                </Button>
                                <Button
                                    variant={selectedError.resolved ? "outline" : "default"}
                                    onClick={() => {
                                        resolveError(selectedError.id);
                                        setSelectedError({ ...selectedError, resolved: true });
                                    }}
                                    disabled={selectedError.resolved}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {selectedError.resolved ? 'Resuelto' : 'Marcar como Resuelto'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}


