const Router = require("express").Router;
const { tokenGenerator, voiceResponse } = require("./handler");
const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");

const router = new Router();

router.get("/token", (req, res) => {
    res.send(tokenGenerator());
});
router.post("/save", (req, res) => {
    const { RecordingUrl, RecordingSid } = req.body;
    const file = fs.createWriteStream(`./recordings/${RecordingSid}.wav`);
    console.log(RecordingUrl);
    const options = {
        method: "GET",
        auth: ``,
    };

    https.get(`${RecordingUrl}.mp3?RequestedChannels=2`, options, function (response) {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });

    res.json("saved");
});

router.post("/transcribe", (req, res) => {
  // res.set("Content-Type", "text/xml");
  // res.send(voiceResponse(req.body));
  console.log(req.body)
  const { sentences_url, transcript_sid } = req.body;
  const file = fs.createWriteStream(`./transcripts/${transcript_sid}.json`);
  // console.log(RecordingUrl);
  const options = {
      method: "GET",
      auth: ``,
  };

  https.get(`${sentences_url}`, options, function (response) {
      response.pipe(file);
      file.on("finish", () => {
          file.close();
          console.log("Download Completed");
      });
  });
  res.send(200)
});


router.post("/voice", (req, res) => {
    res.set("Content-Type", "text/xml");
    res.send(voiceResponse(req.body));
});

module.exports = router;
