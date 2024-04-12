const DARK_ALIAS = 'dark';
const LIGHT_ALIAS = 'light';
const keyValue = 'dynamic-css-theme'
const THEME_MAP = {
  [DARK_ALIAS]: 'theme.dark.css',
  [LIGHT_ALIAS]: 'theme.light.css'
}

const request = (url) => {
  return fetch(url).then(response => response.json())
}

const getUserConfig = async () => {
  return await request('./userConfig.json')
}

const findRemoveThemeLink = (key, fileName) => {
  if (!fileName) return;
  const head = document.head;
  const headChildren = head.children;
  for (const element of headChildren) {
    const tagName = String(element.tagName).toLowerCase();
    if (tagName === 'link' && element.hasAttribute(key) && element.hasAttribute('href')) {
      const href = element.getAttribute('href').trim();
      const signKey = element.getAttribute(key).trim();
      if (href && href.indexOf(fileName) >= 0 && signKey && signKey === keyValue) {
        head.removeChild(element);
      }
    }
  }
};

const injectCSS = (key, cssHref) => {
  if (!cssHref) return;
  const head = document.head;
  const firstChild = head.firstChild;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssHref;
  link.setAttribute(key, keyValue);
  head.insertBefore(link, firstChild);
};

export const updateTheme = (theme) => {
  const key = 'data-dynamic-theme-key';
  const formatThemeString = String(theme).toLowerCase().trim();
  const cssFileName = THEME_MAP[formatThemeString];
  if (!cssFileName) return
  findRemoveThemeLink(key, cssFileName);
  injectCSS(key, `./${cssFileName}`);
};

const init = async () => {
  const userConfig = await getUserConfig()
  updateTheme(userConfig.theme || '')
}

init()