# 🛡️ vpn-sync

> VPN ne IP badli, lekin tumhari ghari, zubaan aur CPU ne tumhe pakad liya? `vpn-sync` isko theek karta hai.

Browser extension jo VPN ki IP ke hisaab se browser ki identity **match** karta hai:

| Cheez | Kya hota hai |
|---|---|
| Timezone | IP ke country/timezone ke mutabiq (`Date`, `Intl`) |
| Language | `navigator.language(s)` + `Accept-Language` header |
| Battery | Fixed, boring value |
| CPU cores / RAM | Common values (8 cores, 8 GB) |
| WebRTC | Real IP leak band (`disable_non_proxied_udp`) |

## Install (Chrome / Edge / Brave)
1. `chrome://extensions` kholo, **Developer mode** on karo
2. **Load unpacked** pe click karo aur is folder ko chuno
3. VPN lagao, ek minute mein profile update ho jata hai (popup mein dekho)

## Honest limits
- "Bilkul undetectable" nahi. Ye fingerprinting ko **mushkil** banata hai.
- Canvas/audio fingerprint, TLS fingerprint, aur behaviour tracking is mein cover nahi hain.
- `Date.toString` ab patched hai, lekin edge cases ho sakte hain (naye bugs mile to issue kholo).
- Random values nahi, **consistent** values use hoti hain, kyunke random khud shak paida karta hai.
- Timezone lookup ke liye `ipapi.co` ko call jati hai (sirf IP bheji jati hai).

## TODO
- [x] `Date.toString` / `toTimeString` patch
- [ ] Canvas/audio noise (consistent per-session)
- [ ] Country → language table barhana
- [ ] Firefox support
