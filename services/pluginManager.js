import { GameManager } from './gameManager.js';
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
    /**
     *
     *
     * @param {string} src
     * @return {Promise<boolean>} 
     * @memberof Plugins
     */
    async definePlugin(src) {
        const module = await import(src);
        this.plugins = {
            ...this.plugins,
            [module.name]: new module.default({
                GameManager,
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

    async postLoad() {
        return Promise.allSettled(Object.entries(this.plugins).map(([_, plugin]) => {
            plugin?.postLoad();
        }))
    }

}

export const PluginManager = new Plugins();

window['$pluginManager'] = PluginManager;