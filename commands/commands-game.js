import { GameManager } from "../services/gameManager.js";
import { SceneManager } from '../services/sceneManager.js';

const textProcessor = (string = "") => {
    if (string.length) {
        const result = [document.createElement('span')];
        let index = 0;
        while (index < string.length) {

            if (string[index] === '\x1b') {
                result.push(document.createElement('span'));
                index++;

                if (string[index] === 'C') {
                    result[result.length - 1].style.color = `#${string.substring(index + 1, index + 7)}`;
                    index += 7;
                }

                continue;
            }

            result[result.length - 1].innerHTML += string[index];
            index++;
        }
        return result.map(el => el.outerHTML).join('\n');
    }
    return '';
}

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
        // TODO: убрать
        location.reload();
    },
    'set-dialog': (id, message, pid, resolver) => {
        const dialog = document.querySelector(`g-dialog[id=${id}]`);
        dialog.innerHTML = textProcessor(message);
        resolver('set-dialog');
    },
    'set-dialog-titled': (id, title, message, pid, resolver) => {
        const dialog = document.querySelector(`g-dialog-titled[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = textProcessor(title);
        dialog.shadowRoot.querySelector('[message]').innerHTML = textProcessor(message);
        resolver('set-dialog-titled');
    },
    'get-dialog-input': (id, title, _, resolver) => {
        const dialog = document.querySelector(`g-dialog-input[id=${id}]`);
        dialog.shadowRoot.querySelector('[title]').innerHTML = textProcessor(title);
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
        const value = Math.floor((Math.random() * (1 + Number(to) - Number(from))) + Number(from));
        resolver(value);
    },
    'get-random-float': (from, to, pid, resolver) => {
        const value = (Math.random() * (1 + Number(to) - Number(from))) + Number(from);
        resolver(value);
    },
}