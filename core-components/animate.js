import { AnimationManager } from "../services/animationManager.js";
import { GameElement } from "../core-components/element.js";

export class Animate extends GameElement {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.style.display = 'contents';
        this.update = this.update.bind(this);
    }

    update() {
        super.update();

        const duration = this.hasAttribute('duration') ? Number(this.getAttribute('duration')) : 200;
        const iterations = this.hasAttribute('duration') ? Number(this.getAttribute('iterations')) : 1;

        [...this.children].forEach(async (child) => {
            await AnimationManager.playAnimationOnTarget(this.getAttribute('name'), child, { duration, iterations });
            if (this.hasAttribute('backName')) {
                child.beforeHide = () => new Promise(async (resolve) => {
                    await AnimationManager.playAnimationOnTarget(this.getAttribute('backName'), child);
                    resolve();
                });
            }
        });
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'name', 'backName', 'duration', 'iterations'];
    }
}

customElements.define('g-animate', Animate);
