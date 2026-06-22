import { SignJWT, jwtVerify } from 'jose';

let inMemoryUsers: any[] | null = null;

const DEFAULT_USERS = [
  { id: 'admin', username: 'admin', password: 'admin123', role: 'admin' as const, createdAt: '2024-01-01' },
  { id: 'test', username: 'test', password: 'test123', role: 'user' as const, createdAt: '2024-01-01' }
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'capability-management-secret-key-change-in-production'
);

async function getKV() {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      return kv;
    }
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import('@upstash/redis');
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  } catch {
  }
  return null;
}

export async function getUsers(): Promise<Array<{ id: string; username: string; password?: string; role: string; createdAt: string }>> {
  const kv = await getKV();
  if (kv) {
    try {
      const users = await kv.get<any[]>('capability:users');
      if (users && Array.isArray(users) && users.length > 0) {
        return users;
      }
    } catch {
    }
  }
  if (!inMemoryUsers) {
    inMemoryUsers = [...DEFAULT_USERS];
  }
  return inMemoryUsers;
}

export async function saveUsers(users: any[]) {
  inMemoryUsers = [...users];
  const kv = await getKV();
  if (kv) {
    try {
      await kv.set('capability:users', users);
    } catch {
    }
  }
}

export async function authenticateUser(username: string, password: string) {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = await new SignJWT({ userId: user.id, username: user.username, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
    
    return {
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, createdAt: user.createdAt }
    };
  }
  return { success: false, message: '用户名或密码错误' };
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { success: true, payload: payload as { userId: string; username: string; role: string } };
  } catch {
    return { success: false };
  }
}

export function requireAdmin(payload: { role?: string }) {
  return payload.role === 'admin';
}

export async function addUser(username: string, password: string, role: 'admin' | 'user') {
  const users = await getUsers();
  if (users.find(u => u.username === username)) {
    return { success: false, message: '用户名已存在' };
  }
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    role,
    createdAt: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  await saveUsers(users);
  return { success: true };
}

export async function updateUser(id: string, username: string, password?: string, role?: 'admin' | 'user') {
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return { success: false, message: '用户不存在' };
  }
  if (users.find(u => u.username === username && u.id !== id)) {
    return { success: false, message: '用户名已存在' };
  }
  users[userIndex].username = username;
  if (password) users[userIndex].password = password;
  if (role) users[userIndex].role = role;
  await saveUsers(users);
  return { success: true };
}

export async function deleteUser(id: string) {
  let users = await getUsers();
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userToDelete = users.find(u => u.id === id);
  
  if (userToDelete?.role === 'admin' && adminCount <= 1) {
    return { success: false, message: '至少需要保留一个管理员账号' };
  }
  
  users = users.filter(u => u.id !== id);
  await saveUsers(users);
  return { success: true };
}
