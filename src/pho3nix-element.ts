import { LitElement, html, css, property, customElement } from 'lit-element';

@customElement('pho3nix-element')
export class Pho3nixElement extends LitElement {
  @property({ type: Boolean, reflect: true, attribute: true })
  sticky = false;

  static get styles() {
    return [
      css`
        h1 {
          color: red;
        }
      `
    ];
  }

  private get element(): HTMLElement | null {
    return this.renderRoot && this.renderRoot.querySelector('h1');
  }

  private get slotted(): Node[] | null {
    const slot: HTMLSlotElement | null = this.renderRoot && this.renderRoot.querySelector('slot');
    return slot && slot.assignedNodes();
  }

  protected render() {
   return html`<h1>It's working</h1>`;
  }
}
