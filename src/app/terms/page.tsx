
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-10">
        <div className="prose lg:prose-xl mx-auto">
          <h1 className="font-headline">Termos de Serviço</h1>
          <p>
            Bem-vindo ao AgendaPlus. Ao usar nossos serviços, você concorda com
            estes termos. Por favor, leia-os com atenção.
          </p>

          <h2>1. Uso dos Nossos Serviços</h2>
          <p>
            Você deve seguir todas as políticas disponibilizadas a você dentro
            dos Serviços. Não use nossos Serviços indevidamente. Por exemplo,
            não interfira com nossos Serviços nem tente acessá-los por um método
            diferente da interface e das instruções que fornecemos.
          </p>

          <h2>2. Sua Conta no AgendaPlus</h2>
          <p>
            Você pode precisar de uma Conta do AgendaPlus para usar alguns dos
            nossos Serviços. Você pode criar sua própria Conta do AgendaPlus ou
            ela pode ser atribuída a você por um administrador. Se você estiver
            usando uma Conta do AgendaPlus atribuída a você por um
            administrador, termos diferentes ou adicionais podem ser aplicados
            e seu administrador pode ser capaz de acessar ou desativar sua
            conta.
          </p>

          <h2>3. Privacidade e Proteção de Direitos Autorais</h2>
          <p>
            As políticas de privacidade do AgendaPlus explicam como tratamos
            seus dados pessoais e protegemos sua privacidade quando você usa
            nossos Serviços. Ao usar nossos Serviços, você concorda que o
            AgendaPlus pode usar tais dados de acordo com nossas políticas de
            privacidade.
          </p>

          <h2>4. Modificação e Rescisão dos Nossos Serviços</h2>
          <p>
            Estamos constantemente alterando e melhorando nossos Serviços.
            Podemos adicionar ou remover funcionalidades ou recursos e podemos
            suspender ou interromper um Serviço por completo.
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
