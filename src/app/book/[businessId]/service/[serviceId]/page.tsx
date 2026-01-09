
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import type { Business, Service, Schedule } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import BookingClient from './BookingClient';

async function getBookingData(businessId: string, serviceId: string) {
    const { firestore } = initializeFirebase();
    try {
        const businessRef = doc(firestore, "businesses", businessId);
        const serviceRef = doc(firestore, `businesses/${businessId}/services`, serviceId);
        const scheduleQuery = query(collection(firestore, `businesses/${businessId}/schedules`));

        const [businessSnap, serviceSnap, scheduleSnap] = await Promise.all([
            getDoc(businessRef),
            getDoc(serviceRef),
            getDocs(scheduleQuery)
        ]);

        if (!businessSnap.exists() || !serviceSnap.exists()) {
            return null;
        }

        const business = { id: businessSnap.id, ...businessSnap.data() } as Business;
        const service = { id: serviceSnap.id, ...serviceSnap.data() } as Service;
        const schedule = scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));

        return { business, service, schedule };
    } catch (error) {
        console.error("Failed to fetch booking data on server:", error);
        return null;
    }
}

export default async function BookServicePage({ params }: { params: { businessId: string, serviceId: string } }) {
    const { businessId, serviceId } = params;
    const data = await getBookingData(businessId, serviceId);

    if (!data) {
        notFound();
    }

    const { business, service, schedule } = data;

    return (
        <div className="flex flex-col min-h-screen bg-accent/20">
            <Header />
            <main className="flex-1 container py-10">
                <BookingClient business={business} service={service} schedule={schedule} />
            </main>
            <Footer />
        </div>
    );
}
