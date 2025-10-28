import { config } from 'dotenv';
config();

import '@/ai/flows/generate-evaluation-report.ts';
import '@/ai/flows/suggest-evaluation-scales.ts';
import '@/ai/flows/create-questionnaire-from-pdf.ts';
