
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do negócio deve ter pelo menos 2 caracteres.' }),
  businessType: z.string().min(2, { message: 'O tipo do negócio é obrigatório.' }),
  address: z.string().min(5, { message: 'O endereço é obrigatório.' }),
  timeZone: z.string().min(2, { message: 'O fuso horário é obrigatório.' }),
  description: z.string().optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'A cor deve estar em formato hexadecimal (ex: #RRGGBB).' }).optional(),
  ownerEmail: z.string().email({ message: 'Por favor, insira um email válido para o proprietário.' }),
});

export default function NewBusinessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessType: '',
      address: '',
      timeZone: 'America/Sao_Paulo',
      description: '',
      themeColor: '#8A8AFF', // Medium Lavender from globals.css
      ownerEmail: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de banco de dados não disponível.' });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Find user by email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', values.ownerEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Proprietário não encontrado', description: 'Nenhum usuário encontrado com este email.' });
        setIsLoading(false);
        return;
      }

      const ownerDoc = querySnapshot.docs[0];
      const ownerId = ownerDoc.id;

      // 2. Create the business document
      const businessData = {
        name: values.name,
        businessType: values.businessType,
        address: values.address,
        timeZone: values.timeZone,
        description: values.description || '',
        theme: {
          primaryColor: values.themeColor || '#8A8AFF',
          accentColor: '#DBBFFF', // Dusty Rose from globals.css
        },
        ownerId: ownerId,
        isActive: true,
        logoUrl: '',
        phone: '',
        socialMedia: {},
      };

      const docRef = await addDoc(collection(firestore, 'businesses'), businessData);

      // 3. Update user's role to 'business-owner' and add businessId
      const userRef = doc(firestore, 'users', ownerId);
      await updateDoc(userRef, {
        role: 'business-owner',
        businessIds: [docRef.id], // Assuming a user can own one business for now
      });

      toast({ title: 'Negócio criado com sucesso!', description: `${values.name} foi adicionado à plataforma.` });
      router.push('/dashboard/admin');

    } catch (error) {
      console.error("Error creating business: ", error);
      toast({ variant: 'destructive', title: 'Erro ao criar negócio', description: 'Ocorreu um erro inesperado. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Adicionar Novo Negócio</CardTitle>
        <CardDescription>Preencha os detalhes abaixo para cadastrar um novo estabelecimento na plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
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
                name="ownerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Proprietário</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="proprietario@email.com" {...field} />
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
                Cadastrar Negócio
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
