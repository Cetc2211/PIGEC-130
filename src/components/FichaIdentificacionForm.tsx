'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export default function FichaIdentificacionForm() {

    return (
        <form className="space-y-8 p-1">
            {/* SECCIÓN I: DATOS DEL ESTUDIANTE */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">I. Datos del Estudiante</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="full-name">Nombre Completo</Label>
                        <Input id="full-name" name="full-name" placeholder="Ej. Ana María Pérez López" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth-date">Fecha de Nacimiento</Label>
                        <Input id="birth-date" name="birth-date" type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="group">Grupo</Label>
                        <Input id="group" name="group" placeholder="Ej. 5B" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="semester">Semestre</Label>
                        <Input id="semester" name="semester" type="number" placeholder="Ej. 5" />
                    </div>
                </div>
            </div>

            <Separator />

            {/* SECCIÓN II: DATOS SOCIOFAMILIARES */}
            <div>
                <h3 className="text-lg font.semibold text-gray-700 mb-4">II. Datos Sociofamiliares</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>¿Con quién vives actualmente?</Label>
                         <RadioGroup name="living-with" className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ambos" id="lw-1" /><Label htmlFor="lw-1">Ambos Padres</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="mama" id="lw-2" /><Label htmlFor="lw-2">Solo Mamá</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="papa" id="lw-3" /><Label htmlFor="lw-3">Solo Papá</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="abuelos" id="lw-4" /><Label htmlFor="lw-4">Abuelos</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="otro" id="lw-5" /><Label htmlFor="lw-5">Otro</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-name">Nombre del Contacto de Emergencia</Label>
                        <Input id="contact-name" name="contact-name" placeholder="Nombre completo del familiar"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact-phone">Teléfono del Contacto de Emergencia</Label>
                        <Input id="contact-phone" name="contact-phone" type="tel" placeholder="Ej. 55-1234-5678"/>
                    </div>
                </div>
            </div>
            
            <Separator />

            {/* SECCIÓN III: ANTECEDENTES */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">III. Antecedentes Personales Relevantes</h3>
                 <div className="space-y-2">
                    <Label htmlFor="background-info">Describe brevemente si has recibido atención psicológica o psiquiátrica previa, o si hay alguna condición médica relevante.</Label>
                    <Textarea id="background-info" name="background-info" placeholder="Ej. 'Asistí a terapia por ansiedad hace 2 años', 'Tengo diagnóstico de TDAH', 'Sufro de migrañas frecuentes'..." />
                </div>
            </div>
        </form>
    );
}