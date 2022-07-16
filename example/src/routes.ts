import { html } from 'lit';
import { RouteDefinitions } from '../../src/types';

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
  '/not-found': {
    resolve: () => [Promise.reject('bad url')],
    render: () => html` Will never render `,
  },
};
