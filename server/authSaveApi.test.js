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
