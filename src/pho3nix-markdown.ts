import { LitElement, html, css, property, customElement, TemplateResult } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import 'pho3nix-spinner';

//@ts-ignore
import Showdown from 'showdown'; 

const converter = new Showdown.Converter();
converter.setOption('parseImgDimensions', true);
converter.setOption('simplifiedAutoLink', true);
converter.setOption('strikethrough', true);
converter.setOption('tables', true);
converter.setOption('tasklists', true);
converter.setOption('openLinksInNewWindow', true);
converter.setOption('emoji', true);
converter.setOption('underline', true);
converter.setOption('metadata', true);

@customElement('pho3nix-markdown')
export class Pho3nixMarkdown extends LitElement {
  private fetchedMarkdown: [string, string] = ['', ''];
  private fetchedTheme: [string, string] = ['', ''];
  private renderedMarkdown: TemplateResult = html``;
  private renderedTheme: TemplateResult = html``;

  @property({ type: Boolean, reflect: true, attribute: true })
  sticky = false;

  @property({ type: String, reflect: true, attribute: true })
  src = '';

  @property({ type: String, reflect: true, attribute: true })
  theme = '';

  async fetchMarkdown(src: string) {
    if (src) {
      const md = await fetch(src).then(async response => await response.text()).catch(() => '');
      if (md) this.fetchedMarkdown = [src, md];
      return md || this.fetchedMarkdown[1];
    }
    this.fetchedMarkdown = [src, ''];
    return '';
  }
  async fetchTheme(src: string) {
    if (src) {
      const css = await fetch(src).then(async response => await response.text()).catch(() => '');
      if (css) this.fetchedTheme = [src, css];
      return css || this.fetchedTheme[1];
    } 
    
    this.fetchedTheme = [src, '']
    return '';
  }

  async fetchAndConvertMarkdown(src: string, theme?: string) {
    const isSameMd = src === this.fetchedMarkdown[0];
    const isSameTheme = theme === this.fetchedTheme[0];
    const [md, style] = await Promise.all([this.fetchMarkdown(src), this.fetchTheme(theme || '')]);
    if (!isSameMd) {
      this.renderedMarkdown = html`${unsafeHTML(converter.makeHtml(md))}`;
    }
    if (!isSameTheme) {
      this.renderedTheme = html`<style>${style}</style>`;
    }
    return html`${this.renderedTheme}${this.renderedMarkdown}`;
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          color: white;
        }
        img {
          display: block;
          margin: auto;

          height: auto;
          max-height: 100%;

          width: auto;
          max-width: 100%;
        }
      `
    ];
  }

  private renderSpinner() {
    return html`
    <style>
      pho3nix-spinner {
        --ripple-size: 128px;
        --ripple-color: #fff;
        --ripple-style: solid;
      }
    </style>
    <pho3nix-spinner></pho3nix-spinner>
    `;
  }

  protected render() {
    const md = this.fetchAndConvertMarkdown(this.src, this.theme);
    return html`${until(md, this.renderSpinner())}`;
  }
}
