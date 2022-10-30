import { GameElement } from "./element.js";

export class Transform extends GameElement {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.style.display = 'contents';
    }

    TRANSFORM_DEMENSIONS = {
        matrix: '',
        matrix3d: '',
        perspective: '',
        rotate: 'turn',
        rotate3d: '',
        rotateX: 'deg',
        rotateY: 'deg',
        rotateZ: 'deg',
        translate: '',
        translate3d: '',
        translateX: 'px',
        translateY: 'px',
        translateZ: 'px',
        scale: '',
        scale3d: '',
        scaleX: '',
        scaleY: '',
        scaleZ: '',
        skew: '',
        skewX: 'deg',
        skewY: 'deg',
    }

    _legacy = '';
    get legacy() { return this._legacy; };
    set legacy(val) { this._leagcy = val; }

    update() {
        super.update();
        const transformName = this.getAttribute('name');
        const transformValue = this.getAttribute('value');
        const computed = `${this.legacy} ${transformName}(${transformValue}${this.TRANSFORM_DEMENSIONS[transformName]})`;
        [...this.children].forEach(child => {
            if (customElements.get(child.localName) !== this.constructor) {
                child.style.transform = `${computed}`;
            }
            else {
                child.legacy = child.legacy ? `${child.legacy} ${computed}` : computed;
            }
        });
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'name', 'value'];
    }

}

customElements.define('g-transform', Transform);
