import React from 'react';
import { renderToString } from 'react-dom/server'
import { StaticRouter, BrowserRouter } from 'react-router-dom';
import Routes from '../router';
import { Provider } from 'react-redux';
import store from '../store';
import { matchRoutes, renderRoutes } from 'react-router-config';

  // 定义客户端渲染的路由信息
const ClientRootApp = function() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        { renderRoutes(Routes) }
      </BrowserRouter>
    </Provider>
  );
}

// 服务端渲染请求相关数据填充到store中
const serverAjaxData = function(path) {
  const matchResult = matchRoutes(Routes, path);
  matchResult.forEach(({ route }) => {
    if (typeof route.loadData === 'function') {
      route.loadData(store);
    }
  })
}

const renderServerHtmlContent = function(path, context) {
  serverAjaxData(path);
  
  /*
    需要注意renderToString处理，只会渲染根路由对应的组件（即组件的render函数会被调用），
    之后子路由匹配的组件的渲染会被客户端接管；
    服务端渲染中路由的处理跟react-router-config的renderRoutes存在关联，当组件渲染时其内部存在renderRoutes就会触发路由组件本身的渲染
  */
  const content = renderToString((
    <Provider store={store}>
      <StaticRouter location={path} context={context}>
        { renderRoutes(Routes) }
      </StaticRouter>
    </Provider>
  ));

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React SSR</title>
    <script crossorigin src="https://unpkg.com/react@17.0.2/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js"></script>
  </head>
  <body>
    <div id="root">${content}</div>
    <script src="/static/index.js"></script>
  </body>
  </html>`;
};

export {
  renderServerHtmlContent,
  ClientRootApp
};

