'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, User, ChevronDown, ChevronUp } from 'lucide-react';
import type { StudentWithRisk } from '@/lib/store';
import { getRiskLevel } from '@/lib/risk-analysis';

function RiskIndicator({ level }: { level: 'Bajo' | 'Medio' | 'Alto' }) {
  const levelMap = {
    Bajo: { color: 'bg-green-500', text: 'Bajo' },
    Medio: { color: 'bg-yellow-500', text: 'Medio' },
    Alto: { color: 'bg-red-500', text: 'Alto' },
  };
  const { color, text } = levelMap[level];
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`}></span>
      <span className="font-medium">{text}</span>
    </div>
  );
}


export function StudentDashboard({ students }: { students: StudentWithRisk[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StudentWithRisk | 'riskIndex'; direction: 'ascending' | 'descending' } | null>({ key: 'riskIndex', direction: 'descending' });

  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig === null) return 0;
    
    let aValue, bValue;
    
    if (sortConfig.key === 'riskIndex') {
      aValue = a.riskIndex;
      bValue = b.riskIndex;
    } else if (sortConfig.key === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else {
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const requestSort = (key: keyof StudentWithRisk | 'riskIndex') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof StudentWithRisk | 'riskIndex') => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expedientes de Estudiantes</h2>
        <div className="w-1/3">
          <Input
            placeholder="🔍 Buscar estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center gap-1">Estudiante {getSortIcon('name')}</div>
              </TableHead>
              <TableHead>Datos Académicos</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('riskIndex')}>
                 <div className="flex items-center gap-1">Índice de Riesgo (IRC) {getSortIcon('riskIndex')}</div>
              </TableHead>
              <TableHead>Nivel de Riesgo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-bold">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex gap-4'>
                    <Badge variant="outline">GPA: {student.academicData.gpa.toFixed(1)}</Badge>
                    <Badge variant="outline">Faltas: {student.academicData.absences}%</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-lg font-semibold">{student.riskIndex.toFixed(2)}%</div>
                </TableCell>
                <TableCell>
                  <RiskIndicator level={getRiskLevel(student.riskIndex)} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Expediente
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p>No se encontraron estudiantes con ese criterio.</p>
            </div>
        )}
      </div>
    </div>
  );
}
