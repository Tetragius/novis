import { DataManager } from '../services/dataManager.js';
import { CommandManager } from '../services/commandManager.js';

class IFrame extends HTMLIFrameElement {
    constructor() {
        super();
        DataManager.addEventListener('change', this.checkConditional);
    }

    connectedCallback() {
        this.checkConditional();
        this.style.position = 'absolute';
        this.style.zIndex = '9999';
        this.style.width = '100%';
        this.style.height = '100%';
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

customElements.define('g-iframe', IFrame, { extends: 'iframe' });