import { GameElement } from "../core-components/element.js";

export class Highlight extends GameElement {

    constructor() {
        super();
        this.style.display = 'contents';
    }

    filter = '';

    connectedCallback() {
        super.connectedCallback();
        const child = this.querySelector('*');
        child.style.zIndex = 1;
        child.addEventListener('mouseover', this.handlerOver);
        child.addEventListener('mouseout', this.handlerOut);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const child = this.querySelector('*');
        child.removeEventListener('mouseover', this.handlerOver);
        child.addEventListener('mouseout', this.handlerOut);
    }

    handlerOver = () => {
        const child = this.querySelector('*');
        this.filter = window.getComputedStyle(child)?.style?.filter ?? '';
        child.style.filter = `${this.filter}drop-shadow(0px 0px 8px ${this.getAttribute('color') ?? 'yellow'})`;
    }

    handlerOut = () => {
        const child = this.querySelector('*');
        child.style.filter = this.filter;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'color'];
    }

}

customElements.define('g-highlight', Highlight);