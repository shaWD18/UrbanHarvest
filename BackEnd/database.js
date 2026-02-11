require('dotenv').config();
const mysql = require('mysql2/promise');

let pool = null;
let dbWrapper = null;

// Wrapper class to mimic SQLite API for compatibility with existing server.js
class DatabaseWrapper {
    constructor(pool) {
        this.pool = pool;
    }

    // Execute a query and return the first row (mimics db.get)
    async get(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows[0];
    }

    // Execute a query and return all rows (mimics db.all)
    async all(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }

    // Execute a query and return metadata (mimics db.run)
    // Returns { lastID, changes }
    async run(sql, params = []) {
        const [result] = await this.pool.execute(sql, params);
        return {
            lastID: result.insertId,
            changes: result.affectedRows
        };
    }

    // Execute raw SQL (mimics db.exec)
    async exec(sql) {
        // mysql2 doesn't support multiple statements by default in execute/query unless enabled
        // For schema loading typically separate connections are used, but for general exec:
        return this.pool.query(sql);
    }
}

async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
            user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
            password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
            database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'urbanharvestdb',
            port: process.env.MYSQLPORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Verify connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database');
        connection.release();

        dbWrapper = new DatabaseWrapper(pool);
        return dbWrapper;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
}

function getDatabase() {
    if (!dbWrapper) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return dbWrapper;
}

module.exports = {
    initializeDatabase,
    getDatabase
};
