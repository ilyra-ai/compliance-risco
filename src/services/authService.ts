export type Role = 'admin' | 'user';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function login(username: string, password: string): Promise<{ token: string; role: Role }>{
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  if (!res.ok) throw new Error('Login inválido');
  const data = await res.json();
  const token: string = data.access_token;

  // Fetch /me to get role
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) throw new Error('Falha ao obter perfil');
  const me = await meRes.json();
  return { token, role: me.role as Role };
}

export async function fetchUsers(token: string){
  const res = await fetch(`${BASE_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Falha ao listar usuários');
  return res.json();
}

export async function createUser(token: string, user: { username: string; password: string; role: Role }){
  const res = await fetch(`${BASE_URL}/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Falha ao criar usuário');
  return res.json();
}

export async function deleteUser(token: string, id: number){
  const res = await fetch(`${BASE_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Falha ao remover usuário');
  return res.json();
}
