import './services/sceneManager.js';
import './services/dataManager.js';
import './services/animationManager.js';
import './services/commandManager.js';
import './services/sfxManager.js';
import './services/pluginManager.js';
import { GameManager } from './services/gameManager.js';

document.body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.body.addEventListener('keydown', (e) => {
    if (e.key === 'F12')
        e.preventDefault();
});

GameManager.load(
    '/scenes/gameData.json',
    [
        '/animations/animation-rotate.json',
        '/animations/animation-shake.json',
        '/animations/animation-zoom.json',
        '/animations/animation-heartBeat.json',
        '/animations/animation-lightSpeed.json',
    ],
    [
        '/commands/commands-game.js',
        '/commands/commands-script.js',
        '/commands/commands-animation.js',
        '/commands/commands-data.js',
        '/commands/commands-sound.js',
    ],
    [
        '/plugins/plugin-inventory.js',
        '/plugins/plugin-dialog.js',
        '/plugins/plugin-dialog-history.js'
    ],
    [
        '/core-components/element.js',
        '/core-components/game.js',
        '/core-components/layer.js',
        '/core-components/image.js',
        '/core-components/scene.js',
        '/core-components/input.js',
        '/core-components/range.js',
        '/core-components/window.js',
        '/core-components/group.js',
        '/core-components/button.js',
        '/core-components/filter.js',
        '/core-components/highlight.js',
        '/core-components/animate.js',
        '/core-components/transform.js',
        '/core-components/div.js',
        '/components/title.js',
        '/components/dialog.js',
        '/components/dialog-menu.js',
        '/components/dialog-titled.js',
        '/components/dialog-input.js',
        '/components/dialog-system.js',
    ]
)
    .then(() => GameManager.init())
    .then(() => {
        document.body.querySelector('.loader')?.remove();
    });