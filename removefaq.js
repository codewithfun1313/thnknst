const fs = require('fs');
const files = ['index.html','about.html','contact.html','weight-loss.html','weight-gain.html','diabetes-nutrition.html','pcod-pcos-nutrition.html','cardiovascular-health.html','pregnancy-post-pregnancy-nutrition.html','faq.html'];
files.forEach(f => {
  const p = 'E:\\Desktop\\healmed\\' + f;
  if(!fs.existsSync(p)) return;
  let s = fs.readFileSync(p,'utf8');
  const re = /\n<a class="faq-bubble"[^>]*>[\s\S]*?<\/a>\n/g;
  if(re.test(s)){
    s = s.replace(re, '\n');
    fs.writeFileSync(p, s);
    console.log('removed', f);
  }
});
console.log('done');
