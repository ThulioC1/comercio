"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building } from "lucide-react";
import Link from "next/link";

const businesses = [
    { id: "1", name: "Barbearia do Zé", owner: "José da Silva", status: "Ativo" },
    { id: "2", name: "Salão da Maria", owner: "Maria Souza", status: "Ativo" },
    { id: "3", name: "Estética Beleza Pura", owner: "Ana Costa", status: "Inativo" },
]

export default function AdminBusinessesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Gerenciar Negócios</h1>
                    <p className="text-muted-foreground">Adicione, edite ou remova negócios da plataforma.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2" />
                    Adicionar Negócio
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                    <Card key={business.id}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Building className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-headline">{business.name}</CardTitle>
                                    <CardDescription>{business.owner}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${business.status === "Ativo" ? "text-green-600" : "text-red-600"}`}>
                                {business.status}
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