import { GameElement } from "../core-components/element.js";

export class TitledDialog extends GameElement {

    constructor() {
        super();
    }

    _css = `
    :host{
        display: flex; 
        flex-direction: column;
        position: absolute; 
        left: 50%; 
        transform: translateX(-50%); 
        bottom: 64px; 
        z-index: 2;
    }

    :host > div {
        padding: 0px 0px 8px 16px;
        box-sizing: border-box;
        font-size: 16pt;
        font-weight: bold;
    }

    :host g-window {
        height: 150px;
    }

    :host g-window div {
        width: 100%; 
        height: 100%; 
        padding: 24px; 
        box-sizing: border-box;
    }
`;
    template = `
    <div title>
    </div>
    <g-window w="100%" h="150px" color="0,0,0" opacity="0.5">
        <div message>
        </div>
    </g-window>
`;

    setPosition() {
        super.setPosition();
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : 'calc(100% - 48px)';
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : null;
    }

}

customElements.define('g-dialog-titled', TitledDialog);