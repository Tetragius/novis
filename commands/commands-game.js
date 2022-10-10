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
    'set-dialog': (id, message, pid, resolver) => {
        const dialog = document.querySelector(`g-dialog[id=${id}]`);
        dialog.innerHTML = message;
        resolver('set-dialog');
    },
    'set-dialog-titled': (id, title, message, pid, resolver) => {
        const dialog = document.querySelector(`g-dialog-titled[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = title;
        dialog.shadowRoot.querySelector('[message]').innerHTML = message;
        resolver('set-dialog-titled');
    },
    'read-dialog-input': (id, title, _, resolver) => {
        const dialog = document.querySelector(`g-dialog-input[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = title;
        dialog.addEventListener('submit', async ({ detail }) => resolver(String(detail)), { once: true })
    },
    'set-title': (id, text, pid, resolver) => {
        const dialog = document.querySelector(`g-title[id=${id}]`);
        dialog.innerHTML = text;
        resolver('show-title');
    },
    'change-attr': (id, values, pid, resolver) => {
        const element = document.querySelector(`*[id=${id}]`);
        values.split('|').forEach(elem => {
            const pair = elem.split(',');
            element.setAttribute(pair[0], pair[1]);
        });
        resolver('show-scene-title');
    },
    'get-random-int': (from, to, pid, resolver) => {
        const value = Math.floor((Math.random() * to - from) + from);
        resolver(value);
    },
    'get-random-float': (from, to, pid, resolver) => {
        const vallue = (Math.random() * to - from) + from;
        resolver(value);
    },
}