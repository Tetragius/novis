import { DataManager } from './dataManager.js';
import { CommandManager } from './commandManager.js'
import { AnimationManager } from './animationManager.js'
import { SceneManager } from './sceneManager.js';

export class Manager extends EventTarget {
    constructor() {
        super();
    }

    init() {
        window.addEventListener('keydown', this.clickHandler.bind(this));
        this.addEventListener('changescene', async ({ detail }) => await SceneManager.changeScene(detail));
        this.addEventListener('startnewgame', this.startNewGame.bind(this));
        this.addEventListener('endgame', this.initialScene.bind(this));
        this.initialScene();
    }

    clickHandler(e) {
        if (DataManager.global.isStarted) {
            switch (e.key.toUpperCase()) {
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

    async load(gameDataSrc, animationsSrc, commandsSrc) {
        await DataManager.loadData(gameDataSrc);
        for (const animationSrc of animationsSrc) {
            await AnimationManager.defineAnimations(animationSrc);
        }
        for (const commandSrc of commandsSrc) {
            await CommandManager.defineCommands(commandSrc);
        }
    }
}

export const GameManager = new Manager();

window['$gameManager'] = GameManager;