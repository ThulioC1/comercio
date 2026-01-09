
"use client";

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { useAuth } from '@/lib/auth';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Appointment, Service } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemoFirebase } from '@/firebase/provider';

export default function TodayAppointmentsList() {
    const firestore = useFirestore();
    const { userProfile } = useAuth();
    const businessId = userProfile?.businessIds?.[0];

    const appointmentsQuery = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;

        const today = new Date();
        const startOfToday = new Timestamp(Math.floor(new Date(today.setHours(0, 0, 0, 0)).getTime() / 1000), 0);
        const endOfToday = new Timestamp(Math.floor(new Date(today.setHours(23, 59, 59, 999)).getTime() / 1000), 0);

        return query(
            collection(firestore, `businesses/${businessId}/appointments`),
            where('startTime', '>=', startOfToday),
            where('startTime', '<=', endOfToday)
        );
    }, [firestore, businessId]);

    const servicesQuery = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;
        return collection(firestore, `businesses/${businessId}/services`);
    }, [firestore, businessId]);

    const { data: appointments, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsQuery);
    const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);

    const servicesMap = useMemo(() => {
        if (!services) return new Map();
        return new Map(services.map(s => [s.id, s.name]));
    }, [services]);
    
    const getInitials = (name?: string | null) => {
        if (!name) return 'C';
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2).toUpperCase();
    };

    const isLoading = isLoadingAppointments || isLoadingServices;

    if (isLoading) {
        return (
            <div className="space-y-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="ml-4 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="ml-auto text-right">
                             <Skeleton className="h-4 w-28" />
                             <Skeleton className="h-3 w-16 mt-1 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <p>Nenhum agendamento para hoje.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {appointments
                .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis())
                .map((appt) => (
                <div key={appt.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        {/* Placeholder for client image */}
                        <AvatarFallback>{getInitials(appt.clientName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{appt.clientName}</p>
                        <p className="text-sm text-muted-foreground">{appt.clientPhone || 'Sem telefone'}</p>
                    </div>
                    <div className="ml-auto font-medium text-right">
                        <div>{servicesMap.get(appt.serviceId) || 'Serviço desconhecido'}</div>
                        <div className="text-sm text-muted-foreground">
                            {format(appt.startTime.toDate(), "HH:mm", { locale: ptBR })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
