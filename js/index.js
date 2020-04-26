function injectScript(file, node) {
  var body = document.getElementsByTagName(node)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file);
  body.appendChild(script);
}
injectScript(chrome.extension.getURL("js/data.js"), "body");

function injectStyle(url, node) {
  const head = document.getElementsByTagName(node)[0];
  const link = document.createElement("link", node);
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  head.appendChild(link);
}
injectStyle(chrome.extension.getURL("./css/debugger.css"), "head");
