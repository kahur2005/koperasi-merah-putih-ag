import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRES_IN = '7d';
const SAVE_NAMES = {
  AUTO: 'Auto Save',
  MANUAL: 'Manual Save',
  LEGACY: 'Main Save',
};

function normalizeSaveName(value) {
  if (value === SAVE_NAMES.MANUAL) return SAVE_NAMES.MANUAL;
  if (value === SAVE_NAMES.LEGACY) return SAVE_NAMES.LEGACY;
  return SAVE_NAMES.AUTO;
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    authProvider: user.auth_provider || 'password',
    email: user.email || null,
    displayName: user.display_name || null,
    avatarUrl: user.avatar_url || null,
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

function usernameBaseFromEmail(email) {
  const [localPart] = String(email || 'google_user').split('@');
  const cleaned = localPart
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || 'google_user';
}

async function createUniqueGoogleUsername(repository, email) {
  const base = usernameBaseFromEmail(email);
  let candidate = base;
  let suffix = 1;

  while (await repository.findUserByUsername(candidate)) {
    suffix += 1;
    candidate = `${base}_${suffix}`;
  }

  return candidate;
}

function formatSave(save, { includeGameState = false } = {}) {
  if (!save) return null;
  return {
    id: save.id,
    saveName: save.save_name,
    ...(includeGameState ? { gameState: save.game_state } : {}),
    dayNumber: save.day_number,
    money: save.money === null ? null : Number(save.money),
    happiness: save.happiness === null ? null : Number(save.happiness),
    memberCount: save.member_count,
    updatedAt: save.updated_at,
  };
}

function buildSavePayload(saves) {
  const auto = saves.find((save) => save.save_name === SAVE_NAMES.AUTO)
    || saves.find((save) => save.save_name === SAVE_NAMES.LEGACY)
    || null;
  const manual = saves.find((save) => save.save_name === SAVE_NAMES.MANUAL) || null;
  const saveSlots = [auto, manual].filter(Boolean).map((save) => formatSave(save, { includeGameState: true }));

  return {
    hasSave: saveSlots.length > 0,
    save: formatSave(auto || manual, { includeGameState: true }),
    saves: {
      auto: formatSave(auto, { includeGameState: true }),
      manual: formatSave(manual, { includeGameState: true }),
    },
    saveSlots,
  };
}

export function createAuthSaveApp({ repository, jwtSecret, clientOrigin = '*', firebaseAuth = null }) {
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

    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Username atau password salah.' });
      return;
    }

    res.json({ user: publicUser(user), token: signToken(user, jwtSecret) });
  });

  app.post('/api/auth/google', async (req, res) => {
    if (!firebaseAuth) {
      res.status(503).json({ error: 'Google login belum dikonfigurasi di server.' });
      return;
    }

    const idToken = String(req.body?.idToken || '').trim();
    if (!idToken) {
      res.status(400).json({ error: 'Firebase ID token wajib dikirim.' });
      return;
    }

    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      const googleUid = decodedToken.uid;
      if (!googleUid) {
        res.status(401).json({ error: 'Token Google tidak valid.' });
        return;
      }

      let user = await repository.findUserByGoogleUid(googleUid);
      if (!user) {
        const username = await createUniqueGoogleUsername(repository, decodedToken.email);
        user = await repository.createGoogleUser({
          username,
          googleUid,
          email: decodedToken.email || null,
          displayName: decodedToken.name || null,
          avatarUrl: decodedToken.picture || null,
        });
      }

      res.json({ user: publicUser(user), token: signToken(user, jwtSecret) });
    } catch {
      res.status(401).json({ error: 'Login Google gagal. Coba ulangi.' });
    }
  });

  const requireAuth = authMiddleware(repository, jwtSecret);

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  app.get('/api/save', requireAuth, async (req, res) => {
    const saves = await repository.findSavesByUserId(req.user.id);
    res.json(buildSavePayload(saves));
  });

  app.post('/api/save', requireAuth, async (req, res) => {
    const gameState = req.body?.gameState;
    if (!gameState || typeof gameState !== 'object' || Array.isArray(gameState)) {
      res.status(400).json({ error: 'gameState wajib berupa object.' });
      return;
    }

    const save = await repository.upsertSave({
      userId: req.user.id,
      saveName: normalizeSaveName(req.body?.saveName),
      gameState,
      ...summarizeGameState(gameState),
    });

    res.json({
      save: formatSave(save),
    });
  });

  app.delete('/api/save', requireAuth, async (req, res) => {
    await repository.deleteSave(req.user.id, normalizeSaveName(req.query?.saveName));
    res.status(204).end();
  });

  return app;
}
