const pool = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, semester, password_hash, created_at FROM users WHERE email = ?',
    [email]
  );

  return rows[0] || null;
}

async function findPublicUserById(userId) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, semester, created_at FROM users WHERE id = ?',
    [userId]
  );

  return rows[0] || null;
}

async function createUserWithPreferences(name, email, passwordHash) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    await connection.execute(
      'INSERT INTO notification_preferences (user_id) VALUES (?)',
      [userResult.insertId]
    );

    const [rows] = await connection.execute(
      'SELECT id, name, email, semester, created_at FROM users WHERE id = ?',
      [userResult.insertId]
    );

    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateUser(userId, name, semester) {
  const [result] = await pool.execute(
    'UPDATE users SET name = ?, semester = ? WHERE id = ?',
    [name, semester, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findPublicUserById(userId);
}

module.exports = {
  findUserByEmail,
  findPublicUserById,
  createUserWithPreferences,
  updateUser
};
