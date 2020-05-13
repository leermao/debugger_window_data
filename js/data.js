let debuggerUuid = 0;

function beginBracketByType(val) {
  return Array.isArray(val) ? "[" : "{";
}

function arrayLen(key, val) {
  return Array.isArray(val)
    ? `${key}(<em>array[${val.length}])</em>)`
    : `${key}(<em>Object</em>)`;
}

function render(datas) {
  const arr = [];
  arr.push("<div>");
  arr.push(renderDebuger());
  arr.push(renderContent(datas));
  arr.push("</div>");

  const divNode = document.createElement("div");
  divNode.id = "_chrome_debugger";
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
function renderItem(values, deep = 0, isArray) {
  const nextDeep = deep + 1;

  let out = `<div class="debugger-content-block depth-${deep}">`;

  for (let key in values) {
    const value = values[key];

    if (value instanceof Object && Object.keys(value).length) {
      out += `<div><span>${"&nbsp;".repeat(nextDeep * 4)}</span>`;
      const domid = `${debuggerUuid++}`;

      let objkey = `<input class="debugger-common-toggle" type="checkbox" name="debugger-toggles-${domid}" id="debugger-toggle-${domid}" /><label class="debugger-common-handle" for="debugger-toggle-${domid}">${arrayLen(
        key,
        value
      )} ${beginBracketByType(value)}<br/></label>`;

      out += `${objkey}`;

      const objVal = `
        ${renderItem(value, deep + 1, Array.isArray(value))}
        </div>
      `;

      out += `${objVal}`;
    } else {
      out += `<div><div class="base-css"><span>${"&nbsp;".repeat(
        nextDeep * 4
      )}</span>`;

      //key
      out += `<span class="key">${key}</span>:&nbsp;`;

      const copyDom = ``;

      // value
      out += `${setValueDomColor(value)} ${copyDom}</div></div>`;
    }
  }

  out += `<span>${"&nbsp;".repeat(deep * 4)}</span>${
    isArray ? "]" : "}"
  }</div>`;
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
  document.querySelector("body").appendChild(render(window.__DEBUG__));
}
