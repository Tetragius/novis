import { GameElement } from "../core-components/element.js";

export class MenuDialog extends GameElement {

    constructor() {
        super();
    }

    _css = `
    :host{
        display: block; 
        position: absolute; 
        left: 50%; 
        top: 50%;
        transform: translate(-50%, -50%); 
        padding: 24px; 
        z-index: 2;
    }

    :host div {
        min-width: 200px; 
        height: 100%; 
        padding: 24px; 
        box-sizing: border-box;
    }
`;
    template = `
    <g-window w="100%" h="100%" color="0,0,0" opacity="0.5">
        <div>
            <slot></slot>
        </div>
    </g-window>
`;

    setPosition() {
        super.setPosition();
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : null;
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : null;
    }

}

customElements.define('g-dialog-menu', MenuDialog);