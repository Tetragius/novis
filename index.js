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
        '/plugins/plugin-inventory.js'
    ]
)
    .then(
        async () => {
            // base-components
            await import('/core-components/element.js');
            await import('/core-components/game.js');
            await import('/core-components/layer.js');
            await import('/core-components/image.js');
            await import('/core-components/scene.js');
            await import('/core-components/input.js');
            await import('/core-components/range.js');
            await import('/core-components/window.js');
            await import('/core-components/group.js');
            await import('/core-components/button.js');
            await import('/core-components/filter.js');
            await import('/core-components/highlight.js');
            await import('/core-components/animate.js');
            await import('/core-components/transform.js');
            // extended-components
            await import('/components/title.js');
            await import('/components/dialog.js');
            await import('/components/dialog-menu.js');
            await import('/components/dialog-titled.js');
            await import('/components/dialog-input.js');
            await import('/components/dialog-system.js');
        }
    )
    .then(() => GameManager.init())
    .then(() => {
        document.body.querySelector('.loader')?.remove();
    });