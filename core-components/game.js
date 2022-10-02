export class Game extends HTMLElement {

    constructor() {
        super();
        this.style.display = 'block';
        this.style.position = 'fixed';
        this.style.overflow = 'hidden';
        this.style.left = '50%';
        this.style.top = '50%';
        this.style.transform = 'translate(-50%, -50%)';
        this.style.width = `${this.getAttribute('w')}px`;
        this.style.height = `${this.getAttribute('h')}px`;
        this.style.backgroundColor = `${this.getAttribute('color')}`;
    }

}

customElements.define('g-game', Game);