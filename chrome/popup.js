const STORAGE_COOKIE_NAMES_KEY = 'cookies';
const STORAGE_COOKIE_DATA_KEY = 'cookiesData';

const copyButton = document.getElementById('copy-button');
const pasteButton = document.getElementById('paste-button');

(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let { href } = new URL(tab.url);

      await chrome.storage.local.set({ tabUrl: href });
    } catch {}
  }
})();

copyButton.addEventListener('click', async () => {
  const { tabUrl } = await chrome.storage.local.get('tabUrl');
  const { cookies } = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);

  let cookiesData = [];
  for (let cookieName of cookies) {
    const record = await chrome.cookies.get({
      name: cookieName,
      url: tabUrl,
    });

    if (record) {
      const { session, domain, hostOnly, ...cookie } = record;

      cookiesData.push(cookie);
    }
  }

  await chrome.storage.local.set({ cookiesData });

  copyButton
    .querySelector('.bi')
    .setAttribute('class', 'bi bi-clipboard-check');
  setTimeout(() => {
    copyButton.querySelector('.bi').setAttribute('class', 'bi bi-clipboard');
  }, 2000);
});

pasteButton.addEventListener('click', async () => {
  const { tabUrl } = await chrome.storage.local.get('tabUrl');
  const { cookiesData } = await chrome.storage.local.get(
    STORAGE_COOKIE_DATA_KEY
  );

  for (let data of cookiesData) {
    await chrome.cookies.set({ ...data, url: tabUrl });
  }

  pasteButton
    .querySelector('.bi')
    .setAttribute('class', 'bi bi-file-earmark-check');
  setTimeout(() => {
    pasteButton
      .querySelector('.bi')
      .setAttribute('class', 'bi bi-file-earmark');
  }, 2000);
});
