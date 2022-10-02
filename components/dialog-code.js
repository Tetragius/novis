import { GameElement } from "../core-components/element.js";

export class DialogCode extends GameElement {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.shadowRoot.querySelector('g-input')
            ?.addEventListener('keydown', ({ key, target }) => {
                if (key === 'Enter') {
                    this.dispatchEvent(new CustomEvent('submit', { detail: target.value }));
                }
            })
    }

    _css = `
    :host{
        display: block; 
        position: absolute; 
        left: 50%; 
        top: 50%;
        transform: translate(-50%, -50%); 
        z-index: 2;
    }

    :host div {
        min-width: 200px; 
        height: 100%; 
        padding: 24px; 
        box-sizing: border-box;
    }

    :host div:first-child {
        padding-bottom: 8px; 
    }
    
    :host div:last-child {
        padding-top: 8px; 
    }`;

    template = `
    <g-window w="100%" h="100%" color="0,0,0" opacity="0.5">
        <div title></div>
        <div>
            <g-input autofocus></g-input>
        </div>
    </g-window>
`;

    setPosition() {
        super.setPosition();
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : null;
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : null;
    }

}

customElements.define('g-dialog-code', DialogCode);