import express from 'express';
const app: express.Express = express();

import { Installation, InstallationQuery, InstallProvider, Logger } from '@slack/oauth';

// Error: Cannot find module 'model/slackError'
import { CustomSlack } from 'model/user';
import { NoWorkSpaceError } from 'model/slackError';
import { SlackAppRepository } from 'repository/slackAppRepository';
import { slackAppAuth, slackInfoDB } from 'plugins/firebase';

// initialize the installProvider
const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,
  renderHtmlForInstallPath: (url) => `<html><body><a href="${url}">Install my app!</a></body></html>`,
  installationStore: {
    storeInstallation: async (
      installation: Installation<any, boolean>,
      logger?: Logger | undefined
    ) => {
      new Promise<void>(async (resolve, reject) => {
        if (
          installation.isEnterpriseInstall &&
          installation.enterprise !== undefined
        ) {
          // OrG 全体へのインストールに対応する場合
          logger?.info("OrG 全体へのインストールに対応する場合");
          reject(new NoWorkSpaceError());
        }
        if (installation.team !== undefined) {
          // 単独のワークスペースへのインストールの場合
          logger?.info("単独のワークスペースへのインストールの場合");
          logger?.debug(installation.toString());
          const data: CustomSlack.User = {
            teamId: installation.team.id,
            teamName: installation.team.name ?? "",
            enterpriseId: installation.enterprise?.id ?? "",
            enterpriseName: installation.enterprise?.name ?? "",
            userToken: installation.user.token ?? "",
            userId: installation.user.id,
          };
          logger?.debug(data);
          const firebaseRepository = new SlackAppRepository(slackAppAuth, slackInfoDB);
          await firebaseRepository.storeFirestoreData(data);
          resolve();
        }
      });
    },
    fetchInstallation: async (
      query: InstallationQuery<boolean>,
      logger?: Logger | undefined
    ) => {
      return new Promise<Installation<"v1" | "v2", boolean>>(
        (resolve, reject) => {
          if (
            query.isEnterpriseInstall &&
            query.enterpriseId !== undefined
          ) {
            // OrG 全体へのインストール情報の参照
            logger?.debug("Fetching installation for OrG");
          }
          if (query.teamId !== undefined) {
            logger?.debug("Fetching installation for workspace");
          }
        }
      );
    },
  },
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
  installer.installationStore;
});


// //redicrect
// app.get('slack/oauth_redirect', function (req, res, next) {
//   res.send('<h1>Redirect</h1>');
// });


//API
app.get('/api/:memberId', function(req,res,next){
  var memberId = req.params.memberId;
  var data = {"status":"OK","memberId":memberId}
  res.json(data);
});


app.listen(3000, function () {
  console.log("Start Express on port 3000.");
});