export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // 로그아웃 시 쿠키 무효화 (만료 시간을 과거로 설정하고 값을 비움)
  res.setHeader('Set-Cookie', 'site_auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.status(200).json({ success: true });
}
