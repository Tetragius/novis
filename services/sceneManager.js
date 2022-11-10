import { CommandManager } from './commandManager.js'
import { GameManager } from './gameManager.js';

export class Scenes extends EventTarget {
    constructor() {
        super();
    }

    currentScene = null;
    currentSceneName = null;
    currentSceneElem = null;
    /**
     *
     *
     * @param {Object} json
     * @return {HTMLElement} 
     * @memberof Scenes
     */
    parse(json) {
        if (typeof json === 'string') { return document.createTextNode(json) }

        const element = document.createElement(json.name);

        for (const key in json.attrs ?? {}) {
            element.setAttribute(key, json.attrs[key]);
        }

        if (json.children && !Array.isArray(json.children)) json.children = [String(json.children)];
        for (const child of json.children ?? []) {
            const childElement = this.parse(child);
            element.appendChild(childElement);
        }

        return element;
    }
    /**
     *
     *
     * @param {string} sceneName
     * @memberof Scenes
     */
    async loadSceneFromHTML(sceneName) {
        const response = await fetch(`scenes/${sceneName}.html`);
        const text = await response.text();
        var div = document.createElement('div');
        div.innerHTML = text;
        GameManager.entryRef.before(div.firstChild);
    }
    /**
     *
     *
     * @param {Object} template
     * @memberof Scenes
     */
    loadSceneFromTemplate(template) {
        const scene = this.parse(template);
        GameManager.entryRef.before(scene);
    }
    /**
     *
     *
     * @param {string} sceneName
     * @memberof Scenes
     */
    async changeScene(sceneName) {

        if(this.sceneChangeInProgress){
            return;
        }

        this.dispatchEvent(new CustomEvent('scenechangestart'));
        const scene = window["$gameScenes"][sceneName];
        const promise = new Promise(resolve => scene.onmount = resolve);
        
        this.sceneChangeInProgress = true;
        
        await CommandManager.evalScripts(this.currentSceneElem?.data?.scripts?.onOut, true);        
        scene.setAttribute('conditional', 'true');
        this.currentSceneElem?.setAttribute('conditional', 'false');
        this.currentSceneElem = scene;
        this.currentSceneName = sceneName;
        this.currentScene = this.currentSceneElem?.data;
        await promise;
        await CommandManager.evalScripts(scene.data?.scripts?.onIn);

        this.sceneChangeInProgress = false;
        
        this.dispatchEvent(new CustomEvent('scenechangeend'));
        
    }
    /**
     *
     *
     * @memberof Scenes
     */
    async playSplashScenes() {
        const splashScenes = Object.entries(window['$gameScenes'])
            .filter(([_, { data }]) => !!data.splash)
            .sort(([_A, { data: A }], [_B, { data: B }]) => A.splash - B.splash);
        for (const splashScene of splashScenes) {
            await this.changeScene(splashScene[0]);
        }
    }

    /**
     *
     *
     * @memberof Scenes
     */
    async goToInitial() {
        this.changeScene('initial');
    }
    /**
     *
     *
     * @memberof Scenes
     */
    async goToStart() {
        const sceneName = Object.entries(window["$gameScenes"])
            .filter(([_, { data }]) => data.startFrom)
            .map(([sceneName]) => sceneName)[0];
        this.changeScene(sceneName);
    }

}

export const SceneManager = new Scenes();

window['$sceneManager'] = SceneManager;