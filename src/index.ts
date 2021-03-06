import express from 'express';
import functions from 'firebase-functions';
import { Installation, InstallationQuery, InstallProvider, Logger } from '@slack/oauth';

// Error: Cannot find module 'model/slackError'
import { CustomSlack } from 'model/user';
import { NoWorkSpaceError } from 'model/slackError';
import { SlackAppRepository } from 'repository/slackAppRepository';
import { slackAppAuth, slackInfoDB } from 'plugins/firebase';
import { WebClient } from '@slack/web-api';
import { html } from 'pages/install';


const app: express.Express = express();
// initialize the installProvider
const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,
  renderHtmlForInstallPath: (url) => html(url),
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

          (async () => {
            const token  = process.env.SLACK_BOT_TOKEN;
            const client = new WebClient(token);
            const response = await client.conversations.open({
              token: process.env.SLACK_BOT_TOKEN!,
              users: installation.user.id,
            });
            //TODO:このコードは削除する
            // if (user.userId == process.env.NOT_AUTH_USER) {
            try {
              client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN!,
                channel: response.channel?.id!,
                text: `Thank you <@${data.userId}>! 状態の変更は10分後に反映されます。Changes in status are reflected after 10 minutes.\n また、本システムの詳しい説明は、以下のURLから確認できます。 A detailed description of this system can be found at the following URL \n<https://www.notion.so/office-now-App-574203d2d25042c29461d415b4543f4a|*What is Office now?*>\nBeaconを持っていない場合は<@${process.env.MASTER_USER_ID}>に連絡してください。 If you don't have Beacon, please contact <@${process.env.MASTER_USER_ID}>.`,
              });
            } catch (error) {
              console.log(error);
            }
            // 投稿に成功すると `ok` フィールドに `true` が入る。
            console.log(response.ok);
            // => true
          })();
          //MASTERにチャットメッセージを送信
          (async () => {
            const token  = process.env.SLACK_BOT_TOKEN;
            const client = new WebClient(token);
            const response = await client.conversations.open({
              token: process.env.SLACK_BOT_TOKEN!,
              users: process.env.MASTER_USER_ID,
            });
            //TODO:このコードは削除する

            try {
              client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN!,
                channel: response.channel?.id!,
                text: `<@${data.userId}>さんの OAuth認証が完了しました。\nビーコンを受け取っていない場合、以下のURLを送付してください。\nOfficeNowアプリのインストールありがとうございます！ビーコンを渡したいと思います。私が学校にいない場合は、田中の席に置いているので取りに来てください。<https://www.notion.so/Beacon-ad08af0fd2f34fa1abad98a0084b3ff1|*For those who have not received a Beacon*>`,
              });
            } catch (error) {
              console.log(error);
            }
            // 投稿に成功すると `ok` フィールドに `true` が入る。
            console.log(response.ok);
            // => true
          })();

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
      "channels:read",
      "groups:read",
      "mpim:read",
      "im:read",
    ],
    userScopes: [
      "channels:write",
      "im:write",
      "mpim:write",
      "groups:write",
      "users.profile:write",
      "users.profile:read",
      "channels:read",
      "groups:read",
      "mpim:read",
      "im:read",
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

app.get('/monitor', (req, res) => { res.send('<h1>Monitor</h1>'); });

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

// export const firebaseApp = functions.https.onRequest(app);
app.listen(3000, function () {
  console.log("Start Express on port 3000.");
});