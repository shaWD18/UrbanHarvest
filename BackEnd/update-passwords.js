const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./urban_harvest.db');

async function updatePasswords() {
    try {
        console.log('🔐 Updating user passwords...');

        // Hash the passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);

        console.log('Admin hash:', adminHash);
        console.log('Customer hash:', customerHash);

        // Update admin password
        db.run(
            'UPDATE users SET password = ? WHERE email = ?',
            [adminHash, 'admin@urban.com'],
            function (err) {
                if (err) {
                    console.error('❌ Error updating admin password:', err);
                } else {
                    console.log('✅ Admin password updated');
                }
            }
        );

        // Update customer password
        db.run(
            'UPDATE users SET password = ? WHERE email = ?',
            [customerHash, 'customer@example.com'],
            function (err) {
                if (err) {
                    console.error('❌ Error updating customer password:', err);
                } else {
                    console.log('✅ Customer password updated');
                }

                // Close database after last update
                db.close(() => {
                    console.log('✅ Password update complete!');
                    console.log('You can now login with:');
                    console.log('  Admin: admin@urban.com / admin123');
                    console.log('  Customer: customer@example.com / customer123');
                });
            }
        );

    } catch (error) {
        console.error('❌ Error:', error);
        db.close();
    }
}

updatePasswords();
