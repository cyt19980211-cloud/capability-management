import { authenticateUser } from './_lib/auth';

export default async function handler(req: Request) {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: '用户名和密码不能为空' }), {
        status: 400,
        headers,
      });
    }

    const result = await authenticateUser(username, password);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 401,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误' }), {
      status: 500,
      headers,
    });
  }
}
