
import { doc, collection, query, getDoc, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server'; // Using server initialization
import type { Business, Service } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, CalendarPlus, Building, MapPin, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getBusinessData(businessId: string) {
    const { firestore } = initializeFirebase();
    const businessRef = doc(firestore, "businesses", businessId);
    const servicesQuery = query(collection(firestore, `businesses/${businessId}/services`));

    const businessSnap = await getDoc(businessRef);

    if (!businessSnap.exists()) {
        return null;
    }

    const servicesSnap = await getDocs(servicesQuery);
    const business = { id: businessSnap.id, ...businessSnap.data() } as Business;
    const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));

    return { business, services };
}


export default async function BusinessPublicPage({ params }: { params: { businessId: string } }) {
    const businessId = params.businessId;
    const data = await getBusinessData(businessId);

    if (!data) {
        notFound();
    }
    
    const { business, services } = data;

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
                        
                        {services?.map((service) => (
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
                                    <Link href={`/book/${businessId}/service/${service.id}`} className="w-full">
                                        <Button className="w-full">
                                            <CalendarPlus className="mr-2"/>
                                            Agendar Agora
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                         {services?.length === 0 && (
                            <p className="col-span-full text-center text-muted-foreground">Nenhum serviço disponível no momento.</p>
                         )}
                     </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
