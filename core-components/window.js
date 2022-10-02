import { GameElement } from "../core-components/element.js";

export class Window extends GameElement {

    constructor() {
        super();
    }

    _css = `
    :host{
        display: block; 
        position: relative;
        font-family: Arial;
        z-index: 2;
    }

    :host g-filter div {
        width: 100%; 
        height: 100%; 
        border-radius: 16px;
    }

    :host g-filter div div {
        width: 100%; 
        height: 100%; 
        border-radius: 16px; 
        box-sizing: border-box; 
        border: 4px solid gray; 
    }`;

    static get observedAttributes() {
        return [...super.observedAttributes, 'color', 'opacity', 'text-color']
    }

    update() {
        super.update();
        this.shadowRoot.querySelector('g-filter div div')
            .style
            .backgroundColor = this.hasAttribute('color') ? `rgba(${this.getAttribute('color')}, ${this.getAttribute('opacity') ?? 1})` : 'rgba(0,0,0,.5)';
        this
            .style
            .color = this.getAttribute('text-color') ?? 'white';
    }

    template = `
    <g-filter backdrop name="blur" value="10">
        <div>  
            <div>    
                <slot></slot>
            </div>
        </div>  
    </g-filter>
`;

}

customElements.define('g-window', Window);