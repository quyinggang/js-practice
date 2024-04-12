import express from 'express';
import { renderServerHtmlContent } from '../tools/render';
const app = express();
const port = 3000;

// 静态资源获取（js文件等）
app.use('/static', express.static('public'));

app.get('*', (req, res) => {
  const context = {};
  const htmlContent = renderServerHtmlContent(req.url, context);
  if (context.status) {
    res.status(context.status);
  }
  res.send(htmlContent);
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});