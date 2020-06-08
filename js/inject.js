// mac command win ctrl
let count = 0;
let timer = "";
const dbgOpts = "front_dbg=1";

window.onkeyup = (e) => {
  if (e.keyCode === 17) {
    console.log(count);
    count++;
    if (count === 3) {
      if (location.href.indexOf(`${dbgOpts}`) < 0) {
        location.href = location.href.split("?")[1]
          ? (location.href += `&${dbgOpts}`)
          : (location.href += `?${dbgOpts}`);
      }
    }
    clearTimeout(timer);
    timer = setTimeout(function () {
      count = 0;
    }, 500);
  }
};
