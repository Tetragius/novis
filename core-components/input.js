import { GameElement } from "../core-components/element.js";

export class Input extends GameElement {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.shadowRoot.querySelector('input').onkeydown = (event) => {
            event.stopPropagation();
            this.dispatchEvent(new KeyboardEvent(event.type, event));
        }
    }

    #value = () => this.hasAttribute('$value') ? eval(this.getAttribute('$value')) : this.getAttribute('value') ?? '';
    get value() { return this.shadowRoot.querySelector('input').value }

    _css = `
        :host {
            flex: 1;
        }
        
        :host input{
            width: 100%;
            box-sizing: border-box;
            background: rgba(0,0,0,0.2);
            color: white;
            padding: 8px;
            border: none;
        }`;

    template = `<input ${this.hasAttribute('autofocus') && 'autofocus '}value="${this.#value()}" type="text" oninput="${this.getAttribute('onchange')}" />`

}

customElements.define('g-input', Input);