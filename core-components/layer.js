import { GameElement } from "../core-components/element.js";

export class Layer extends GameElement {

    constructor() {
        super(true);
        this.style.display = 'contents';
        this.style.position = 'absolute';
        this.style.top = '0';
        this.style.left = '0';
        this.style.height = '100%';
        this.style.width = '100%';
    }

    update() {
        super.update();
        this.style.mixBlendMode = this.getAttribute('blend');
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'blend'];
    }

}

customElements.define('g-layer', Layer);