import { SFXManager } from './sfxManager.js';

export const name = 'audio';

const defineComponents = (GameElement, DataManager, CommandManager) => {
    class AudioWindow extends GameElement {
        constructor() {
            super();
        }

        template = `<g-layer>
            <span style="display: flex; align-items: center;">Громкость: <g-range min="0" max="1"
                    step="0.01" value="$cmd:pg-sfx-volume$"
                    onchange="$cmd:pg-sfx-set-volume:{0}$"></g-range></span>
        </g-layer>`

    }

    customElements.define('pg-sfx', AudioWindow);
}

export default class AudioPlugin {
    constructor({
        GameManager,
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }) {
        this.dm = DataManager;
        this.gm = GameManager;
        this.sm = SceneManager;
        this.cm = CommandManager;
        CommandManager.registrCommands(this.commands);
        defineComponents(GameElement, DataManager, CommandManager);
        this.init();
    }

    init = () => {
        this.draw();
        this.drawMenuButton();
    }

    draw = () => {
        const layer = document.createElement('g-layer');
        layer.id = `plugin-${name}`;
        layer.setAttribute('conditional', '$cmd:get-global-data:sysDialogName$ === "audio"');
        const inventory = document.createElement('pg-sfx');
        layer.appendChild(inventory);
        this.gm.settingsBlockRef.after(layer);
    }

    drawMenuButton = () => {
        const button = document.createElement('g-button');
        button.onclick = () => this.dm.setGlobalData('sysDialogName', 'audio');
        button.setAttribute('conditional', 'true')
        button.innerHTML = 'Аудио';

        this.gm.menuGroupRef.append(button);
    };

    postLoad = async () => {
        const Button = customElements.get('g-button');
        const old = Button.staticActions;
        Button.staticActions = () => {
            old();
            SFXManager.sound('/sfx/click.wav');
        }
    }

    commands = {
        'pg-sfx-play-parallel': async (url, pid, resolver) => {
            await SFXManager.sound(url);
            resolver('pg-sfx-play-parallel');
        },
        'pg-sfx-background': async (url, pid, resolver) => {
            await SFXManager.setBackground(url);
            resolver('pg-sfx-background');
        },
        'pg-sfx-in': async (pid, resolver) => {
            await SFXManager.volumeIn();
            resolver('pg-sfx-in');
        },
        'pg-sfx-out': async (pid, resolver) => {
            await SFXManager.volumeOut();
            resolver('sfx-uot');
        },
        'pg-sfx-set-volume': async (value, pid, resolver) => {
            SFXManager.volume = value;
            resolver(SFXManager.volume);
        },
        'pg-sfx-volume': async (pid, resolver) => {
            await SFXManager.volume;
            resolver(SFXManager.volume);
        },
    }
}