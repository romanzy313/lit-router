import { html } from 'lit';
import { ErrorRouteDefinition, RouteDefinitions } from '../../src';

const sleep = (milliseconds: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const routes: RouteDefinitions = {
  '/': {
    resolve: () => [],
    render: () => html`index page`,
  },
  '/test': {
    resolve: () => [],
    render: () => html`test page`,
  },
  '/remote-component/:name': {
    resolve: ({ name }) => [
      import(/* webpackMode: "lazy" */ './remote-component'),
      sleep(300).then(() => {
        // return true;
        console.log('slow loading', name);
      }),
    ],
    render: ({ name }) => html`<remote-component name=${name}></remote-component>`,
  },
  '/resolve-error': {
    resolve: () => [Promise.reject('resolve error')],
    render: () => html` Will never render `,
  },
  '/admin': {
    resolve: () => [Promise.reject(403)],
    render: () => html` Welcome Mr. Admin `,
  },
  403: {
    resolve: () => [],
    render: ({ request }) => html` You have no access to ${request.path}`,
  } as ErrorRouteDefinition,
  404: {
    resolve: () => [],
    render: ({ request }) => html` Page "${request.path}" is not found`,
  } as ErrorRouteDefinition,
};
