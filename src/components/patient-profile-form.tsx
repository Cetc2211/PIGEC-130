'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Patient } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Save } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useActionState, useEffect } from 'react';
import { updatePatientAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  name: z.string().optional(),
  dob: z.string().optional(),
  age: z.coerce.number().optional(),
  sex: z.enum(['M', 'F', 'Otro']).optional(),
  otherSex: z.string().optional(),
  maritalStatus: z.string().optional(),
  curp: z.string().optional(),
  nss: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  municipality: z.string().optional(),
  homePhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type PatientProfileFormProps = {
  patient: Patient;
};

export function PatientProfileForm({ patient }: PatientProfileFormProps) {
  const { toast } = useToast();
  const updatePatientWithId = updatePatientAction.bind(null, patient.id);
  const [state, formAction, isPending] = useActionState(updatePatientWithId, {
    success: false,
    message: '',
  });

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: patient.name ?? "",
      email: patient.email ?? "",
      dob: patient.dob ?? "",
      age: patient.age ?? 0,
      curp: patient.curp ?? "",
      nss: patient.nss ?? "",
      sex: patient.sex ?? undefined,
      otherSex: patient.otherSex ?? "",
      maritalStatus: patient.maritalStatus ?? "",
      address: patient.address ?? "",
      neighborhood: patient.neighborhood ?? "",
      postalCode: patient.postalCode ?? "",
      municipality: patient.municipality ?? "",
      homePhone: patient.homePhone ?? "",
      mobilePhone: patient.mobilePhone ?? "",
      emergencyContactName: patient.emergencyContactName ?? "",
      emergencyContactRelationship: patient.emergencyContactRelationship ?? "",
      emergencyContactPhone: patient.emergencyContactPhone ?? "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Éxito",
          description: state.message,
        });
      } else {
        toast({
          title: "Error",
          description: state.message,
          variant: 'destructive'
        });
      }
    }
  }, [state, toast]);
  
  const sexValue = form.watch('sex');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ficha de Identificación</CardTitle>
        <CardDescription>
          Información personal y de contacto del estudiante. Los datos se pueden editar y guardar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="curp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CURP</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="nss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NSS</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Sexo</FormLabel>
                        <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                        >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="M" /></FormControl>
                                <FormLabel className="font-normal">M</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="F" /></FormControl>
                                <FormLabel className="font-normal">F</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="Otro" /></FormControl>
                                <FormLabel className="font-normal">Otro</FormLabel>
                            </FormItem>
                        </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {sexValue === 'Otro' && (
                    <FormField
                        control={form.control}
                        name="otherSex"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl><Input placeholder="Especificar..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estado civil</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-4">Información de Contacto</h3>
             <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domicilio (Calle y Número)</FormLabel>
                    <FormControl><Textarea placeholder="Av. Siempre Viva 742" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Colonia</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>CP</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="municipality"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Municipio</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="homePhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teléfono de Casa</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mobilePhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teléfono Celular</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-4">Contacto de Emergencia</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Avisar a</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parentesco</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar Cambios
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
