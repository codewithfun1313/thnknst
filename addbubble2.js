const fs = require('fs');
let s = fs.readFileSync('E:\\Desktop\\healmed\\index.html','utf8');
if(s.indexOf('faq-bubble') === -1){
  const bubble = "\n<a class=\"faq-bubble\" href=\"faq.html\" aria-label=\"Open FAQs\"><span class=\"faq-bubble-icon\"><i class=\"fa-solid fa-question\"></i></span><span class=\"faq-bubble-text\">FAQs</span></a>\n";
  s = s.replace('</body>', bubble + '</body>');
  fs.writeFileSync('E:\\Desktop\\healmed\\index.html', s);
  console.log('added');
} else {
  console.log('exists');
}
