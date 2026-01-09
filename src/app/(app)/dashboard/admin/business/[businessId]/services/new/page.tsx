
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do serviço deve ter pelo menos 2 caracteres.' }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: 'O preço deve ser um número positivo.' }),
  durationMinutes: z.coerce.number().int().positive({ message: 'A duração deve ser um número inteiro positivo de minutos.' }),
});

export default function NewServicePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!firestore || !businessId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informações do negócio não encontradas.' });
      setIsLoading(false);
      return;
    }

    try {
      const servicesCollectionRef = collection(firestore, `businesses/${businessId}/services`);
      
      const serviceData = {
        name: values.name,
        description: values.description || '',
        price: values.price,
        durationMinutes: values.durationMinutes,
        businessId: businessId,
        staffIds: [], // Staff can be assigned later
      };

      await addDoc(servicesCollectionRef, serviceData);

      toast({ title: 'Serviço criado com sucesso!', description: `${values.name} foi adicionado ao negócio.` });
      router.push(`/dashboard/admin/business/${businessId}`);

    } catch (error) {
      console.error("Error creating service: ", error);
      toast({ variant: 'destructive', title: 'Erro ao criar serviço', description: 'Ocorreu um erro inesperado. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
             </Button>
             <div>
                <h1 className="text-xl font-bold font-headline">Adicionar Novo Serviço</h1>
                <p className="text-muted-foreground text-sm">Preencha os detalhes para cadastrar um novo serviço.</p>
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
                            <FormLabel>Nome do Serviço</FormLabel>
                            <FormControl>
                            <Input placeholder="Ex: Corte de Cabelo Masculino" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duração (em minutos)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="Ex: 30" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço (R$)</FormLabel>
                                <FormControl>
                                <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} />
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
                            placeholder="Fale um pouco sobre o serviço."
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
                        Cadastrar Serviço
                    </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
