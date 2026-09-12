# -*- coding: utf-8 -*-
import io
P = '/tmp/wlz/index.html'
L = io.open(P, encoding='utf-8').read().split('\n')

assert 'wa-app-btn' in L[5263], L[5263]
L[5263] = '''                        <select id="app-share-sel" title="Uygulamayı paylaş" style="flex: 1; min-width: 0; padding: 10px 8px; background: #128C7E; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">
                            <option value="">&#128241; Uygulamayı Paylaş</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="telegram">Telegram</option>
                            <option value="twitter">X (Twitter)</option>
                            <option value="facebook">Facebook</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="reddit">Reddit</option>
                            <option value="discord">Discord</option>
                            <option value="email">E-posta</option>
                            <option value="sms">SMS</option>
                            <option value="copy">Bağlantıyı Kopyala</option>
                        </select>'''

assert 'Arkada' in L[5265] and 'WhatsApp' in L[5265], L[5265]
L[5265] = L[5265].replace('bu uygulamaya WhatsApp ile davet et', 'bu uygulamaya davet et')

assert "we.target.id === 'wa-app-btn'" in L[6409], L[6409]
new_handler = r'''            document.addEventListener('change', function(we){
                if (!we.target || we.target.id !== 'app-share-sel') return;
                var plat = we.target.value;
                we.target.value = '';
                if (!plat) return;
                var _appMsg = 'Wir Lesen Zusammen\n\nOrtak Hatim ve Dua takibi uygulaması. Birlikte okumak için katılın:';
                var _link = 'https://mckurdi27.github.io/Wir-lesen-zusammen-/';
                var _full = _appMsg + ' ' + _link;
                var _t = encodeURIComponent(_appMsg), _u = encodeURIComponent(_link), _tu = encodeURIComponent(_full);
                var urls = {
                    whatsapp: 'https://wa.me/?text=' + _tu,
                    telegram: 'https://t.me/share/url?url=' + _u + '&text=' + _t,
                    twitter:  'https://twitter.com/intent/tweet?text=' + _t + '&url=' + _u,
                    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + _u + '&quote=' + _t,
                    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + _u,
                    reddit:   'https://www.reddit.com/submit?url=' + _u + '&title=' + _t,
                    email:    'mailto:?subject=' + _t + '&body=' + _tu,
                    sms:      'sms:?&body=' + _tu
                };
                if (plat === 'copy') {
                    var _done = function(){ if (typeof showToast === 'function') showToast('Bağlantı kopyalandı', 'info'); };
                    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(_full).then(_done, _done);
                    else { var ta = document.createElement('textarea'); ta.value = _full; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(e){} document.body.removeChild(ta); _done(); }
                    return;
                }
                if (plat === 'discord') {
                    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(_full);
                    if (typeof showToast === 'function') showToast('Metin kopyalandı — Discord’a yapıştırın', 'info');
                    window.open('https://discord.com/app', '_blank');
                    return;
                }
                var _url = urls[plat];
                if (_url) window.open(_url, '_blank');
            });'''

del L[6408:6415]
L.insert(6408, new_handler)

io.open(P, 'w', encoding='utf-8').write('\n'.join(L))
print('OK')
