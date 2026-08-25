document.addEventListener("DOMContentLoaded", () => {
    // Oryantal Motifler ve Tema (Açık & Koyu Mod) Stillerini Enjekte Etme
    function injectOrientalStyles() {
        if (document.getElementById("oriental-motif-styles")) return;
        const styleEl = document.createElement("style");
        styleEl.id = "oriental-motif-styles";
        styleEl.innerHTML = `
            :root {
                --bg-primary: #fdfbf7;
                --card-bg: #ffffff;
                --gold-primary: #d4af37;
                --gold-dark: #8a6d3b;
                --text-main: #3e2723;
                --border-color: #e3dcd2;
            }

            body {
                background-color: var(--bg-primary);
                color: var(--text-main);
                font-family: 'Georgia', serif;
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --bg-primary: #0b1329;
                    --card-bg: #131b31;
                    --gold-primary: #f6e05e;
                    --gold-dark: #d4af37;
                    --text-main: #f1f5f9;
                    --border-color: #22304a;
                }
                body {
                    background-color: #0b1329 !important;
                    color: #f1f5f9 !important;
                }
                .container {
                    background-color: #0b1329 !important;
                }
                #main-title-ornate-section {
                    background: linear-gradient(135deg, #131b31 0%, #0b1329 100%) !important;
                    border-color: #d4af37 !important;
                    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25) !important;
                }
                #daily-inspiration-section, #analysis-section, #admin-message-section, .controls > div {
                    background: #131b31 !important;
                    border-color: #22304a !important;
                    color: #e2e8f0 !important;
                }
                .book-card {
                    background: #131b31 !important;
                    border-color: #22304a !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
                }
                .book-header {
                    background: linear-gradient(to right, #1a2642, #131b31) !important;
                    color: #f6e05e !important;
                    border-bottom: 1px solid #22304a !important;
                }
                .book-name {
                    color: #f6e05e !important;
                }
                .book-body {
                    background: #131b31 !important;
                }
                .sub-modes {
                    background: #131b31 !important;
                    border-bottom-color: #22304a !important;
                }
                .sub-btn {
                    background: #0b1329 !important;
                    color: #cbd5e1 !important;
                    border: 1px solid #22304a !important;
                }
                .sub-btn.active {
                    background: #d4af37 !important;
                    color: #0b1329 !important;
                    border-color: #f6e05e !important;
                }
                .part-row {
                    background: #0b1329 !important;
                    border: 1px solid #22304a !important;
                    color: #e2e8f0 !important;
                }
                .part-row.taken {
                    background: #28220b !important;
                    border-color: #b78103 !important;
                }
                .part-row.read {
                    background: #064e3b !important;
                    border-color: #059669 !important;
                }
            }

            .book-card {
                border: 2px solid var(--gold-primary) !important;
                border-radius: 12px !important;
                overflow: hidden;
            }
            .book-header {
                border-bottom: 2px solid var(--gold-primary);
            }
        `;
        document.head.appendChild(styleEl);
    }

    injectOrientalStyles();

    const container = document.querySelector(".container") || document.body;
    const adminToggleBtn = document.getElementById("admin-toggle-btn");
    const bulkShareArea = document.getElementById("bulk-share-area");
    const bulkWhatsappBtn = document.getElementById("bulk-whatsapp-btn");

    let currentGroup = "grup_1";
    let isAdmin = false;
    let appData = null;
    let loggedInMember = "";

    const ADMIN_PASSWORD = "1234";

    const bookPdfMap = {
        "kuran": "pdfs/Kuran-ı Kerim.pdf",
        "cevsen": "pdfs/Cevşen.pdf",
        "tevhidname": "pdfs/Tevhidname Mealli.pdf",
        "celcelutiye": "pdfs/Celcelûtiye.pdf",
        "buyuk_cevsen": "pdfs/Büyük Cevşen.pdf",
        "ashabi_bedr": "pdfs/Ashabı Bedr ve Şühedayı Uhud.pdf",
        "dalail": "pdfs/Dalail ul khairat_text.pdf",
        "dua_mecmuasi": "pdfs/Dua Mecmuasi Mealli.pdf",
        "dilekce_tr": "pdfs/Bir Kırık Dilekçe Tr.pdf",
        "dilekce_ar": "pdfs/Bir Kırık Dilekçe Ar.pdf"
    };

    // Dahili İlham ve Hikmet Veri Havuzu (Harici dosya hatasını tamamen önler)
    function getDailyInspirationData() {
        const havuz = [
            { ayet: "Şüphesiz güçlükle beraber bir kolaylık vardır. (İnşirah, 5-6)", hadis: "İki nimet vardır ki, insanların çoğu bunların kıymetini bilmekte aldanmıştır.", german: { quote: "Übung macht den Meister.", translation: "Pratik ustayı yapar." } },
            { ayet: "Sabredenlere mükafatları hesapsız olarak ödenir. (Zümer, 10)", hadis: "Amellerin en hayırlısı az da olsa devamlı olanıdır.", german: { quote: "Wer rastet, der rostet.", translation: "Duran paslanır." } },
            { ayet: "Rabbiniz size rahmet etmeyi kendi üzerine yazdı. (En'âm, 54)", hadis: "İnsanlara teşekkür etmeyen Allah'a şükretmez.", german: { quote: "Aller Anfang ist schwer.", translation: "Her başlangıç zordur." } },
            { ayet: "Beni anın ki ben de sizi anayım. (Bakara, 152)", hadis: "Mümin, başka bir mümine karşı birbirini destekleyen binalar gibidir.", german: { quote: "Wissen ist Macht.", translation: "Bilgi güçtür." } },
            { ayet: "Şüphesiz Allah muhsinlerle beraberdir. (Ankebût, 69)", hadis: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.", german: { quote: "Übung macht den Meister.", translation: "Pratik ustayı yapar." } },
            { ayet: "Dualarınız olmasa ne ehemmiyetiniz var? (Furkan, 77)", hadis: "Kulların Allah'a en yakın olduğu an secde anıdır.", german: { quote: "Wer Wind sät, wird Sturm ernten.", translation: "Rüzgâr eken fırtına biçer." } },
            { ayet: "Sabır ve namazla yardım dileyiniz. (Bakara, 45)", hadis: "Tebessüm etmek sadakadır.", german: { quote: "Morgenstunde hat Gold im Munde.", translation: "Erken kalkan yol alır." } }
        ];

        let dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        let selected = havuz[dayOfYear % havuz.length];
        
        let miladiStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        let hicriStr = "1448 H.";
        try {
            const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
            hicriStr = formatter.format(new Date()) + " H.";
        } catch (e) {}

        return {
            miladiDateStr: miladiStr,
            fullDateStr: hicriStr,
            verse: selected.ayet,
            hadish: selected.hadis,
            german: selected.german
        };
    }

    function renderMainTitleHeader() {
        let titleSection = document.getElementById("main-title-ornate-section");
        if (!titleSection) {
            titleSection = document.createElement("div");
            titleSection.id = "main-title-ornate-section";
            titleSection.style.cssText = `
                margin-bottom: 20px;
                padding: 22px;
                background: linear-gradient(135deg, #fdfbf7 0%, #f4ebd0 100%);
                border: 2px solid #d4af37;
                border-top: 6px solid #8a6d3b;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(138, 109, 59, 0.2);
                text-align: center;
                position: relative;
            `;
            container.insertBefore(titleSection, container.firstChild);
        }

        titleSection.innerHTML = `
            <div style="font-size: 21px; font-weight: bold; font-family: 'Georgia', serif; margin-bottom: 6px; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
                <span>⚜️ 📖</span>
                <span>Ortak Hatim ve Duada Buluşuyoruz</span>
                <span>📖 ⚜️</span>
            </div>
            <div style="font-size: 13px; opacity: 0.85; font-style: italic;">
                Grubunuzu seçin, isminizi belirleyin ve manevi iklimde ortak hatim halkamıza katılın.
            </div>
        `;
    }

    function renderDailyInspiration() {
        const inspirationData = getDailyInspirationData();
        let inspirationContainer = document.getElementById("daily-inspiration-section");
        if (!inspirationContainer) {
            inspirationContainer = document.createElement("div");
            inspirationContainer.id = "daily-inspiration-section";
            const mainTitleSec = document.getElementById("main-title-ornate-section");
            if (mainTitleSec && mainTitleSec.nextSibling) {
                container.insertBefore(inspirationContainer, mainTitleSec.nextSibling);
            } else {
                container.appendChild(inspirationContainer);
            }
        }

        inspirationContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 16px;
            border: 1px solid #e3dcd2;
            border-left: 4px solid #27ae60;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            background: var(--card-bg);
        `;

        inspirationContainer.innerHTML = `
            <div style="text-align: center; font-weight: bold; font-size: 14px; border-bottom: 1px dashed rgba(150,150,150,0.3); padding-bottom: 8px; margin-bottom: 10px;">
                🌙 Manevi ve Dil İlhamı Köşesi
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 12px; padding: 4px 10px; border-radius: 4px; font-weight: bold; border: 1px solid rgba(150,150,150,0.2);">📅 Miladi: ${inspirationData.miladiDateStr}</span>
                <span style="font-size: 12px; padding: 4px 10px; border-radius: 4px; font-weight: bold; border: 1px solid rgba(150,150,150,0.2);">🌙 Hicri: ${inspirationData.fullDateStr}</span>
            </div>
            <div style="font-size: 13px; line-height: 1.5;">
                <p style="margin-bottom: 6px;">📖 <strong>Günün Ayeti:</strong> ${inspirationData.verse}</p>
                <p style="margin-bottom: 6px;">📜 <strong>Günün Hadisi:</strong> ${inspirationData.hadish}</p>
                <p style="margin-bottom: 2px;">🇩🇪 <strong>Tägliche Weisheit:</strong> <em>"${inspirationData.german.quote}"</em> <span style="opacity: 0.8;">(${inspirationData.german.translation})</span></p>
            </div>
        `;
    }

    function createPageModes(totalPages) {
        return {
            yirmi_sayfa: { name: "20 Sayfa", getItems: () => {
                let items = [], count = Math.ceil(totalPages / 20);
                for (let i = 0; i < count; i++) {
                    let start = i * 20, end = Math.min((i + 1) * 20, totalPages);
                    items.push({ id: i + 1, name: `${i + 1}. Cüz / Sayfa ${start + 1}-${end}`, start, end });
                }
                return items;
            }},
            on_sayfa: { name: "10 Sayfa", getItems: () => {
                let items = [], count = Math.ceil(totalPages / 10);
                for (let i = 0; i < count; i++) {
                    let start = i * 10, end = Math.min((i + 1) * 10, totalPages);
                    items.push({ id: i + 1, name: `Sayfa ${start + 1}-${end}`, start, end });
                }
                return items;
            }},
            bes_sayfa: { name: "5 Sayfa", getItems: () => {
                let items = [], count = Math.ceil(totalPages / 5);
                for (let i = 0; i < count; i++) {
                    let start = i * 5, end = Math.min((i + 1) * 5, totalPages);
                    items.push({ id: i + 1, name: `Sayfa ${start + 1}-${end}`, start, end });
                }
                return items;
            }},
            bir_sayfa: { name: "1 Sayfa", getItems: () => {
                let items = [];
                for (let i = 0; i < totalPages; i++) items.push({ id: i + 1, name: `${i + 1}. Sayfa`, start: i, end: i + 1 });
                return items;
            }}
        };
    }

    function createBabModes(totalBabs) {
        return {
            on_bab: { name: "10 Bab", getItems: () => {
                let items = [], count = Math.ceil(totalBabs / 10);
                for (let i = 0; i < count; i++) {
                    let start = i * 10, end = Math.min((i + 1) * 10, totalBabs);
                    items.push({ id: i + 1, name: `${start + 1}-${end}. Bablar`, start, end });
                }
                return items;
            }},
            bes_bab: { name: "5 Bab", getItems: () => {
                let items = [], count = Math.ceil(totalBabs / 5);
                for (let i = 0; i < count; i++) {
                    let start = i * 5, end = Math.min((i + 1) * 5, totalBabs);
                    items.push({ id: i + 1, name: `${start + 1}-${end}. Bablar`, start, end });
                }
                return items;
            }},
            bab: { name: "1 Bab", getItems: () => {
                let items = [];
                for (let i = 0; i < totalBabs; i++) items.push({ id: i + 1, name: `${i + 1}. Bab`, start: i, end: i + 1 });
                return items;
            }}
        };
    }

    const defaultBooksTemplate = [
        { id: "kuran", name: "1. Kur'ân-ı Kerîm", totalUnits: 604, type: "page", defaultMode: "yirmi_sayfa" },
        { id: "cevsen", name: "2. Cevşen", totalUnits: 100, type: "bab", defaultMode: "on_bab" },
        { id: "tevhidname", name: "3. Tevhidnâme", totalUnits: 20, type: "bab", defaultMode: "on_bab" },
        { id: "celcelutiye", name: "4. Celcelûtiye", totalUnits: 30, type: "bab", defaultMode: "on_bab" },
        { id: "buyuk_cevsen", name: "5. Büyük Cevşen", totalUnits: 250, type: "page", defaultMode: "yirmi_sayfa" },
        { id: "ashabi_bedr", name: "6. Ashâb-ı Bedr ve Şühedâ-yı Uhud", totalUnits: 32, type: "page", defaultMode: "on_sayfa" },
        { id: "dalail", name: "7. Delâilü'l-Hayrât", totalUnits: 160, type: "page", defaultMode: "yirmi_sayfa" },
        { id: "dua_mecmuasi", name: "8. Dua Mecmuası Mealli", totalUnits: 200, type: "page", defaultMode: "yirmi_sayfa" },
        { id: "dilekce_tr", name: "9. Bir Kırık Dilekçe (Türkçe)", totalUnits: 100, type: "page", defaultMode: "on_sayfa" },
        { id: "dilekce_ar", name: "10. Bir Kırık Dilekçe (Arapça)", totalUnits: 100, type: "page", defaultMode: "on_sayfa" }
    ];

    const bookModesDefs = {};
    defaultBooksTemplate.forEach(b => {
        bookModesDefs[b.id] = b.type === "bab" ? createBabModes(b.totalUnits) : createPageModes(b.totalUnits);
    });

    function getAllGroupKeys() {
        let keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key && key.startsWith("hatim_group_")) keys.push(key.replace("hatim_group_", ""));
        }
        if (keys.length === 0) keys.push("grup_1");
        else keys.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }));
        return keys;
    }

    function loadGroupData() {
        const savedData = localStorage.getItem(`hatim_group_${currentGroup}`);
        appData = savedData ? JSON.parse(savedData) : { members: ["Ahmet", "Mehmet", "Ayşe"] };
        if (!appData.members || !Array.isArray(appData.members)) appData.members = ["Ahmet", "Mehmet", "Ayşe"];

        const savedSession = localStorage.getItem(`hatim_session_${currentGroup}`);
        loggedInMember = (savedSession && appData.members.includes(savedSession)) ? savedSession : "";

        if (!appData.bookPages) appData.bookPages = {};
        if (!appData.bookHatims) appData.bookHatims = {};
        if (!appData.bookHistory) appData.bookHistory = {};

        const todayStr = new Date().toLocaleDateString("tr-TR");
        defaultBooksTemplate.forEach(defBook => {
            if (!appData.bookPages[defBook.id]) appData.bookPages[defBook.id] = Array(defBook.totalUnits).fill(null).map(() => ({ owner: "", isRead: false }));
            if (!appData.bookHatims[defBook.id]) appData.bookHatims[defBook.id] = { hatimNo: 1, startDate: todayStr, prayerDone: false };
            if (!appData.bookHistory[defBook.id]) appData.bookHistory[defBook.id] = [];
        });
        
        if (!appData.books) {
            appData.books = JSON.parse(JSON.stringify(defaultBooksTemplate));
        } else {
            defaultBooksTemplate.forEach(defBook => {
                let existing = appData.books.find(b => b.id === defBook.id);
                if (!existing) appData.books.push(JSON.parse(JSON.stringify(defBook)));
                else {
                    if (!existing.currentMode) existing.currentMode = defBook.defaultMode;
                    if (!existing.totalUnits) existing.totalUnits = defBook.totalUnits;
                }
            });
        }
        saveGroupData();
        
        renderMainTitleHeader();
        renderDailyInspiration();
        renderMainInterface();
        renderAnalysisSection();
        renderBooks();
        renderAdminMessageSection();
    }

    function saveGroupData() {
        localStorage.setItem(`hatim_group_${currentGroup}`, JSON.stringify(appData));
    }

    function renderMainInterface() {
        let controlsContainer = document.querySelector(".controls");
        if (!controlsContainer) {
            controlsContainer = document.createElement("div");
            controlsContainer.className = "controls";
            const inspSec = document.getElementById("daily-inspiration-section");
            if (inspSec && inspSec.nextSibling) {
                container.insertBefore(controlsContainer, inspSec.nextSibling);
            } else {
                container.appendChild(controlsContainer);
            }
        }

        let allGroups = getAllGroupKeys();
        let groupsHtml = allGroups.map(g => `<option value="${g}" ${g === currentGroup ? "selected" : ""}>${g.replace(/_/g, ' ').toUpperCase()}</option>`).join('');

        if (!isAdmin) {
            let memberOptions = `<option value="">-- İsminizi Seçin --</option>` + 
                appData.members.map(m => `<option value="${m}" ${m === loggedInMember ? "selected" : ""}>${m}</option>`).join('');

            controlsContainer.innerHTML = `
                <div style="padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); box-shadow: 0 2px 6px rgba(0,0,0,0.04); margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
                        <label style="font-weight: bold; font-size: 14px; min-width: 90px;">👥 Grup Seçin:</label>
                        <select id="user-group-select" style="padding: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 6px; font-size: 14px; flex: 1; min-width: 150px;">
                            ${groupsHtml}
                        </select>
                        <button id="user-new-group-btn" style="padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">+ Yeni Grup</button>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: space-between;">
                        <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 250px;">
                            <label style="font-weight: bold; font-size: 14px; min-width: 90px;">👤 İsminiz:</label>
                            <select id="user-name-select" style="padding: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 6px; font-size: 14px; flex: 1;" ${loggedInMember ? "disabled" : ""}>
                                ${memberOptions}
                            </select>
                            <button id="user-add-name-btn" title="Listeye Yeni İsim Ekle" style="padding: 8px 10px; background: #2980b9; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">+ Ekle</button>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${loggedInMember ? 
                                `<button id="unlock-name-btn" style="padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">Oturumu Kapat</button>` :
                                `<button id="lock-name-btn" style="padding: 8px 15px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">🔑 Kilitle</button>`
                            }
                            <button id="admin-toggle-btn-custom" style="padding: 8px 12px; background: ${isAdmin ? '#c0392b' : '#34495e'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">${isAdmin ? '🔓 Yönetici: AÇIK' : '🔐 Yönetici Modu'}</button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById("user-group-select").addEventListener("change", (e) => {
                currentGroup = e.target.value;
                loadGroupData();
            });

            document.getElementById("user-new-group-btn").addEventListener("click", () => {
                let newG = prompt("Yeni grup adını girin:");
                if (newG && newG.trim()) {
                    currentGroup = newG.trim().toLowerCase().replace(/\s+/g, '_');
                    saveGroupData();
                    loadGroupData();
                }
            });

            document.getElementById("user-add-name-btn").addEventListener("click", () => {
                let mName = prompt("Listeye eklenecek adınızı yazın:");
                if (mName && mName.trim()) {
                    let clean = mName.trim();
                    if (!appData.members.includes(clean)) {
                        appData.members.push(clean);
                        saveGroupData();
                        loggedInMember = clean;
                        localStorage.setItem(`hatim_session_${currentGroup}`, loggedInMember);
                        renderMainInterface();
                        renderBooks();
                    } else {
                        alert("Bu isim zaten listede var.");
                    }
                }
            });

            document.getElementById("admin-toggle-btn-custom").addEventListener("click", () => triggerAdminToggle());

            if (loggedInMember) {
                document.getElementById("unlock-name-btn").addEventListener("click", () => {
                    if (confirm("Oturumu kapatmak istiyor musunuz?")) {
                        loggedInMember = "";
                        localStorage.removeItem(`hatim_session_${currentGroup}`);
                        renderMainInterface();
                        renderBooks();
                    }
                });
            } else {
                document.getElementById("lock-name-btn").addEventListener("click", () => {
                    let selectEl = document.getElementById("user-name-select");
                    let nameVal = selectEl.value;
                    if (!nameVal) { alert("Lütfen açılır listeden isminizi seçin veya '+ Ekle' butonu ile isminizi ekleyin."); return; }
                    loggedInMember = nameVal;
                    localStorage.setItem(`hatim_session_${currentGroup}`, loggedInMember);
                    renderMainInterface();
                    renderBooks();
                });
            }
        } else {
            let membersHtml = appData.members.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin-bottom: 4px; border-radius: 4px; font-size: 13px; border: 1px solid var(--border-color);">
                    <span>• ${m}</span>
                    <div style="display: flex; gap: 4px;">
                        <button class="admin-edit-member" data-name="${m}" style="background: #f39c12; color: #fff; border: none; padding: 3px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Düzelt</button>
                        <button class="admin-remove-member" data-name="${m}" style="background: #e74c3c; color: #fff; border: none; padding: 3px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Çıkart</button>
                    </div>
                </div>
            `).join('');

            controlsContainer.innerHTML = `
                <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--gold-primary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="color: var(--gold-dark); font-size: 15px; margin: 0;">🛠️ Yönetici Kontrol Paneli</h3>
                        <button id="admin-toggle-btn-custom" style="padding: 6px 12px; background: #c0392b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">🔓 Kapat</button>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
                        <label style="font-weight: bold; font-size: 13px;">Grup:</label>
                        <select id="admin-group-select" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); flex: 1;">${groupsHtml}</select>
                        <button id="admin-add-group" style="background: #27ae60; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Ekle</button>
                        <button id="admin-edit-group" style="background: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Düzenle</button>
                        <button id="admin-delete-group" style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Sil</button>
                    </div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: bold; font-size: 13px;">Gruptaki Üyeler:</span>
                            <button id="admin-add-member" style="background: #2980b9; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">+ Üye Ekle</button>
                        </div>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); padding: 5px; border-radius: 4px;">
                            ${appData.members.length > 0 ? membersHtml : '<div style="font-size: 12px; text-align: center; padding: 5px;">Kayıtlı üye yok.</div>'}
                        </div>
                    </div>
                </div>
            `;

            document.getElementById("admin-group-select").addEventListener("change", (e) => {
                currentGroup = e.target.value;
                loadGroupData();
            });

            document.getElementById("admin-toggle-btn-custom").addEventListener("click", () => triggerAdminToggle());

            document.getElementById("admin-add-group").addEventListener("click", () => {
                let newG = prompt("Yeni grup adı:");
                if (newG && newG.trim()) {
                    currentGroup = newG.trim().toLowerCase().replace(/\s+/g, '_');
                    saveGroupData();
                    loadGroupData();
                }
            });

            document.getElementById("admin-edit-group").addEventListener("click", () => {
                let newName = prompt("Grubun yeni adı:", currentGroup.replace(/_/g, ' '));
                if (newName && newName.trim()) {
                    let newKey = newName.trim().toLowerCase().replace(/\s+/g, '_');
                    if (newKey !== currentGroup) {
                        localStorage.setItem(`hatim_group_${newKey}`, JSON.stringify(appData));
                        localStorage.removeItem(`hatim_group_${currentGroup}`);
                        currentGroup = newKey;
                        loadGroupData();
                    }
                }
            });

            document.getElementById("admin-delete-group").addEventListener("click", () => {
                if (confirm(`"${currentGroup}" grubunu silmek istiyor musunuz?`)) {
                    localStorage.removeItem(`hatim_group_${currentGroup}`);
                    let keys = getAllGroupKeys();
                    currentGroup = keys[0];
                    loadGroupData();
                }
            });

            document.getElementById("admin-add-member").addEventListener("click", () => {
                let mName = prompt("Eklenecek üye adı:");
                if (mName && mName.trim()) {
                    let clean = mName.trim();
                    if (!appData.members.includes(clean)) {
                        appData.members.push(clean);
                        saveGroupData();
                        loadGroupData();
                    } else alert("Bu isim zaten var.");
                }
            });

            document.querySelectorAll(".admin-remove-member").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    let nameToRemove = e.target.getAttribute("data-name");
                    if (confirm(`"${nameToRemove}" adlı üyeyi çıkartmak istiyor musunuz?`)) {
                        appData.members = appData.members.filter(m => m !== nameToRemove);
                        saveGroupData();
                        loadGroupData();
                    }
                });
            });

            document.querySelectorAll(".admin-edit-member").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    let oldName = e.target.getAttribute("data-name");
                    let editedName = prompt("Yeni ad:", oldName);
                    if (editedName && editedName.trim() && editedName.trim() !== oldName) {
                        let cleanNew = editedName.trim();
                        let idx = appData.members.indexOf(oldName);
                        if (idx !== -1) {
                            appData.members[idx] = cleanNew;
                            Object.keys(appData.bookPages).forEach(bId => {
                                appData.bookPages[bId].forEach(p => { if (p.owner === oldName) p.owner = cleanNew; });
                            });
                            saveGroupData();
                            loadGroupData();
                        }
                    }
                });
            });
        }
        checkBulkShareVisibility();
    }

    function triggerAdminToggle() {
        if (isAdmin) {
            isAdmin = false;
            if (adminToggleBtn) {
                adminToggleBtn.textContent = "🔐 Yönetici Modu: Kapalı";
                adminToggleBtn.classList.remove("active");
            }
            alert("Yönetici modu kapatıldı.");
        } else {
            const enteredPassword = prompt("Yönetici şifresi:");
            if (enteredPassword === ADMIN_PASSWORD) {
                isAdmin = true;
                if (adminToggleBtn) {
                    adminToggleBtn.textContent = "🔓 Yönetici Modu: AÇIK";
                    adminToggleBtn.classList.add("active");
                }
                alert("Yönetici modu açıldı.");
            } else if (enteredPassword !== null) {
                alert("Hatalı şifre!");
                return;
            } else {
                return;
            }
        }
        renderMainInterface();
        renderDailyInspiration();
        renderAnalysisSection();
        renderBooks();
    }

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener("click", () => triggerAdminToggle());
    }

    function checkBulkShareVisibility() {
        if (bulkShareArea) {
            bulkShareArea.style.display = loggedInMember ? "block" : "none";
        }
    }

    function renderAnalysisSection() {
        let analysisContainer = document.getElementById("analysis-section");
        if (!analysisContainer) {
            analysisContainer = document.createElement("div");
            analysisContainer.id = "analysis-section";
            analysisContainer.style.cssText = "margin-bottom: 20px; padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
            const controlsSec = document.querySelector(".controls");
            if (controlsSec && controlsSec.nextSibling) {
                controlsSec.parentNode.insertBefore(analysisContainer, controlsSec.nextSibling);
            } else {
                container.appendChild(analysisContainer);
            }
        }

        let totalBooks = appData.books.length;
        let totalTakenUnits = 0, totalReadUnits = 0, totalUnitsAll = 0;

        appData.books.forEach(book => {
            let baseArray = appData.bookPages[book.id];
            totalUnitsAll += book.totalUnits;
            baseArray.forEach(p => {
                if (p.owner) totalTakenUnits++;
                if (p.isRead) totalReadUnits++;
            });
        });

        let percentTaken = totalUnitsAll > 0 ? Math.round((totalTakenUnits / totalUnitsAll) * 100) : 0;
        let percentRead = totalUnitsAll > 0 ? Math.round((totalReadUnits / totalUnitsAll) * 100) : 0;

        analysisContainer.innerHTML = `
            <h3 style="margin-bottom: 10px; font-size: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span>📈 Genel Grup İlerleme Paneli</span>
                <span style="font-size: 11px; background: #27ae60; color: #fff; padding: 3px 8px; border-radius: 4px;">Grup: ${currentGroup.replace(/_/g, ' ').toUpperCase()}</span>
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-top: 10px;">
                <div style="padding: 10px; border-radius: 6px; border-left: 4px solid #3498db; border: 1px solid var(--border-color);">
                    <div style="font-size: 11px; opacity: 0.8;">Toplam Eser</div>
                    <div style="font-size: 17px; font-weight: bold;">${totalBooks} Adet</div>
                </div>
                <div style="padding: 10px; border-radius: 6px; border-left: 4px solid #f39c12; border: 1px solid var(--border-color);">
                    <div style="font-size: 11px; opacity: 0.8;">Alınan Hisseler</div>
                    <div style="font-size: 17px; font-weight: bold;">${totalTakenUnits} / ${totalUnitsAll} (%${percentTaken})</div>
                </div>
                <div style="padding: 10px; border-radius: 6px; border-left: 4px solid #27ae60; border: 1px solid var(--border-color);">
                    <div style="font-size: 11px; opacity: 0.8;">Okunan Hisseler</div>
                    <div style="font-size: 17px; font-weight: bold;">${totalReadUnits} / ${totalUnitsAll} (%${percentRead})</div>
                </div>
            </div>
        `;
    }

    function getRangeStatus(baseArray, start, end) {
        let subset = baseArray.slice(start, end);
        let allFree = subset.every(p => !p.owner);
        let firstOwner = subset[0].owner;
        let firstIsRead = subset[0].isRead;
        let allSame = subset.every(p => p.owner === firstOwner && p.isRead === firstIsRead && p.owner !== "");

        if (allFree) return { owner: "", isRead: false, statusType: "free" };
        else if (allSame) return { owner: firstOwner, isRead: firstIsRead, statusType: firstIsRead ? "read" : "taken" };
        else {
            let owners = [...new Set(subset.map(p => p.owner).filter(Boolean))];
            return { owner: owners.join(", "), isRead: false, statusType: "mixed" };
        }
    }

    function renderBooks() {
        let booksGrid = document.getElementById("books-grid");
        if (!booksGrid) {
            booksGrid = document.createElement("div");
            booksGrid.id = "books-grid";
            const analysisSec = document.getElementById("analysis-section");
            if (analysisSec && analysisSec.nextSibling) {
                container.insertBefore(booksGrid, analysisSec.nextSibling);
            } else {
                container.appendChild(booksGrid);
            }
        }

        const openBookIds = Array.from(document.querySelectorAll(".book-card.open")).map(el => el.getAttribute("data-book-id"));
        booksGrid.innerHTML = "";

        appData.books.forEach((book, bookIndex) => {
            let baseArray = appData.bookPages[book.id];
            let defModes = bookModesDefs[book.id] || createPageModes(book.totalUnits || 100);
            let modeKeys = Object.keys(defModes);
            
            if (!modeKeys.includes(book.currentMode)) book.currentMode = modeKeys[0];
            let items = defModes[book.currentMode].getItems();

            let takenCount = 0;
            let primaryKey = book.type === "bab" ? "on_bab" : "yirmi_sayfa";
            if (!defModes[primaryKey]) primaryKey = modeKeys[0];
            let primaryItems = defModes[primaryKey].getItems();

            primaryItems.forEach(pi => {
                let st = getRangeStatus(baseArray, pi.start, pi.end);
                if (st.statusType === "taken" || st.statusType === "read") takenCount++;
            });
            const totalCount = primaryItems.length;
            const currentHatimInfo = appData.bookHatims[book.id];
            const historyList = appData.bookHistory[book.id] || [];

            const cardEl = document.createElement("div");
            cardEl.className = `book-card ${openBookIds.includes(book.id) ? "open" : ""}`;
            cardEl.setAttribute("data-book-id", book.id);
            cardEl.style.cssText = "margin-bottom: 15px; border-radius: 12px; overflow: hidden; background: var(--card-bg); border: 2px solid var(--gold-primary);";

            let modesHtml = `<div class="sub-modes" style="position: sticky; top: 0; z-index: 5; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); display: flex; gap: 4px; flex-wrap: wrap;">`;
            modeKeys.forEach(mKey => {
                const mObj = defModes[mKey];
                const activeClass = mKey === book.currentMode ? "active" : "";
                modesHtml += `<button class="sub-btn ${activeClass}" data-book="${bookIndex}" data-mode="${mKey}" style="padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: ${mKey === book.currentMode ? 'var(--gold-primary)' : 'var(--card-bg)'}; color: ${mKey === book.currentMode ? '#0b1329' : 'var(--text-main)'}; font-weight: bold;">${mObj.name}</button>`;
            });
            modesHtml += `</div>`;

            let adminHeaderControls = "";
            if (isAdmin) {
                adminHeaderControls = `
                    <div style="margin-top: 10px; padding: 10px; border: 1px solid var(--gold-primary); border-radius: 6px; display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                        <span style="font-size: 12px; font-weight: bold; color: var(--gold-dark);">🛠️ Yönetici (${currentHatimInfo.hatimNo}. Hatim)</span>
                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            <button class="toggle-prayer-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; cursor: pointer; background: #f39c12; color: #fff; border: none; border-radius: 3px;">Dua: ${currentHatimInfo.prayerDone ? "✓ Yapıldı" : "Yapılacak"}</button>
                            <button class="finish-hatim-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; background: #27ae60; color: #fff; border: none; border-radius: 3px; font-weight: bold; cursor: pointer;">🏁 Hatmi Bitir</button>
                            <button class="cancel-hatim-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; background: #e74c3c; color: #fff; border: none; border-radius: 3px; font-weight: bold; cursor: pointer;">❌ Sıfırla</button>
                        </div>
                    </div>
                `;
            }

            let historyHtml = `
                <div style="margin-top: 15px; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    <div style="font-weight: bold; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📚 Mevcut Döngü: <strong style="color: #27ae60;">${currentHatimInfo.hatimNo}. Hatim</strong></span>
                        <span style="font-size: 11px; opacity: 0.8; font-weight: normal;">Başlangıç: ${currentHatimInfo.startDate}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span>Dua Durumu: <strong>${currentHatimInfo.prayerDone ? "✓ Yapıldı" : "Yapılacak"}</strong></span>
                    </div>
                    ${historyList.length > 0 ? `
                        <div style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                            <div style="font-weight: bold; font-size: 11px; opacity: 0.7; margin-bottom: 3px;">TAMAMLANAN GEÇMİŞ:</div>
                            ${historyList.map(h => `<div style="font-size: 11px; opacity: 0.8;">• ${h.hatimNo}. Hatim (${h.startDate} - ${h.endDate})</div>`).join('')}
                        </div>
                    ` : ""}
                </div>
            `;

            cardEl.innerHTML = `
                <div class="book-header" style="padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: linear-gradient(to right, #f4ebd0, #fdfbf7);">
                    <div class="book-title-area">
                        <span class="book-name" style="font-weight: bold; font-size: 15px;">${book.name} <span style="color: #27ae60; font-size: 12px;">(${currentHatimInfo.hatimNo}. Hatim)</span></span>
                        <span class="book-stats" style="font-size: 12px; opacity: 0.8; display: block; margin-top: 2px;">Alınan: ${takenCount} / ${totalCount}</span>
                    </div>
                    <div class="book-actions" style="display: flex; align-items: center; gap: 12px;">
                        <button class="book-pdf-btn" data-bookid="${book.id}" title="PDF Görüntüle" style="padding: 4px 8px; font-size: 12px; cursor: pointer; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 4px;">📄 PDF</button>
                        <button class="book-whatsapp-btn" data-whatsapp="${bookIndex}" style="padding: 4px 8px; font-size: 12px; cursor: pointer; background: #25D366; color: #fff; border: none; border-radius: 4px; font-weight: bold;">💬 Paylaş</button>
                        <span class="toggle-icon" style="font-size: 12px;">▼</span>
                    </div>
                </div>
                <div class="book-body" style="padding: 12px; display: none;">
                    ${adminHeaderControls}
                    ${modesHtml}
                    <div class="items-list" id="list-${bookIndex}" style="max-height: 170px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; margin-top: 8px; padding-right: 4px;"></div>
                    ${historyHtml}
                </div>
            `;

            booksGrid.appendChild(cardEl);

            if (cardEl.classList.contains("open")) {
                cardEl.querySelector(".book-body").style.display = "block";
            }

            cardEl.querySelector(".book-header").addEventListener("click", (e) => {
                if (e.target.closest(".book-whatsapp-btn") || e.target.closest(".book-pdf-btn")) return;
                cardEl.classList.toggle("open");
                const body = cardEl.querySelector(".book-body");
                body.style.display = cardEl.classList.contains("open") ? "block" : "none";
            });

            cardEl.querySelector(".book-pdf-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                const pdfPath = bookPdfMap[e.target.getAttribute("data-bookid")];
                if (pdfPath) window.open(pdfPath, "_blank");
                else alert("Bu kitap için PDF bulunamadı.");
            });

            cardEl.querySelectorAll(".finish-hatim-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const bId = e.target.getAttribute("data-bookid");
                    if (!confirm("Hatmi tamamlayıp yeni döngüye geçmek istiyor musunuz?")) return;
                    const endDateStr = new Date().toLocaleDateString("tr-TR");
                    appData.bookHistory[bId].push({ hatimNo: currentHatimInfo.hatimNo, startDate: currentHatimInfo.startDate, endDate: endDateStr, prayerDone: currentHatimInfo.prayerDone });
                    appData.bookHatims[bId] = { hatimNo: currentHatimInfo.hatimNo + 1, startDate: endDateStr, prayerDone: false };
                    appData.bookPages[bId] = Array(book.totalUnits).fill(null).map(() => ({ owner: "", isRead: false }));
                    saveGroupData();
                    renderAnalysisSection();
                    renderBooks();
                    alert("Yeni hatim başlatıldı.");
                });
            });

            cardEl.querySelectorAll(".cancel-hatim-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const bId = e.target.getAttribute("data-bookid");
                    if (!confirm("Mevcut hatim seçimlerini sıfırlamak istiyor musunuz?")) return;
                    appData.bookPages[bId] = Array(book.totalUnits).fill(null).map(() => ({ owner: "", isRead: false }));
                    saveGroupData();
                    renderAnalysisSection();
                    renderBooks();
                });
            });

            cardEl.querySelectorAll(".toggle-prayer-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    appData.bookHatims[e.target.getAttribute("data-bookid")].prayerDone = !appData.bookHatims[e.target.getAttribute("data-bookid")].prayerDone;
                    saveGroupData();
                    renderBooks();
                });
            });

            const listContainer = cardEl.querySelector(`#list-${bookIndex}`);
            items.forEach((item, itemIndex) => {
                const row = document.createElement("div");
                let statusClass = "", statusText = "Boş", actionText = "Al";
                let st = getRangeStatus(baseArray, item.start, item.end);
                
                if (st.statusType === "read") { statusClass = "read"; statusText = `✓ Okundu: ${st.owner}`; actionText = "Okundu"; }
                else if (st.statusType === "taken") { statusClass = "taken"; statusText = `Alan: ${st.owner}`; actionText = isAdmin ? "Yönet" : "Bırak"; }
                else if (st.statusType === "mixed") { statusClass = "taken"; statusText = `Kısmen Alınmış`; actionText = isAdmin ? "Yönet" : "Dolu"; }

                row.className = `part-row ${statusClass}`;
                row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid var(--border-color);";
                let targetPage = item.start + 1;
                let hasPdf = bookPdfMap[book.id] ? true : false;

                let rowButtonsHtml = `<div style="display: flex; align-items: center; gap: 6px;">`;
                if (hasPdf) rowButtonsHtml += `<button class="row-pdf-btn" data-bookid="${book.id}" data-page="${targetPage}" title="PDF" style="padding: 3px 6px; font-size: 11px; cursor: pointer; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 4px;">📄 PDF</button>`;
                if (st.statusType === "taken" && st.owner === loggedInMember) rowButtonsHtml += `<button class="mark-read-btn" data-bookid="${book.id}" data-start="${item.start}" data-end="${item.end}" style="padding: 3px 6px; font-size: 11px; cursor: pointer; border: none; background: #27ae60; color: #fff; border-radius: 4px;">✓ Okudum</button>`;
                else if (st.statusType === "read" && (st.owner === loggedInMember || isAdmin)) rowButtonsHtml += `<button class="mark-unread-btn" data-bookid="${book.id}" data-start="${item.start}" data-end="${item.end}" style="padding: 3px 6px; font-size: 11px; cursor: pointer; border: none; background: #e74c3c; color: #fff; border-radius: 4px;">İptal</button>`;
                rowButtonsHtml += `<span style="font-size: 11px; font-weight: bold; padding: 2px 6px; background: rgba(0,0,0,0.05); border-radius: 3px;">${actionText}</span></div>`;

                row.innerHTML = `
                    <div>
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 11px; opacity: 0.8;">${statusText}</div>
                    </div>
                    ${rowButtonsHtml}
                `;

                const rowPdfBtn = row.querySelector(".row-pdf-btn");
                if (rowPdfBtn) rowPdfBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.open(`${bookPdfMap[e.target.getAttribute("data-bookid"]}#page=${e.target.getAttribute("data-page")}`, "_blank");
                });

                const markReadBtn = row.querySelector(".mark-read-btn");
                if (markReadBtn) markReadBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    let start = parseInt(e.target.getAttribute("data-start")), end = parseInt(e.target.getAttribute("data-end"));
                    let bArr = appData.bookPages[e.target.getAttribute("data-bookid")];
                    for (let i = start; i < end; i++) bArr[i].isRead = true;
                    saveGroupData();
                    renderAnalysisSection();
                    renderBooks();
                });

                const markUnreadBtn = row.querySelector(".mark-unread-btn");
                if (markUnreadBtn) markUnreadBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    let start = parseInt(e.target.getAttribute("data-start")), end = parseInt(e.target.getAttribute("data-end"));
                    let bArr = appData.bookPages[e.target.getAttribute("data-bookid")];
                    for (let i = start; i < end; i++) bArr[i].isRead = false;
                    saveGroupData();
                    renderAnalysisSection();
                    renderBooks();
                });

                row.addEventListener("click", () => handleItemClick(bookIndex, book.currentMode, itemIndex));
                listContainer.appendChild(row);
            });
        });

        document.querySelectorAll(".sub-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                appData.books[e.target.getAttribute("data-book")].currentMode = e.target.getAttribute("data-mode");
                saveGroupData();
                renderBooks();
            });
        });

        document.querySelectorAll(".book-whatsapp-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                shareBookToWhatsApp(e.target.getAttribute("data-whatsapp"));
            });
        });
    }

    function handleItemClick(bookIndex, modeKey, itemIndex) {
        if (!loggedInMember) { alert("Lütfen önce isminizi seçip oturumu kilitleyin!"); return; }
        const book = appData.books[bookIndex];
        let baseArray = appData.bookPages[book.id];
        let item = bookModesDefs[book.id][modeKey].getItems()[itemIndex];
        let st = getRangeStatus(baseArray, item.start, item.end);

        if (st.statusType === "free") {
            for (let i = item.start; i < item.end; i++) baseArray[i] = { owner: loggedInMember, isRead: false };
            saveGroupData(); renderAnalysisSection(); renderBooks();
        } else {
            if (isAdmin) {
                if (confirm(`[Yönetici] Bu hisseyi boşa çıkarmak istiyor musunuz?`)) {
                    for (let i = item.start; i < item.end; i++) baseArray[i] = { owner: "", isRead: false };
                    saveGroupData(); renderAnalysisSection(); renderBooks();
                }
            } else {
                if (st.owner === loggedInMember) {
                    if (confirm(`Bu hisseyi bırakmak ister misiniz?`)) {
                        for (let i = item.start; i < item.end; i++) baseArray[i] = { owner: "", isRead: false };
                        saveGroupData(); renderAnalysisSection(); renderBooks();
                    }
                } else alert(`Bu kısım başka bir üyeye (${st.owner}) ait.`);
            }
        }
    }

    if (bulkWhatsappBtn) {
        bulkWhatsappBtn.addEventListener("click", () => {
            if (!loggedInMember) { alert("Lütfen önce oturum açın."); return; }
            let summary = [];
            appData.books.forEach(book => {
                let baseArray = appData.bookPages[book.id];
                let defModes = bookModesDefs[book.id];
                let primaryKey = book.type === "bab" ? "on_bab" : "yirmi_sayfa";
                if (!defModes[primaryKey]) primaryKey = Object.keys(defModes)[0];
                let taken = [];
                defModes[primaryKey].getItems().forEach(pi => {
                    let st = getRangeStatus(baseArray, pi.start, pi.end);
                    if (st.owner === loggedInMember) taken.push(pi.name);
                });
                if (taken.length > 0) summary.push(`• ${book.name}: *${taken.join(", ")}*`);
            });
            if (summary.length === 0) { alert("Üzerinizde hisse bulunmuyor."); return; }
            let msg = `*[${currentGroup.replace(/_/g, ' ').toUpperCase()}] ${loggedInMember} Hisseleri*\n\n` + summary.join("\n");
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        });
    }

    function shareBookToWhatsApp(bookIndex) {
        const book = appData.books[bookIndex];
        let baseArray = appData.bookPages[book.id];
        let defModes = bookModesDefs[book.id];
        let primaryKey = book.type === "bab" ? "on_bab" : "yirmi_sayfa";
        if (!defModes[primaryKey]) primaryKey = Object.keys(defModes)[0];
        let active = [];
        defModes[primaryKey].getItems().forEach(pi => {
            let st = getRangeStatus(baseArray, pi.start, pi.end);
            if (st.owner) active.push(`• *${st.owner}*, *${pi.name}*'nü ${st.isRead ? "Okundu ✓" : "Aldı"}.`);
        });
        let msg = `*[${currentGroup.replace(/_/g, ' ').toUpperCase()}] ${book.name} (${appData.bookHatims[book.id].hatimNo}. Hatim)*\n\n`;
        msg += active.length === 0 ? "Henüz pay alan kimse yok." : active.join("\n");
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }

    function renderAdminMessageSection() {
        let sec = document.getElementById("admin-message-section");
        if (!sec) {
            sec = document.createElement("div");
            sec.id = "admin-message-section";
            sec.style.cssText = "margin-top: 30px; padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
            sec.innerHTML = `
                <h3 style="margin-bottom: 10px; font-size: 15px;">📢 Yöneticiye Mesaj Gönder</h3>
                <textarea id="admin-msg-input" placeholder="Mesajınızı buraya yazın..." style="width: 100%; height: 60px; padding: 10px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 4px; margin-bottom: 10px;"></textarea>
                <button id="send-admin-msg-btn" style="background: #25D366; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">💬 WhatsApp ile Gönder</button>
            `;
            container.appendChild(sec);
            document.getElementById("send-admin-msg-btn").addEventListener("click", () => {
                let text = document.getElementById("admin-msg-input").value.trim();
                if (!text) return;
                window.open(`https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(text)}`, "_blank");
            });
        }
    }

    loadGroupData();
});
