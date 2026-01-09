import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Scissors, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: 'Agendamento Fácil',
    description: 'Clientes agendam em segundos, a qualquer hora e de qualquer lugar.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Sugestões Inteligentes',
    description: 'Nossa IA sugere os melhores horários para otimizar sua agenda.',
  },
  {
    icon: <Scissors className="h-8 w-8 text-primary" />,
    title: 'Gestão Completa',
    description: 'Painel completo para gerenciar serviços, horários e clientes.',
  },
];

const featuredBusinesses = PlaceHolderImages.slice(0, 3);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-accent/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Otimize seu tempo, encante seus clientes.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  AgendaPlus é a solução completa para agendamentos online. Simplifique sua gestão, reduza faltas e ofereça a melhor experiência para seu público.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src={PlaceHolderImages[3]?.imageUrl || "https://picsum.photos/seed/4/600/400"}
                data-ai-hint="salon interior"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Recursos Principais</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  Tudo que você precisa para decolar
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desde o agendamento inteligente até a gestão do seu negócio, temos as ferramentas que impulsionam seu crescimento.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    <p>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section id="establishments" className="w-full py-12 md:py-24 lg:py-32 bg-accent/30">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Descubra estabelecimentos incríveis
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Encontre os melhores serviços perto de você e agende seu horário com apenas alguns cliques.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-8">
              {featuredBusinesses.map((business, index) => (
                <Link href={`/book/${business.id}`} key={business.id}>
                  <Card className="overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                    <Image
                      src={business.imageUrl}
                      width="400"
                      height="225"
                      data-ai-hint={business.imageHint}
                      alt={`Imagem de ${business.description}`}
                      className="aspect-video w-full object-cover"
                    />
                    <CardHeader>
                      <CardTitle className="font-headline">{business.description}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
             <div className="mt-8">
               <Link href="/login">
                  <Button variant="outline">Ver todos os estabelecimentos <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
