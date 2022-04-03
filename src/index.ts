import express from 'express'
const app = express();

//redicrect
app.get('slack/oauth_redirect', function (req, res, next) {
  res.send('<h1>Redirect</h1>');
});


//install
app.get('/slack/install', async (req, res) => {
  res.send('<h1>Install</h1>\n<a href="https://google.com/">サンプルサイトへ飛びます。</a>' + process.env.TEST);
});

//API
app.get('/api/:memberId', function(req,res,next){
  var memberId = req.params.memberId;
  var data = {"status":"OK","memberId":memberId}
  res.json(data);
});


app.listen(3000, function(){
  console.log("Start Express on port 3000.");
});