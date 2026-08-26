document.addEventListener("DOMContentLoaded", async () => {
    // Güvenli Container ve Grid Seçimi (Bulunamazsa Body'ye ekle)
    let container = document.querySelector(".container");
    if (!container) {
        container = document.createElement("div");
        container.className = "container";
        document.body.appendChild(container);
    }

    let booksGrid = document.getElementById("books-grid");
    if (!booksGrid) {
        booksGrid = document.createElement("div");
        booksGrid.id = "books-grid";
        container.appendChild(booksGrid);
    }

    // Eski statik panellerin kalıntısı varsa temizle
    function removeStuckPanel() {
        document.querySelectorAll('div').forEach(div => {
            if (div && div.textContent && div.textContent.includes("Ortak Hatim ve Dua Takip Sistemi") && !div.id.includes("main-title-ornate-section") && (div.querySelector('select') || div.innerHTML.includes("Yönetici Modu"))) {
                div.remove();
            }
        });
    }
    removeStuckPanel();
    setTimeout(removeStuckPanel, 100);

    // Oryantal Motifler ve Tema Stilleri
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
                margin: 0;
                padding: 10px;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
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
            }
            .book-card {
                border: 2px solid var(--gold-primary) !important;
                border-radius: 12px !important;
                overflow: hidden;
                margin-bottom: 15px;
                background: var(--card-bg);
            }
            .book-header {
                border-bottom: 2px solid var(--gold-primary);
                background: linear-gradient(to right, rgba(212,175,55,0.1), transparent);
            }
        `;
        document.head.appendChild(styleEl);
    }

    injectOrientalStyles();

    let currentGroup = "grup_1";
    let isAdmin = false;
    let appData = null;
    let loggedInMember = "";
    let monthlyInspirationCache = {};

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

    function bugunkuHicriTarihiAl() {
        try {
            const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
            const parts = formatter.formatToParts(new Date());
            let gun = "", ay = "";
            for (const part of parts) {
                if (part.type === 'day') gun = part.value;
                if (part.type === 'month') ay = part.value;
            }
            return { ayKodu: String(ay).padStart(2, '0'), gunNumarasi: parseInt(gun, 10) };
        } catch (hata) {
            return { ayKodu: "03", gunNumarasi: 12 };
        }
    }

    async function fetchHijriMonthData(ayKodu) {
        if (monthlyInspirationCache[ayKodu]) return monthlyInspirationCache[ayKodu];
        const fileMap = {
            "01": "json/01-muharrem.json", "02": "json/02-sefer.json", "03": "json/03-rebiulevvel.json",
            "04": "json/04-rebiulahir.json", "05": "json/05-cemaziyelevvel.json", "06": "json/06-cemaziyelahir.json",
            "07": "json/07-recep.json", "08": "json/08-saban.json", "09": "json/09-ramazan.json",
            "10": "json/10-sevval.json", "11": "json/11-zilkade.json", "12": "json/12-zilhicce.json"
        };
        let filePath = fileMap[ayKodu] || "json/03-rebiulevvel.json";
        try {
            let response = await fetch(filePath);
            if (!response.ok) throw new Error();
            let data = await response.json();
            monthlyInspirationCache[ayKodu] = data;
            return data;
        } catch (e) {
            return null;
        }
    }

    async function getHijriInspiration() {
        const todayMiladiStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hicriInfo = bugunkuHicriTarihiAl();
        let hDay = hicriInfo.gunNumarasi;
        let hMonth = hicriInfo.ayKodu;
        
        let todayHijriStr = `${hDay}.${hMonth}.1448`;
        try {
            const displayFormatter = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umalqura', { day: '2-digit', month: '2-digit', year: 'numeric' });
            todayHijriStr = displayFormatter.format(new Date());
        } catch (e) {}

        let jsonData = await fetchHijriMonthData(hMonth);
        let item = null;
        if (jsonData) {
            item = jsonData[String(hDay)] || jsonData[hDay] || jsonData[String(hDay).padStart(2, '0')];
        }

        let verseText = "Şüphesiz güçlükle beraber bir kolaylık vardır. (İnşirah, 5-6)";
        let hadishText = "İki nimet vardır ki, insanların çoğu bunların kıymetini bilmekte aldanmıştır.";
        let germanQuote = "Übung macht den Meister.";
        let germanTrans = "Pratik ustayı yapar.";

        if (item) {
            if (item.ayet) {
                let meal = typeof item.ayet === 'object' ? (item.ayet.meal || item.ayet.text || "") : String(item.ayet);
                let kaynak = typeof item.ayet === 'object' ? (item.ayet.kaynak || item.ayet.source || "") : "";
                verseText = kaynak ? `${meal} (${kaynak})` : meal;
            }
            let h = item.hadis || item.hadish;
            if (h) {
                let meal = typeof h === 'object' ? (h.meal || h.text || "") : String(h);
                let kaynak = typeof h === 'object' ? (h.kaynak || h.source || "") : "";
                hadishText = kaynak ? `${meal} (${kaynak})` : meal;
            }
            if (item.german) {
                germanQuote = item.german.quote || germanQuote;
                germanTrans = item.german.translation || germanTrans;
            }
        }
        return { fullDateStr: todayHijriStr, miladiDateStr: todayMiladiStr, verse: verseText, hadish: hadishText, german: { quote: germanQuote, translation: germanTrans } };
    }

    function renderMainTitleHeader() {
        let titleSection = document.getElementById("main-title-ornate-section");
        if (!titleSection) {
            titleSection = document.createElement("div");
            titleSection.id = "main-title-ornate-section";
            container.insertBefore(titleSection, container.firstChild);
        }

        titleSection.style.cssText = `
            margin-bottom: 20px;
            padding: 22px;
            background: linear-gradient(135deg, #fdfbf7 0%, #f4ebd0 100%);
            border: 2px solid #d4af37;
            border-top: 6px solid #8a6d3b;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(138, 109, 59, 0.2);
            text-align: center;
        `;

        titleSection.innerHTML = `
            <div style="font-size: 21px; font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
                <span>⚜️ 📖</span>
                <span>Ortak Hatim ve Duada Buluşuyoruz</span>
                <span>📖 ⚜️</span>
            </div>
            <div style="font-size: 13px; opacity: 0.85; font-style: italic;">
                Grubunuzu seçin, isminizi belirleyin ve manevi iklimde ortak hatim halkamıza katılın.
            </div>
        `;
    }

    async function renderDailyInspiration() {
        const inspirationData = await getHijriInspiration();
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

    async function loadGroupData() {
        removeStuckPanel();
        const savedData = localStorage.getItem(`hatim_group_${currentGroup}`);
        appData = savedData ? JSON.parse(savedData) : { members: ["Ahmet", "Mehmet", "Ayşe"] };
        if (!appData.members) appData.members = [];

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
        await renderDailyInspiration();
        renderUserControls();
        renderBooks();
        renderAnalysisSection();
        renderAdminSectionAtBottom();
    }

    function saveGroupData() {
        localStorage.setItem(`hatim_group_${currentGroup}`, JSON.stringify(appData));
    }

    function renderUserControls() {
        let controlsContainer = document.getElementById("user-controls-section");
        if (!controlsContainer) {
            controlsContainer = document.createElement("div");
            controlsContainer.id = "user-controls-section";
            const inspSec = document.getElementById("daily-inspiration-section");
            if (inspSec && inspSec.nextSibling) {
                container.insertBefore(controlsContainer, inspSec.nextSibling);
            } else {
                container.appendChild(controlsContainer);
            }
        }

        let allGroups = getAllGroupKeys();
        let groupsHtml = allGroups.map(g => `<option value="${g}" ${g === currentGroup ? "selected" : ""}>${g.replace(/_/g, ' ').toUpperCase()}</option>`).join('');
        let membersOptions = '<option value="">-- İsminizi Seçin --</option>' + appData.members.map(m => `<option value="${m}" ${m === loggedInMember ? "selected" : ""}>${m}</option>`).join('');

        controlsContainer.style.cssText = `
            padding: 16px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            margin-bottom: 20px;
            background: var(--card-bg);
        `;

        controlsContainer.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px;">
                <label style="font-weight: bold; font-size: 13px; min-width: 65px;">👥 Grup:</label>
                <select id="user-group-select" style="padding: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 6px; font-size: 13px; flex: 1; min-width: 140px;">
                    ${groupsHtml}
                </select>
                <button id="user-new-group-btn" style="padding: 6px 10px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Yeni Grup</button>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px;">
                <label style="font-weight: bold; font-size: 13px; min-width: 65px;">👤 İsminiz:</label>
                <select id="user-member-select" style="padding: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 6px; font-size: 14px; flex: 1; min-width: 180px;">
                    ${membersOptions}
                </select>
                <button id="user-add-member-btn" style="padding: 6px 10px; background: #2980b9; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Üye Ekle</button>
            </div>
            <div id="bulk-share-area" style="display: ${loggedInMember ? 'block' : 'none'}; margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 10px;">
                <button id="bulk-whatsapp-btn" style="width: 100%; padding: 8px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">💬 Tüm Seçtiklerimi WhatsApp'ta Paylaş</button>
            </div>
        `;

        document.getElementById("user-group-select").addEventListener("change", async (e) => {
            currentGroup = e.target.value;
            await loadGroupData();
        });

        document.getElementById("user-new-group-btn").addEventListener("click", async () => {
            let newG = prompt("Yeni grup adını girin:");
            if (newG && newG.trim()) {
                currentGroup = newG.trim().toLowerCase().replace(/\s+/g, '_');
                saveGroupData();
                await loadGroupData();
            }
        });

        document.getElementById("user-member-select").addEventListener("change", (e) => {
            loggedInMember = e.target.value;
            if (loggedInMember) {
                localStorage.setItem(`hatim_session_${currentGroup}`, loggedInMember);
            } else {
                localStorage.removeItem(`hatim_session_${currentGroup}`);
            }
            renderUserControls();
            renderBooks();
        });

        document.getElementById("user-add-member-btn").addEventListener("click", async () => {
            let mName = prompt("Eklenecek üye adı:");
            if (mName && mName.trim()) {
                let clean = mName.trim();
                if (!appData.members.includes(clean)) {
                    appData.members.push(clean);
                    loggedInMember = clean;
                    saveGroupData();
                    localStorage.setItem(`hatim_session_${currentGroup}`, loggedInMember);
                    renderUserControls();
                    renderBooks();
                    renderAdminSectionAtBottom();
                } else {
                    loggedInMember = clean;
                    document.getElementById("user-member-select").value = clean;
                    localStorage.setItem(`hatim_session_${currentGroup}`, loggedInMember);
                    renderBooks();
                }
            }
        });

        const bulkBtn = document.getElementById("bulk-whatsapp-btn");
        if (bulkBtn) {
            bulkBtn.addEventListener("click", () => {
                if (!loggedInMember) { alert("Lütfen önce isminizi seçin."); return; }
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
    }

    // Genel Grup İlerleme Paneli (Kitapların Altında, Yönetici Alanının Üstünde)
    function renderAnalysisSection() {
        let analysisContainer = document.getElementById("analysis-section");
        if (!analysisContainer) {
            analysisContainer = document.createElement("div");
            analysisContainer.id = "analysis-section";
            container.appendChild(analysisContainer);
        } else {
            container.appendChild(analysisContainer);
        }

        analysisContainer.style.cssText = "margin: 20px 0; padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg);";

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

    function renderAdminSectionAtBottom() {
        let bottomContainer = document.getElementById("admin-bottom-section");
        if (!bottomContainer) {
            bottomContainer = document.createElement("div");
            bottomContainer.id = "admin-bottom-section";
            container.appendChild(bottomContainer);
        } else {
            container.appendChild(bottomContainer);
        }

        bottomContainer.style.cssText = "margin: 20px 0; padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg);";

        let allGroups = getAllGroupKeys();
        let groupsHtml = allGroups.map(g => `<option value="${g}" ${g === currentGroup ? "selected" : ""}>${g.replace(/_/g, ' ').toUpperCase()}</option>`).join('');

        let membersHtml = appData.members.map(m => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin-bottom: 4px; border-radius: 4px; font-size: 13px; border: 1px solid var(--border-color);">
                <span>• ${m}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="admin-edit-member" data-name="${m}" style="background: #f39c12; color: #fff; border: none; padding: 3px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Düzelt</button>
                    <button class="admin-remove-member" data-name="${m}" style="background: #e74c3c; color: #fff; border: none; padding: 3px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Çıkart</button>
                </div>
            </div>
        `).join('');

        let adminPanelHtml = "";
        if (isAdmin) {
            adminPanelHtml = `
                <div id="admin-panel-section" style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--gold-primary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: var(--gold-dark); font-size: 15px; margin-bottom: 10px;">🛠️ Yönetici Kontrol Paneli</h3>
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
        }

        bottomContainer.innerHTML = `
            ${adminPanelHtml}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                <h3 style="font-size: 15px; margin: 0;">📢 Yöneticiye Mesaj Gönder</h3>
                <button id="admin-toggle-btn-custom" style="padding: 6px 12px; background: ${isAdmin ? '#c0392b' : '#f39c12'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">${isAdmin ? '🔓 Yönetici Modu: AÇIK' : '🔐 Yönetici Modu: Kapalı'}</button>
            </div>
            <textarea id="admin-msg-input" placeholder="Mesajınızı buraya yazın..." style="width: 100%; height: 60px; padding: 10px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); border-radius: 4px; margin-bottom: 10px;"></textarea>
            <button id="send-admin-msg-btn" style="background: #25D366; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">💬 WhatsApp ile Gönder</button>
        `;

        document.getElementById("admin-toggle-btn-custom").addEventListener("click", () => triggerAdminToggle());

        if (isAdmin) {
            document.getElementById("admin-group-select").addEventListener("change", async (e) => {
                currentGroup = e.target.value;
                await loadGroupData();
            });

            document.getElementById("admin-add-group").addEventListener("click", async () => {
                let newG = prompt("Yeni grup adı:");
                if (newG && newG.trim()) {
                    currentGroup = newG.trim().toLowerCase().replace(/\s+/g, '_');
                    saveGroupData();
                    await loadGroupData();
                }
            });

            document.getElementById("admin-edit-group").addEventListener("click", async () => {
                let newName = prompt("Grubun yeni adı:", currentGroup.replace(/_/g, ' '));
                if (newName && newName.trim()) {
                    let newKey = newName.trim().toLowerCase().replace(/\s+/g, '_');
                    if (newKey !== currentGroup) {
                        localStorage.setItem(`hatim_group_${newKey}`, JSON.stringify(appData));
                        localStorage.removeItem(`hatim_group_${currentGroup}`);
                        currentGroup = newKey;
                        await loadGroupData();
                    }
                }
            });

            document.getElementById("admin-delete-group").addEventListener("click", async () => {
                if (confirm(`"${currentGroup}" grubunu silmek istiyor musunuz?`)) {
                    localStorage.removeItem(`hatim_group_${currentGroup}`);
                    let keys = getAllGroupKeys();
                    currentGroup = keys[0];
                    await loadGroupData();
                }
            });

            document.getElementById("admin-add-member").addEventListener("click", async () => {
                let mName = prompt("Eklenecek üye adı:");
                if (mName && mName.trim()) {
                    let clean = mName.trim();
                    if (!appData.members.includes(clean)) {
                        appData.members.push(clean);
                        saveGroupData();
                        await loadGroupData();
                    }
                }
            });

            document.querySelectorAll(".admin-remove-member").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    let nameToRemove = e.target.getAttribute("data-name");
                    if (confirm(`"${nameToRemove}" adlı üyeyi çıkartmak istiyor musunuz?`)) {
                        appData.members = appData.members.filter(m => m !== nameToRemove);
                        saveGroupData();
                        await loadGroupData();
                    }
                });
            });

            document.querySelectorAll(".admin-edit-member").forEach(btn => {
                btn.addEventListener("click", async (e) => {
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
                            await loadGroupData();
                        }
                    }
                });
            });
        }

        document.getElementById("send-admin-msg-btn").addEventListener("click", () => {
            let text = document.getElementById("admin-msg-input").value.trim();
            if (!text) return;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        });
    }

    async function triggerAdminToggle() {
        if (isAdmin) {
            isAdmin = false;
        } else {
            const enteredPassword = prompt("Yönetici şifresi:");
            if (enteredPassword === ADMIN_PASSWORD) {
                isAdmin = true;
            } else if (enteredPassword !== null) {
                alert("Hatalı şifre!");
                return;
            } else {
                return;
            }
        }
        renderUserControls();
        await renderDailyInspiration();
        renderBooks();
        renderAnalysisSection();
        renderAdminSectionAtBottom();
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

            let modesHtml = `<div class="sub-modes" style="position: sticky; top: 0; z-index: 5; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">`;
            modeKeys.forEach(mKey => {
                const mObj = defModes[mKey];
                const activeClass = mKey === book.currentMode ? "active" : "";
                modesHtml += `<button class="sub-btn ${activeClass}" data-book="${bookIndex}" data-mode="${mKey}" style="padding: 4px 8px; margin-right: 4px; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-color); background: ${activeClass ? 'var(--gold-primary)' : 'var(--card-bg)'}; color: ${activeClass ? '#000' : 'var(--text-main)'};">${mObj.name}</button>`;
            });
            modesHtml += `</div>`;

            let adminHeaderControls = "";
            if (isAdmin) {
                adminHeaderControls = `
                    <div style="margin-top: 10px; padding: 10px; border: 1px solid var(--gold-primary); border-radius: 6px; display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                        <span style="font-size: 12px; font-weight: bold;">🛠️ Yönetici (${currentHatimInfo.hatimNo}. Hatim)</span>
                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            <button class="toggle-prayer-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; cursor: pointer; background: #f39c12; color: #fff; border: none; border-radius: 3px;">Dua: ${currentHatimInfo.prayerDone ? "✓ Yapıldı" : "Yapılacak"}</button>
                            <button class="finish-hatim-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; background: #27ae60; color: #fff; border: none; border-radius: 3px; font-weight: bold; cursor: pointer;">🏁 Hatmi Bitir</button>
                            <button class="cancel-hatim-btn" data-bookid="${book.id}" style="padding: 4px 8px; font-size: 11px; background: #e74c3c; color: #fff; border: none; border-radius: 3px; font-weight: bold; cursor: pointer;">❌ Sıfırla</button>
                        </div>
                    </div>
                `;
            }

            // Kutu içerisindeki yükseklik ferahlatıldı ("Mevcut Döngü" ve "Dua Durumu" net görünsün diye)
            let historyHtml = `
                <div style="margin-top: 15px; padding: 14px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; background: rgba(0,0,0,0.02);">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span>📚 Mevcut Döngü: <strong style="color: #27ae60;">${currentHatimInfo.hatimNo}. Hatim</strong></span>
                        <span style="font-size: 11px; opacity: 0.8; font-weight: normal;">Başlangıç: ${currentHatimInfo.startDate}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                        <span>Dua Durumu: <strong style="color: ${currentHatimInfo.prayerDone ? '#27ae60' : '#e67e22'};">${currentHatimInfo.prayerDone ? "✓ Yapıldı" : "Yapılacak"}</strong></span>
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
                <div class="book-header" style="padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
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
                <div class="book-body" style="padding: 14px; display: none;">
                    ${adminHeaderControls}
                    ${modesHtml}
                    <div class="items-list" id="list-${bookIndex}" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; margin-top: 10px; padding-right: 4px;"></div>
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
                row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid var(--border-color); background: var(--card-bg);";
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
                    window.open(`${bookPdfMap[e.target.getAttribute("data-bookid")]}#page=${e.target.getAttribute("data-page")}`, "_blank");
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
        if (!loggedInMember) { alert("Lütfen önce isminizi seçin!"); return; }
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

    await loadGroupData();
});
