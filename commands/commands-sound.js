import { SFXManager } from "../services/sfxManager.js";

export const commands = {
    'sfx-play-parallel': async (url, resolver) => {
        await SFXManager.sound(url);
        resolver('sfx-play-parallel');
    },
    'sfx-background': async (url, resolver) => {
        await SFXManager.setBackground(url);
        resolver('sfx-background');
    },
    'sfx-in': async (resolver) => {
        await SFXManager.volumeIn();
        resolver('sfx-in');
    },
    'sfx-out': async (resolver) => {
        await SFXManager.volumeOut();
        resolver('sfx-uot');
    },
}