const fs = require('fs');
fs.appendFileSync('E:\\Desktop\\healmed\\styles.css', fs.readFileSync('E:\\Desktop\\healmed\\faq-bubble.css','utf8'));
console.log('done');
