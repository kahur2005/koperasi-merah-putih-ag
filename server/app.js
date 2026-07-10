import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRES_IN = '7d';

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
  };
}

function signToken(user, jwtSecret) {
  return jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

function authMiddleware(repository, jwtSecret) {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [, token] = header.match(/^Bearer (.+)$/) || [];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      const user = await repository.findUserById(payload.sub);
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      req.user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

function summarizeGameState(gameState) {
  return {
    dayNumber: Number.isFinite(gameState?.dayNumber) ? gameState.dayNumber : null,
    money: Number.isFinite(gameState?.money) ? gameState.money : null,
    happiness: Number.isFinite(gameState?.happiness) ? gameState.happiness : null,
    memberCount: Number.isFinite(gameState?.memberCount) ? gameState.memberCount : null,
  };
}

export function createAuthSaveApp({ repository, jwtSecret, clientOrigin = '*' }) {
  if (!repository) throw new Error('repository is required');
  if (!jwtSecret) throw new Error('jwtSecret is required');

  const app = express();
  app.use(cors({ origin: clientOrigin === '*' ? true : clientOrigin }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/register', async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (username.length < 3 || password.length < 6) {
      res.status(400).json({ error: 'Username minimal 3 karakter dan password minimal 6 karakter.' });
      return;
    }

    const existingUser = await repository.findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ error: 'Username sudah digunakan.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await repository.createUser({ username, passwordHash });
    const token = signToken(user, jwtSecret);

    res.status(201).json({ user: publicUser(user), token });
  });

  app.post('/api/auth/login', async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const user = await repository.findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Username atau password salah.' });
      return;
    }

    res.json({ user: publicUser(user), token: signToken(user, jwtSecret) });
  });

  const requireAuth = authMiddleware(repository, jwtSecret);

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  app.get('/api/save', requireAuth, async (req, res) => {
    const save = await repository.findMainSaveByUserId(req.user.id);
    if (!save) {
      res.json({ hasSave: false, save: null });
      return;
    }

    res.json({
      hasSave: true,
      save: {
        id: save.id,
        saveName: save.save_name,
        gameState: save.game_state,
        dayNumber: save.day_number,
        money: save.money === null ? null : Number(save.money),
        happiness: save.happiness === null ? null : Number(save.happiness),
        memberCount: save.member_count,
        updatedAt: save.updated_at,
      },
    });
  });

  app.post('/api/save', requireAuth, async (req, res) => {
    const gameState = req.body?.gameState;
    if (!gameState || typeof gameState !== 'object' || Array.isArray(gameState)) {
      res.status(400).json({ error: 'gameState wajib berupa object.' });
      return;
    }

    const save = await repository.upsertMainSave({
      userId: req.user.id,
      gameState,
      ...summarizeGameState(gameState),
    });

    res.json({
      save: {
        id: save.id,
        saveName: save.save_name,
        dayNumber: save.day_number,
        money: save.money === null ? null : Number(save.money),
        happiness: save.happiness === null ? null : Number(save.happiness),
        memberCount: save.member_count,
        updatedAt: save.updated_at,
      },
    });
  });

  app.delete('/api/save', requireAuth, async (req, res) => {
    await repository.deleteMainSave(req.user.id);
    res.status(204).end();
  });

  return app;
}
