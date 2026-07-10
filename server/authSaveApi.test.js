import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthSaveApp } from './app.js';
import { createMemoryAuthSaveRepository } from './repositories/memoryAuthSaveRepository.js';

const JWT_SECRET = 'test-secret';

async function request(app, path, options = {}) {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { status: response.status, body };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('register hashes password and rejects duplicate usernames', async () => {
  const repository = createMemoryAuthSaveRepository();
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET });

  const first = await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'zephy', password: 'secret123' },
  });

  assert.equal(first.status, 201);
  assert.equal(first.body.user.username, 'zephy');
  assert.equal(typeof first.body.token, 'string');
  assert.notEqual(repository.users[0].password_hash, 'secret123');

  const duplicate = await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'zephy', password: 'another-secret' },
  });

  assert.equal(duplicate.status, 409);
});

test('login returns token for valid credentials and rejects invalid password', async () => {
  const repository = createMemoryAuthSaveRepository();
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET });

  await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'rina', password: 'secret123' },
  });

  const badLogin = await request(app, '/api/auth/login', {
    method: 'POST',
    body: { username: 'rina', password: 'wrong' },
  });
  assert.equal(badLogin.status, 401);

  const goodLogin = await request(app, '/api/auth/login', {
    method: 'POST',
    body: { username: 'rina', password: 'secret123' },
  });
  assert.equal(goodLogin.status, 200);
  assert.equal(goodLogin.body.user.username, 'rina');
  assert.equal(typeof goodLogin.body.token, 'string');
});

test('authenticated user can upsert and load only their own main save', async () => {
  const repository = createMemoryAuthSaveRepository();
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET });

  const userA = await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'budi', password: 'secret123' },
  });
  const userB = await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'siti', password: 'secret123' },
  });

  const unauthorized = await request(app, '/api/save');
  assert.equal(unauthorized.status, 401);

  const save = await request(app, '/api/save', {
    method: 'POST',
    headers: { authorization: `Bearer ${userA.body.token}` },
    body: {
      gameState: { dayNumber: 7, money: 123456, happiness: 64, memberCount: 3 },
    },
  });
  assert.equal(save.status, 200);
  assert.equal(save.body.save.dayNumber, 7);

  const loadedA = await request(app, '/api/save', {
    headers: { authorization: `Bearer ${userA.body.token}` },
  });
  assert.equal(loadedA.status, 200);
  assert.equal(loadedA.body.hasSave, true);
  assert.equal(loadedA.body.save.gameState.money, 123456);

  const loadedB = await request(app, '/api/save', {
    headers: { authorization: `Bearer ${userB.body.token}` },
  });
  assert.equal(loadedB.status, 200);
  assert.equal(loadedB.body.hasSave, false);
});

test('authenticated user can keep separate auto and manual save slots', async () => {
  const repository = createMemoryAuthSaveRepository();
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET });

  const user = await request(app, '/api/auth/register', {
    method: 'POST',
    body: { username: 'dewi', password: 'secret123' },
  });
  const headers = { authorization: `Bearer ${user.body.token}` };

  const autoSave = await request(app, '/api/save', {
    method: 'POST',
    headers,
    body: {
      saveName: 'Auto Save',
      gameState: { dayNumber: 3, money: 300000, happiness: 52, memberCount: 1 },
    },
  });
  assert.equal(autoSave.status, 200);
  assert.equal(autoSave.body.save.saveName, 'Auto Save');

  const manualSave = await request(app, '/api/save', {
    method: 'POST',
    headers,
    body: {
      saveName: 'Manual Save',
      gameState: { dayNumber: 5, money: 500000, happiness: 70, memberCount: 2 },
    },
  });
  assert.equal(manualSave.status, 200);
  assert.equal(manualSave.body.save.saveName, 'Manual Save');

  const loaded = await request(app, '/api/save', { headers });

  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.hasSave, true);
  assert.equal(loaded.body.saves.auto.gameState.dayNumber, 3);
  assert.equal(loaded.body.saves.manual.gameState.dayNumber, 5);
  assert.equal(loaded.body.saveSlots.length, 2);
});

test('google auth creates a user from a verified firebase token', async () => {
  const repository = createMemoryAuthSaveRepository();
  const firebaseAuth = {
    verifyIdToken: async (idToken) => {
      assert.equal(idToken, 'valid-google-token');
      return {
        uid: 'google-uid-1',
        email: 'player@example.com',
        name: 'Player Satu',
        picture: 'https://example.com/avatar.png',
      };
    },
  };
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET, firebaseAuth });

  const response = await request(app, '/api/auth/google', {
    method: 'POST',
    body: { idToken: 'valid-google-token' },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.username, 'player');
  assert.equal(response.body.user.email, 'player@example.com');
  assert.equal(response.body.user.authProvider, 'google');
  assert.equal(typeof response.body.token, 'string');
  assert.equal(repository.users.length, 1);
  assert.equal(repository.users[0].google_uid, 'google-uid-1');
});

test('google auth reuses an existing google user', async () => {
  const repository = createMemoryAuthSaveRepository();
  const firebaseAuth = {
    verifyIdToken: async () => ({
      uid: 'google-uid-2',
      email: 'same@example.com',
      name: 'Same Player',
    }),
  };
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET, firebaseAuth });

  const first = await request(app, '/api/auth/google', {
    method: 'POST',
    body: { idToken: 'first-token' },
  });
  const second = await request(app, '/api/auth/google', {
    method: 'POST',
    body: { idToken: 'second-token' },
  });

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(repository.users.length, 1);
  assert.equal(first.body.user.id, second.body.user.id);
});

test('google auth rejects an invalid firebase token', async () => {
  const repository = createMemoryAuthSaveRepository();
  const firebaseAuth = {
    verifyIdToken: async () => {
      throw new Error('invalid token');
    },
  };
  const app = createAuthSaveApp({ repository, jwtSecret: JWT_SECRET, firebaseAuth });

  const response = await request(app, '/api/auth/google', {
    method: 'POST',
    body: { idToken: 'bad-token' },
  });

  assert.equal(response.status, 401);
  assert.equal(repository.users.length, 0);
});
