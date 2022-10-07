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
        case 'input': return `$cmd:read-dialog-input:${DIALOGS[type].id}:${text}$`;
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

    init = () => { }

    postLoad = async () => {
        const dialogsEl = Object.entries(DIALOGS).map(([key, data]) => {
            const dialog = document.createElement(data.tag);
            dialog.id = data.id;
            dialog.conditional = false;
            data.element = dialog;
            return dialog;
        });
        this.gm.entryRef.after(...dialogsEl);
        return true;
    }

    commands = {
        'pg-dialog-play': async (id, pid, resolver) => {
            const messages = this.sm.currentScene.dialogs[id];

            for (const message of messages) {
                const { type = 'dialog', conditional = true, duration = 1, preactions, actions, postactions, title, text, options } = message;
                if (this.cm.checkConditional(conditional)) {
                    const script = [
                        ...(preactions ?? []),
                        [
                            ...(actions ?? []),
                            [
                                constructCommand(type, title, text),
                                ...(postactions ?? []),
                            ]
                        ],
                        `$cmd:wait:${duration}$`
                    ];

                    DIALOGS[type].element.conditional = true;
                    await this.cm.evalCommandChain([...script], pid);

                    if (options?.length) {
                        DIALOGS['menu'].element.conditional = true;

                        await new Promise((resolve) => {
                            for (const option of options) {
                                const button = document.createElement('g-button');
                                button.innerHTML = option.text;
                                button.conditional = option.conditional;
                                button.action = option.action;
                                button.onactioncomplete = () => resolve();
                                DIALOGS['menu'].element.append(button);
                            }
                        });

                        DIALOGS['menu'].element.conditional = false;
                        DIALOGS['menu'].element.innerHTML = '';
                    }

                    DIALOGS[type].element.conditional = false;
                }
            }

            resolver('pg-dialog-play');
        },
    }
}