import { html } from 'lit';
import { ErrorRouteDefinition, RouteDefinitions } from '../../src';

const sleep = (milliseconds: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const routes: RouteDefinitions = {
  '/': {
    resolve: () => [],
    render: () => html`<div>index page</div>`,
  },
  '/test': {
    resolve: () => [],
    render: () => html`<div>test page</div>`,
  },
  '/remote-component/:name': {
    resolve: ({ name }) => [
      import(/* webpackMode: "lazy" */ './remote-component'),
      sleep(300).then(() => {
        // return true;
        console.log('slow loading', name);
      }),
    ],
    render: ({ name }) =>
      html`<remote-component name=${name}></remote-component>`,
  },
  '/resolve-error': {
    resolve: () => [Promise.reject('resolve error')],
    render: () => html`<div>Will never render</div> `,
  },
  '/admin': {
    resolve: () => [Promise.reject(403)],
    render: () => html`<div>Welcome Mr. Admin</div> `,
  },
  403: {
    resolve: () => [],
    render: ({ request }) =>
      html`<div>You have no access to ${request.path}</div>`,
  } as ErrorRouteDefinition,
  404: {
    resolve: () => [],
    render: ({ request }) =>
      html`<div>Page "${request.path}" is not found</div>`,
  } as ErrorRouteDefinition,
};
