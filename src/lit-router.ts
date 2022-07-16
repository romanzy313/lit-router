import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LitRouter } from './LitRouter';
import { Hash } from './mount/hash';
import { RouteDefinitions } from './types';

@customElement('lit-router')
export class LitRouterElement extends LitElement {
  // static styles = css``;

  public static router = new LitRouter();

  @property({ type: Array })
  routes!: RouteDefinitions;

  // TODO lots of work to do here to expose all available options

  @state()
  private currentView = html``;

  connectedCallback(): void {
    super.connectedCallback();
    LitRouterElement.router.define(this.routes).mountTo(Hash).start();

    LitRouterElement.router.on('route', (route) => {
      console.log('route is called');

      console.log('[lit-router] change', route);

      this.currentView = route.html;
    });
    // LitRouterBase.init();
  }

  disconnectedCallback(): void {
    LitRouterElement.router.stop();
    super.disconnectedCallback();
  }

  render() {
    return this.currentView;
  }
}

// customElements.define('lit-router-2', LitRouter);
