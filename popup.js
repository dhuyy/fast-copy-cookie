const STORAGE_COOKIE_NAMES_KEY = 'cookies';

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

  // @TODO Iterate over all cookie names stored
  const name = cookies[0];
  const cookie = await chrome.cookies.get({ name, url: tabUrl });

  await chrome.storage.local.set({ [cookie.name]: cookie.value });
});

pasteButton.addEventListener('click', async () => {
  const { tabUrl } = await chrome.storage.local.get('tabUrl');
  const { cookies } = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);

  // @TODO Iterate over all cookie names stored
  const name = cookies[0];
  const value = await chrome.storage.local.get(name);

  await chrome.cookies.set({ name, url: tabUrl, value: value.H24AuthToken });
});
