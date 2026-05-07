const { Pool } = require('pg');

class Database {
  static #instance = null;

  #pool = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Используйте Database.getInstance() для получения экземпляра');
    }

    this.#pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'trajectory'
    });

    console.log('Database pool created');
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.#pool.query(text, params);
      const duration = Date.now() - start;

      if (duration > 100) {
        console.warn('Slow query:', { text: text.substring(0, 100), duration, rows: res.rowCount });
      }
      
      return res;
    } catch (err) {
      console.error('Database query error:', {
        text: text.substring(0, 200),
        error: err.message
      });
      throw err;
    }
  }

  async transaction(callback) {
    const client = await this.#pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async getClient() {
    return await this.#pool.connect();
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as time');
      console.log('Database connection successful:', result.rows[0].time);
      return true;
    } catch (err) {
      console.error('Database connection failed:', err.message);
      return false;
    }
  }

  async close() {
    if (this.#pool) {
      await this.#pool.end();
      console.log('Database pool closed');
    }
  }
}

module.exports = Database;