import { CommandManager } from "../services/commandManager.js";
import { DataManager } from "../services/dataManager.js";
import { SceneManager } from '../services/sceneManager.js';

export const commands = {
    'run-script': async (name, pid, resolver) => {
        await CommandManager.evalSceneScriptByName(SceneManager.currentScene, name);
        resolver('run-script');
    },
    'kill-script': async (pid, _, resolver) => {
        await CommandManager.killProcess(pid);
        resolver('kill-script');
    },
    'kill-this-script': async (pid, resolver) => {
        await CommandManager.killProcess(pid);
        resolver('kill-this-script');
    },
    'eval': (code, _, resolver) => {
        eval(code);
        resolver('eval');
    },
    'wait': (seconds, pid, resolver) => {
        const foo = () => DataManager.global.isSkipMode && resolver('wait');
        DataManager.addEventListener('change', foo);
        const timer = setTimeout(() => {
            DataManager.removeEventListener('change', foo);
            resolver('wait');
        }, Number(seconds * 1000))
    },
    'set-temp-value': (name, value, pid, resolver) => {
        CommandManager.process[pid]['data'] = CommandManager.process[pid]['data'] ?? {};
        CommandManager.process[pid]['data'][name] = value;
        resolver('set-temp-value');
    },
    'read-temp-value': (name, pid, resolver) => {
        const result = CommandManager.process[pid]['data']?.[name];
        resolver(result);
    }
}