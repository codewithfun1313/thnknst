import re,os

root = r'E:\Desktop\healmed'
with open(os.path.join(root,'index.html'),'r',encoding='utf-8',errors='ignore') as f:
    content = f.read()

# Extract header
h_start = content.find('<header')
h_end = content.find('</header>') + len('</header>')
header = content[h_start:h_end]

# Extract drawer
parts = []
# backdrop
s = content.find('<div class="drawer-backdrop"')
e = content.find('</div>', s) + len('</div>')
parts.append(content[s:e])
# drawer
s = content.find('<aside class="mobile-drawer"')
e = content.find('</aside>') + len('</aside>')
parts.append(content[s:e])
# search
s = content.find('<div class="search-popup"')
# find end of form
e_form = content.find('</form>', s) + len('</form>')
e = content.find('</div>', e_form) + len('</div>')
parts.append(content[s:e])

# Extract faq section
fs = content.find('<section class="section faq-section"')
fe = content.find('</section>', fs) + len('</section>')
faq = content[fs:fe]

# Extract footer
ft_s = content.find('<footer')
ft_e = content.find('</footer>') + len('</footer>')
footer = content[ft_s:ft_e]

html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FAQs | Healmedetox</title>
<meta name="description" content="Frequently asked questions about Healmedetox nutrition programs.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body>

''' + header + '\n\n' + '\n\n'.join(parts) + '\n\n<main>\n  <section class="section" style="padding-top:140px;"><div class="container"><div class="section-heading centered"><span class="eyebrow">FAQs</span><h1 class="section-title">Frequently Asked Questions</h1></div></div></section>\n' + faq + '\n</main>\n\n' + footer + '\n\n<button class="back-top" id="backTop" type="button" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>\n\n<script src="script.js"></script>\n</body>\n</html>'

with open(os.path.join(root,'faq.html'),'w',encoding='utf-8') as f:
    f.write(html)

print('done')
