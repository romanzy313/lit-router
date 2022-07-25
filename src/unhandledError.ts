import { html } from 'lit';
import { ErrorRouteDefinition } from './types';

export const unhandledErrorRoute: ErrorRouteDefinition = {
  resolve: () => [],
  render: ({ error, request }) => {
    return html`<div>
      Unhandled route error in ${request.path}. Error message: ${error.message}
    </div>`;
  },
};
// <pre>${(error as any).message ?? error ?? 'Unkown'}</pre>;
