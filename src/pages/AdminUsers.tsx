import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/hooks/useAuth';
import { fetchUsers, createUser, deleteUser, Role } from '@/services/authService';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');

  const token = auth.get()?.token || '';

  const load = async () => {
    const list = await fetchUsers(token);
    setUsers(list);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(token, { username, password, role });
    setUsername(''); setPassword(''); setRole('user');
    await load();
  };

  return (
    <>
      <SEO title="Admin – Gestão de Acessos" description="Gerencie usuários e perfis de acesso." canonical={window.location.origin + '/admin/users'} />
      <main className="container mx-auto px-6 py-10 space-y-8">
        <h1 className="text-3xl font-imprima">Gestão de Acessos</h1>
        <section className="grid md:grid-cols-2 gap-8">
          <form onSubmit={onCreate} className="space-y-4 bg-card p-6 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="u">Usuário</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Senha</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <select className="w-full rounded-md border bg-background p-2" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <Button type="submit">Criar usuário</Button>
          </form>
          <div className="space-y-4">
            <h2 className="text-xl">Usuários</h2>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-muted-foreground">{u.role}</div>
                  </div>
                  <Button variant="outline" onClick={async () => { await deleteUser(token, u.id); await load(); }}>Remover</Button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminUsers;
