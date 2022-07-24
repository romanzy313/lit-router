import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../../src/lit-router';
import { routes } from './routes';

@customElement('lit-route-example')
export class LitRouteDemo extends LitElement {
  render() {
    return html`
      <div class="nav">
        <h3>Navigation bar</h3>
        <a href="/">Home</a>
        <a href="#/test">Test</a>
        <a href="#/remote-component/lit-router">Parameters</a>
        <a href="#/not-found">Not found</a>
        <a href="#/resolve-error">Resolve error</a>
        <a href="#/admin">Admin page</a>
      </div>
      <lit-router .routes=${routes}></lit-router>
    `;
  }

  static styles = css`
    :host {
      margin-block: 1rm;
      /* max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center; */
    }
    .nav {
      display: flex;
      flex-direction: column;
      margin-bottom: 2rem;
      background-color: lightgray;
    }
    h3 {
      padding: 0;
      margin: 0;
    }
    a {
      margin-inline: 1rem;
    }
    lit-router {
      margin-top: 5rem;
      text-align: center;
    }
  `;
}
