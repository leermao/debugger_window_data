let debuggerUuid = 0;

// log 封装
const log = (...args) =>
  chrome.devtools.inspectedWindow.eval(`
    console.log(...${JSON.stringify(args)});
`);

function getData() {
  return new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      "window.__DEBUG__",
      (result, isException) => {
        resolve(result);
      }
    );
  });
}

function mounted() {
  getData()
    .then((result) => {
      if (!result) {
        $(".container").html(
          "<h1>请快速连按3次ctrl键，开启debug，查看数据<h1>"
        );
        return;
      }
      $(".container").html(render(result));
    })
    .then(() => {
      $(".copy-text").on("click", function () {
        handleCopyText(this);
      });
      $(".copy-path").on("click", function () {
        handleCopyText(this);
      });
    });
}

mounted();

chrome.tabs.onUpdated.addListener(() => {
  mounted();
});

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
  arr.push(renderContent(datas));
  arr.push("</div>");

  const divNode = document.createElement("div");
  divNode.id = "_chrome_debugger";
  divNode.innerHTML = arr.join("");
  return divNode;
}

/**
 * render data内容
 */
function renderContent(datas) {
  let datalist = [];
  for (let data in datas) {
    const dataVal = datas[data];
    datalist.push(`<div class="debugger-accordion">
      <div class="debugger-content">
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
function renderItem(values, deep = 0, isArray, path = "") {
  // const nextDeep = deep + 1;
  let out = `<div class="debugger-content-block depth-${deep}">`;

  for (let key in values) {
    const value = values[key];
    out += `<div class="render-line-item render-line-item${deep}">`;

    if (value instanceof Object && Object.keys(value).length) {
      out += `<div class="debugger_box">`;

      const domid = `${debuggerUuid++}`;

      let objkey = `<input class="debugger-common-toggle" type="checkbox" checked name="debugger-toggles-${domid}" id="debugger-toggle-${domid}" /><label class="debugger-common-handle" for="debugger-toggle-${domid}">${arrayLen(
        key,
        value
      )} ${beginBracketByType(value)}<br/></label>`;

      out += `${objkey}`;

      const newPath = isArray
        ? `${path}[${key}]`
        : path
        ? `${path}.${key}`
        : key;

      const objVal = `
            ${renderItem(value, deep + 1, Array.isArray(value), newPath)}
        </div>
      `;

      out += `${objVal}</div>`;
    } else {
      // out += `<div><div class="base-css debugger_box" style="padding:0 ${nextDeep * 30}px">`;
      out += `<div class="debugger_box">`;

      //key
      out += `<span class="key">${key}</span>:&nbsp;`;

      const copyDom = ``;

      // value
      out += `${setValueDomColor(value)} ${copyDom}</div>`;

      const copyPath = path ? `${path}.${key}` : key;

      // result
      out += `${renderCopyText(key, copyPath)}</div>`;
    }
  }

  out += `${isArray ? "]" : "}"}</div>`;
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

function renderCopyText(key, copyPath) {
  return `<div class="copy-box">
      <div class="copy-text">
        <input value=${key} />
        复制文本
      </div>
      <div class="copy-path">
        <input value=${copyPath} />
        复制路径
      </div>
    </div>`;
}

function handleCopyText(data) {
  const input = data.childNodes[1];
  input.select();
  document.execCommand("copy");
}
