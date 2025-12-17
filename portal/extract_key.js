
const fs = require('fs');
try {
    const env = fs.readFileSync('.env', 'utf8');
    const match = env.match(/ANON_KEY="(.*)"/);
    if (match) {
        fs.writeFileSync('key.txt', match[1]);
        console.log('Key extracted');
    } else {
        console.log('Key not found');
    }
} catch (e) {
    console.error(e);
}
