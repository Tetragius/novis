import { GameManager } from "../services/gameManager.js";
import { CommandManager } from "../services/commandManager.js";
import { SceneManager } from '../services/sceneManager.js';

export const commands = {
    // game
    'set-scene': (sceneName, pid, resolver) => {
        SceneManager.changeScene(sceneName);
        resolver('set-scene');
    },
    'start-game': (pid, resolver) => {
        GameManager.startNewGame();
        resolver('start-game');
    },
    'end-game': (pid, resolver) => {
        GameManager.initialScene();
        resolver('end-game');
    },
    'set-dialog-message': (id, message, pid, resolver) => {
        const dialog = SceneManager.currentSceneElem.querySelector(`g-dialog[id=${id}]`);
        dialog.innerHTML = message;
        resolver('set-dialog-message');
    },
    'set-dialog-titled': (id, title, message, pid, resolver) => {
        const dialog = SceneManager.currentSceneElem.querySelector(`g-dialog-titled[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = title;
        dialog.shadowRoot.querySelector('[message]').innerHTML = message;
        resolver('set-dialog-titled');
    },
    'read-dialog-input': (id, title, key, pid, resolver) => {
        const dialog = SceneManager.currentSceneElem.querySelector(`g-dialog-input[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = title;
        dialog.addEventListener('submit', async ({ detail }) => {
            await CommandManager.runCommand(`$cmd:set-scene-data:this:${key}:${String(detail)}$`);
            resolver('read-dialog-input');
        }, { once: true })
    },
    'read-dialog-input-global': (id, title, key, pid, resolver) => {
        const dialog = SceneManager.currentSceneElem.querySelector(`g-dialog-input[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = title;
        dialog.addEventListener('submit', async ({ detail }) => {
            await CommandManager.runCommand(`$cmd:set-global-data:${key}:${String(detail)}$`);
            resolver('read-dialog-input-global');
        }, { once: true })
    },
    'set-title': (id, text, pid, resolver) => {
        const dialog = SceneManager.currentSceneElem.querySelector(`g-title[id=${id}]`);
        dialog.innerHTML = text;
        resolver('show-title');
    },
    'change-attr': (id, values, pid, resolver) => {
        const element = SceneManager.currentSceneElem.querySelector(`*[id=${id}]`);
        values.split('|').forEach(elem => {
            const pair = elem.split(',');
            element.setAttribute(pair[0], pair[1]);
        });
        resolver('show-scene-title');
    },
}