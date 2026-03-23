'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell, BellRing, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Clock, User, Calendar } from 'lucide-react';
import {
  calculateIntegratedRiskProfile,
  getAlertsSummary,
  StudentRiskProfile,
  RiskAlert,
  AlertLevel,
  AlertCategory,
} from '@/lib/intelligent-risk-alerts';
import { DiagnosticImpressionInput } from '@/ai/flows/diagnostic-impression-flow';

interface IntelligentRiskAlertsProps {
  studentId: string;
  studentName: string;
  academicData: {
    attendanceRate: number;
    grade: number;
    activityRate: number;
    participationRate: number;
  };
  clinicalData?: DiagnosticImpressionInput;
  onAlertClick?: (alert: RiskAlert) => void;
}

export default function IntelligentRiskAlerts({
  studentId,
  studentName,
  academicData,
  clinicalData,
  onAlertClick,
}: IntelligentRiskAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [profile, setProfile] = useState<StudentRiskProfile | null>(null);

  useEffect(() => {
    const riskProfile = calculateIntegratedRiskProfile(
      studentId,
      studentName,
      academicData,
      clinicalData
    );
    setProfile(riskProfile);
  }, [studentId, studentName, academicData, clinicalData]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'crítico':
      case 'critical':
        return 'bg-red-600 text-white';
      case 'alto':
      case 'danger':
        return 'bg-red-500 text-white';
      case 'medio':
      case 'warning':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getLevelIcon = (level: AlertLevel) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />;
      case 'danger':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Info className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'academic':
        return '📚';
      case 'emotional':
        return '💭';
      case 'behavioral':
        return '⚠️';
      case 'neurocognitive':
        return '🧠';
      case 'integrated':
        return '🎯';
      default:
        return '📋';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} hrs`;
    return `hace ${days} días`;
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Analizando perfil de riesgo...</div>
        </CardContent>
      </Card>
    );
  }

  const hasAlerts = profile.activeAlerts.length > 0;
  const criticalCount = profile.activeAlerts.filter(a => a.level === 'critical').length;
  const dangerCount = profile.activeAlerts.filter(a => a.level === 'danger').length;

  return (
    <Card className={`border-2 ${criticalCount > 0 ? 'border-red-500 bg-red-50/30' : dangerCount > 0 ? 'border-amber-500 bg-amber-50/30' : 'border-gray-200'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasAlerts && criticalCount > 0 ? (
              <BellRing className="h-5 w-5 text-red-600 animate-bounce" />
            ) : (
              <Bell className="h-5 w-5 text-gray-600" />
            )}
            <CardTitle className="text-lg">Alertas de Riesgo Inteligentes</CardTitle>
            {hasAlerts && (
              <Badge variant="destructive" className="ml-2">
                {profile.activeAlerts.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Análisis integrado de factores académicos y clínicos
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Resumen de Riesgos por Dimensión */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {/* Riesgo Integrado */}
            <div className={`p-3 rounded-lg text-center ${profile.integratedRiskLevel === 'crítico' ? 'bg-red-100 border-2 border-red-500' : profile.integratedRiskLevel === 'alto' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 font-medium">INTEGRADO</div>
              <div className={`text-2xl font-bold ${profile.integratedRiskLevel === 'crítico' ? 'text-red-600' : profile.integratedRiskLevel === 'alto' ? 'text-red-500' : profile.integratedRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500'}`}>
                {profile.integratedRiskScore}%
              </div>
              <Badge className={getLevelColor(profile.integratedRiskLevel)} variant="secondary">
                {profile.integratedRiskLevel.toUpperCase()}
              </Badge>
            </div>

            {/* Riesgo Académico */}
            <div className="p-3 rounded-lg text-center bg-gray-50">
              <div className="text-xs text-gray-500 font-medium">📚 Académico</div>
              <div className={`text-xl font-bold ${profile.academicRiskLevel === 'alto' ? 'text-red-500' : profile.academicRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500'}`}>
                {profile.academicRiskScore}%
              </div>
              <div className="text-xs text-gray-400">
                Rep: {profile.failingRisk}% | Aband: {profile.dropoutRisk}%
              </div>
            </div>

            {/* Riesgo Emocional */}
            <div className="p-3 rounded-lg text-center bg-gray-50">
              <div className="text-xs text-gray-500 font-medium">💭 Emocional</div>
              <div className={`text-xl font-bold ${profile.emotionalRiskLevel === 'crítico' ? 'text-red-600' : profile.emotionalRiskLevel === 'alto' ? 'text-red-500' : profile.emotionalRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500'}`}>
                {profile.emotionalRiskScore}%
              </div>
              <div className="text-xs text-gray-400">
                {profile.depressionIndicators.length + profile.anxietyIndicators.length} indicadores
              </div>
            </div>

            {/* Riesgo Conductual */}
            <div className={`p-3 rounded-lg text-center ${profile.suicideRisk || profile.selfHarmRisk ? 'bg-red-50 border border-red-300' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 font-medium">⚠️ Conductual</div>
              <div className={`text-xl font-bold ${profile.behavioralRiskLevel === 'alto' ? 'text-red-500' : profile.behavioralRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500'}`}>
                {profile.behavioralRiskScore}%
              </div>
              <div className="flex justify-center gap-1 mt-1">
                {profile.suicideRisk && <Badge variant="destructive" className="text-xs">Suicida</Badge>}
                {profile.selfHarmRisk && <Badge variant="destructive" className="text-xs">Autolesión</Badge>}
                {profile.substanceUseRisk && <Badge variant="secondary" className="text-xs">Sustancias</Badge>}
              </div>
            </div>

            {/* Riesgo Neurocognitivo */}
            <div className="p-3 rounded-lg text-center bg-gray-50">
              <div className="text-xs text-gray-500 font-medium">🧠 Neurocog.</div>
              <div className={`text-xl font-bold ${profile.neurocognitiveRiskLevel === 'alto' ? 'text-red-500' : profile.neurocognitiveRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500'}`}>
                {profile.neurocognitiveRiskScore}%
              </div>
              <div className="text-xs text-gray-400">
                {profile.affectedDomains.length > 0 ? profile.affectedDomains.join(', ') : 'Sin déficit'}
              </div>
            </div>
          </div>

          {/* Alertas Activas */}
          {hasAlerts && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Alertas Activas ({profile.activeAlerts.length})
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {profile.activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      alert.level === 'critical'
                        ? 'bg-red-50 border-red-300 border-2'
                        : alert.level === 'danger'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                    onClick={() => onAlertClick?.(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getLevelIcon(alert.level)}
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            <span>{getCategoryIcon(alert.category)}</span>
                            {alert.title}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                        </div>
                      </div>
                      {alert.requiresAction && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          Acción Requerida
                        </Badge>
                      )}
                    </div>

                    {/* Factores Contribuyentes */}
                    {alert.contributingFactors.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alert.contributingFactors.slice(0, 3).map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-white">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Fecha límite de acción */}
                    {alert.actionDeadline && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Fecha límite: {new Date(alert.actionDeadline).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin Alertas */}
          {!hasAlerts && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Sin alertas activas</p>
              <p className="text-sm text-green-600">El perfil de riesgo del estudiante está dentro de parámetros normales</p>
            </div>
          )}

          {/* Última actualización */}
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Actualizado: {formatTimeAgo(profile.lastUpdated)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {studentName}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Componente de resumen de alertas para dashboard general.
 */
export function AlertsSummaryCard({ profiles }: { profiles: StudentRiskProfile[] }) {
  const summary = useMemo(() => getAlertsSummary(profiles), [profiles]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Resumen de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.criticalCount}</div>
            <div className="text-xs text-gray-500">Críticas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{summary.dangerCount}</div>
            <div className="text-xs text-gray-500">Peligro</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{summary.warningCount}</div>
            <div className="text-xs text-gray-500">Advertencia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{summary.totalAlerts}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Por Categoría */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-500">Por Categoría</h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.byCategory).map(([category, count]) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category === 'academic' ? '📚' : category === 'emotional' ? '💭' : category === 'behavioral' ? '⚠️' : category === 'neurocognitive' ? '🧠' : '🎯'} {category}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Alertas prioritarias */}
        {summary.topPriority.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-medium text-gray-500">⚠️ Prioridad Inmediata</h5>
            {summary.topPriority.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-2 bg-red-50 rounded border border-red-200 text-xs">
                <span className="font-medium">{alert.title}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
