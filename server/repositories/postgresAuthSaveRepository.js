export function createPostgresAuthSaveRepository(pool) {
  return {
    async findUserByUsername(username) {
      const result = await pool.query(
        'select * from app_users where username = $1 limit 1',
        [username]
      );
      return result.rows[0] || null;
    },

    async findUserById(id) {
      const result = await pool.query(
        'select * from app_users where id = $1 limit 1',
        [id]
      );
      return result.rows[0] || null;
    },

    async createUser({ username, passwordHash }) {
      const result = await pool.query(
        `insert into app_users (username, password_hash)
         values ($1, $2)
         returning *`,
        [username, passwordHash]
      );
      return result.rows[0];
    },

    async findMainSaveByUserId(userId) {
      const result = await pool.query(
        `select * from game_saves
         where user_id = $1 and save_name = 'Main Save'
         limit 1`,
        [userId]
      );
      return result.rows[0] || null;
    },

    async upsertMainSave({ userId, gameState, dayNumber, money, happiness, memberCount }) {
      const result = await pool.query(
        `insert into game_saves (
           user_id, save_name, game_state, day_number, money, happiness, member_count
         )
         values ($1, 'Main Save', $2::jsonb, $3, $4, $5, $6)
         on conflict (user_id, save_name)
         do update set
           game_state = excluded.game_state,
           day_number = excluded.day_number,
           money = excluded.money,
           happiness = excluded.happiness,
           member_count = excluded.member_count,
           updated_at = now()
         returning *`,
        [userId, JSON.stringify(gameState), dayNumber, money, happiness, memberCount]
      );
      return result.rows[0];
    },

    async deleteMainSave(userId) {
      await pool.query(
        `delete from game_saves
         where user_id = $1 and save_name = 'Main Save'`,
        [userId]
      );
    },
  };
}
