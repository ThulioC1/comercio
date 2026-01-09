
"use client";

import { useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building } from "lucide-react";
import type { Business } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemoFirebase } from "@/firebase/provider";


export default function AdminBusinessesPage() {
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
                    <h1 className="text-2xl font-bold font-headline">Gerenciar Negócios</h1>
                    <p className="text-muted-foreground">Adicione, edite ou remova negócios da plataforma.</p>
                </div>
                <Link href="/dashboard/admin/business/new">
                    <Button>
                        <PlusCircle className="mr-2" />
                        Adicionar Negócio
                    </Button>
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-8 h-8 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-8 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
                {!isLoading && businesses?.map((business) => (
                    <Card key={business.id}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Building className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-headline">{business.name}</CardTitle>
                                    <CardDescription>ID: {business.ownerId}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${business.isActive ? "text-green-600" : "text-red-600"}`}>
                                {business.isActive ? "Ativo" : "Inativo"}
                            </span>
                            <Link href={`/dashboard/admin/business/${business.id}`}>
                               <Button variant="outline" size="sm">Ver Detalhes</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
