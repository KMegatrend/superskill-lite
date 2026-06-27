import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_fallback_secret_key';

export default function handler(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const tokenMatch = cookieHeader.match(/site_auth=([^;]+)/);
  
  if (tokenMatch) {
    try {
      const decoded = jwt.verify(tokenMatch[1], JWT_SECRET);
      return res.status(200).json({ authenticated: true, userId: decoded.userId });
    } catch(err) {
      // Invalid or expired token
    }
  }
  
  return res.status(401).json({ authenticated: false });
}
