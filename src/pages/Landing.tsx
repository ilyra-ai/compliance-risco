import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <>
      <SEO title="Plataforma de Compliance – Análise Rápida" description="Landing page minimalista e envolvente para sua plataforma de compliance." canonical={window.location.origin + '/'} />
      <header className="border-b bg-background">
        <nav className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="font-imprima text-xl">CompliancePro</Link>
          <div className="flex gap-3">
            <Link to="/login"><Button variant="outline">Entrar</Button></Link>
            <Link to="/app"><Button>Ir para o App</Button></Link>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-20">
        <section className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-imprima">
            Decisões seguras. Resultados confiáveis.
          </h1>
          <p className="text-muted-foreground text-lg">
            Eleve seu processo de due diligence com análises claras e acionáveis. Simples, rápido e com foco no que importa para o seu negócio.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login"><Button size="lg">Começar agora</Button></Link>
            <Link to="/app"><Button size="lg" variant="outline">Fazer uma análise</Button></Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Construa confiança com seus clientes e reduza riscos em minutos.
          </p>
        </section>
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CompliancePro. Todos os direitos reservados.
      </footer>
    </>
  );
};

export default Landing;
