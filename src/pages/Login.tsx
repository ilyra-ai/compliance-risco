import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/hooks/useAuth';
import { login } from '@/services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, role } = await login(username, password);
      auth.save({ username, role, token });
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      navigate('/app', { replace: true });
    } catch (err) {
      toast({ title: 'Falha no login', description: 'Verifique suas credenciais.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login – Plataforma de Compliance" description="Acesse sua conta para gerenciar análises e configurações." canonical={window.location.origin + '/login'} />
      <main className="min-h-screen flex items-center justify-center px-6">
        <section className="w-full max-w-md space-y-6">
          <h1 className="text-3xl text-center font-imprima">Acesse sua conta</h1>
          <form onSubmit={onSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
            <div className="text-center text-sm text-muted-foreground">
              Dica: admin / admin
            </div>
            <div className="text-center">
              <Link to="/">Voltar</Link>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default Login;
