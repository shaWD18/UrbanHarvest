const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkBookings() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'urban_harvest_db'
    });

    try {
        console.log('--- Event Bookings ---');
        const [bookings] = await connection.execute('SELECT * FROM event_bookings');
        console.table(bookings);

        console.log('\n--- Events ---');
        const [events] = await connection.execute('SELECT id, title, slots FROM events');
        console.table(events);

        console.log('\n--- Users ---');
        const [users] = await connection.execute('SELECT id, name, email, role FROM users');
        console.table(users);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkBookings();
