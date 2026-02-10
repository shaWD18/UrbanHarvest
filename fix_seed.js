const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'BackEnd', 'seed.sql');
let content = fs.readFileSync(seedPath, 'utf8');

const marker = "(8, '09:30 AM', 'Closing Reflection and Tea', 3);";
const idx = content.indexOf(marker);

if (idx !== -1) {
    // Keep content up to the marker + marker length
    const cleanContent = content.substring(0, idx + marker.length) + "\n\n-- ============================================\n-- END OF SEED DATA\n-- ============================================\n";
    fs.writeFileSync(seedPath, cleanContent, 'utf8');
    console.log('Successfully cleaned seed.sql');
} else {
    console.error('Marker not found!');
    process.exit(1);
}
