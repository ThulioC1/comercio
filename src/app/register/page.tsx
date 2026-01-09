import Link from 'next/link';
import { Scissors } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://picsum.photos/seed/registerpage/1200/1600')` }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Scissors className="mr-2 h-6 w-6" />
          AgendaPlus
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-lg font-headline">
              &ldquo;A plataforma que transformou a gestão do meu salão. Meus clientes adoram a facilidade de agendar online.&rdquo;
            </p>
            <footer className="text-sm">Sofia Mendes, Dona do Beauty Lounge</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight font-headline">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com seus dados para criar uma conta.
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao clicar em continuar, você concorda com nossos{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
