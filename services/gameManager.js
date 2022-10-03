import { DataManager } from './dataManager.js';
import { CommandManager } from './commandManager.js'
import { PluginManager } from './pluginManager.js'
import { AnimationManager } from './animationManager.js'
import { SceneManager } from './sceneManager.js';

export class Manager extends EventTarget {
    constructor() {
        super();
    }

    init() {
        window.addEventListener('keydown', this.keyDownHandler.bind(this));
        window.addEventListener('keyup', this.keyUpHandler.bind(this));
        this.addEventListener('changescene', async ({ detail }) => await SceneManager.changeScene(detail));
        this.addEventListener('startnewgame', this.startNewGame.bind(this));
        this.addEventListener('endgame', this.initialScene.bind(this));
        this.initialScene();
    }

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
            switch (e.key.toUpperCase()) {
                case 'CONTROL':
                    DataManager.setGlobalData('isSkipMode', true);
                    return;
                case 'ESCAPE':
                    DataManager.setGlobalData('isShowMenu', !DataManager.global.isShowMenu);
                    return;
                case 'C':
                case 'С':
                    DataManager.setGlobalData('isShowSettings', !DataManager.global.isShowSettings);
                    return;
                case 'P':
                case 'З':
                    DataManager.setGlobalData('isPaused', !DataManager.global.isPaused);
                    return;
                default:
                    return;
            }
        }
        else {
            switch (e.key.toUpperCase()) {
                case 'ESCAPE':
                    DataManager.setGlobalData('isShowSettings', false);
                    return;
                default:
                    return;
            }
        }
    }

    async startNewGame() {
        DataManager.setGlobalData('isStarted', true);
        DataManager.setGlobalData('isShowMenu', false);
        await SceneManager.goToStart();
    }

    async initialScene() {
        DataManager.setGlobalData('isStarted', false);
        DataManager.setGlobalData('isShowMenu', false);
        await SceneManager.goToInitial();
        DataManager.setGlobalData('isShowMenu', true);
    }

    async load(gameDataSrc, animationsSrc, commandsSrc, pluginsSrc) {
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
    }
}

export const GameManager = new Manager();

window['$gameManager'] = GameManager;