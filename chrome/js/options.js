const STORAGE_COOKIE_NAMES_KEY = 'cookies';

const LIST_CLASS = 'list-group';
const LIST_ITEM_CLASS = 'list-group-item';
const COOKIE_NAME_INPUT_NAME = 'cookie-name';
const DATA_ACTION_DELETE_ITEM = 'delete-item';
const DISABLED_LIST_ITEM_SELECTOR = '[data-action="disabled-item"]';

const disabledListItem = document.querySelector(DISABLED_LIST_ITEM_SELECTOR);

const isEmptyObject = object =>
  Object.keys(object).length === 0 && object.constructor === Object;

const createListItem = ({ name }) => {
  const listItem = document.createElement('li');
  const button = document.createElement('button');
  const icon = document.createElement('i');

  listItem.innerHTML = name;
  listItem.classList.add(LIST_ITEM_CLASS);

  button.setAttribute('class', 'btn btn-danger');
  button.setAttribute('type', 'button');
  button.setAttribute('data-action', DATA_ACTION_DELETE_ITEM);

  icon.setAttribute('class', 'bi bi-trash3');
  icon.setAttribute('data-action', DATA_ACTION_DELETE_ITEM);

  button.append(icon);
  listItem.append(button);

  return listItem;
};

const toggleDisabledListItem = () => {
  const [list] = document.getElementsByClassName(LIST_CLASS);

  if (list.childElementCount === 0) {
    list.append(disabledListItem);

    return;
  }

  const currentDisabledItem = list.querySelector(DISABLED_LIST_ITEM_SELECTOR);

  if (currentDisabledItem) {
    currentDisabledItem.remove();
  }
};

const retrieveCookieNamesFromStorage = async () => {
  const { cookies } = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);

  return cookies;
};

const setCookieOnStorage = async cookieName => {
  const record = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);
  const cookies = [...record.cookies, cookieName];

  await chrome.storage.local.set({ cookies });
};

const removeCookieFromStorage = async cookieName => {
  const record = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);
  const cookies = record.cookies.filter(listItem => listItem !== cookieName);

  await chrome.storage.local.set({ cookies });
};

const renderCookieNames = cookies => {
  for (let i = 0; i < cookies.length; i++) {
    const [list] = document.getElementsByClassName(LIST_CLASS);

    list.append(createListItem({ name: cookies[i] }));
  }

  toggleDisabledListItem();
};

const isCookieNameDuplicated = cookieName => {
  const [list] = document.getElementsByClassName(LIST_CLASS);

  return Boolean(
    Array.from(list.children).find(
      listItem => listItem.innerText === cookieName
    )
  );
};

const dispatchToastrNotification = options => {
  const defaults = { delay: 3000, placement: 'bottom-right' };

  new bs5.Toast({
    ...defaults,
    ...options,
  }).show();
};

const registerAddButtonEventListener = () => {
  const form = document.querySelector('form');
  const [list] = document.getElementsByClassName(LIST_CLASS);

  form.addEventListener('submit', event => {
    event.preventDefault();

    const [list] = document.getElementsByClassName(LIST_CLASS);
    const cookieName =
      event.currentTarget.elements[COOKIE_NAME_INPUT_NAME].value.trim();

    if (cookieName === '') {
      dispatchToastrNotification({
        className: 'bg-warning',
        body: 'Cookie name must not be empty.',
      });

      return;
    }

    if (isCookieNameDuplicated(cookieName)) {
      dispatchToastrNotification({
        className: 'bg-warning',
        body: 'Cookie name was already added.',
      });

      return;
    }

    list.append(createListItem({ name: cookieName }));

    toggleDisabledListItem();
    setCookieOnStorage(cookieName);

    dispatchToastrNotification({
      className: 'bg-success text-light',
      body: `"${cookieName}" cookie name has been added.`,
    });
  });
};

const registerDeleteButtonEventListener = () => {
  const [list] = document.getElementsByClassName(LIST_CLASS);

  list.addEventListener('click', ({ target }) => {
    if (target.dataset['action'] === DATA_ACTION_DELETE_ITEM) {
      target.closest(`.${LIST_ITEM_CLASS}`).remove();

      const cookieName = target.closest(`.${LIST_ITEM_CLASS}`).innerText;

      removeCookieFromStorage(cookieName);
      toggleDisabledListItem();

      dispatchToastrNotification({
        className: 'bg-danger text-light',
        body: `"${cookieName}" cookie name has been removed.`,
      });
    }
  });
};

const initLocalStorageRecord = async () => {
  const record = await chrome.storage.local.get(STORAGE_COOKIE_NAMES_KEY);

  if (isEmptyObject(record)) {
    await chrome.storage.local.set({ cookies: [] });
  }
};

(async () => {
  initLocalStorageRecord();

  const cookies = await retrieveCookieNamesFromStorage();

  if (cookies.length > 0) {
    renderCookieNames(cookies);
  }

  registerAddButtonEventListener();
  registerDeleteButtonEventListener();
})();
