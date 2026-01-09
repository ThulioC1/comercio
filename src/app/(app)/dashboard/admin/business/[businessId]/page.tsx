
"use client";

import { useMemoFirebase } from "@/firebase/provider";
import { useDoc, useCollection } from "@/firebase";
import { doc, collection, query } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, Scissors, Edit, ArrowLeft } from "lucide-react";
import type { Business, Service } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


export default function AdminBusinessDetailsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const businessId = params.businessId as string;

    const businessRef = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;
        return doc(firestore, "businesses", businessId);
    }, [firestore, businessId]);

    const servicesQuery = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;
        return query(collection(firestore, `businesses/${businessId}/services`));
    }, [firestore, businessId]);

    const { data: business, isLoading: isLoadingBusiness } = useDoc<Business>(businessRef);
    const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
                {isLoadingBusiness ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                ) : business ? (
                    <div>
                        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                            <ArrowLeft className="mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <Building /> {business.name}
                        </h1>
                        <p className="text-muted-foreground">{business.businessType}</p>
                    </div>
                ) : (
                     <p>Negócio não encontrado.</p>
                )}
                 <Link href={`/dashboard/admin/business/${businessId}/edit`}>
                    <Button variant="outline">
                        <Edit className="mr-2" />
                        Editar Negócio
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline flex items-center gap-2"><Scissors /> Serviços</CardTitle>
                            <CardDescription>Gerencie os serviços oferecidos por este estabelecimento.</CardDescription>
                        </div>
                        <Link href={`/dashboard/admin/business/${businessId}/services/new`}>
                            <Button>
                                <PlusCircle className="mr-2" />
                                Adicionar Serviço
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead className="text-right">Preço</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingServices && (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!isLoadingServices && services?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Nenhum serviço cadastrado ainda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoadingServices && services?.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.durationMinutes} min</TableCell>
                                    <TableCell className="text-right">{formatPrice(service.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
