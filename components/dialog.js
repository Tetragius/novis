import { GameElement } from "../core-components/element.js";

export class Dialog extends GameElement {

    constructor() {
        super();
    }

    _css = `
    :host{
        display: block; 
        position: absolute; 
        left: 50%; 
        transform: translateX(-50%); 
        bottom: 64px;
        z-index: 2;
    }

    :host div {
        width: 100%; 
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
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : 'calc(100% - 48px)';
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : '150px';
    }

}

customElements.define('g-dialog', Dialog);