import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'technophilia-admin-secret-key-2026';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = '123456';

export function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateAdminToken(email) {
  if (email !== ADMIN_EMAIL) return null;
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export function validateAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export const adminAuthMiddleware = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = verifyAdminToken(token);
      if (!decoded || decoded.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.admin = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
