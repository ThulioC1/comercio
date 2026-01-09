import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Clock } from "lucide-react";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import RecentAppointments from "@/components/dashboard/RecentAppointments";

const stats = [
    { title: "Faturamento (mês)", value: "R$ 4,231.89", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Novos Clientes", value: "+230", icon: Users, change: "+180.1% from last month" },
    { title: "Agendamentos (mês)", value: "+120", icon: Calendar, change: "+19% from last month" },
    { title: "Taxa de Ocupação", value: "72%", icon: Clock, change: "+4% from last month" },
];

export default function DashboardPage() {
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
