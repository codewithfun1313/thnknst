const fs = require('fs');
const lines = fs.readFileSync('E:\\Desktop\\healmed\\styles.css','utf8').split('\n');
for(let i=3055; i<3095 && i<lines.length; i++) {
  console.log((i+1)+': '+lines[i]);
}
