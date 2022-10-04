import { load } from '/libs/js-yaml.js';
import { SceneManager } from './sceneManager.js';

const JSONParseSafety = (value) => {
    try {
        return JSON.parse(value);
    }
    catch (e) {
        return String(value);
    }
}

class Data extends EventTarget {
    constructor() {
        super();
    }
    /**
     *
     *
     * @memberof Data
     */
    notify() {
        this.dispatchEvent(new CustomEvent('change'));
    }
    /**
     *
     *
     * @param {string} path
     * @param {string} value
     * @memberof Data
     */
    setData(path, value) {
        (new Function('value', `this.${path} = value`)).call(this, JSONParseSafety(value));
        this.notify();
    }
    /**
     *
     *
     * @param {string} path
     * @param {string} value
     * @memberof Data
     */
    setGlobalData(path, value) {
        (new Function('value', `this.global.${path} = value`)).call(this, JSONParseSafety(value));
        this.notify();
    }
    /**
     *
     *
     * @param {string} scene
     * @param {string} path
     * @param {string} value
     * @memberof Data
     */
    setSceneData(scene, path, value) {
        if (value === 'false' || value === 'true' || Number(value)) {
            value = JSONParseSafety(value);
        }
        (new Function('value', `this.scenesData['${scene}'].data.${path} = value`))
            .call(this, value);
        this.notify();
    }
    /**
     *
     *
     * @param {string} url
     * @return {Promise<boolean>} 
     * @memberof Data
     */
    async loadData(url) {
        const response = await fetch(url);
        const json = await response.json();
        for (const sceneName of json) {
            const sceneYaml = await fetch(`/scenes/${sceneName}.yaml`).then(resp => resp.text());
            const sceneData = load(sceneYaml);
            this.scenesData = { ...this.scenesData, ...sceneData };
            if (!sceneData[sceneName].template) {
                await SceneManager.loadSceneFromHTML(sceneName);
            }
            else {
                SceneManager.loadSceneFromTemplate(sceneData[sceneName].template);
            }
        }

        return true;
    }

    global = {
        isStarted: false,
        isPaused: false,
        isFinished: false,
        isShowMenu: false,
        sysDialogName: '',
        isSkipMode: false,
    }

    scenesData = {}
}

export const DataManager = new Data();

window['$gameData'] = DataManager;