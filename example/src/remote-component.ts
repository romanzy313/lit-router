import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('remote-component')
export class RemoteComponent extends LitElement {
  @property()
  name!: string;

  render() {
    return html` <div>Hello, ${this.name}</div>`;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}
