import { GameElement } from "../core-components/element.js";

export class Title extends GameElement {

    constructor() {
        super();
    }

    _css = `

    :host{
        display: contents;
    }

    slot{
        display: block; 
        position: absolute; 
        left: 0; 
        width: 100%;
        text-align: center;
        top: 148px; 
        font-size: 72pt;
        color: white;
        z-index: 3;
    }
`;

    template = `<g-filter name="drop-shadow" value="2px 2px 2px black">
            <slot></slot>
    </g-filter>`

}

customElements.define('g-title', Title);