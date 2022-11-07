export const name = 'dialog';

const DIALOGS = {
    dialog: {
        id: 'pg-dialog-dialog',
        tag: 'g-dialog',
        element: null
    },
    titled: {
        id: 'pg-dialog-dialog-titled',
        tag: 'g-dialog-titled',
        element: null
    },
    menu: {
        id: 'pg-dialog-menu',
        tag: 'g-dialog-menu',
        element: null
    },
    input: {
        id: 'pg-dialog-input',
        tag: 'g-dialog-input',
        element: null
    }
}

const constructCommand = (type, title, text) => {
    switch (type) {
        case 'input': return `$cmd:get-dialog-input:${DIALOGS[type].id}:${text}$`;
        case 'titled': return `$cmd:set-dialog-titled:${DIALOGS[type].id}:${title}:${text}$`
        case 'dialog': return `$cmd:set-dialog:${DIALOGS[type].id}:${text}$`;
    }
}

export default class InventoryPlugin {
    constructor({
        GameManager,
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }) {
        this.gm = GameManager;
        this.sm = SceneManager;
        this.cm = CommandManager;
        CommandManager.registrCommands(this.commands);
        this.init();
    }

    autoToggle = false;
    deafaultDuration = 2;

    init = () => {
        this.drawButton();
    }

    drawButton = () => {
        const button = document.createElement('g-button');
        button.onclick = () => {
            this.autoToggle = !this.autoToggle;
            button.innerHTML = this.autoToggle ? 'Авто диалог ВЫКЛ' : 'Авто диалог ВКЛ';
        };
        button.setAttribute('conditional', '$cmd:get-global-data:isStarted$');
        button.innerHTML = this.autoToggle ? 'Авто диалог ВЫКЛ' : 'Авто диалог ВКЛ';

        this.gm.bottomGroupRef.append(button);
    };

    postLoad = async () => {
        const dialogsEl = Object.entries(DIALOGS).map(([key, data]) => {

            const animate = document.createElement('g-animate');
            animate.setAttribute('name', 'zoomIn');
            animate.setAttribute('backName', 'jello');

            const dialog = document.createElement(data.tag);
            dialog.id = data.id;
            dialog.conditional = false;
            data.element = dialog;

            animate.append(dialog);

            return animate;
        });
        this.gm.entryRef.after(...dialogsEl);
        return true;
    }

    commands = {
        'pg-dialog-play': async (id, pid, resolver) => {

            this.sm.addEventListener('scenechangestart', () => {
                console.log(1);
            });

            const messages = this.sm.currentScene.dialogs[id];

            let oldType = 'dialog';

            for (const message of messages) {
                const { type = 'dialog', conditional = true, duration = this.deafaultDuration, preactions, actions, postactions, title, text, options } = message;

                if (type !== oldType) {
                    DIALOGS[oldType].element.conditional = false;
                    await DIALOGS[oldType].element.isHide;
                }

                if (await this.cm.checkConditional(conditional, pid)) {
                    const script = [
                        ...(preactions ?? []),
                        [
                            ...(actions ?? []),
                            constructCommand(type, title, text),
                        ],
                        type === 'input' ? false : `$cmd:wait-click:${this.autoToggle ? 0 : duration}$`,
                        ...(postactions ?? []),
                    ].filter(Boolean);

                    DIALOGS[type].element.conditional = true;
                    await this.cm.evalCommandChain([...script], pid);

                    if (options?.length) {
                        DIALOGS.menu.element.innerHTML = '';
                        DIALOGS.menu.element.conditional = true;

                        await new Promise((resolve) => {
                            const group = document.createElement('g-group');
                            DIALOGS.menu.element.append(group);
                            for (const option of options) {
                                const button = document.createElement('g-button');
                                button.innerHTML = option.text;
                                button.conditional = option.conditional ?? true;
                                button.onclick = () => DIALOGS.menu.element.conditional = false;
                                button.action = option.action;
                                button.onactioncomplete = () => resolve();
                                group.append(button);
                            }
                        });

                        DIALOGS.menu.element.conditional = false;
                        await DIALOGS.menu.element.isHide;
                    }
                    oldType = type;
                }
            }

            DIALOGS[oldType].element.conditional = false;
            await DIALOGS[oldType].element.isHide;

            resolver('pg-dialog-play');
        },
    }
}