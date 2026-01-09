
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { useAuth } from '@/lib/auth';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarClock, CalendarCheck } from 'lucide-react';
import type { Schedule as ScheduleType } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import TodayAppointmentsList from '@/components/dashboard/TodayAppointmentsList';

const daySchema = z.object({
  id: z.string(),
  dayName: z.string(),
  dayIndex: z.number(),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const scheduleSchema = z.object({
  days: z.array(daySchema),
});

const weekDays = [
  { id: 'sunday', name: 'Domingo', index: 0 },
  { id: 'monday', name: 'Segunda-feira', index: 1 },
  { id: 'tuesday', name: 'Terça-feira', index: 2 },
  { id: 'wednesday', name: 'Quarta-feira', index: 3 },
  { id: 'thursday', name: 'Quinta-feira', index: 4 },
  { id: 'friday', name: 'Sexta-feira', index: 5 },
  { id: 'saturday', name: 'Sábado', index: 6 },
];

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessIds?.[0];

  const scheduleQuery = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    return collection(firestore, `businesses/${businessId}/schedules`);
  }, [firestore, businessId]);

  const { data: scheduleData, isLoading: isLoadingSchedule } = useCollection<ScheduleType>(scheduleQuery);
  
  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      days: weekDays.map(day => ({
        id: day.id,
        dayName: day.name,
        dayIndex: day.index,
        isOpen: false,
        openTime: '09:00',
        closeTime: '18:00',
      })).sort((a,b) => a.index - b.index),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "days",
  });

  useEffect(() => {
    if (scheduleData) {
      const updatedDays = weekDays.map(weekDay => {
        const dbDay = scheduleData.find(d => d.id === weekDay.id);
        return dbDay ? { ...dbDay, dayName: weekDay.name, dayIndex: weekDay.index } : {
          id: weekDay.id,
          dayName: weekDay.name,
          dayIndex: weekDay.index,
          isOpen: false,
          openTime: '09:00',
          closeTime: '18:00',
        };
      }).sort((a,b) => a.index - b.index);
      
      form.reset({ days: updatedDays });
    }
  }, [scheduleData, form]);

  const onSubmit = async (values: z.infer<typeof scheduleSchema>) => {
    setIsLoading(true);
    if (!firestore || !businessId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'ID do negócio não encontrado.' });
      setIsLoading(false);
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const scheduleCollectionRef = collection(firestore, `businesses/${businessId}/schedules`);

      values.days.forEach(day => {
        const dayDocRef = doc(scheduleCollectionRef, day.id);
        const { dayName, dayIndex, ...scheduleInfo } = day;
        batch.set(dayDocRef, scheduleInfo, { merge: true });
      });

      await batch.commit();
      toast({ title: 'Agenda atualizada com sucesso!' });
    } catch (error) {
      console.error("Error updating schedule: ", error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar agenda', description: 'Ocorreu um erro inesperado. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center gap-2"><CalendarCheck/> Agendamentos de Hoje</CardTitle>
             <CardDescription>Veja os agendamentos confirmados para hoje.</CardDescription>
          </CardHeader>
          <CardContent>
            <TodayAppointmentsList />
          </CardContent>
       </Card>

       <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center gap-2"><CalendarClock/> Horário de Funcionamento</CardTitle>
             <CardDescription>Defina os dias e horários em que seu estabelecimento estará aberto para agendamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSchedule ? (
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <Skeleton className="h-6 w-28" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row items-center justify-between rounded-lg border p-4 gap-4">
                    <h3 className="font-medium text-lg w-full md:w-32">{field.dayName}</h3>
                    <div className="flex items-center gap-4 flex-1 justify-end">
                      <FormField
                        control={form.control}
                        name={`days.${index}.openTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} disabled={!form.watch(`days.${index}.isOpen`)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-muted-foreground">-</span>
                       <FormField
                        control={form.control}
                        name={`days.${index}.closeTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} disabled={!form.watch(`days.${index}.isOpen`)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`days.${index}.isOpen`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center">
                            <FormControl>
                               <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                             <FormLabel className="text-sm mt-1">{form.watch(`days.${index}.isOpen`) ? 'Aberto' : 'Fechado'}</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                 <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </CardContent>
       </Card>
    </div>
  );
}
