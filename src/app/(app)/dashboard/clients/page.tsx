
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/auth';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import type { Appointment, UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemoFirebase } from '@/firebase/provider';

interface ClientData extends UserProfile {
  lastAppointment: Date | null;
  appointmentCount: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessIds?.[0];

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    return query(collection(firestore, `businesses/${businessId}/appointments`));
  }, [firestore, businessId]);

  useEffect(() => {
    async function fetchClients() {
      if (!firestore || !businessId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // 1. Fetch all appointments for the business
        const appointmentsSnapshot = await getDocs(appointmentsQuery!);
        const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

        if (appointments.length === 0) {
          setClients([]);
          setIsLoading(false);
          return;
        }

        // 2. Aggregate client data
        const clientAggregates: { [clientId: string]: { lastAppointment: Date, count: number } } = {};

        for (const appt of appointments) {
          const apptTime = appt.startTime.toDate();
          if (!clientAggregates[appt.clientId] || apptTime > clientAggregates[appt.clientId].lastAppointment) {
            clientAggregates[appt.clientId] = {
              lastAppointment: apptTime,
              count: (clientAggregates[appt.clientId]?.count || 0) + 1,
            };
          } else {
             clientAggregates[appt.clientId].count += 1;
          }
        }

        // 3. Fetch client profiles
        const clientIds = Object.keys(clientAggregates);
        
        const clientDocsSnapshots = await Promise.all(clientIds.map(id => getDoc(doc(firestore, 'users', id))));

        const clientData: ClientData[] = clientDocsSnapshots
            .map((docSnap, index) => {
                if (docSnap.exists()) {
                    const profile = docSnap.data() as UserProfile;
                    const clientId = clientIds[index];
                    return {
                        ...profile,
                        lastAppointment: clientAggregates[clientId].lastAppointment,
                        appointmentCount: clientAggregates[clientId].count,
                    };
                }
                return null;
            })
            .filter((c): c is ClientData => c !== null)
            .sort((a, b) => (b.lastAppointment?.getTime() ?? 0) - (a.lastAppointment?.getTime() ?? 0));
        
        setClients(clientData);

      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (appointmentsQuery) {
        fetchClients();
    }
  }, [firestore, businessId, appointmentsQuery]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Users /> Meus Clientes</CardTitle>
          <CardDescription>Veja a lista de clientes que já agendaram um serviço no seu estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Agendamentos</TableHead>
                <TableHead className="text-right">Último Agendamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && clients.map((client) => (
                <TableRow key={client.uid}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={client.photoURL ?? undefined} alt={client.displayName ?? 'Cliente'} />
                        <AvatarFallback>{getInitials(client.displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                   <TableCell className="text-muted-foreground text-center">{client.appointmentCount}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {client.lastAppointment ? format(client.lastAppointment, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
