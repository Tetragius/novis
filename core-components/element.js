import { DataManager } from '../services/dataManager.js';
import { CommandManager } from '../services/commandManager.js';

export class GameElement extends HTMLElement {

    get css() {
        return `<style>${this._css}</style>`;
    }

    constructor(noShadow) {
        super();

        this.isMounted = false;
        this.noShadow = noShadow;

        !noShadow && this.attachShadow({ mode: 'open' });

        DataManager.addEventListener('change', this.checkConditional);

        this.addEventListener('unmount', () => this.onunmount?.());
        this.addEventListener('mount', () => this.onmount?.());

        this.checkConditional();
    }

    #observer = null;
    onunmount = null;
    onmount = null;

    connectedCallback() {
        this.isMounted = true;
        !this.noShadow && (this.shadowRoot.innerHTML = `${this.css}${this.template}`);
        this.#observer = new MutationObserver(this.update.bind(this.shadowRoot ?? this));
        this.#observer.observe(this, { childList: true });
        this.update();
        this.dispatchEvent(new CustomEvent('mount'));
    }

    disconnectedCallback() {
        if (!this.placeholder) {
            this.isMounted = false;
        }
        this.dispatchEvent(new CustomEvent('unmount'));
        this.#observer.disconnect();
    }

    setPosition() {
        this.style.width = this.hasAttribute('w') ? `${this.getAttribute('w')}` : '100%';
        this.style.height = this.hasAttribute('h') ? `${this.getAttribute('h')}` : '100%';
        this.style.left = this.hasAttribute('x') ? `${this.getAttribute('x')}` : null;
        this.style.top = this.hasAttribute('y') ? `${this.getAttribute('y')}` : null;
    }

    static get observedAttributes() {
        return ['conditional', 'x', 'y', 'w', 'h'];
    }

    update() {
        this.checkConditional?.();
        this.setPosition?.();
    }

    attributeChangedCallback(name) {
        if (this.isMounted) {
            this.update();
        }
    }

    checkConditional = async () => {
        const conditional = this.getAttribute('conditional');
        if (!conditional) return;
        const result = await CommandManager.checkScriptConditional(conditional);
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

    _css = ``;
    template = `<slot></slot>`

}