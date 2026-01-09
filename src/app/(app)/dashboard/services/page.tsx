
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { useAuth } from '@/lib/auth';
import { collection, doc, updateDoc, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Scissors, DollarSign } from 'lucide-react';
import type { Service } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  price: z.coerce.number().positive({ message: 'O preço deve ser um número positivo.' }),
});

const servicesFormSchema = z.object({
  services: z.array(serviceSchema),
});


export default function ServicesPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const firestore = useFirestore();
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessIds?.[0];

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    return query(collection(firestore, `businesses/${businessId}/services`));
  }, [firestore, businessId]);

  const { data: servicesData, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);

  const form = useForm<z.infer<typeof servicesFormSchema>>({
    resolver: zodResolver(servicesFormSchema),
    defaultValues: {
      services: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "services",
  });
  
  useEffect(() => {
    if (servicesData) {
      const sortedData = [...servicesData].sort((a, b) => a.name.localeCompare(b.name));
      replace(sortedData);
    }
  }, [servicesData, replace]);


  const onSubmit = async (serviceId: string, index: number) => {
    setLoadingStates(prev => ({ ...prev, [serviceId]: true }));
    
    if (!firestore || !businessId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'ID do negócio não encontrado.' });
      setLoadingStates(prev => ({ ...prev, [serviceId]: false }));
      return;
    }

    const serviceData = form.getValues().services[index];
    if (!serviceData) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Dados do serviço não encontrados.' });
        setLoadingStates(prev => ({ ...prev, [serviceId]: false }));
        return;
    }
    
    const serviceDocRef = doc(firestore, `businesses/${businessId}/services`, serviceId);

    try {
      await updateDoc(serviceDocRef, {
        price: serviceData.price
      });
      toast({ title: 'Preço atualizado!', description: `O preço de "${serviceData.name}" foi salvo.` });
    } catch (error) {
      console.error("Error updating service price: ", error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível salvar o novo preço.' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [serviceId]: false }));
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center gap-2"><Scissors/> Meus Serviços</CardTitle>
             <CardDescription>Ajuste os preços dos serviços oferecidos no seu estabelecimento. Para adicionar ou remover serviços, contate o administrador.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServices ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                       <Skeleton className="h-10 w-28" />
                       <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <Form {...form}>
              <form className="space-y-4">
                {fields.length === 0 && !isLoadingServices ? (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Nenhum serviço cadastrado para seu estabelecimento.</p>
                        <p className="text-sm">Por favor, peça ao administrador para adicionar seus serviços.</p>
                    </div>
                ) : fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 gap-4">
                     <div className="flex-1">
                        <h3 className="font-semibold text-base">{field.name}</h3>
                        <p className="text-sm text-muted-foreground">{field.durationMinutes} min • {field.description}</p>
                     </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <FormField
                            control={form.control}
                            name={`services.${index}.price`}
                            render={({ field: formField }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="sr-only">Preço</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" className="pl-8" {...formField} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      <Button 
                        type="button" 
                        disabled={loadingStates[field.id]}
                        onClick={() => onSubmit(field.id, index)}
                        className="w-28"
                      >
                        {loadingStates[field.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                ))}
              </form>
            </Form>
            )}
          </CardContent>
       </Card>
    </div>
  );
}
