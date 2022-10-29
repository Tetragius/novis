import { GameElement } from "./element.js";

export class Image extends GameElement {

    constructor() {
        super();
    }

    set src(value) {
        this.setAttribute('src', value);
    }

    connectedCallback() {
        super.connectedCallback();

        this.style.position = 'absolute';
        this.style.display = 'block';
        this.style.backgroundRepeat = 'no-repeat';
        this.style.backgroundPosition = 'center';
        this.style.backgroundSize = 'cover';
    }

    setPosition() {
        super.setPosition();
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : null;
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : null;
        if (!(this.hasAttribute('h') && this.hasAttribute('w'))) {
            this.style.aspectRatio = this.getAttribute('aspect-ratio') ?? '4 / 3';
        }
    }

    update() {
        super.update();
        this.style.backgroundImage = `url(${this.getAttribute('src')})`;
    }

    aspectRatio() {
        if (navigator.userAgent.includes('Safari') && navigator.userAgent.includes('Version/14')) {
            return this.getAttribute('aspect-ratio')?.trim().split('/').map(Number).sort((a, b) => a - b).reduce((a, b) => b / a, 1) * 100 ?? null;
        }
        return null;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'aspect-ratio', 'src']
    }

    _css = `
    :host:before{
        float: left;
        padding-top: ${this.aspectRatio()}%;
        content: ${this.aspectRatio() ? "''" : ''};
    }

    :host:after{
        display: block;
        content: ${this.aspectRatio() ? "''" : ''};
        clear: both;
    }`;

    template = '<slot></slot>'

}

customElements.define('g-image', Image);