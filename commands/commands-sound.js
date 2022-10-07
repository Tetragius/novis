import { SFXManager } from "../services/sfxManager.js";

export const commands = {
    'sfx-play-parallel': async (url, pid, resolver) => {
        await SFXManager.sound(url);
        resolver('sfx-play-parallel');
    },
    'sfx-background': async (url, pid, resolver) => {
        await SFXManager.setBackground(url);
        resolver('sfx-background');
    },
    'sfx-in': async (pid, resolver) => {
        await SFXManager.volumeIn();
        resolver('sfx-in');
    },
    'sfx-out': async (pid, resolver) => {
        await SFXManager.volumeOut();
        resolver('sfx-uot');
    },
}