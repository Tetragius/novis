import { CommandManager } from './commandManager.js';
import { SceneManager } from './sceneManager.js'

export class Dialog extends EventTarget {
    constructor() {
        super();
    }
    // добавить запуск с определенного места
    async play(id) {
        const dialog = SceneManager.currentScene.dialogs[id];

        for (const idx in dialog) {

            const item = dialog[idx];
            let element = null;

            if (item.title) {
                element = document.createElement('g-dialog-titled');
                element.id = id + idx;
                SceneManager.currentSceneElem.appendChild(element);

                await CommandManager.runCommand(`$cmd:set-dialog-titled:${element.id}:${item.title}:${item.message}$`);
                CommandManager.evalScriptsParallel([{ conditional: 'true', steps: [item.commands] }]);
                await CommandManager.runCommand(`$cmd:wait:${item.wait}$`);
            }
            else if (item.buttons) {
                element = document.createElement('g-dialog-menu');
                element.id = id + idx;
                SceneManager.currentSceneElem.appendChild(element);

                for (const button of item.buttons) {
                    const el = document.createElement('g-button');
                    el.innerHTML = button.text;
                    el.conditional = button.conditional;
                    element.appendChild(el);

                    const promise = new Promise(resolve => {
                        el.onclick = async () => {
                            await CommandManager.runCommand(button.action);
                            resolve();
                        }
                    });

                    await promise;
                }

            }
            else {
                element = document.createElement('g-dialog');
                element.id = id + idx;
                SceneManager.currentSceneElem.appendChild(element);

                await CommandManager.runCommand(`$cmd:set-dialog-message:${element.id}:${item.message}$`);
                CommandManager.evalScriptsParallel([{ conditional: 'true', steps: [item.commands] }]);
                await CommandManager.runCommand(`$cmd:wait:${item.wait}$`);
            }

            element.remove();
        }
    }

}

export const DialogManager = new Dialog();
window['$dialogManager'] = DialogManager;