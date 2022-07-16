import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../../src/lit-router';
import { routes } from './routes';

@customElement('lit-route-example')
export class LitRouteDemo extends LitElement {
  render() {
    return html`
      <div>
        <h3>Header</h3>
        <a href="#/">Go home</a>
        <a href="#/test">Go test</a>
        <a href="#/remote-component/lit-router">With params</a>
        <a href="#/bad-route">Not found route</a>
      </div>
      <lit-router .routes=${routes}></lit-router>
    `;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
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
