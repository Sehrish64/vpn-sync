chrome.storage.local.get('profile').then(({ profile }) => {
  const out = document.getElementById('out');
  if (!profile) { out.textContent = 'Abhi profile nahi bana. Thori der baad dekho.'; return; }
  const rows = [['IP', profile.ip], ['Country', profile.country], ['Timezone', profile.timezone],
                ['Language', profile.language], ['CPU cores', profile.cores]];
  out.innerHTML = rows.map(([k, v]) => `<div class="row"><span>${k}</span><b>${v}</b></div>`).join('');
});
