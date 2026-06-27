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
      // 1. KV에서 계정 조회
      const storedHashedPassword = await kv.get(`auth:${id}`);
      let isAuthenticated = false;

      if (storedHashedPassword) {
        const inputHashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (inputHashedPassword === storedHashedPassword) {
          isAuthenticated = true;
        }
      } else {
        // Fallback: Vercel 환경변수 (기존 사용자를 위한 하위 호환성)
        const authorizedUsersRaw = process.env.AUTHORIZED_USERS || '';
        const users = {};
        authorizedUsersRaw.split(',').forEach(pair => {
          const [uid, upw] = pair.split(':').map(s => s.trim());
          if (uid && upw) {
            users[uid] = upw;
          }
        });

        if (!process.env.AUTHORIZED_USERS) {
          users['admin'] = '1234';
        }

        if (users[id] && users[id] === password) {
          isAuthenticated = true;
          // 자동으로 KV로 마이그레이션 (옵션)
          const newHashed = crypto.createHash('sha256').update(password).digest('hex');
          await kv.set(`auth:${id}`, newHashed);
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
