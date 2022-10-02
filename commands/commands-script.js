import { CommandManager } from "../services/commandManager.js";
import { SceneManager } from '../services/sceneManager.js';

export const commands = {
    'run-script': async (name, resolver) => {
        await CommandManager.evalSceneScriptByName(SceneManager.currentScene, name);
        resolver('run-script');
    },
    'kill-script': async (pid, resolver) => {
        await CommandManager.killProcess(pid);
        resolver('kill-script');
    },
    'kill-this-script': async (resolver, pid) => {
        await CommandManager.killProcess(pid);
        resolver('kill-this-script');
    },
    'eval': (code, resolver) => {
        eval(code);
        resolver('eval');
    },
    'wait': (seconds, resolver) => setTimeout(resolver, Number(seconds * 1000), 'wait'),
}