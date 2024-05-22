const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const router = require("./src/router");

// Create Express webapp
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(router);

// Create http server and run it
const server = http.createServer();
const port = process.env.PORT || 3000;

let WSServer = require("ws").Server;
let wss = new WSServer({
    server: server,
});
const {
    AudioConfig,
    AudioInputStream,
    SpeechRecognizer,
    SpeechConfig,
} = require("microsoft-cognitiveservices-speech-sdk");

server.on("request", app);

const speechConfig = SpeechConfig.fromSubscription(
    "56789552fd00412fb4cc9407e7a1e8a8",
    "centralindia"
);
speechConfig.speechRecognitionLanguage = "en-US";

const recognizer = new SpeechRecognizer(speechConfig, AudioConfig.fromStreamInput());

wss.on("connection", function connection(ws) {
    const audioConfig = AudioConfig.fromStreamInput(
        new AudioInputStream({
            format: AudioStreamFormat.getWaveFormatPCM(16000, 16, 1),
        })
    );

    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`);
    };

    recognizer.recognized = (s, e) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${e.result.text}`);
        } else if (e.result.reason === ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be recognized.");
        }
    };

    recognizer.startContinuousRecognitionAsync();

    ws.on("message", function incoming(message) {
        // console.log(`received: ${message}`);
        const msg = JSON.parse(message);
        switch (msg.event) {
            case "connected":
                console.log("connected");
            case "start":
                // console.log("connected");
                break;
            case "media":
                // console.log("received call packet");
                recognizer.sendAudio(msg.audio);
                break;
            case "stop":
                recognizer.stopContinuousRecognitionAsync(() => {
                    recognizer.close();
                });
                // console.log("connected");
                break;
            default:
                break;
        }
    });
});

server.listen(port, function () {
    console.log("server running on *:" + port);
});
