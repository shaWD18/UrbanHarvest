const jwt = require('jsonwebtoken');

// Hardcoded matching the backend
const JWT_SECRET = 'urban-harvest-secret-key-change-in-production';
const BASE_URL = 'http://localhost:3000/api';

async function verifyWithGeneratedToken() {
    console.log("1. Generating Admin Token...");
    // Create a token for a fake admin user
    const adminUser = { id: 1, email: 'admin@urban.com', role: 'admin' };
    const token = jwt.sign(
        adminUser,
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log("   Token generated successfully.");

    console.log("2. Fetching Subscribers for Subscription ID 8 (Microgreens)...");
    try {
        const res = await fetch(`${BASE_URL}/subscriptions/8/subscribers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error(`   Fetch failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error("   Response:", text);
            return;
        }

        const data = await res.json();
        console.log(`   Success! Found ${data.length} subscribers.`);
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("   Error:", error.message);
    }
}

verifyWithGeneratedToken();
