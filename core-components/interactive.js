import { CommandManager } from "../services/commandManager.js";
import { GameElement } from "./element.js";

export class Interactive extends GameElement {

    constructor() {
        super();
        this.addEventListener('click', () => this.constructor.clickActions?.());
        this.addEventListener('mouseover', () => this.constructor.hoverActions?.());

        this.addEventListener('click', this.doAction);
        this.addEventListener('actioncomplete', () => this.onactioncomplete?.());
    }

    set action(value) {
        this.setAttribute('action', value);
    }

    doAction = async (e) => {
        if (this.hasAttribute('action')) {
            const action = this.getAttribute('action');
            await CommandManager.runCommands(action.split(','), e?.target?.value);
            this.dispatchEvent(new CustomEvent('actioncomplete'));
        }
    }

}