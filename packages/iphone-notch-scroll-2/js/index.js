console.clear();

const THRESH = 10;

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const items = $$("li");
const style = getComputedStyle(document.body);
// const chromeWidth = style.getPropertyValue("--chrome");
const chromeWidth = 22.5;

const setCustomProperty = (property, value) => {
  style.setProperty("--${property}", value);
};

let notchRect = $(".notch").getBoundingClientRect();

window.addEventListener("resize", () => {
  notchRect = $(".notch").getBoundingClientRect();
});

bumpItems();

$(".inner").onscroll = onScroll;

function onScroll(e) {
  window.requestAnimationFrame(bumpItems);
}

function bumpItems() {
  for (let item of items) {
    const itemRect = item.getBoundingClientRect();
    const distFromBottom = itemRect.top - notchRect.bottom;
    const distFromTop = itemRect.bottom - notchRect.top;

    if (Math.abs(distFromTop) < THRESH) {
      item.style.transform = `translateX(${lerp(
        0,
        chromeWidth,
        (distFromTop + THRESH) / (THRESH * 2)
      )}px)`;
    } else if (
      distFromTop > 0 &&
      Math.abs(distFromBottom) > THRESH &&
      distFromBottom < 0
    ) {
      item.style.transform = `translateX(${chromeWidth}px)`;
    } else if (Math.abs(distFromBottom) < THRESH) {
      item.style.transform = `translateX(${lerp(
        chromeWidth,
        0,
        (distFromBottom + THRESH) / (THRESH * 2)
      )}px)`;
    } else {
      item.style.transform = `translateX(0)`;
    }
  }
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}