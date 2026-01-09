
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';
import type { Business } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do negócio deve ter pelo menos 2 caracteres.' }),
  businessType: z.string().min(2, { message: 'O tipo do negócio é obrigatório.' }),
  address: z.string().min(5, { message: 'O endereço é obrigatório.' }),
  timeZone: z.string().min(2, { message: 'O fuso horário é obrigatório.' }),
  description: z.string().optional(),
  logoUrl: z.string().url({ message: "Por favor, insira uma URL válida para a logo." }).optional().or(z.literal('')),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'A cor deve estar em formato hexadecimal (ex: #RRGGBB).' }).optional(),
});

export default function EditBusinessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const { toast } = useToast();
  const firestore = useFirestore();

  const businessRef = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, "businesses", businessId);
  }, [firestore, businessId]);

  const { data: business, isLoading: isLoadingBusiness } = useDoc<Business>(businessRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        businessType: '',
        address: '',
        timeZone: 'America/Sao_Paulo',
        description: '',
        logoUrl: '',
        themeColor: '#8A8AFF',
    },
  });

  useEffect(() => {
    if (business) {
      form.reset({
        name: business.name || '',
        businessType: business.businessType || '',
        address: business.address || '',
        timeZone: business.timeZone || 'America/Sao_Paulo',
        description: business.description || '',
        logoUrl: business.logoUrl || '',
        themeColor: business.theme?.primaryColor || '#8A8AFF',
      });
    }
  }, [business, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!firestore || !businessId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de banco de dados não disponível.' });
      setIsLoading(false);
      return;
    }

    try {
      const businessDocRef = doc(firestore, 'businesses', businessId);
      const businessDataToUpdate = {
        name: values.name,
        businessType: values.businessType,
        address: values.address,
        timeZone: values.timeZone,
        description: values.description || '',
        logoUrl: values.logoUrl || '',
        'theme.primaryColor': values.themeColor,
      };

      await updateDoc(businessDocRef, businessDataToUpdate);
      
      toast({ title: 'Negócio atualizado com sucesso!', description: `${values.name} foi atualizado.` });
      router.push(`/dashboard/admin/business/${businessId}`);

    } catch (error) {
      console.error("Error updating business: ", error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar negócio', description: 'Ocorreu um erro inesperado. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBusiness) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-24 w-full" />
                        <div className="flex justify-end gap-2">
                           <Skeleton className="h-10 w-24" />
                           <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
             </Button>
             <div>
                <h1 className="text-xl font-bold font-headline flex items-center gap-2"><Building /> Editar {business?.name}</h1>
                <p className="text-muted-foreground text-sm">Atualize os detalhes do estabelecimento.</p>
             </div>
        </div>
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Negócio</FormLabel>
                            <FormControl>
                            <Input placeholder="Ex: Barbearia do Zé" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo do Negócio</FormLabel>
                            <FormControl>
                            <Input placeholder="Ex: Salão de Beleza, Barbearia" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                            <Input placeholder="Rua, Número, Bairro, Cidade - Estado" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL da Logo</FormLabel>
                            <FormControl>
                            <Input placeholder="https://exemplo.com/logo.png" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                        <FormField
                            control={form.control}
                            name="timeZone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fuso Horário</FormLabel>
                                <FormControl>
                                <Input placeholder="Ex: America/Sao_Paulo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="themeColor"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cor do Tema</FormLabel>
                                <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input type="color" className="w-12 h-10 p-1" {...field} />
                                    <Input type="text" placeholder="#8A8AFF" {...field} />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Fale um pouco sobre o negócio, seus serviços e diferenciais."
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
