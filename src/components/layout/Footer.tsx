import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container flex items-center justify-between py-6 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} AgendaPlus. Todos os direitos reservados.
        </p>
        <nav className="hidden md:flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-sm hover:underline">Termos de Serviço</Link>
            <Link href="/privacy" className="text-sm hover:underline">Política de Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}
