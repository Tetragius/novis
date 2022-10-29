import { DataManager } from './dataManager.js';
import { CommandManager } from './commandManager.js'
import { PluginManager } from './pluginManager.js'
import { AnimationManager } from './animationManager.js'
import { SceneManager } from './sceneManager.js';

export class Manager extends EventTarget {
    constructor() {
        super();
    }

    async init() {
        window.addEventListener('keydown', this.keyDownHandler.bind(this));
        window.addEventListener('keyup', this.keyUpHandler.bind(this));
        this.addEventListener('changescene', async ({ detail }) => await SceneManager.changeScene(detail));
        this.addEventListener('startnewgame', this.startNewGame.bind(this));
        this.addEventListener('endgame', this.initialScene.bind(this));
        await this.initialScene();
    }

    entryRef = document.getElementById('g-entry');
    bottomGroupRef = document.getElementById('bottom-group');
    menuGroupRef = document.getElementById('menu-group');
    settingsBlockRef = document.getElementById('settings-block');

    keyUpHandler(e) {
        if (DataManager.global.isStarted) {
            switch (e.key.toUpperCase()) {
                case 'CONTROL':
                    DataManager.setGlobalData('isSkipMode', false);
                    return;
                default:
                    return;
            }
        }
    }

    keyDownHandler(e) {
        if (DataManager.global.isStarted) {
            switch (e.keyCode) {
                case 17: // Control
                    DataManager.setGlobalData('isSkipMode', true);
                    return;
                case 27: // Escape
                    if (DataManager.global.sysDialogName) {
                        DataManager.setGlobalData('sysDialogName', '');
                        this.dispatchEvent(new CustomEvent('continue'));
                        return;
                    }

                    if (DataManager.global.isShowMenu) {
                        DataManager.setGlobalData('isShowMenu', false);
                        this.dispatchEvent(new CustomEvent('continue'));
                        return;
                    }
                    else {
                        DataManager.setGlobalData('isShowMenu', true);
                        this.dispatchEvent(new CustomEvent('pause'));
                    }

                    if (DataManager.global.isPaused) {
                        DataManager.setGlobalData('isPaused', false)
                        this.dispatchEvent(new CustomEvent('continue'));
                    }

                    return;
                case 80:
                    if (!DataManager.global.sysDialogName && !DataManager.global.isShowMenu && !DataManager.global.isPaused) {
                        this.dispatchEvent(new CustomEvent('pause'));
                        DataManager.setGlobalData('isPaused', true);
                    }
                    else if (DataManager.global.isPaused) {
                        DataManager.setGlobalData('isPaused', false)
                        this.dispatchEvent(new CustomEvent('continue'));
                    }
                    return;
                default:
                    return;
            }
        }
        else {
            switch (e.keyCode) {
                case 27:
                    DataManager.setGlobalData('sysDialogName', '');
                    return;
                default:
                    return;
            }
        }
    }
    /**
     *
     *
     * @memberof Manager
     */
    async startNewGame() {
        DataManager.setGlobalData('isStarted', true);
        DataManager.setGlobalData('isShowMenu', false);
        await SceneManager.goToStart();
    }
    /**
     *
     *
     * @memberof Manager
     */
    async initialScene() {
        DataManager.setGlobalData('isStarted', false);
        DataManager.setGlobalData('isShowMenu', false);
        await SceneManager.goToInitial();
        DataManager.setGlobalData('isShowMenu', true);
    }
    /**
     *
     *
     * @param {string[]} gameDataSrc
     * @param {string[]} animationsSrc
     * @param {string[]} commandsSrc
     * @param {string[]} pluginsSrc
     * @memberof Manager
     */
    async load(gameDataSrc, animationsSrc, commandsSrc, pluginsSrc, components) {
        await DataManager.loadData(gameDataSrc);
        for (const animationSrc of animationsSrc) {
            await AnimationManager.defineAnimations(animationSrc);
        }
        for (const commandSrc of commandsSrc) {
            await CommandManager.defineCommands(commandSrc);
        }
        for (const pluginSrc of pluginsSrc) {
            await PluginManager.definePlugin(pluginSrc);
        }
        await Promise.all(components.map(component => import(component)));
        await PluginManager.postLoad();
    }
}

export const GameManager = new Manager();

window['$gameManager'] = GameManager;