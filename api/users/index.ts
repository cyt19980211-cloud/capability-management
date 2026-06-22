import { getUsers, addUser, verifyToken, requireAdmin } from '../_lib/auth';

const headers = { 
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401, headers });
  }

  const authResult = await verifyToken(token);
  if (!authResult.success) {
    return new Response(JSON.stringify({ success: false, message: '登录已过期' }), { status: 401, headers });
  }

  try {
    if (req.method === 'GET') {
      const users = await getUsers();
      return new Response(JSON.stringify({ 
        success: true, 
        users: users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })) 
      }), { status: 200, headers });
    }

    if (req.method === 'POST') {
      if (!requireAdmin(authResult.payload)) {
        return new Response(JSON.stringify({ success: false, message: '无权限，仅管理员可操作' }), { status: 403, headers });
      }
      
      const { username, password, role } = await req.json();
      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: '用户名和密码不能为空' }), { status: 400, headers });
      }
      const result = await addUser(username, password, role || 'user');
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers });
    }

    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), { status: 405, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误' }), { status: 500, headers });
  }
}
