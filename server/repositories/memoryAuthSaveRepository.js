import crypto from 'node:crypto';

export function createMemoryAuthSaveRepository() {
  const repository = {
    users: [],
    saves: [],

    async findUserByUsername(username) {
      return repository.users.find((user) => user.username === username) || null;
    },

    async findUserById(id) {
      return repository.users.find((user) => user.id === id) || null;
    },

    async findUserByGoogleUid(googleUid) {
      return repository.users.find((user) => user.google_uid === googleUid) || null;
    },

    async createUser({ username, passwordHash, authProvider = 'password', googleUid = null, email = null, displayName = null, avatarUrl = null }) {
      const user = {
        id: crypto.randomUUID(),
        username,
        password_hash: passwordHash || null,
        auth_provider: authProvider,
        google_uid: googleUid,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      repository.users.push(user);
      return user;
    },

    async createGoogleUser({ username, googleUid, email, displayName, avatarUrl }) {
      return repository.createUser({
        username,
        authProvider: 'google',
        googleUid,
        email,
        displayName,
        avatarUrl,
      });
    },

    async findSavesByUserId(userId) {
      return repository.saves.filter((save) => save.user_id === userId);
    },

    async findMainSaveByUserId(userId) {
      return repository.saves.find((save) => save.user_id === userId && save.save_name === 'Main Save') || null;
    },

    async upsertSave({ userId, saveName = 'Auto Save', gameState, dayNumber, money, happiness, memberCount }) {
      const existingSave = repository.saves.find((save) => save.user_id === userId && save.save_name === saveName);
      const payload = {
        save_name: saveName,
        game_state: gameState,
        day_number: dayNumber,
        money,
        happiness,
        member_count: memberCount,
        updated_at: new Date().toISOString(),
      };

      if (existingSave) {
        Object.assign(existingSave, payload);
        return existingSave;
      }

      const save = {
        id: crypto.randomUUID(),
        user_id: userId,
        save_name: 'Main Save',
        created_at: new Date().toISOString(),
        ...payload,
      };
      repository.saves.push(save);
      return save;
    },

    async deleteMainSave(userId) {
      repository.saves = repository.saves.filter((save) => !(save.user_id === userId && save.save_name === 'Main Save'));
    },

    async upsertMainSave(payload) {
      return repository.upsertSave({ ...payload, saveName: 'Main Save' });
    },

    async deleteSave(userId, saveName = 'Auto Save') {
      repository.saves = repository.saves.filter((save) => !(save.user_id === userId && save.save_name === saveName));
    },
  };

  return repository;
}
