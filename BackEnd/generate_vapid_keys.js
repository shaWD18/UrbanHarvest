const webpush = require('web-push');

// Generate VAPID keys for push notifications
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 VAPID Keys Generated!\n');
console.log('Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=your-email@example.com`);
console.log('\n✅ Copy these values to your .env file');
