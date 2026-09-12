# -*- coding: utf-8 -*-
import io, re
P = '/tmp/wlz/index.html'
s = io.open(P, encoding='utf-8').read()
m = re.search(r'\n[ \t]*<div style="font-size: 11px; color: #777; text-align: left; margin-top: 6px;">[^<]*</div>', s)
assert m, 'davet satiri bulunamadi'
print('SILINIYOR >>>', m.group(0).strip())
s = s[:m.start()] + s[m.end():]
io.open(P, 'w', encoding='utf-8').write(s)
print('OK')
