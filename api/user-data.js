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
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login again.' });
  }

  const kvKey = `user_data_${userId}`;

  // 데이터 로드
  if (req.method === 'GET') {
    try {
      const data = await kv.get(kvKey) || {
        skills: [],
        profile: { name: userId, job: '사용자', company: '', bio: '반갑습니다.' },
        plan: { type: 'BASIC', usage: 0 }
      };
      return res.status(200).json({ success: true, userId, data });
    } catch (err) {
      console.error(err);
      // KV 설정이 안된 경우 개발 편의를 위해 임시 데이터 반환 (실패 메시지와 함께)
      return res.status(500).json({ success: false, error: 'KV DB not configured', detail: err.message });
    }
  }

  // 데이터 저장
  if (req.method === 'POST') {
    try {
      const { type, payload } = req.body;
      let currentData = await kv.get(kvKey) || { skills: [], profile: {}, plan: { type: 'BASIC', usage: 0 } };
      
      if (type === 'profile') currentData.profile = payload;
      else if (type === 'skills') currentData.skills = payload;
      else if (type === 'plan') currentData.plan = payload;
      else if (type === 'all') currentData = payload;

      await kv.set(kvKey, currentData);
      return res.status(200).json({ success: true, data: currentData });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'KV DB Save error', detail: err.message });
    }
  }
  
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
