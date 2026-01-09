
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Business, Service, Schedule } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import { add, format, parse, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';


export default function BookServicePage() {
    const firestore = useFirestore();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const businessId = params.businessId as string;
    const serviceId = params.serviceId as string;

    const [business, setBusiness] = useState<Business | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [schedule, setSchedule] = useState<Schedule[] | null>(null);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!firestore || !businessId || !serviceId) return;
            setLoading(true);
            try {
                const businessRef = doc(firestore, "businesses", businessId);
                const serviceRef = doc(firestore, `businesses/${businessId}/services`, serviceId);
                const scheduleQuery = query(collection(firestore, `businesses/${businessId}/schedules`));

                const [businessSnap, serviceSnap, scheduleSnap] = await Promise.all([
                    getDoc(businessRef),
                    getDoc(serviceRef),
                    getDocs(scheduleQuery)
                ]);

                if (businessSnap.exists()) setBusiness({ id: businessSnap.id, ...businessSnap.data() } as Business);
                if (serviceSnap.exists()) setService({ id: serviceSnap.id, ...serviceSnap.data() } as Service);
                
                const scheduleData = scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
                setSchedule(scheduleData);

            } catch (error) {
                console.error("Failed to fetch booking data:", error);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados para agendamento.' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [firestore, businessId, serviceId, toast]);

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
        if (!price) return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }
    
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                 <main className="flex-1 container py-10">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
       <div className="flex flex-col min-h-screen bg-accent/20">
        <Header />
        <main className="flex-1 container py-10">
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
                            <Button className="w-full" disabled={!selectedSlot || !date}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Agendamento
                            </Button>
                        </div>
                    </Card>
                 </div>
            </div>
        </main>
        <Footer />
       </div>
    );
}

