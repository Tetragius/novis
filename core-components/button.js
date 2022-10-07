import { CommandManager } from "../services/commandManager.js";
import { SFXManager } from "../services/sfxManager.js";
import { GameElement } from "./element.js";

export class Button extends GameElement {


    constructor() {
        super();
        this.addEventListener('click', () => SFXManager.sound('/sfx/click.wav'));
        this.addEventListener('click', this.doAction);
        this.addEventListener('actioncomplete', () => this.onactioncomplete?.());
    }

    set action(value) {
        this.setAttribute('action', value);
    }

    doAction = async () => {
        if (this.hasAttribute('action')) {
            const action = this.getAttribute('action');
            await CommandManager.runCommands(action.split(','));
            this.dispatchEvent(new CustomEvent('actioncomplete'));
        }
    }

    setPosition() {
        super.setPosition();
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : '';
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : '';
    }

    _css = `
        :host{
            border: 2px solid gray;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border-radius: 8px;
            box-sizing: border-box;
            padding: 4px 8px;
        }

        :host(:hover){
            background-color: rgba(170, 170, 255, 0.5);
        }
    `;

    template = `<slot></slot>`;

}

customElements.define('g-button', Button);