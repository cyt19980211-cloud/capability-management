import { updateUser, deleteUser, verifyToken, requireAdmin } from '../_lib/auth';

const headers = { 
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

export default async function handler(req: Request, { params }: { params: { id: string } }) {
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

  if (!requireAdmin(authResult.payload)) {
    return new Response(JSON.stringify({ success: false, message: '无权限，仅管理员可操作' }), { status: 403, headers });
  }

  const userId = params.id;

  try {
    if (req.method === 'PUT') {
      const { username, password, role } = await req.json();
      if (!username) {
        return new Response(JSON.stringify({ success: false, message: '用户名不能为空' }), { status: 400, headers });
      }
      const result = await updateUser(userId, username, password, role);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers });
    }

    if (req.method === 'DELETE') {
      if (userId === authResult.payload.userId) {
        return new Response(JSON.stringify({ success: false, message: '不能删除当前登录的账号' }), { status: 400, headers });
      }
      const result = await deleteUser(userId);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers });
    }

    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), { status: 405, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误' }), { status: 500, headers });
  }
}
