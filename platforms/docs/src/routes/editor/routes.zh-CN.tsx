// eslint-disable-next-line unicorn/filename-case
import { Route } from '../types';

const routes: Array<Route> = [
  {
    name: '总览',
    path: '/',
    component: () => import('../../views/editor/index.zh-CN.mdx'),
  },
  {
    name: '基本用法',
    path: '/basic',
    component: () => import('../../views/editor/basic/index.zh-CN.mdx'),
  },
];

export default routes;
