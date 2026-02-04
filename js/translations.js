const loadedTranslations = {};
const availableLocales = ['en','pt-BR','es','fr','de','it','ja','zh-CN','ru','ko'];

function normalizeLocale(lang) {
    if (!lang) return 'en';
    lang = String(lang).replace('_', '-');
    if (availableLocales.includes(lang)) return lang;
    const parts = lang.split('-');
    if (parts.length > 1) {
        const candidate = parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
        if (availableLocales.includes(candidate)) return candidate;
    }
    const base = parts[0].toLowerCase();
    for (const loc of availableLocales) {
        if (loc.startsWith(base)) return loc;
    }
    return 'en';
}

async function loadTranslation(lang) {
    lang = normalizeLocale(lang);
    if (loadedTranslations[lang]) return loadedTranslations[lang];
    try {
        const resp = await fetch('js/locales/' + lang + '.json');
        if (!resp.ok) throw new Error('no file');
        const data = await resp.json();
        loadedTranslations[lang] = data;
        return data;
    } catch (e) {
        if (lang !== 'en') return loadTranslation('en');
        loadedTranslations[lang] = {};
        return {};
    }
}

function t(key) {
    const raw = localStorage.getItem('language') || localStorage.getItem('lang') || 'en';
    const lang = normalizeLocale(raw);
    const trans = loadedTranslations[lang] || loadedTranslations['en'] || {};
    const parts = key.split('.');
    let cur = trans;
    for (const p of parts) {
        if (!cur) return key;
        cur = cur[p];
    }
    return cur || key;
}

async function updatePageLanguage() {
    const raw = localStorage.getItem('language') || 'en';
    const lang = normalizeLocale(raw);
    const trans = await loadTranslation(lang);
    document.documentElement.lang = lang;
    document.getElementById('headerTitle').textContent = trans.title || 'FOV Calculator';
    document.getElementById('headerSubtitle').textContent = trans.subtitle || '';
    document.getElementById('settingsTitle').textContent = '🖥️ ' + (trans.settings || 'Settings');
    document.getElementById('screenRatioLabel').textContent = trans.screenRatio || 'Screen Ratio';
    document.getElementById('screenSizeLabel').textContent = trans.screenSize || 'Screen Size';
    const inchesUnitEl = document.getElementById('inchesUnit');
    if (inchesUnitEl) inchesUnitEl.textContent = trans.inches || trans.inches_unit || 'inches';
    document.getElementById('distanceLabel').textContent = trans.distanceLabel || 'Distance to Screen';
    const distanceUnit = document.getElementById('distanceUnit');
    if (distanceUnit) {
        const cmOpt = distanceUnit.querySelector('option[value="cm"]');
        const inOpt = distanceUnit.querySelector('option[value="inch"]');
        if (cmOpt) cmOpt.textContent = trans.cm || 'cm';
        if (inOpt) inOpt.textContent = trans.inches || trans.inches_unit || 'inches';
    }
    document.getElementById('screenTypeLabel').textContent = trans.screenType || 'Setup Type';
    const single = document.getElementById('singleScreenLabel');
    if (single) single.textContent = trans.singleScreen || 'Single Screen';
    const triple = document.getElementById('tripleScreenLabel');
    if (triple) triple.textContent = trans.tripleScreen || 'Triple Screen';
    const curved = document.getElementById('curvedScreenLabel');
    if (curved) curved.textContent = trans.curvedScreen || 'Curved Screen';
    const radius = document.getElementById('radiusLabel');
    if (radius) radius.textContent = trans.curveRadius || 'Curve Radius';
    const bezel = document.getElementById('bezelLabel');
    if (bezel) bezel.textContent = trans.bezelThickness || 'Bezel Thickness';
    const info = document.getElementById('infoText');
    if (info && trans.tip) info.innerHTML = trans.tip;
    const resultsTitle = document.getElementById('resultsTitle');
    if (resultsTitle) resultsTitle.textContent = '📊 ' + (trans.results || 'Results');
    const hLabel = document.getElementById('horizontalFOVLabel');
    if (hLabel) hLabel.textContent = trans.horizontalFov || 'Horizontal FOV';
    const vLabel = document.getElementById('verticalFOVLabel');
    if (vLabel) vLabel.textContent = trans.verticalFov || 'Vertical FOV';
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = lang;
}

function setLanguage(lang) {
    const n = normalizeLocale(lang);
    localStorage.setItem('language', n);
    updatePageLanguage().catch(err => console.error('Language update failed:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('languageSelect');
    const savedRaw = localStorage.getItem('language') || localStorage.getItem('lang') || (navigator.language || 'en');
    const saved = normalizeLocale(savedRaw);
    if (langSelect) {
        langSelect.value = saved;
        langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    updatePageLanguage();
});
