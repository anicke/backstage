import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

import { JiraClient, jiraApiRef } from './api';

export const jiraPlugin = createPlugin({
  id: 'jira',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: jiraApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new JiraClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const JiraPage = jiraPlugin.provide(
  createRoutableExtension({
    name: 'JiraPage',
    component: () => import('./components/JiraPage').then(m => m.JiraPage),
    mountPoint: rootRouteRef,
  }),
);
