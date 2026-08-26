// Ana dizindeki main.js dosyası
// json/ klasöründen yüklenen ay verilerini tek bir merkezde toplar.

window.HicriTakvimAnaListe = {
    "10": typeof window.sevval_veri !== 'undefined' ? window.sevval_veri : null,
    "11": typeof window.zilkade_veri !== 'undefined' ? window.zilkade_veri : null,
    "12": typeof window.zilhicce_veri !== 'undefined' ? window.zilhicce_veri : null
};
