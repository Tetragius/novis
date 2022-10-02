import { AnimationManager } from "../services/animationManager.js";
import { GameElement } from "../core-components/element.js";

export class Animate extends GameElement {

    constructor() {
        super();
        this.style.display = 'contents';
    }

    update() {
        super.update();
        [...this.children].forEach((child) => {
            AnimationManager.playAnimationOnTarget(this.getAttribute('name'), child);
        });
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'name'];
    }
}

customElements.define('g-animate', Animate);
