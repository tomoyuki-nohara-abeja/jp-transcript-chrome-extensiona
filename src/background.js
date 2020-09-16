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
        chrome.tabs.sendMessage(tabs[0].id, {type: "transcript", transcript: "hogehoge"});

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
        chrome.runtime.onMessage.addListener(onStop);

        function onStop(request){
            if(request==="stopCapture"){
                stop_and_closeStream();
            }
        }

        const stop_and_closeStream = function(){
          chrome.runtime.onMessage.removeListener(onStop);

          liveStream.getAudioTracks()[0].stop();
          recorder && recorder.stop();

          // Speech-to-text
          transcript = audioRecognize(recorder, audio_context, 
            (results)=>{
              //[ISSUE] I want to send results to frontend....
              // chrome.tabs.sendMessage(tabs[0].id, {type: "transcript", transcript: transcript});
          });

          recorder.clear();

        }


        if(true) {
          let audio = new Audio();
          audio.srcObject = liveStream;
          audio.play();
        }


      });
    });
};


GID = 0

function audioRecognize(_recorder, _audio_context, _callback){
    GID += 1
    const ID = GID + 0
    // console.log("audioRecognize: ID", ID);

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
            console.log("api send ...");
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
                console.log(text);

                // if (result_json.result !== undefined){
                //     let transcript = result_json.results[0].alternatives[0].transcript;
                //     let confidence = result_json.results[0].alternatives[0].confidence;
                //     console.log("ID:", ID, transcript, confidence);
                // }else{
                //     console.log("ID:", ID, "-", "-");
                // }
            });
        };
        reader.readAsArrayBuffer(blob)

    });
}

