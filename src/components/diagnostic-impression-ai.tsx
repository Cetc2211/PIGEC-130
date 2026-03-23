'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, AlertCircle, CheckCircle, Info, Loader2, Sparkles, Brain, Shield, ClipboardList } from 'lucide-react';
import {
  generateDiagnosticImpression,
  DiagnosticImpressionInput,
  DiagnosticImpressionOutput,
} from '@/ai/flows/diagnostic-impression-flow';

interface DiagnosticImpressionAIProps {
  clinicalData: DiagnosticImpressionInput;
  onImpressionGenerated?: (impression: DiagnosticImpressionOutput) => void;
  existingImpression?: string;
}

export default function DiagnosticImpressionAI({
  clinicalData,
  onImpressionGenerated,
  existingImpression,
}: DiagnosticImpressionAIProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [impression, setImpression] = useState<DiagnosticImpressionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generar impresión automáticamente cuando hay suficientes datos
  useEffect(() => {
    const hasEnoughData = Object.entries(clinicalData).some(([key, value]) => {
      if (key === 'studentName' || key === 'cognitive_load_context' || key === 'additional_observations') {
        return false;
      }
      return typeof value === 'number' && value > 0;
    });

    if (hasEnoughData && !impression && !existingImpression) {
      handleGenerateImpression();
    }
  }, [clinicalData]);

  const handleGenerateImpression = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateDiagnosticImpression(clinicalData);
      setImpression(result);
      onImpressionGenerated?.(result);
    } catch (err) {
      console.error('Error generating impression:', err);
      setError('No se pudo generar la impresión diagnóstica. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'crítico':
        return 'bg-red-600 text-white';
      case 'severo':
        return 'bg-red-500 text-white';
      case 'moderado':
        return 'bg-amber-500 text-white';
      case 'leve':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'crítico':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'severo':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'moderado':
        return <Info className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-700">Analizando datos clínicos con IA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerateImpression}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!impression) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Impresión Diagnóstica con IA
          </CardTitle>
          <CardDescription>
            Ingrese datos de screening para generar una impresión diagnóstica sugerida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateImpression} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Impresión Diagnóstica
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${impression.requiresUrgentAttention ? 'border-red-500' : 'border-purple-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>Impresión Diagnóstica Sugerida</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(impression.severityLevel)}>
              {impression.severityLevel.toUpperCase()}
            </Badge>
            {impression.requiresUrgentAttention && (
              <Badge variant="destructive" className="animate-pulse">
                URGENTE
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Generado automáticamente con IA. Esta sugerencia no sustituye el juicio clínico profesional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hipótesis Principal */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            {getSeverityIcon(impression.severityLevel)}
            <div>
              <h4 className="font-semibold text-purple-800">Hipótesis Diagnóstica Principal</h4>
              <p className="text-sm text-purple-700 mt-1">{impression.primaryHypothesis}</p>
            </div>
          </div>
        </div>

        {/* Factores de Riesgo y Protectores */}
        <div className="grid md:grid-cols-2 gap-4">
          {impression.riskFactors.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Factores de Riesgo
              </h4>
              <ul className="mt-2 space-y-1">
                {impression.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {impression.protectiveFactors.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Factores Protectores
              </h4>
              <ul className="mt-2 space-y-1">
                {impression.protectiveFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Separator />

        {/* Consideraciones Secundarias */}
        {impression.secondaryConsiderations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Consideraciones Adicionales</h4>
            <ul className="space-y-1">
              {impression.secondaryConsiderations.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendaciones */}
        {impression.recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Recomendaciones Clínicas
            </h4>
            <ul className="mt-2 space-y-2">
              {impression.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evaluaciones Sugeridas */}
        {impression.suggestedAssessments.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 text-sm">Evaluaciones Adicionales Sugeridas</h4>
            <ul className="mt-1 flex flex-wrap gap-2">
              {impression.suggestedAssessments.map((assessment, index) => (
                <Badge key={index} variant="outline" className="bg-white">
                  {assessment}
                </Badge>
              ))}
            </ul>
          </div>
        )}

        {/* Notas Clínicas */}
        {impression.clinicalNotes && (
          <div className="text-xs text-gray-500 italic border-t pt-3">
            {impression.clinicalNotes}
          </div>
        )}

        {/* Botón para regenerar */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleGenerateImpression}>
            <Sparkles className="mr-2 h-3 w-3" />
            Regenerar con IA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
