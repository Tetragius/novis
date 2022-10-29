import { load } from '/libs/js-yaml.js';
export const name = 'actor';

const actorsUrl = '/actors';

const createActorElement = (id, actor, emotion, x, y) => {
    const actorLayer = document.createElement('g-layer');
    actorLayer.id = id;
    const bodyParams = { ...(emotion.body ?? actor.body), x, y };

    const bodyElement = document.createElement('g-image');
    Object.entries(bodyParams).forEach(([name, value]) => bodyElement.setAttribute(name, value));
    actorLayer.appendChild(bodyElement);

    for (const partName in emotion.parts) {
        const partElement = document.createElement('g-image');
        partElement.id = partName;
        Object.entries({ ...emotion.parts[partName] }).forEach(([name, value]) => partElement.setAttribute(name, value));
        bodyElement.appendChild(partElement);
    }

    return actorLayer;
}

const updateActorElement = (scene, id, emotion) => {
    const bodyElement = scene.querySelector(`#${id}`);
    if (emotion.body) {
        Object.entries(emotion.body).forEach(([name, value]) => bodyElement.setAttribute(name, value));
    }

    for (const partName in emotion.parts) {
        const partElement = bodyElement.querySelector(`#${partName}`);
        Object.entries(emotion.parts[partName]).forEach(([name, value]) => partElement.setAttribute(name, value));
    }
}

export default class ActorPlugin {
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

    actors = {};

    init = () => { }

    postLoad = async () => {
        for (const actorName of this.config.actors) {
            const response = await fetch(`${actorsUrl}/${actorName}.yaml`);
            const yaml = await response.text();
            const json = load(yaml);
            this.actors = { ...this.actors, [actorName]: json };
        }
    }

    commands = {
        'pg-actor-show': (id, emotionId, x, y, pid, resolver) => {
            const actor = this.actors[id];
            const emotion = actor[emotionId];
            const actorElement = createActorElement(id, actor, emotion, x, y);
            this.sm.currentSceneElem.append(actorElement);
            resolver('pg-actor-show');
        },
        'pg-actor-remove': (id, pid, resolver) => {
            this.sm.currentSceneElem.querySelector(`#${id}`)?.remove();
            resolver('pg-actor-remove');
        },
        'pg-actor-change': (id, emotionId, pid, resolver) => {
            const actor = this.actors[id];
            const emotion = actor[emotionId];
            updateActorElement(this.sm.currentSceneElem, id, emotion);
            resolver('pg-actor-change');
        },
    }
}