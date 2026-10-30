# Inline lucide icons: template.src -> index.html
import re
s = open('template.src').read()
ic = '../../node_modules/lucide-static/icons/'
def rep(m):
    t = re.sub(r'<!--.*?-->', '', open(ic + m.group(1) + '.svg').read(), flags=re.S).strip()
    return re.sub(r'\s+', ' ', t)
open('index.html', 'w').write(re.sub(r'\{\{i:([a-z0-9-]+)\}\}', rep, s))
