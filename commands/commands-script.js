import { CommandManager, AsyncFunction } from "../services/commandManager.js";
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
    'eval': async (code, _, resolver, ...prevStepReturns) => {
        const result = await (new AsyncFunction('prevStepReturns', code))(prevStepReturns);
        resolver(result);
    },
    'wait': (seconds, pid, resolver, ...prevStepReturns) => {
        const foo = () => DataManager.global.isSkipMode && resolver(prevStepReturns);
        DataManager.addEventListener('change', foo);
        const timer = setTimeout(() => {
            DataManager.removeEventListener('change', foo);
            resolver(prevStepReturns);
        }, Number(seconds * 1000))
    },
    'wait-click': (pid, resolver, ...prevStepReturns) => {
        document.body.addEventListener('click', () => { 
            resolver('wait-click');
        }, { once: true });
    },
    'set-temp-value': (name, value, pid, resolver) => {
        CommandManager.process[pid]['data'] = CommandManager.process[pid]['data'] ?? {};
        CommandManager.process[pid]['data'][name] = value;
        resolver('set-temp-value');
    },
    'get-temp-value': (name, pid, resolver) => {
        const result = CommandManager.process[pid]['data']?.[name];
        resolver(result);
    }
}