import { CommandManager } from "../services/commandManager.js";
import { GameElement } from "./element.js";

export class Range extends GameElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        super.connectedCallback();
        const value = parseFloat(await CommandManager.runCommands([this.getAttribute('value')])) ?? 0;
        if (this.shadowRoot.children[1]) {
            this.shadowRoot.children[1].value = value;
            this.shadowRoot.children[1].oninput = this.changeHandler;
        }
    }

    changeHandler = async (e) => {
        if (this.hasAttribute('onchange')) {
            const action = this.getAttribute('onchange');
            await CommandManager.runCommands(action.split(','), null, e.target.value);
        }
    }

    _css = `
        :host {
            flex: 1;
        }
        
        :host input{
            width: 100%;
        }`;

    template = `<input type="range" min="${this.getAttribute('min')}" max="${this.getAttribute('max')}" step="${this.getAttribute('step')}"/>`

}

customElements.define('g-range', Range);