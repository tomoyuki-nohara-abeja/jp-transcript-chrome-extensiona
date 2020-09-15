//sends reponses to and from the popup menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "startCapture") {
   startCapture(); 
  }
});


const startCapture = function() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    // sets up stream for capture
      chrome.tabCapture.capture({audio: true}, (stream) => { 
        console.log("start tabCapture");

        const liveStream = stream;
        let base64 = ''
        let chunks = []


        const audio_context = new AudioContext();
        let input = audio_context.createMediaStreamSource(stream);
        let recorder = new Recorder(input);
        
        // start
        audio_context.resume()
        recorder && recorder.record();


        // controller

        function onStop(request){
            if(request==="stopCapture"){
                // console.log("stopCapture");
                stop_and_closeStream();
            }
        }
        chrome.runtime.onMessage.addListener(onStop);

        const stop_and_closeStream = function(){
          chrome.runtime.onMessage.removeListener(onStop);

          liveStream.getAudioTracks()[0].stop();
          recorder && recorder.stop();

          // Speech-to-text
          transcript = audioRecognize(recorder, audio_context, 
            (results)=>{
              //[ISSUE] impliment callback
              chrome.tabs.sendMessage(tabs[0].id, {type: "transcript", transcript: transcript});
          });

          recorder.clear();

        }


        if(true) {
          let audio = new Audio();
          audio.srcObject = liveStream;
          audio.play();
        }

        console.log("eof tabCapture");

      });
    });
};


GID = 0

function audioRecognize(_recorder, _audio_context, _callback){
    GID += 1
    const ID = GID + 0
    console.log("audioRecognize: ID", ID);

    function arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Float32Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    _recorder && _recorder.exportWAV(function (blob) {
        let reader = new FileReader();
        reader.onload = function () {
            let result = new Uint8Array(reader.result); // reader.result is ArrayBuffer
            let data = {
                "config": {
                    "encoding": "LINEAR16",
                    "sampleRateHertz": _audio_context.sampleRate, //48000, //44100, // microphoneによって変わりそう.
                    "languageCode": "ja-JP"
                },
                "audio": {
                    "content": arrayBufferToBase64(result)
                }
            };
            console.log("audio send...");
            fetch('https://speech.googleapis.com/v1/speech:recognize?key=' + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(data)
            }).then(function (response) {
                return response.text();
            }).then(function (text) {
                result_json = JSON.parse(text);
                //ここに処理
                // テキストデータ自体はresult_json.results[0].alternatives[0].transcriptに格納
                // console.log("RESULT: " + result_json);
                console.log(ID);
                console.log("RESULT: " + text);
                if (result_json.length > 0){
                    if (result_json.results.length>0){
                        console.log(result_json.results[0].alternatives[0].transcript);
                        _callback(result_json.results[0].alternatives[0].transcript);

                    }
                }
                // console.log(data)
            });
        };
        reader.readAsArrayBuffer(blob)

    });
}

