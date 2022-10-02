import { SceneManager } from '../services/sceneManager.js';
import { AnimationManager } from "../services/animationManager.js";

const traverse = (element) => {
    const isWrapper = window.getComputedStyle(element)?.display === 'contents';
    if(isWrapper){
        return [...(element.shadowRoot ?? element).querySelectorAll(':not(style)')].map(traverse).flat();
    }
    return [element];
}

export const commands = {
    'play-animation-on': async (elementId, animationName, duration, iterations, animationId, resolver) => {
        const scene = SceneManager.currentSceneElem;
        const element = scene.querySelector(`#${elementId}`);
        const elements = traverse(element);
        const option = { duration: duration * 1000, iterations };
        await Promise.allSettled(elements.map(element => AnimationManager.playAnimationOnTarget(animationName, element, option)));
        resolver(`start-animation-on:${elementId}:${animationName}`);
    },
    // scenes animation
    'fadeIn': async (value, resolver) => {
        const option = { duration: value * 1000, iterations: 1 };
        await AnimationManager.playAnimationOnTarget('fadeIn', SceneManager.currentSceneElem, option);
        resolver('fadeIn');
    },
    'blurIn': async (value, resolver) => {
        const option = { duration: value * 1000, iterations: 1 };
        await AnimationManager.playAnimationOnTarget('blurIn', SceneManager.currentSceneElem, option);
        resolver('blurIn');
    },
    'fadeOut': async (value, resolver) => {
        const option = { duration: value * 1000, iterations: 1 };
        await AnimationManager.playAnimationOnTarget('fadeOut', SceneManager.currentSceneElem, option);
        resolver('fadeOut');
    },
    'blurOut': async (value, resolver) => {
        const option = { duration: value * 1000, iterations: 1 };
        await AnimationManager.playAnimationOnTarget('blurOut', SceneManager.currentSceneElem, option);
        resolver('blurOut');
    }
}