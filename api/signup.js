import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { id, password } = req.body;

  if (!id || !password || id.length < 3 || password.length < 4) {
    return res.status(400).json({ success: false, error: '아이디는 3자 이상, 비밀번호는 4자 이상이어야 합니다.' });
  }

  // Promise 체이닝이나 async/await을 Vercel Serverless Function에서 사용
  return (async () => {
    try {
      const existingUser = await kv.get(`auth:${id}`);
      if (existingUser) {
        return res.status(409).json({ success: false, error: '이미 존재하는 아이디입니다.' });
      }

      // 비밀번호 해싱 (보안)
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // 계정 정보 저장
      await kv.set(`auth:${id}`, hashedPassword);

      // 사용자 초기 데이터 셋업
      const initialData = {
        skills: [],
        profile: { name: id, job: '', company: '', bio: '' },
        plan: { type: 'BASIC', usage: 0 }
      };
      await kv.set(`user_data:${id}`, initialData);

      return res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
  })();
}
