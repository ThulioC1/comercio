
"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowRight } from "lucide-react";
import type { Business } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemoFirebase } from "@/firebase/provider";
import Image from 'next/image';
import { WithId } from "@/firebase/firestore/use-collection";


export default function ClientDashboard() {
    const firestore = useFirestore();

    const businessesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "businesses"));
    }, [firestore]);

    const { data: businesses, isLoading } = useCollection<Business>(businessesQuery);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Encontre um Estabelecimento</h1>
                    <p className="text-muted-foreground">Escolha um local para agendar seu próximo serviço.</p>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                             <Skeleton className="w-full h-40 rounded-t-md" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Skeleton className="h-5 w-3/4" />
                             <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-10 w-full mt-4" />
                        </CardContent>
                    </Card>
                ))}
                {!isLoading && businesses?.map((business: WithId<Business>) => (
                     <Link href={`/book/${business.id}`} key={business.id}>
                        <Card className="overflow-hidden h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="relative w-full h-40">
                                {business.logoUrl ? (
                                    <Image
                                        src={business.logoUrl}
                                        alt={business.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <Building className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-headline text-lg font-bold">{business.name}</h3>
                                <p className="text-muted-foreground text-sm flex-grow">{business.businessType}</p>
                                <Button className="w-full mt-4">
                                    Agendar Agora <ArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </Link>
                ))}
                {!isLoading && businesses?.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        <p>Nenhum estabelecimento disponível no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
