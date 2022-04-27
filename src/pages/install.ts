export const html = (url: string):string => {
  return `
  <html>
    <body>
      <div>Please press the following button</div>
      <a href="${url}">
        <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
      </a>
    </body>
  </html>
  `
}