export const name = 'frame';

export default class FramePlugin {
    constructor({
        GameManager,
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }, config) {
        this.gm = GameManager;
        this.dm = DataManager;
        this.sm = SceneManager;
        this.cm = CommandManager;
        this.config = config;
        CommandManager.registrCommands(this.commands);
        this.init();
    }

    init = () => { }

    commands = {
        'pg-frame-show': (src, background, pid, resolver) => {
            const frame = document.createElement('iframe', { is: 'g-iframe' });
            frame.src = unescape(src);
            frame.style.background = background ?? 'transparent';
            this.sm.currentSceneElem.append(frame);

            frame.contentWindow['resolver'] = (result) => {
                frame.remove();
                resolver(result);
            }

            window.onmessage = ({ data }) => {
                frame.remove();
                resolver(data);
            }
        },
    }
}