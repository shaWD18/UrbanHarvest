const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'urban_harvest',
    multipleStatements: true
};

async function loadSeedData() {
    let connection;
    try {
        console.log('🌱 Starting database seeding...');
        console.log('🔌 Connecting to MySQL database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('📂 Connected to database');

        // Disable foreign keys check
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        // Drop existing tables
        console.log('🗑️  Dropping existing tables...');
        const tables = [
            'workshop_testimonials', 'workshop_reviews', 'workshop_registrations', 'workshop_learning_outcomes',
            'workshop_bookings', 'workshop_agenda', 'user_subscriptions', 'subscription_variants',
            'push_subscriptions', 'subscription_specifications', 'subscription_reviews', 'subscription_plans', 'subscription_features',
            'product_specifications', 'product_reviews', 'product_features', 'order_items',
            'orders', 'event_speakers', 'event_highlights', 'event_bookings', 'event_agenda',
            'subscriptions', 'workshops', 'instructors', 'products', 'users', 'events'
        ];

        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        }
        console.log('✅ Tables dropped');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'mysql_schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log('🏗️  Applying database schema...');
        await connection.query(schemaSQL);
        console.log('✅ Schema applied successfully');

        // Read and execute seed data
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        console.log('📥 Loading seed data from seed.sql...');
        await connection.query(seedSQL);
        console.log('✅ Seed data loaded successfully!');

        // Verify data
        const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [instructorCount] = await connection.query('SELECT COUNT(*) as count FROM instructors');
        const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
        const [eventCount] = await connection.query('SELECT COUNT(*) as count FROM events');
        const [workshopCount] = await connection.query('SELECT COUNT(*) as count FROM workshops');

        console.log('\n📊 Database Summary:');
        console.log(`   Users: ${userCount[0].count}`);
        console.log(`   Instructors: ${instructorCount[0].count}`);
        console.log(`   Products: ${productCount[0].count}`);
        console.log(`   Events: ${eventCount[0].count}`);
        console.log(`   Workshops: ${workshopCount[0].count}`);

    } catch (error) {
        console.error('❌ Error loading seed data:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.query('SET FOREIGN_KEY_CHECKS=1');
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

loadSeedData();
