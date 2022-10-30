import { GameElement } from "../core-components/element.js";

const traverse = (element) => {
    const isWrapper = window.getComputedStyle(element)?.display === 'contents';
    if (isWrapper) {
        return [...(element.shadowRoot ?? element).querySelectorAll(':host > :not(style), :scope > :not(style)')].map(traverse).flat();
    }
    return [element];
}

export class Layer extends GameElement {

    constructor() {
        super(true);
    }

    connectedCallback() {
        super.connectedCallback();

        this.style.display = this.hasAttribute('wrap') ? '' : 'contents';
        this.style.position = 'absolute';
        this.style.top = '0';
        this.style.left = '0';
        this.style.height = '100%';
        this.style.width = '100%';
        this.style.zIndex = this.getAttribute('z') ?? this.hasAttribute('wrap') ? '2' : '';

        if (!this.hasAttribute('wrap')) {
            traverse(this).forEach(element => element.style.zIndex = this.getAttribute('z') ?? '');
        }
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