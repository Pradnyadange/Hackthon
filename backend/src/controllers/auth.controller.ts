import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'edumatrix_super_secret_jwt_key_2026_safe';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'edumatrix_super_secret_refresh_jwt_key_2026_safe';

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password, passcode, securityPasscode } = req.body;
      const targetPasscode = (passcode || securityPasscode || '').trim();

      let user = null;

      if (targetPasscode) {
        user = await prisma.user.findFirst({
          where: { securityPasscode: targetPasscode }
        });
        if (!user) {
          return res.status(401).json({ message: 'Invalid or unauthorized Admin Security Passcode.' });
        }
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password (or Secret Security Passcode) are required.' });
        }

        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful',
        user: tokenPayload,
        token,
        refreshToken
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async loginWithPasscode(req: Request, res: Response) {
    try {
      const { passcode, securityPasscode } = req.body;
      const code = (passcode || securityPasscode || '').trim();

      if (!code) {
        return res.status(400).json({ message: 'Secret Security Passcode is required.' });
      }

      const user = await prisma.user.findFirst({
        where: { securityPasscode: code }
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid or unauthorized Admin Security Passcode.' });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Passcode authentication successful',
        user: tokenPayload,
        token,
        refreshToken
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role || 'SCHOOL_ADMIN';

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: userRole
        }
      });

      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      return res.status(201).json({
        message: 'User registered successfully',
        user: tokenPayload,
        token
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      return res.json({ token });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
  }

  public static async me(req: any, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return res.json({ user });
  }
}
