import { DataManager } from "../services/dataManager.js";
import { SceneManager } from '../services/sceneManager.js';

export const commands = {
    'increment-data': (path, value, resolver) => {
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager);
        DataManager.setData(path, data + Number(value));
        resolver('increment-data');
    },
    'increment-scene-data': (sceneName, path, value, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName?.replace('scene-', '');
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        DataManager.setSceneData(sceneName, path, Number(data) + Number(value));
        resolver('increment-scene-data');
    },
    'decriment-scene-data': (sceneName, path, value, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName?.replace('scene-', '');
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        DataManager.setSceneData(sceneName, path, Number(data) - Number(value));
        resolver('decriment-scene-data');
    },
    'decriment-data': (path, value, resolver) => {
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager);
        DataManager.setData(path, data - Number(value));
        resolver('decriment-data');
    },
    'set-data': (path, value, resolver) => {
        DataManager.setData(path, value);
        resolver('set-data');
    },
    'set-scene-data': (sceneName, path, value, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName?.replace('scene-', '');
        DataManager.setSceneData(sceneName, path, value);
        resolver('set-scene-data');
    },
    'set-global-data': (path, value, resolver) => {
        DataManager.setGlobalData(path, value);
        resolver('set-global-data');
    },
    'get-scene-data': (sceneName, path, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName?.replace('scene-', '');
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        resolver(data);
    },
}