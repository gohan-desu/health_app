// test-db.js
const pool = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('MySQL 接続成功:', rows[0].result);
    } catch (error) {
        console.error('MySQL 接続エラー:', error.message);
    } finally {
        pool.end();
    }
}

testConnection();
