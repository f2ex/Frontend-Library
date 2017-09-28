console.clear();

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);


const items = $$("li");
const style = getComputedStyle(document.body);
const chromeWidth = style.getPropertyValue("--chrome");

const setCustomProperty = (property, value) => {
  style.setProperty('--${property}', value);
}

let notchRect = $(".notch").getBoundingClientRect();

window.addEventListener('resize', () => {
  notchRect = $(".notch").getBoundingClientRect();
})

bumpItems();

$(".inner").onscroll = onScroll;

function onScroll(e) {
  window.requestAnimationFrame(bumpItems)
}

function bumpItems() {
  for (let item of items) {
    const itemRect = item.getBoundingClientRect();
    if (itemRect.bottom > notchRect.top && itemRect.top < notchRect.bottom) {
      if (item.style.transform !== `translateX(${chromeWidth})`) {
        item.style.transform = `translateX(${chromeWidth})`;
      }
    } else {
      if (item.style.transform !== `translateX(0)`) {
        item.style.transform = `translateX(0)`;
      }
    }
  }
}