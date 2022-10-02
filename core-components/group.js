import { GameElement } from "../core-components/element.js";

export class Group extends GameElement {

    constructor() {
        super();
    }

    _css = `
    :host{
        display: flex;
        flex-direction: ${this.hasAttribute('horizontal') ? 'row' : 'column'};
        align-items: ${this.hasAttribute('align')}; 
        position: relative; 
    }

    ::slotted(*:not(:last-child)){
        margin-bottom: ${!this.hasAttribute('horizontal') ? '8px' : ''};
        margin-right: ${this.hasAttribute('horizontal') ? '8px' : ''};
    }
`;

}

customElements.define('g-group', Group);