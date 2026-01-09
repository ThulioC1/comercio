
"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link, Share2 } from 'lucide-react';

export default function SettingsPage() {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const businessId = userProfile?.businessIds?.[0];
    const bookingUrl = businessId ? `${window.location.origin}/book/${businessId}` : '';

    const copyToClipboard = () => {
        if (!bookingUrl) return;
        navigator.clipboard.writeText(bookingUrl).then(() => {
            toast({ title: 'Link copiado!', description: 'O link de agendamento foi copiado para a área de transferência.' });
        }, (err) => {
            toast({ variant: 'destructive', title: 'Falha ao copiar', description: 'Não foi possível copiar o link.' });
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Share2 /> Divulgue seu Negócio</CardTitle>
                    <CardDescription>Use o link abaixo para compartilhar sua página de agendamentos com seus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {businessId ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                           <div className="relative flex-grow w-full">
                             <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                value={bookingUrl}
                                readOnly 
                                className="pl-9 bg-muted/50"
                             />
                           </div>
                           <Button onClick={copyToClipboard} className="w-full sm:w-auto">
                                <Copy className="mr-2" />
                                Copiar Link
                           </Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum negócio associado a esta conta.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
