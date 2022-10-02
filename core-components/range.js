import { GameElement } from "../core-components/element.js";

export class Range extends GameElement {

    constructor() {
        super();
    }

    value = () => this.hasAttribute('$value') ? eval(this.getAttribute('$value')) : this.getAttribute('value') ?? 0;

    _css = `
        :host {
            flex: 1;
        }
        
        :host input{
            width: 100%;
        }`;

    template = `<input type="range" min="${this.getAttribute('min')}" max="${this.getAttribute('max')}" step="${this.getAttribute('step')}"
    value="${this.value()}"
    oninput="${this.getAttribute('onchange')}" />`

}

customElements.define('g-range', Range);