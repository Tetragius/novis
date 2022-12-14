import { DataManager } from '../services/dataManager.js';
import { CommandManager } from '../services/commandManager.js';
import { SceneManager } from '../services/sceneManager.js';

export class GameElement extends HTMLElement {

    constructor(noShadow) {
        super();

        this.isMounted = false;
        this.noShadow = noShadow;

        !noShadow && this.attachShadow({ mode: 'open' });

        DataManager.addEventListener('change', this.checkConditional);
        SceneManager.addEventListener('scenechangeend', this.checkConditional);

        this.addEventListener('unmount', () => this.onunmount?.());
        this.addEventListener('mount', () => this.onmount?.());

        this.checkConditional();

        this.constructor._instanses = this.constructor._instanses ?? new WeakMap();
        this.constructor._instanses.set(this, this);
    }

    get css() {
        return `<style>${this._css}</style>`;
    }

    set w(value) {
        this.setAttribute('w', value);
    }

    set h(value) {
        this.setAttribute('h', value);
    }

    set x(value) {
        this.setAttribute('x', value);
    }

    set y(value) {
        this.setAttribute('y', value);
    }

    set conditional(value) {
        this.setAttribute('conditional', value);
    }

    get conditional() { return this.getAttribute('conditional'); }

    get isHide() {
        return (() => new Promise(resolve => {
            const foo = () => {
                this.removeEventListener('hide', foo);
                resolve(true);
            };
            this.addEventListener('hide', foo);
            if (this.placeholder) {
                foo();
            }
        }))();
    }

    #observer = null;
    onunmount = null;
    onmount = null;

    connectedCallback() {
        this.isMounted = true;
        !this.noShadow && (this.shadowRoot.innerHTML = `${this.css}${this.template}`);
        this.#observer = new MutationObserver(this.update.bind(this));
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

    async beforeHide() {
        return true;
    }

    checkConditional = async () => {
        const conditional = this.getAttribute('conditional');
        if (!conditional) return;
        const result = await CommandManager.execCommandString(conditional);
        if (!result && !this.placeholder) {
            this.placeholder = new Comment(this.id);
            this.placeholder.$element = this;
            await this.beforeHide();
            this.dispatchEvent(new CustomEvent('hide'));
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