const STORAGE_COOKIE_NAMES_KEY = 'cookies';

const LIST_CLASS = 'list-group';
const LIST_ITEM_CLASS = 'list-group-item';
const COOKIE_NAME_INPUT_NAME = 'cookie-name';
const DATA_ACTION_DELETE_ITEM = 'delete-item';
const DISABLED_LIST_ITEM_SELECTOR = '[data-action="disabled-item"]';

const COOKIE_NAMES_FROM_STORAGE = [
  'H24AuthToken',
  'H24DeviceID',
  'H24DeviceSessionID',
];

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
  // @TODO: fetch cookie names from Chrome Extensions API
  const cookies = {};

  return isEmptyObject(cookies) ? null : COOKIE_NAMES_FROM_STORAGE;
};

const renderCookieNames = cookies => {
  for (let i = 0; i < cookies.length; i++) {
    const [list] = document.getElementsByClassName(LIST_CLASS);

    list.append(createListItem({ name: cookies[i] }));
  }

  toggleDisabledListItem();
};

const registerAddButtonEventListener = () => {
  const form = document.querySelector('form');
  const [list] = document.getElementsByClassName(LIST_CLASS);

  form.addEventListener('submit', event => {
    event.preventDefault();

    const [list] = document.getElementsByClassName(LIST_CLASS);
    const cookieName =
      event.currentTarget.elements[COOKIE_NAME_INPUT_NAME].value;

    list.append(createListItem({ name: cookieName }));

    toggleDisabledListItem();
  });
};

const registerDeleteButtonEventListener = () => {
  const [list] = document.getElementsByClassName(LIST_CLASS);

  list.addEventListener('click', ({ target }) => {
    if (target.dataset['action'] === DATA_ACTION_DELETE_ITEM) {
      target.closest(`.${LIST_ITEM_CLASS}`).remove();

      toggleDisabledListItem();
    }
  });
};

(async () => {
  const cookies = await retrieveCookieNamesFromStorage();

  if (cookies) {
    renderCookieNames(cookies);
  }

  registerAddButtonEventListener();
  registerDeleteButtonEventListener();
})();
