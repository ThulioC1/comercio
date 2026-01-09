
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useFirestore } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Business, Service, Schedule, Appointment } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, DollarSign, Loader2, ArrowLeft, CalendarPlus, UserCheck } from 'lucide-react';
import { add, format, parse, startOfDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface BookingClientProps {
    business: Business;
    service: Service;
    schedule: Schedule[];
}

const generateTimeSlots = (start: string, end: string, duration: number) => {
    const slots = [];
    let currentTime = parse(start, 'HH:mm', new Date());
    const endTime = parse(end, 'HH:mm', new Date());

    while (currentTime < endTime) {
        slots.push(format(currentTime, 'HH:mm'));
        currentTime = add(currentTime, { minutes: duration });
    }
    return slots;
};


export default function BookingClient({ business, service, schedule }: BookingClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user, loading: userLoading } = useAuth();
    const firestore = useFirestore();

    const [date, setDate] = useState<Date | undefined>(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const parsedDate = new Date(dateParam);
            if (isValid(parsedDate)) {
                return parsedDate;
            }
        }
        return new Date();
    });
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(searchParams.get('slot'));
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    useEffect(() => {
        if (!date || !service || !schedule) {
            setAvailableSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);

            const dayOfWeek = date.getDay(); // Sunday - 0, Monday - 1
            const daySchedule = schedule.find(s => s.dayIndex === dayOfWeek);

            if (!daySchedule || !daySchedule.isOpen) {
                setAvailableSlots([]);
                setLoadingSlots(false);
                return;
            }

            const slots = generateTimeSlots(daySchedule.openTime, daySchedule.closeTime, service.durationMinutes);
            // In a real app, you would filter these slots against existing appointments
            setAvailableSlots(slots);
            setLoadingSlots(false);
        };

        fetchSlots();

    }, [date, service, schedule]);

    const handleSlotSelection = (slot: string) => {
        setSelectedSlot(slot);
        if (date) {
            const currentPath = window.location.pathname;
            const newUrl = `${currentPath}?date=${format(date, 'yyyy-MM-dd')}&slot=${slot}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        }
    }

    const formatPrice = (price?: number) => {
        if (price === undefined) return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }
    
    const handleBooking = async () => {
        setIsSubmitting(true);

        if (!user) {
            toast({
                title: "Login necessário",
                description: "Você precisa fazer login para confirmar o agendamento. Estamos te redirecionando!",
            });
            const redirectPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }

        if (!firestore || !date || !selectedSlot) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Informações de agendamento incompletas.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const [hours, minutes] = selectedSlot.split(':').map(Number);
            const startTime = new Date(date);
            startTime.setHours(hours, minutes);

            const endTime = add(startTime, { minutes: service.durationMinutes });

            const newAppointment: Omit<Appointment, 'id'> = {
                businessId: business.id,
                clientId: user.uid,
                clientName: user.displayName || 'Nome não informado',
                clientPhone: user.phoneNumber || 'Telefone não informado',
                serviceId: service.id,
                staffId: 'any', // Placeholder for staff selection logic
                startTime: Timestamp.fromDate(startTime),
                endTime: Timestamp.fromDate(endTime),
                status: 'confirmed',
            };
            
            await addDoc(collection(firestore, `businesses/${business.id}/appointments`), newAppointment);

            setShowConfirmation(true);


        } catch (error) {
             console.error("Error creating appointment: ", error);
             toast({ variant: 'destructive', title: 'Erro ao agendar', description: 'Não foi possível criar o agendamento. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (userLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/book/${business.id}`)} className="mb-6">
                <ArrowLeft className="mr-2" />
                Voltar para os serviços
            </Button>
            <div className="grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Escolha uma data e horário</CardTitle>
                            <CardDescription>Selecione o melhor dia para o seu agendamento.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-8">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => { setDate(d); setSelectedSlot(null); }}
                                disabled={(day) => day < startOfDay(new Date())}
                                className="rounded-md border p-0 mx-auto"
                                locale={ptBR}
                            />
                             <div className="flex-1">
                                <h3 className="text-lg font-medium mb-4 text-center md:text-left">
                                  {date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
                                </h3>
                                {loadingSlots ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-10"/>)}
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                                    {availableSlots.map(slot => (
                                        <Button 
                                            key={slot} 
                                            variant={selectedSlot === slot ? 'default' : 'outline'}
                                            onClick={() => handleSlotSelection(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground mt-4">Nenhum horário disponível para este dia.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                 </div>

                 <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Resumo do Agendamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold">Serviço</h4>
                                <p className="text-muted-foreground">{service?.name}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    <span className="font-semibold">Duração</span>
                                </div>
                                <p className="text-muted-foreground">{service?.durationMinutes} min</p>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground"/>
                                    <span className="font-semibold">Preço</span>
                                </div>
                                <p className="text-muted-foreground">{formatPrice(service?.price)}</p>
                            </div>
                            {selectedSlot && date && (
                                <div className="pt-4 border-t">
                                     <div className="flex justify-between items-center font-bold">
                                        <span>Data</span>
                                        <span>{format(date, "dd/MM/yyyy")}</span>
                                     </div>
                                      <div className="flex justify-between items-center font-bold">
                                        <span>Horário</span>
                                        <span>{selectedSlot}</span>
                                     </div>
                                </div>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button 
                                className="w-full" 
                                disabled={!selectedSlot || !date || isSubmitting || userLoading}
                                onClick={handleBooking}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {user ? <><CalendarPlus className="mr-2"/>Confirmar Agendamento</> : <><UserCheck className="mr-2"/>Fazer Login para Agendar</>}
                            </Button>
                        </div>
                    </Card>
                 </div>
            </div>

             <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-2xl text-center">Agendamento Confirmado!</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        Seu horário para {service.name} em {format(date || new Date(), "dd 'de' MMMM", { locale: ptBR })} às {selectedSlot} foi agendado com sucesso.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>Ver Meus Agendamentos</AlertDialogAction>
                    <AlertDialogCancel onClick={() => router.push(`/book/${business.id}`)}>Agendar Outro Serviço</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
