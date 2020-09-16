document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded");
  const start_button = document.getElementById('start_button');
  const stop_button = document.getElementById('stop_button');
  const status = document.getElementById('status');

  start_button.onclick = () => {
    status.innerHTML = "running";
    farewell = chrome.runtime.sendMessage("startCapture")
    console.log("onClick ", farewell);
  };

  stop_button.onclick = () => {
    status.innerHTML = "stop";
    chrome.runtime.sendMessage("stopCapture")
  };

  

});
