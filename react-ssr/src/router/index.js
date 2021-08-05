import React from 'react';
import { Redirect } from 'react-router-dom';
import { homeLoadData } from '../components/Home/actions';
import Layout from '../components/Layout';
import asyncComponent from '../tools/asyncComponent';

const Home = asyncComponent(() => import('../components/Home'));
const Content = asyncComponent(() => import('../components/Content'));
const NotFound = asyncComponent(() => import('../components/NotFound'));

export default [
  {
    path: '/',
    component: Layout,
    routes: [
      {
        path: '/',
        exact: true,
        render: () => (<Redirect to='/home' />),
        loadData: homeLoadData
      },
      {
        path: '/home',
        exact: true,
        key: 'home',
        component: Home
      },
      {
        path: '/content',
        exact: true,
        key: 'content',
        component: Content
      },
      {
        key: '404',
        render: ({ staticContext }) => {
          // 借助StaticRouter的context
          if (staticContext) staticContext.status = 404;
          return <NotFound />
        }
      }
    ]
  },
];