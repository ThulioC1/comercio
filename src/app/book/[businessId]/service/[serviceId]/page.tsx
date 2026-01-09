
'use client';

import { useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import type { Business, Service, Schedule } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingClient from './BookingClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';


function BookingPageSkeleton() {
    return (
         <div className="flex flex-col min-h-screen bg-accent/20">
            <Header />
            <main className="flex-1 container py-10">
                <Skeleton className="h-9 w-24 mb-6" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-7 w-80" />
                                <Skeleton className="h-4 w-96 mt-2" />
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row gap-8">
                                <Skeleton className="h-[250px] w-full md:w-[280px] rounded-md" />
                                <div className="flex-1">
                                    <Skeleton className="h-7 w-56 mb-4" />
                                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                                        {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-10"/>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Skeleton className="h-5 w-16 mb-1" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-12" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </CardContent>
                            <div className="p-6 pt-0">
                               <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}


export default function BookServicePage() {
    const params = useParams();
    const { businessId, serviceId } = params;
    const firestore = useFirestore();

    const businessRef = useMemoFirebase(() => doc(firestore, "businesses", businessId as string), [firestore, businessId]);
    const serviceRef = useMemoFirebase(() => doc(firestore, `businesses/${businessId}/services`, serviceId as string), [firestore, businessId, serviceId]);
    const scheduleQuery = useMemoFirebase(() => collection(firestore, `businesses/${businessId}/schedules`), [firestore, businessId]);

    const { data: business, isLoading: isLoadingBusiness, error: businessError } = useDoc<Business>(businessRef);
    const { data: service, isLoading: isLoadingService, error: serviceError } = useDoc<Service>(serviceRef);
    const { data: schedule, isLoading: isLoadingSchedule, error: scheduleError } = useCollection<Schedule>(scheduleQuery);
    
    const isLoading = isLoadingBusiness || isLoadingService || isLoadingSchedule;

    if (isLoading) {
        return <BookingPageSkeleton />;
    }

    if (!business || !service || businessError || serviceError || scheduleError) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-accent/20">
            <Header />
            <main className="flex-1 container py-10">
                <BookingClient business={business} service={service} schedule={schedule || []} />
            </main>
            <Footer />
        </div>
    );
}
