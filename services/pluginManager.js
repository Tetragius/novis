import { DataManager } from './dataManager.js';
import { CommandManager } from './commandManager.js'
import { AnimationManager } from './animationManager.js'
import { SceneManager } from './sceneManager.js';
import { GameElement } from "../core-components/element.js";

export class Plugins extends EventTarget {
    constructor() {
        super();
    }

    plugins = {};

    async definePlugin(src) {
        const module = await import(src);
        this.plugins = {
            ...this.plugins,
            [module.name]: new module.default({
                DataManager,
                CommandManager,
                AnimationManager,
                SceneManager,
                PluginManager: this,
                GameElement
            })
        };
        return true;
    }


}

export const PluginManager = new Plugins();

window['$pluginManager'] = PluginManager;