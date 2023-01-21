const response = await fetch(
  "https://raw.githubusercontent.com/robiningelbrecht/playstation-easy-platinums/master/public/chrome-extension.json"
);

if (response.status !== 200) {
  const message = `An error has occured: ${response.status}`;
  throw new Error(message);
}

const { settings } = await chrome.storage.sync.get("settings");
const dateLastChecked = new Date(parseInt(settings.dateLastChecked));

await chrome.storage.sync.set({ settings: { dateLastChecked: Date.now() } });
await chrome.action.setBadgeText({
  text: "",
});

const json = await response.json();
const $root = document.querySelector("div.root");

const $h1 = document.querySelector("h1");
$h1.setAttribute(
  "title",
  "Last updated on " +
    new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(json.lastUpdate.date))
);

const template = document.createElement("template");
template.innerHTML = `
<a class="game" target="_blank">
  <div class="icon">
      <img alt="icon" loading="lazy" />
  </div>
  <div class="content">
      <div class="main">
          <div class="title-wrapper">
              <div class="title"></div>
              <kbd></kbd>
          </div>
          <div class="trophies">
              <div class="trophy trophy--platinum">
                  <span>1</span>
              </div>
              <div class="trophy trophy--gold">
                  <span></span>
              </div>
              <div class="trophy trophy--silver">
                  <span></span>
              </div>
              <div class="trophy trophy--bronze">
                  <span></span>
              </div>
          </div>
      </div>
      <div class="meta">
          <div class="time">
              <img src="/images/assets/time.svg" alt="time" />
              <span></span>
          </div>
          <div class="price">
              <img src="/images/assets/price.svg" alt="price" />
              <span></span>
          </div>
          <div class="points">
              <img src="/images/assets/arrow-up.svg" alt="points" />
              <span>1350 points</span>
          </div>
      </div>
  </div>
</a>
`;

$root.innerHTML = "";
json.games.forEach((game) => {
  const $game = template.content.cloneNode(true);
  const $gameRootNode = $game.getRootNode().querySelector(".game");
  $gameRootNode.setAttribute("href", game.uri);

  if (dateLastChecked < new Date(game.addedOn.date)) {
    $gameRootNode.classList.add("unread");
  }

  const $icon = $game.querySelector("div.icon img");
  $icon.setAttribute(
    "src",
    "https://github.com/robiningelbrecht/playstation-easy-platinums/raw/master/assets/thumbs/" +
      game.thumbnail
  );

  const $platformAndRegion = $game.querySelector("div.main kbd");
  $platformAndRegion.innerHTML = [game.platform, game.region]
    .filter((part) => part !== null)
    .join(" &#9679; ");

  const $title = $game.querySelector("div.main div.title");
  $title.innerHTML = game.title;

  const $trophyGold = $game.querySelector("div.trophies div.trophy--gold span");
  $trophyGold.innerHTML = game.trophiesGold;

  const $trophySilver = $game.querySelector(
    "div.trophies div.trophy--silver span"
  );
  $trophySilver.innerHTML = game.trophiesSilver;

  const $trophyBronze = $game.querySelector(
    "div.trophies div.trophy--bronze span"
  );
  $trophyBronze.innerHTML = game.trophiesBronze;

  const $time = $game.querySelector("div.meta div.time span");
  $time.innerHTML = game.approximateTime + " min";

  const $price = $game.querySelector("div.meta div.price span");
  $price.innerHTML = game.priceFormatted || "???";

  const $points = $game.querySelector("div.meta div.points span");
  $points.innerHTML = game.points + " points";

  $root.appendChild($game);
});
