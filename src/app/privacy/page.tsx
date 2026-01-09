
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-10">
        <div className="prose lg:prose-xl mx-auto">
          <h1 className="font-headline">Política de Privacidade</h1>
          <p>
            Sua privacidade é importante para nós. É política do AgendaPlus
            respeitar a sua privacidade em relação a qualquer informação sua que
            possamos coletar no site AgendaPlus, e outros sites que possuímos e
            operamos.
          </p>

          <h2>1. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente. Por
            exemplo, coletamos informações quando você cria uma conta, se
            inscreve, participa de quaisquer recursos interativos de nossos
            serviços, preenche um formulário, solicita suporte ao cliente ou se
            comunica conosco.
          </p>

          <h2>2. Como Usamos as Informações</h2>
          <p>
            Usamos as informações que coletamos para fornecer, manter e
            melhorar nossos serviços, como para administrar sua conta, processar
            transações e enviar informações relacionadas, incluindo
            confirmações e lembretes.
          </p>

          <h2>3. Compartilhamento de Informações</h2>
          <p>
            Não compartilhamos suas informações pessoais com empresas,
            organizações ou indivíduos externos ao AgendaPlus, exceto em
            circunstâncias limitadas, incluindo: com o seu consentimento; com
            administradores de domínio; para processamento externo; por razões
            legais.
          </p>

          <h2>4. Segurança</h2>
          <p>
            Trabalhamos duro para proteger o AgendaPlus e nossos usuários contra
            acesso não autorizado ou alteração, divulgação ou destruição não
            autorizada das informações que mantemos.
          </p>

          <p>
            <em>Última atualização: {new Date().toLocaleDateString('pt-BR')}</em>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
