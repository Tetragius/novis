import { GameManager } from './gameManager.js';
import { DataManager } from './dataManager.js';
import { CommandManager } from './commandManager.js'
import { AnimationManager } from './animationManager.js'
import { SceneManager } from './sceneManager.js';
import { GameElement } from "../core-components/element.js";

const fetcher = async (pluginName) => {
    const response = await fetch(`/plugins/${pluginName}.js`);
    if (response.status == 200) {
        return await import(`/plugins/${pluginName}.js`);
    } else if (response.status === 404) {
        return await import(`/plugins/${pluginName}/index.js`);
    }
}

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
    async definePlugin(plugin) {
        let module;
        if (typeof plugin === 'string') {
            module = await fetcher(plugin);
        }
        else {
            module = await fetcher(plugin.name);
        }
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
            }, plugin)
        };
        return true;
    }

    async postLoad() {
        return Promise.allSettled(Object.entries(this.plugins).map(([_, plugin]) => {
            plugin?.postLoad?.();
        }))
    }

}

export const PluginManager = new Plugins();

window['$pluginManager'] = PluginManager;