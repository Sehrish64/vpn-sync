// vpn-sync: keep browser identity consistent with the VPN's IP location.

const LANG = {
  US: 'en-US', GB: 'en-GB', CA: 'en-CA', AU: 'en-AU', IN: 'en-IN', SG: 'en-SG',
  DE: 'de-DE', FR: 'fr-FR', NL: 'nl-NL', ES: 'es-ES', IT: 'it-IT',
  TR: 'tr-TR', AE: 'ar-AE', JP: 'ja-JP', BR: 'pt-BR'
};

async function setHeaderRule(lang) {
  const value = `${lang},${lang.split('-')[0]};q=0.9`;
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{ header: 'Accept-Language', operation: 'set', value }]
      },
      condition: {
        regexFilter: '^https?://',
        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'font', 'other']
      }
    }]
  });
}

async function refreshProfile() {
  try {
    const r = await fetch('https://ipapi.co/json/');
    const d = await r.json();
    if (!d || !d.timezone) return;
    const language = LANG[d.country_code] || 'en-US';
    // Common, boring hardware values (consistency beats randomness).
    const profile = { ip: d.ip, country: d.country_code, timezone: d.timezone, language, cores: 8, memory: 8 };
    await chrome.storage.local.set({ profile });
    await setHeaderRule(language);
  } catch (e) { /* offline or rate limited: keep the old profile */ }
}

function setupWebRTC() {
  try {
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'disable_non_proxied_udp' });
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  setupWebRTC();
  refreshProfile();
  chrome.alarms.create('refresh', { periodInMinutes: 1 });
});
chrome.runtime.onStartup.addListener(refreshProfile);
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'refresh') refreshProfile(); });

// Runs inside the page (MAIN world). Must be fully self-contained.
function spoof(p) {
  const def = (obj, key, val) =>
    Object.defineProperty(obj, key, { get: () => val, configurable: true });

  // Language
  def(Navigator.prototype, 'language', p.language);
  def(Navigator.prototype, 'languages', Object.freeze([p.language, p.language.split('-')[0]]));

  // Hardware hints
  def(Navigator.prototype, 'hardwareConcurrency', p.cores);
  def(Navigator.prototype, 'deviceMemory', p.memory);

  // Battery
  if (Navigator.prototype.getBattery) {
    Navigator.prototype.getBattery = () => Promise.resolve({
      charging: true, chargingTime: 0, dischargingTime: Infinity, level: 1,
      addEventListener() {}, removeEventListener() {}
    });
  }

  // Timezone
  const tz = p.timezone;
  const OrigDTF = Intl.DateTimeFormat;

  const offsetMin = (date) => {
    const t = Math.floor(date.getTime() / 1000) * 1000;
    const f = new OrigDTF('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric',
      day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    const o = {};
    for (const x of f.formatToParts(new Date(t))) o[x.type] = x.value;
    const asUTC = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second);
    return Math.round((t - asUTC) / 60000);
  };

  Date.prototype.getTimezoneOffset = function () {
    return isNaN(this.getTime()) ? NaN : offsetMin(this);
  };

  // Date string methods (these leaked the real timezone before)
  const pieces = (date) => {
    const o = {};
    for (const x of new OrigDTF('en-US', {
      timeZone: tz, weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
      hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(date)) o[x.type] = x.value;
    const name = new OrigDTF('en-US', { timeZone: tz, timeZoneName: 'long' })
      .formatToParts(date).find(x => x.type === 'timeZoneName').value;
    const east = -offsetMin(date);
    const a = Math.abs(east);
    const gmt = 'GMT' + (east >= 0 ? '+' : '-') +
      String(Math.floor(a / 60)).padStart(2, '0') + String(a % 60).padStart(2, '0');
    return { o, tail: `${gmt} (${name})` };
  };
  const dateStr = (o) => `${o.weekday} ${o.month} ${o.day} ${o.year}`;
  const timeStr = (o) => `${o.hour}:${o.minute}:${o.second}`;

  Date.prototype.toString = function () {
    if (isNaN(this.getTime())) return 'Invalid Date';
    const { o, tail } = pieces(this);
    return `${dateStr(o)} ${timeStr(o)} ${tail}`;
  };
  Date.prototype.toTimeString = function () {
    if (isNaN(this.getTime())) return 'Invalid Date';
    const { o, tail } = pieces(this);
    return `${timeStr(o)} ${tail}`;
  };
  Date.prototype.toDateString = function () {
    if (isNaN(this.getTime())) return 'Invalid Date';
    return dateStr(pieces(this).o);
  };

  const Patched = function (locales, options) {
    options = Object.assign({}, options);
    if (!options.timeZone) options.timeZone = tz;
    return new OrigDTF(locales, options);
  };
  Patched.prototype = OrigDTF.prototype;
  Patched.supportedLocalesOf = OrigDTF.supportedLocalesOf;
  Intl.DateTimeFormat = Patched;

  for (const m of ['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString']) {
    const orig = Date.prototype[m];
    Date.prototype[m] = function (l, o) {
      o = Object.assign({}, o);
      if (!o.timeZone) o.timeZone = tz;
      return orig.call(this, l, o);
    };
  }
}

chrome.webNavigation.onCommitted.addListener(async (d) => {
  if (!/^https?:/.test(d.url)) return;
  const { profile } = await chrome.storage.local.get('profile');
  if (!profile) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: d.tabId, frameIds: [d.frameId] },
      world: 'MAIN',
      injectImmediately: true,
      func: spoof,
      args: [profile]
    });
  } catch (e) {}
});
