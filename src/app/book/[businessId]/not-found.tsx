
'use client'
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Building } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Negócio não encontrado</h1>
              <p className="mt-2 text-muted-foreground">O link que você seguiu pode estar quebrado ou o negócio pode ter sido removido.</p>
               <Link href="/">
                <Button variant="outline" className="mt-6">Voltar para a Página Inicial</Button>
              </Link>
          </div>
      </main>
      <Footer/>
    </div>
  )
}
