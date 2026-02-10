

const BASE_URL = 'http://localhost:3000/api';

async function verifyAdminAccess() {
    console.log("1. Logging in as Admin...");
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@urban.com',
                password: 'admin' // Assuming default seed password
            })
        });

        if (!loginRes.ok) {
            console.error("Login failed:", await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("   Success! Token received.\n");

        console.log("2. Fetching Subscribers for Subscription ID 8 (Microgreens)...");
        const subRes = await fetch(`${BASE_URL}/subscriptions/8/subscribers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!subRes.ok) {
            console.error("   Fetch failed:", await subRes.text());
            return;
        }

        const subscribers = await subRes.json();
        console.log(`   Success! Found ${subscribers.length} subscribers.`);
        console.log(JSON.stringify(subscribers, null, 2));

    } catch (error) {
        console.error("Error during verification:", error);
    }
}

verifyAdminAccess();
