export const name = 'dialog-history';

// TODO: Временно - клон из файла commands/commands-game.js 
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

const defineComponents = (GameElement, DataManager, CommandManager) => {
    class DialogHistoryWindow extends GameElement {
        constructor() {
            super();
        }

        defineItems() {
            const temp = document.createElement('div');
            Object.entries(DataManager.global.dialogHistory).forEach(([_, item]) => {
                const div = document.createElement('div');
                div.innerHTML = `${textProcessor(item.name)}\n${textProcessor(item.message)}`;
                temp.appendChild(div);
            });
            return temp.innerHTML;
        }

        update() {
            super.update();
            const dialog = (this.shadowRoot ?? this).querySelector(':not(style)');
            dialog.innerHTML = Object.keys(DataManager.global.dialogHistory).length ? this.defineItems() : 'История пуста';
        }

    }

    customElements.define('pg-dialog-history', DialogHistoryWindow);
}

export default class DialogHistoryPlugin {
    constructor({
        GameManager,
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }) {
        DataManager.global['dialogHistory'] = [];

        this.dm = DataManager;
        this.gm = GameManager;

        CommandManager.addEventListener('finishcommand', ({ detail }) => {
            if (detail.command.includes('set-dialog-titled')) {
                DataManager.global.dialogHistory.push({ name: detail.args[1], message: detail.args[2] });
                return;
            }
            if (detail.command.includes('set-dialog')) {
                DataManager.global.dialogHistory.push({ name: '', message: detail.args[1] });
                return;
            }
        });

        defineComponents(GameElement, DataManager, CommandManager);

        this.init();
    }

    init = () => {
        document.body.addEventListener('keydown', this.keyDownHandler);
        this.draw();
        this.drawButton();
    }

    draw = () => {
        const layer = document.createElement('g-layer');
        layer.id = `plugin-${name}`;
        layer.setAttribute('conditional', '$cmd:get-global-data:sysDialogName$ === "dialog-history"');
        const inventory = document.createElement('pg-dialog-history');
        layer.appendChild(inventory);
        this.gm.settingsBlockRef.after(layer);
    }

    toggle = (e) => {
        e.stopPropagation();
        if (this.dm.global.sysDialogName) {
            this.gm.dispatchEvent(new CustomEvent('continue'));
            this.dm.setGlobalData('sysDialogName', '');
            return;
        }
        this.gm.dispatchEvent(new CustomEvent('pause'));
        this.dm.setGlobalData('sysDialogName', 'dialog-history');
    }

    drawButton = () => {
        const button = document.createElement('g-button');
        button.onclick = (e) => this.toggle(e);
        button.setAttribute('conditional', '$cmd:get-global-data:isStarted$')
        button.innerHTML = 'История';

        this.gm.bottomGroupRef.append(button);
    };

    keyDownHandler = (e) => {
        if (this.dm.global.isStarted) {
            const keyCode = e.keyCode;
            if (keyCode === 72) {
                this.toggle();
            }
        }
    }
}