"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth as useAppAuth } from "@/lib/auth";
import { useAuth } from "@/firebase";
import { Home, Settings, Calendar, Users, LogOut, Scissors, Shield } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const menuItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/schedule', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/services', label: 'Serviços', icon: Scissors },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAppAuth();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const getRoleLabel = (role?: UserRole | null) => {
    switch (role) {
      case 'system-admin':
        return 'Administrador';
      case 'business-owner':
        return 'Empreendedor';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
               <AvatarImage src={userProfile?.photoURL ?? undefined} />
               <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
                <span className="font-semibold text-sidebar-foreground">
                  {userProfile?.displayName ?? "Usuário"}
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  {getRoleLabel(userProfile?.role)}
                </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
                  <LogOut/>
                  <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
           <SidebarTrigger className="md:hidden" />
           <div className="w-full flex-1">
             <h1 className="font-headline text-lg font-semibold md:text-2xl">Dashboard</h1>
           </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
