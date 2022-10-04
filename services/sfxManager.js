export class SFX extends EventTarget {
    constructor() {
        super();
        this.gain.connect(this.context.destination);
    }

    nodes = [];
    background = null;

    #context = new AudioContext();
    get context() {
        return this.#context;
    }

    #gain = this.#context.createGain();
    get gain() {
        return this.#gain;
    }

    #volume = 1;
    get volume() {
        return this.gain.gain.value;
    }
    set volume(value) {
        this.#volume = value;
        this.gain.gain.value = value;
    }

    get destination() {
        return this.context.destination;
    }
    /**
     *
     *
     * @param {*} value
     * @memberof SFX
     */
    setVolume(value) {
        this.volume = value;
    }
    /**
     *
     *
     * @memberof SFX
     */
    async play() {
        await this.context.resume();
        this.nodes.forEach(node => node.start(0));
        this.background?.start(0);
    }
    /**
     *
     *
     * @memberof SFX
     */
    pause() {
        this.nodes.forEach(node => node.stop());
        this.background?.stop();
    }
    /**
     *
     *
     * @memberof SFX
     */
    async volumeIn() {
        this.gain.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.gain.setValueAtTime(this.gain.gain.value, this.context.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(this.#volume, this.context.currentTime + 2);
    }
    /**
     *
     *
     * @memberof SFX
     */
    async volumeOut() {
        this.gain.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.gain.setValueAtTime(this.gain.gain.value, this.context.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 2);
    }
    /**
     *
     *
     * @param {string} url
     * @return {Promise<boolean>} 
     * @memberof SFX
     */
    async setBackground(url) {
        await this.context.resume();
        this.background?.stop();
        this.background?.disconnect();
        const node = await this.append(url, true);
        this.background = node;
        this.background.start(0);
        return true;
    }
    /**
     *
     *
     * @param {string} url
     * @return {Promise<boolean>} 
     * @memberof SFX
     */
    async sound(url) {
        await this.context.resume();
        const node = await this.append(url, false);
        this.nodes.push(node);
        node.onended = () => this.nodes = this.nodes.filter(n => n !== node);
        node.start(0);
        return true;
    }
    /**
     *
     *
     * @param {string} src
     * @param {boolean} [loop=false]
     * @return {AudioBufferSourceNode} 
     * @memberof SFX
     */
    async append(src, loop = false) {
        const buffer = await (await fetch(src).then(response => response.blob())).arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(buffer);
        const node = new AudioBufferSourceNode(this.context, { buffer: audioBuffer, loop: loop });
        node.connect(this.gain);
        return node;
    }

}

export const SFXManager = new SFX();
window['$SFXManager'] = SFXManager;