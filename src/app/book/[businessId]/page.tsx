
"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Business, Service } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, DollarSign, CalendarPlus, Building, MapPin, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function BusinessPublicPage() {
    const firestore = useFirestore();
    const params = useParams();
    const businessId = params.businessId as string;

    const businessRef = useMemo(() => {
        if (!firestore || !businessId) return null;
        return doc(firestore, "businesses", businessId);
    }, [firestore, businessId]);

    const servicesQuery = useMemo(() => {
        if (!firestore || !businessId) return null;
        return query(collection(firestore, `businesses/${businessId}/services`));
    }, [firestore, businessId]);

    const { data: business, isLoading: isLoadingBusiness } = useDoc<Business>(businessRef);
    const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }
    
    const getInitials = (name?: string | null) => {
        if (!name) return 'B';
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (isLoadingBusiness) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container py-10">
                   <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                   <Skeleton className="h-8 w-64 mx-auto mt-4" />
                   <Skeleton className="h-5 w-48 mx-auto mt-2" />
                   <div className="mt-8 space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                   </div>
                </main>
                <Footer/>
            </div>
        )
    }

    if (!business) {
        return (
             <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Negócio não encontrado</h1>
                        <p className="mt-2 text-muted-foreground">O link que você seguiu pode estar quebrado ou o negócio pode ter sido removido.</p>
                        <Button variant="outline" className="mt-6" onClick={() => window.history.back()}>Voltar</Button>
                    </div>
                </main>
                <Footer/>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-accent/20">
            <Header />
            <main className="flex-1 container py-10">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                        <AvatarImage src={business.logoUrl} alt={business.name} />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                            {getInitials(business.name)}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="font-headline text-4xl font-bold mt-4">{business.name}</h1>
                    <p className="text-lg text-muted-foreground">{business.businessType}</p>
                    
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4"/>
                        <span>{business.address}</span>
                    </div>

                    {business.description && (
                         <p className="max-w-2xl mt-4 text-center text-foreground/80">
                            <Info className="h-4 w-4 inline-block mr-2 text-primary" />
                            {business.description}
                         </p>
                    )}
                </div>

                <div className="mt-12">
                    <h2 className="font-headline text-2xl font-bold text-center mb-6">Nossos Serviços</h2>
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {isLoadingServices && Array.from({length: 3}).map((_, i) => (
                             <Card key={i}>
                                <CardHeader><Skeleton className="h-5 w-4/5" /></CardHeader>
                                <CardContent className="space-y-2">
                                     <Skeleton className="h-4 w-1/2" />
                                     <Skeleton className="h-4 w-1/3" />
                                </CardContent>
                                <CardFooter>
                                     <Skeleton className="h-10 w-full" />
                                </CardFooter>
                             </Card>
                        ))}
                        {!isLoadingServices && services?.map((service) => (
                            <Card key={service.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{service.name}</CardTitle>
                                    {service.description && <CardDescription>{service.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            <span>{formatPrice(service.price)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{service.durationMinutes} min</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">
                                        <CalendarPlus className="mr-2"/>
                                        Agendar Agora
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                         {!isLoadingServices && services?.length === 0 && (
                            <p className="col-span-full text-center text-muted-foreground">Nenhum serviço disponível no momento.</p>
                         )}
                     </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default BusinessPublicPage;
