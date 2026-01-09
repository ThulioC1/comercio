
import { doc, collection, query, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { notFound } from 'next/navigation';
import type { Business, Service, Schedule } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingClient from './BookingClient';
import { WithId } from '@/firebase/firestore/use-collection';

interface PageProps {
    params: {
        businessId: string;
        serviceId: string;
    }
}

async function getBookingPageData(businessId: string, serviceId: string): Promise<{ business: WithId<Business>, service: WithId<Service>, schedule: WithId<Schedule>[] } | null> {
    try {
        const { firestore } = initializeFirebase();
        const { getDoc } = await import('firebase/firestore');

        // Fetch business
        const businessRef = doc(firestore, "businesses", businessId);
        const businessSnap = await getDoc(businessRef);
        if (!businessSnap.exists()) return null;
        const business = { id: businessSnap.id, ...businessSnap.data() } as WithId<Business>;
        
        // Fetch service
        const serviceRef = doc(firestore, `businesses/${businessId}/services`, serviceId);
        const serviceSnap = await getDoc(serviceRef);
        if (!serviceSnap.exists()) return null;
        const service = { id: serviceSnap.id, ...serviceSnap.data() } as WithId<Service>;

        // Fetch schedule
        const scheduleQuery = query(collection(firestore, `businesses/${businessId}/schedules`));
        const scheduleSnap = await getDocs(scheduleQuery);
        const schedule = scheduleSnap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Schedule>));

        return { business, service, schedule };
    } catch (error) {
        console.error("Failed to fetch booking page data on server:", error);
        return null;
    }
}


export default async function BookServicePage({ params }: PageProps) {
    const data = await getBookingPageData(params.businessId, params.serviceId);

    if (!data) {
        notFound();
    }
    
    const { business, service, schedule } = data;

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
