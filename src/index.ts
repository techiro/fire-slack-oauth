import express from 'express'
const app: express.Express = express();

import { InstallProvider } from '@slack/oauth';

// initialize the installProvider
const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,
  renderHtmlForInstallPath: (url) => `<html><body><a href="${url}">Install my app!</a></body></html>`,
  installUrlOptions: {
    scopes: [
      "chat:write",
      "channels:manage",
      "groups:write",
      "im:write",
      "mpim:write",
    ],
    userScopes: [
      "channels:write",
      "im:write",
      "mpim:write",
      "groups:write",
      "users.profile:write",
      "users.profile:read",
    ]
  }

});

app.get('/slack/install', async (req, res) => {
  await installer.handleInstallPath(req, res);
});


app.get('/slack/oauth_redirect', (req, res) => {
  installer.handleCallback(req, res);
});


//redicrect
app.get('slack/oauth_redirect', function (req, res, next) {
  res.send('<h1>Redirect</h1>');
});


//API
app.get('/api/:memberId', function(req,res,next){
  var memberId = req.params.memberId;
  var data = {"status":"OK","memberId":memberId}
  res.json(data);
});


app.listen(3000, function () {
  console.log("Start Express on port 3000.");
});