# -*- coding: utf-8 -*-
import io, re, sys

P = '/tmp/wlz/index.html'
src = io.open(P, encoding='utf-8').read()
orig = src

def rep(old, new, cnt=1):
    global src
    if old not in src:
        print('BULUNAMADI >>>', old[:120].replace('\n','\\n'))
        sys.exit(1)
    src = src.replace(old, new, cnt)

# ---------- 1) CSS: baslik satiri + tam genislik kutular ----------
css_old = """        #zikirmatikSection .zk-title { font-size: 15px; font-weight: bold; color: var(--gold-dark); margin: 0 0 12px; }"""
css_new = """        #zikirmatikSection .zk-head { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; }
        #zikirmatikSection .zk-title { font-size: 15px; font-weight: bold; color: var(--gold-dark); margin: 0; }
        #zikirmatikSection .zk-gear { background: none; border: 0; padding: 0; margin: 0 0 0 auto; font-size: 18px; line-height: 1; color: var(--gold-dark); cursor: pointer; }
        #zikirmatikSection .zk-full { display: block; width: 100%; box-sizing: border-box; margin: 0 0 8px; border: 1px solid var(--gold-primary); background: var(--card-bg); color: var(--gold-dark); border-radius: 7px; font-size: 14px; line-height: 1.3; font-weight: 600; padding: 3px 8px; min-height: 0; }"""
rep(css_old, css_new)

# ---------- 2) HTML: baslik satiri, bolum+zikir dropdown, tam genislik ----------
html_old = """            <h3 class="zk-title">&#128255; Zikirmatik</h3>
            <div class="zk-kaynak" id="zkKaynak">
                <label class="zk-kk"><input type="checkbox" id="zkKaynakHepsi" data-kaynak="hepsi" checked><span>T&#252;m&#252;</span></label>
                <label class="zk-kk"><input type="checkbox" id="zkKaynakEsma" data-kaynak="esma"><span>Esma&#252;l H&#252;sna</span></label>
                <label class="zk-kk"><input type="checkbox" id="zkKaynakZikir" data-kaynak="zikir"><span>Zikir</span></label>
                <label class="zk-kk"><input type="checkbox" id="zkKaynakKuran" data-kaynak="kuran"><span>Peygamber Dualar&#305;</span></label>
                <label class="zk-kk"><input type="checkbox" id="zkKaynakRabbena" data-kaynak="rabbena"><span>Rabben&#226; Dualar&#305;</span></label>
            </div>
            <div class="zk-picker">
                <select id="zkZikir" class="zk-select"></select>
                <button type="button" id="zkAyarBtn" class="zk-mini" title="Ayarlar">&#9881;</button>
            </div>"""
html_new = """            <div class="zk-head">
                <h3 class="zk-title">&#128255; Zikirmatik</h3>
                <button type="button" id="zkAyarBtn" class="zk-gear" title="Ayarlar">&#9881;</button>
            </div>
            <select id="zkKaynak" class="zk-full">
                <option value="hepsi">T&#252;m&#252;</option>
                <option value="esma">Esma&#252;l H&#252;sna</option>
                <option value="zikir">Zikir</option>
                <option value="kuran">Peygamber Dualar&#305;</option>
                <option value="rabbena">Rabben&#226; Dualar&#305;</option>
            </select>
            <select id="zkZikir" class="zk-full"></select>"""
rep(html_old, html_new)

# ---------- 3) JS ciz(): cekboks yerine select ----------
js_old = """        var kb = document.querySelectorAll('#zkKaynak .zk-kk input');
        for (var ki = 0; ki < kb.length; ki++) kb[ki].checked = (kb[ki].getAttribute('data-kaynak') === ZK_KAYNAK);
"""
js_new = """        if ($('zkKaynak')) $('zkKaynak').value = ZK_KAYNAK;
"""
rep(js_old, js_new)

js_old2 = """        // cekboks durumu: secili kaynak
        var kkBtns = document.querySelectorAll('#zkKaynak .zk-kk input');
        for (var ki = 0; ki < kkBtns.length; ki++) {
            kkBtns[ki].checked = (kkBtns[ki].getAttribute('data-kaynak') === ZK_KAYNAK);
        }
"""
js_new2 = """        // bolum menusu: secili kaynak
        if ($('zkKaynak')) $('zkKaynak').value = ZK_KAYNAK;
"""
rep(js_old2, js_new2)

# ---------- 4) JS init(): cekboks dinleyicileri yerine select ----------
js_old3 = """        var zkKaynaklar = document.querySelectorAll('#zkKaynak .zk-kk input');
        for (var ci = 0; ci < zkKaynaklar.length; ci++) {
            zkKaynaklar[ci].addEventListener('change', (function(inp){
                return function(){
                    if (!inp.checked) { inp.checked = true; return; }
                    zkKaynakUygula(inp.getAttribute('data-kaynak'));
                };
            })(zkKaynaklar[ci]));
        }
"""
js_new3 = """        if ($('zkKaynak')) $('zkKaynak').addEventListener('change', function(){ zkKaynakUygula(this.value); });
"""
rep(js_old3, js_new3)

# ---------- 5) Ayarlar butonu stili: zk-mini -> zk-gear (borderless) ----------
# (HTML zaten guncellendi)

io.open(P, 'w', encoding='utf-8').write(src)
print('OK, degisiklik:', len(src) - len(orig), 'karakter')
print('kalan zk-kk referansi (HTML/JS):', src.count('zk-kk'))
