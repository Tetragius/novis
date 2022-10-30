export const name = 'dialog-history';

const defineComponents = (GameElement, DataManager, CommandManager) => {
    class DialogHistoryWindow extends GameElement {
        constructor() {
            super();
        }

        defineItems() {
            const temp = document.createElement('div');
            Object.entries(DataManager.global.dialogHistory).forEach(([_, item]) => {
                const div = document.createElement('pre');
                div.innerHTML = `${item.name}\n${item.message}`;
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
        this.drawMenuButton();
    }

    draw = () => {
        const layer = document.createElement('g-layer');
        layer.id = `plugin-${name}`;
        layer.setAttribute('conditional', '$cmd:get-global-data:sysDialogName$ === "dialog-history"');
        const inventory = document.createElement('pg-dialog-history');
        layer.appendChild(inventory);
        this.gm.settingsBlockRef.after(layer);
    }

    toggle = () => {
        if (this.dm.global.sysDialogName) {
            this.gm.dispatchEvent(new CustomEvent('continue'));
            this.dm.setGlobalData('sysDialogName', '');
            return;
        }
        this.gm.dispatchEvent(new CustomEvent('pause'));
        this.dm.setGlobalData('sysDialogName', 'dialog-history');
    }

    drawMenuButton = () => {
        const button = document.createElement('g-button');
        button.onclick = () => this.toggle();
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