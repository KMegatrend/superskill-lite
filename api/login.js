import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_fallback_secret_key';

export default function handler(req, res) {
  // 오직 POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ success: false, error: '아이디와 비밀번호를 모두 입력해주세요.' });
  }

  return (async () => {
    try {
      // 1. KV에서 계정 조회 시도 (에러 발생 시 fallback으로 넘어감)
      let storedHashedPassword = null;
      try {
        storedHashedPassword = await kv.get(`auth:${id}`);
      } catch (kvError) {
        console.warn("KV Database not connected. Falling back to hardcoded users.");
      }
      
      let isAuthenticated = false;

      if (storedHashedPassword) {
        const inputHashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (inputHashedPassword === storedHashedPassword) {
          isAuthenticated = true;
        }
      } else {
        // Fallback: 하드코딩된 유저 및 Vercel 환경변수
        const users = {
          'master': 'wotjdWkd@@1',
          'member01': '@@2237'
        };
        
        // 환경변수에 설정된 사용자가 있다면 추가
        const authorizedUsersRaw = process.env.AUTHORIZED_USERS || '';
        authorizedUsersRaw.split(',').forEach(pair => {
          const [uid, upw] = pair.split(':').map(s => s.trim());
          if (uid && upw) {
            users[uid] = upw;
          }
        });

        if (users[id] && users[id] === password) {
          isAuthenticated = true;
          // 자동으로 KV로 마이그레이션 (옵션 - KV가 연결되어 있을 때만)
          try {
            const newHashed = crypto.createHash('sha256').update(password).digest('hex');
            await kv.set(`auth:${id}`, newHashed);
          } catch (e) {
            // KV 연결 안됨 무시
          }
        }
      }

      if (isAuthenticated) {
        const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '1d' });
        res.setHeader('Set-Cookie', `site_auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
  })();
}
