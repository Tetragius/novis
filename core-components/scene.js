import { GameElement } from "./element.js";
import { DataManager } from "../services/dataManager.js";

window['$gameScenes'] = window['$gameScenes'] ?? {};

export class Scene extends GameElement {

    constructor() {
        super(true);
        this.style.display = 'block';
        this.style.width = '100%';
        this.style.height = '100%';
        this.style.position = 'absolute';
        this.style.left = '0';
        this.style.top = '0';
        window["$gameScenes"][this.id] = this;
        this.data = DataManager.scenesData[this.id];
    }

}

customElements.define('g-scene', Scene);