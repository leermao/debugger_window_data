let debuggerUuid = 0;

function rendercss() {
  const cssdom = document.createElement("style");
  cssdom.innerHTML = `
    #chrome_debugger {
      font-size: 16px;
      line-height: 1.5;
      z-index: 11111;
    }

    #chrome_debugger #debugger-handle {
      position: fixed;
      right: 1px;
      top: 1px;
    }

    #chrome_debugger #debugger-content {
      width: 90%;
      height: 100%;
      position: fixed;
      left: 101%;
      top: 0;
      font-family: Consolas, "Courier New", monospace;
      overflow-y: scroll;
      overflow-x: hidden;
      z-index: 9999;
    }

    #chrome_debugger #debugger-content .value {
      color: #d8ffb0;
    }

    #chrome_debugger #debugger-content em {
      color: #40e0d0;
      font-weight: bold;
    }

    #chrome_debugger #debugger-content .special {
      color: #ff3333;
    }

    #chrome_debugger #debugger-content .number {
      color: #7fff00;
    }

    #chrome_debugger #debugger-toggle:checked ~ #debugger-content {
      left: 10%;
    }

    #chrome_debugger #debugger-toggle:checked ~ #debugger-handle {
      right: 90%;
    }

    #chrome_debugger .export {
      float: right;
    }

    #chrome_debugger .debugger-common-block {
      border: 1px solid #193441;
      box-shadow: 0px 0px 3px #3e606f;
      background: #3e606f;
      color: #fcfff5;
    }

    #chrome_debugger .debugger-handle-block {
      width: 50px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      font-weight: bold;
      font-size: 18px;
      background: -moz-linear-gradient(top, #ffc700 0, #ffab00 100%);
      background: -webkit-linear-gradient(top, #ffc700 0, #ffab00 100%);
      color: #333333;
      z-index: 10000;
    }

    #chrome_debugger .debugger-transition {
      -webkit-transition: all 0.2s ease-in-out;
      -moz-transition: all 0.2s ease-in-out;
      -ms-transition: all 0.2s ease-in-out;
      -o-transition: all 0.2s ease-in-out;
      transition: all 0.2s ease-in-out;
    }

    #chrome_debugger .debugger-common-toggle {
      display: none
    }

    #chrome_debugger .debugger-common-handle {
      cursor: pointer;
      display: inline;
    }

    #chrome_debugger .debugger-content-block {
      display: none;
    }

    #chrome_debugger
      .debugger-common-toggle:checked
      ~ .debugger-content-block {
      display: block;
    }

    #chrome_debugger .depth-0 {
      display: block;
    }

    #chrome_debugger .debugger-accordion-handle {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0 12px;
    }
  `;

  return cssdom;
}

function render(datas) {
  const arr = [];
  arr.push("<div>");
  arr.push(renderDebuger());
  arr.push(renderContent(datas));
  arr.push("</div>");

  const divNode = document.createElement("div");
  divNode.id = "chrome_debugger";
  divNode.innerHTML = arr.join("");

  return divNode;
}

/**
 * render debuger按钮
 */
function renderDebuger() {
  return `
      <input
        class="debugger-common-toggle"
        type="checkbox"
        id="debugger-toggle"
        name="debugger-toggle"
      />
      <label
        class="debugger-common-block debugger-handle-block debugger-transition"
        for="debugger-toggle"
        id="debugger-handle"
        >调试</label
      >`;
}

/**
 * render data内容
 */
function renderContent(datas) {
  let datalist = [];
  for (let data in datas) {
    const dataVal = datas[data];
    datalist.push(`<div class="debugger-accordion">
      <input
        class="debugger-common-toggle"
        type="checkbox"
        name="debugger-accordions-${data.toLowerCase()}"
        id="debugger-accordion-${data.toLowerCase()}"
      />
      <label
        class="debugger-common-block debugger-handle-block debugger-accordion-handle"
        for="debugger-accordion-${data.toLowerCase()}"
      >${data}</label>

      <div class="debugger-content-block">
        { ${renderItem(dataVal)}
      </div>
    </div>`);
  }

  return `<div id="debugger-content" class="debugger-transition debugger-common-block">
      ${datalist.join("")}
    </div>`;
}

/**
 *
 * @param {*} values
 * @param {*} deep
 *
 * render 每行内容 递归展示
 */
function renderItem(values, deep = 0) {
  const nextDeep = deep + 1;

  let out = `<div class="debugger-content-block depth-${deep}">`;

  for (let key in values) {
    const value = values[key];
    out += `<div><span>${"&nbsp;".repeat(nextDeep * 4)}</span>`;

    if (value instanceof Object && Object.keys(value).length) {
      const domid = `${debuggerUuid++}`;
      const len = Object.keys(value).length;

      let objkey = `<input class="debugger-common-toggle" type="checkbox" name="debugger-toggles-${domid}" id="debugger-toggle-${domid}" /><label class="debugger-common-handle"   for="debugger-toggle-${domid}" >${key} (<em>array[${len}])</em>) {<br/></label>`;

      out += `${objkey}`;

      const objVal = `
        ${renderItem(value, deep + 1)}
        </div>
      `;

      out += `${objVal}`;
    } else {
      //key
      out += `<span class="key">${key}</span>:&nbsp;`;

      // value
      out += `${setValueDomColor(value)} </div>`;
    }
  }

  out += `<span>${"&nbsp;".repeat(deep * 4)}</span>}</div>`;

  return out;
}

/**
 * 根据不同类型 展示不同样式
 */
function setValueDomColor(value) {
  // 对null，false，true等特殊值的处理
  let className = "";
  if (typeof value === "number") {
    className = "number";
  }

  if (typeof value === "boolean") {
    className = "special";
  }

  if (typeof value === "object") {
    className = "special";

    if (value !== null) {
      value = "array[0]";
    }
  }

  const valueName = typeof value === "string" ? `"${value}"` : value;
  return `<span class="value ${className}">${valueName}</span>`;
}

if (typeof window.__DEBUG__ !== undefined && window.__DEBUG__) {
  console.log(window.__DEBUG__);
  document.querySelector("body").appendChild(rendercss());
  document.querySelector("body").appendChild(render(window.__DEBUG__));
}
