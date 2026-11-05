const fs = require('fs');
const files = ['about.html','contact.html','weight-loss.html','weight-gain.html','diabetes-nutrition.html','pcod-pcos-nutrition.html','cardiovascular-health.html','pregnancy-post-pregnancy-nutrition.html','faq.html'];
const bubble = "\n<a class=\"faq-bubble\" href=\"faq.html\" aria-label=\"Open FAQs\"><span class=\"faq-bubble-icon\"><i class=\"fa-solid fa-question\"></i></span><span class=\"faq-bubble-text\">FAQs</span></a>\n";
files.forEach(f => {
  const p = 'E:\\Desktop\\healmed\\' + f;
  if(!fs.existsSync(p)) return;
  let s = fs.readFileSync(p,'utf8');
  if(s.indexOf('faq-bubble') === -1){
    s = s.replace('</body>', bubble + '</body>');
    fs.writeFileSync(p, s);
    console.log('added to', f);
  }
});
console.log('done');
