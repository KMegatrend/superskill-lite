import { kv } from '@vercel/kv';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_fallback_secret_key';

function getUserIdFromReq(req) {
  const cookieHeader = req.headers.cookie || '';
  const tokenMatch = cookieHeader.match(/site_auth=([^;]+)/);
  if (tokenMatch) {
    try {
      const decoded = jwt.verify(tokenMatch[1], JWT_SECRET);
      return decoded.userId;
    } catch(err) {}
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const userId = getUserIdFromReq(req);
  if (!userId || (userId !== 'master' && userId !== 'admin')) {
    return res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
  }

  try {
    // KV에서 user_data_* 키를 모두 스캔합니다.
    const keys = await kv.keys('user_data_*');
    const users = [];

    if (keys && keys.length > 0) {
      const allData = await kv.mget(...keys);
      for (let i = 0; i < keys.length; i++) {
        const id = keys[i].replace('user_data_', '');
        users.push({
          id,
          data: allData[i] || { profile: {}, plan: { type: 'BASIC', usage: 0 } }
        });
      }
    }

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('Admin API Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin data' });
  }
}
