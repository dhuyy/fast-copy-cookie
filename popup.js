const copyButton = document.getElementById('copy-button');
const pasteButton = document.getElementById('paste-button');

(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let { href } = new URL(tab.url);

      await chrome.storage.sync.set({ tabUrl: href });
    } catch {}
  }
})();

copyButton.addEventListener('click', async () => {
  const { tabUrl } = await chrome.storage.sync.get('tabUrl');

  const name = 'H24AuthToken';
  const cookie = await chrome.cookies.get({ name, url: tabUrl });

  await chrome.storage.sync.set({ [cookie.name]: cookie.value });
});

pasteButton.addEventListener('click', async () => {
  const { tabUrl } = await chrome.storage.sync.get('tabUrl');

  const name = 'H24AuthToken';
  const value = await chrome.storage.sync.get(name);

  await chrome.cookies.set({ name, url: tabUrl, value: value.H24AuthToken });
});
