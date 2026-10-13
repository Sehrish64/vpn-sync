# 🛡️ vpn-sync: poora project ek nazar mein

**Idea:** VPN sirf IP badalta hai. Timezone, language, WebRTC wagera browser se leak ho jate hain.
`vpn-sync` browser ko VPN ki country ke hisaab se match karta hai, aur ek demo page dikhata hai
ke website tumhe kaise pakadti hai.

## Folder map
| Folder / file | Kya hai |
|---|---|
| `extension/` | Chrome/Edge/Brave extension (Manifest V3): `manifest.json`, `background.js`, popup, README |
| `demo/index.html` | "VPN Pakda Gaya?" detective page: 5 checks + shareable score |
| `assets/before-after-card.html` | Before/after card (screenshot lekar thumbnail/README image banao) |
| `marketing/reel-script.md` | 30 sec Instagram reel script (Roman Urdu) + caption |
| `marketing/screenshot-guide.md` | README ke liye screenshots/GIF ka guide |
| `marketing/github-and-reddit.md` | GitHub description, topics, Reddit post, X/Twitter post |

## Extension kya karta hai
- Timezone: `Date`, `Intl`, `getTimezoneOffset`, `toString` sab VPN ki timezone pe
- Language: `navigator.language(s)` + `Accept-Language` header
- Hardware: CPU cores 8, RAM 8 GB, battery fixed
- WebRTC: asli IP leak band (`disable_non_proxied_udp`)
- IP/timezone lookup `ipapi.co` se (har minute refresh)

## Install
1. `chrome://extensions` kholo, **Developer mode** on karo
2. **Load unpacked** pe `extension/` folder chuno
3. VPN lagao, popup mein country/timezone check karo

## Launch ka plan (sab se pehle yahan se shuru karo)
1. Extension ko khud 2-3 sites pe test karo (abhi sirf syntax check hua hai)
2. `demo/index.html` pehle extension ke bina chalao, phir extension ke saath: asli scores note karo
3. `assets/before-after-card.html` mein wahi scores likho, screenshot lo
4. Repo banao: `extension/` + `demo/` + screenshot, GitHub Pages pe `demo` host karo
5. Reel banao (`marketing/reel-script.md`), phir Reddit/X pe post karo

## Honest limits (README aur posts mein bhi yahi likhna)
- "Undetectable" nahi, fingerprinting **mushkil** banata hai
- Canvas/audio/TLS fingerprint aur behaviour tracking cover nahi hain
- Abhi real browser mein test nahi hua; bugs ho sakte hain
- Firefox support nahi hai

## Pehle wali ideas (is project se pehle ki brainstorm)
1. **VPN Leak Checker**: DNS/WebRTC/IPv6 leak test + privacy score card
2. **VPN Pakda Gaya**: detective game (ye `demo/` ban gaya)
3. **vpn-sync**: browser ko VPN se match karne wali extension (ye `extension/` ban gaya)

## Next TODO
- [ ] Canvas/audio fingerprint noise (consistent per session)
- [ ] Zyada countries ka language table
- [ ] Firefox port
- [ ] Demo mein hardware (cores/RAM) check bhi add karna
