import { DataManager } from '../services/dataManager.js';
import { CommandManager } from '../services/commandManager.js';

class Div extends HTMLDivElement {
    constructor() {
        super();
        DataManager.addEventListener('change', this.checkConditional);
    }

    connectedCallback() {
        this.checkConditional();
    }

    checkConditional = async () => {
        const conditional = this.getAttribute('conditional');
        if (!conditional) return;
        const result = await CommandManager.execCommandString(conditional);
        if (!result && !this.placeholder) {
            this.placeholder = new Comment(this.id);
            this.placeholder.$element = this;
            this.parentNode.replaceChild(this.placeholder, this);
        }
        if (result && this.placeholder) {
            this.placeholder.parentNode.replaceChild(this, this.placeholder);
            this.placeholder = null;
        }
    }
}

customElements.define('g-div', Div, { extends: 'div' });