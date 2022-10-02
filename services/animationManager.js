export class Animate extends EventTarget {
    constructor() {
        super();
    }

    animations = {}

    async defineAnimations(url) {
        const response = await fetch(url);
        const json = await response.json();
        this.animations = { ...this.animations, ...json };
        return true;
    }

    async playAnimationOnTarget(animationName, target, overrideConfig = {}) {
        const animationData = this.animations[animationName];
        if (animationData) {
            let resolver = null;
            const promise = new Promise(resolve => resolver = resolve);
            const keyframes = new KeyframeEffect(
                target,
                animationData.animation,
                { ...animationData.config, ...overrideConfig }
            );
            const animation = new Animation(keyframes, document.timeline);
            animation.play();
            animation.onfinish = resolver;
            await promise;
            animation.persist();
        }
        return;
    }

}

export const AnimationManager = new Animate();
window['$animationManager'] = AnimationManager;