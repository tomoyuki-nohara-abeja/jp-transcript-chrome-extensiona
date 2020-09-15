document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded");
  const start_button = document.getElementById('start_button');
  const stop_button = document.getElementById('stop_button');
  const status = document.getElementById('status');

  start_button.onclick = () => {
    status.innerHTML = "running";
    chrome.runtime.sendMessage("startCapture")
  };

  stop_button.onclick = () => {
    status.innerHTML = "stop";
    chrome.runtime.sendMessage("stopCapture")
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if(request.type === "transcript"){
      console.log(sender);
      console.log("[popup.js] ", request.transcript);
    }
  });
});