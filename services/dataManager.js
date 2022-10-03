import { load } from '/libs/js-yaml.js';
import { SceneManager } from './sceneManager.js';

class Data extends EventTarget {
    constructor() {
        super();
    }

    notify() {
        this.dispatchEvent(new CustomEvent('change'));
    }

    setData(path, value) {
        (new Function('value', `this.${path} = value`)).call(this, JSON.parse(value));
        this.notify();
    }

    setGlobalData(path, value) {
        (new Function('value', `this.global.${path} = value`)).call(this, JSON.parse(value));
        this.notify();
    }

    setSceneData(scene, path, value) {
        if (value === 'false' || value === 'true' || Number(value)) {
            value = JSON.parse(value);
        }
        (new Function('value', `this.scenesData['${scene}'].data.${path} = value`))
            .call(this, value);
        this.notify();
    }

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
        isBeasy: false,
        isPaused: false,
        isFinished: false,
        isShowDialog: false,
        isShowMenu: false,
        isShowSettings: false,
        isSkipMode: false,
    }

    scenesData = {}
}

export const DataManager = new Data();

window['$gameData'] = DataManager;