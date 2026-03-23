'use server';

import {
    generateStudentFeedback as executeStudentFeedbackFlow,
    type StudentFeedbackInput,
} from './flows/generate-student-feedback-flow';
import {
    generateGroupReportAnalysis as executeGroupReportAnalysisFlow,
    type GroupReportInput,
} from './flows/generate-group-report-analysis-flow';
import {
    generateDiagnosticImpression as executeDiagnosticImpressionFlow,
    type DiagnosticImpressionInput,
    type DiagnosticImpressionOutput,
    getQuickDiagnosticAssessment,
} from './flows/diagnostic-impression-flow';
import {
    generatePIEI as executePIEIFlow,
    type PIEIInput,
    type PIEIOutput,
    generateInterventionsForArea,
} from './flows/piei-generation-flow';

// Re-export types
export type {
    StudentFeedbackInput,
    GroupReportInput,
    DiagnosticImpressionInput,
    DiagnosticImpressionOutput,
    PIEIInput,
    PIEIOutput,
};

// Funciones existentes
export async function generateStudentFeedback(input: StudentFeedbackInput) {
    return executeStudentFeedbackFlow(input);
}

export async function generateGroupReportAnalysis(input: GroupReportInput) {
    return executeGroupReportAnalysisFlow(input);
}

// Nuevas funciones de IA
export async function generateDiagnosticImpression(input: DiagnosticImpressionInput) {
    return executeDiagnosticImpressionFlow(input);
}

export async function generatePIEI(input: PIEIInput) {
    return executePIEIFlow(input);
}

// Exportar funciones auxiliares
export { getQuickDiagnosticAssessment, generateInterventionsForArea };
