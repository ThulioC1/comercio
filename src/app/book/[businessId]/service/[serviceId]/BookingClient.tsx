
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Business, Service, Schedule } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import { add, format, parse, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


interface BookingClientProps {
    business: Business;
    service: Service;
    schedule: Schedule[];
}

export default function BookingClient({ business, service, schedule }: BookingClientProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    useEffect(() => {
        if (!date || !service || !schedule) {
            setAvailableSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSelectedSlot(null);
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

    const formatPrice = (price?: number) => {
        if (price === undefined) return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }
    
    const handleConfirmBooking = () => {
        // Here you would typically handle the booking submission,
        // which might involve checking for user authentication and then
        // creating an appointment document in Firestore.
        // For now, we'll just show a success message.
        setIsSubmitting(true);
        toast({
            title: "Agendamento quase lá!",
            description: "Para confirmar, você precisa fazer login ou criar uma conta."
        });
        // In a real scenario, you'd likely redirect to a login/register page
        // with the booking details to be finalized after auth.
        // e.g., router.push(`/login?redirect=/book/${business.id}/confirm&...details`);
        setTimeout(() => {
             router.push('/login');
        }, 2000)
    }

    return (
        <div>
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2" />
                Voltar
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
                                onSelect={setDate}
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
                                            onClick={() => setSelectedSlot(slot)}
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
                                disabled={!selectedSlot || !date || isSubmitting}
                                onClick={handleConfirmBooking}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Agendamento
                            </Button>
                        </div>
                    </Card>
                 </div>
            </div>
        </div>
    );
}

