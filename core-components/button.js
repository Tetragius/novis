import { SFXManager } from "../services/sfxManager.js";
import { GameElement } from "./element.js";

export class Button extends GameElement {


    constructor() {
        super();
        this.addEventListener('click', () => SFXManager.sound('/sfx/click.wav'))
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