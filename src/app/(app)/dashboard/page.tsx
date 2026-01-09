
"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Clock, Building } from "lucide-react";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

const stats = [
    { title: "Faturamento (mês)", value: "R$ 4,231.89", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Novos Clientes", value: "+230", icon: Users, change: "+180.1% from last month" },
    { title: "Agendamentos (mês)", value: "+120", icon: Calendar, change: "+19% from last month" },
    { title: "Taxa de Ocupação", value: "72%", icon: Clock, change: "+4% from last month" },
];

function BusinessOwnerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AppointmentsChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Próximos Agendamentos</CardTitle>
            <CardDescription>
              Você tem 5 agendamentos para hoje.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAppointments />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function AdminDashboard() {
    const { userProfile } = useAuth();
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Bem-vindo, Administrador!</CardTitle>
                    <CardDescription>
                        Use o menu lateral para gerenciar os negócios e as configurações do sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <p className="text-lg">Você está logado como <span className="font-semibold">{userProfile?.displayName}</span>.</p>
                     <Link href="/dashboard/admin">
                        <Button>
                            <Building className="mr-2" />
                            Gerenciar Negócios
                        </Button>
                     </Link>
                </CardContent>
            </Card>
        </div>
    );
}


export default function DashboardPage() {
  const { userProfile } = useAuth();

  if (userProfile?.role === 'system-admin') {
    return <AdminDashboard />;
  }

  if (userProfile?.role === 'client') {
    return <ClientDashboard />;
  }

  // Default to business owner dashboard
  return <BusinessOwnerDashboard />;
}
