import { DataManager } from "../services/dataManager.js";
import { SceneManager } from '../services/sceneManager.js';

export const commands = {
    'increment-data': (path, value, pid, resolver) => {
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager);
        DataManager.setData(path, data + Number(value));
        resolver('increment-data');
    },
    'increment-scene-data': (sceneName, path, value, pid, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName;
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        DataManager.setSceneData(sceneName, path, Number(data) + Number(value));
        resolver('increment-scene-data');
    },
    'decriment-scene-data': (sceneName, path, value, pid, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName;
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        DataManager.setSceneData(sceneName, path, Number(data) - Number(value));
        resolver('decriment-scene-data');
    },
    'decriment-data': (path, value, pid, resolver) => {
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager);
        DataManager.setData(path, data - Number(value));
        resolver('decriment-data');
    },
    'set-data': (path, value, pid, resolver) => {
        DataManager.setData(path, value);
        resolver('set-data');
    },
    'set-scene-data': (sceneName, path, value, pid, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName;
        DataManager.setSceneData(sceneName, path, value);
        resolver('set-scene-data');
    },
    'set-global-data': (path, value, pid, resolver) => {
        DataManager.setGlobalData(path, value);
        resolver('set-global-data');
    },
    'get-scene-data': (sceneName, path, pid, resolver) => {
        if (sceneName === 'this') sceneName = SceneManager.currentSceneName;
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.scenesData[sceneName]?.data);
        resolver(data);
    },
    'get-gloabl-data': (path, pid, resolver) => {
        const func = new Function(`return this.${path}`);
        const data = func.call(DataManager.global);
        resolver(data);
    },
}