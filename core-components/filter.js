import { GameElement } from "./element.js";

export class Filter extends GameElement {

    constructor() {
        super(true);
        this.style.display = 'contents';
    }

    FILTER_DEMENSIONS = {
        blur: 'px',
        brightness: '',
        contrast: '%',
        'drop-shadow': '',
        grayscale: '%',
        'hue-rotate': 'deg',
        invert: '%',
        opacity: '%',
        saturate: '%',
        sepia: '%',
    }

    _legacy = '';
    get legacy() { return this._legacy; };
    set legacy(val) { this._leagcy = val; }

    update() {
        super.update();
        const filterName = this.getAttribute('name');
        const filterValue = this.getAttribute('value');
        const computed = `${this.legacy} ${filterName}(${filterValue}${this.FILTER_DEMENSIONS[filterName]})`;
        [...this.children].forEach(child => {
            if (customElements.get(child.localName) !== this.constructor) {
                if (this.hasAttribute('backdrop')) {
                    child.style.backdropFilter = `${computed}`;
                    child.style.webkitBackdropFilter = `${computed}`;
                }
                else {
                    child.style.filter = `${computed}`;
                }
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

customElements.define('g-filter', Filter);
