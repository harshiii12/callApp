const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const nameGenerator = require("../name_generator");
const config = require("../config");

var identity;

exports.tokenGenerator = function tokenGenerator() {
  identity = nameGenerator();

  const accessToken = new AccessToken(
    config.accountSid,
    config.apiKey,
    config.apiSecret
  );
  accessToken.identity = identity;
  const grant = new VoiceGrant({
    outgoingApplicationSid: config.twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
};

exports.voiceResponse = function voiceResponse(requestBody) {
  const toNumberOrClientName = requestBody.To;
  const callerId = config.callerId;
  let twiml = new VoiceResponse();
  const start = twiml.start();
  start.stream({
    url: 'wss://09ce-2405-201-3031-e080-10f-3fd7-68ed-1c80.ngrok-free.app',
  });
  let dial = twiml.dial({callerId, record: "record-from-ringing", recordingStatusCallback:" https://09ce-2405-201-3031-e080-10f-3fd7-68ed-1c80.ngrok-free.app/save"});
  dial.number({}, toNumberOrClientName)
  console.log(twiml.toString());
  return twiml.toString();
};



function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}

