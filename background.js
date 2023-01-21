chrome.runtime.onInstalled.addListener(async () => {
  const settings = { dateLastChecked: Date.now() };
  await setChromeStorageSync({ settings: settings });
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const response = await fetch(
    "https://raw.githubusercontent.com/robiningelbrecht/playstation-easy-platinums/master/public/chrome-extension.json"
  );
  const json = await response.json();

  const settings = await getChromeStorageSync("settings");
  const dateLastChecked = new Date(parseInt(settings.dateLastChecked));
  const dateLastAddedGame = new Date(json.lastUpdate.date);

  if (dateLastChecked >= dateLastAddedGame) {
    return;
  }

  await chrome.action.setBadgeText({
    text: "!",
  });
  await chrome.action.setBadgeBackgroundColor({
    color: "#e63946",
  });
});

const getChromeStorageSync = async function (key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

const setChromeStorageSync = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(obj, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
