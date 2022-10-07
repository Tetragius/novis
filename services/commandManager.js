import { DataManager } from "./dataManager.js";

// script interface
// conditional: boolean or command string
// loop?: number or condtitional as command string
// parallel?: boolean
// awaitConditional?: boolean
// poolId?: string
// steps: Array of string or subArrays or scripts

const AsyncFunction = (async function () { }).constructor;

const safityArrayFrom = (value) => {
    if (Array.isArray(value)) return [...value];
    else return [value];
}

export class Interpretator extends EventTarget {
    constructor() {
        super();
    }

    commands = {};

    async defineCommands(src) {
        const module = await import(src);
        this.commands = { ...this.commands, ...module.commands };
        return true;
    }

    async registrCommands(commands) {
        this.commands = { ...this.commands, ...commands };
        return true;
    }

    #process = {};
    get process() { return this.#process }
    log() {
        setInterval(() => {
            console.clear();
            console.table(this.#process);
        }, 500);
    }

    newProcess(chain) {
        const id = chain.name ?? String(Math.random()).split('.')[1];
        chain['pid'] = id;
        this.#process[id] = chain;
        return id;
    }

    killProcess(id) {
        console.groupEnd();
        if (this.#process[id]) {
            delete this.#process[id].pid;
            delete this.#process[id];
        }
    };

    async pause() {
        return new Promise(resolve => {
            if ((!DataManager.global.isPaused && !DataManager.global.sysDialogName && !DataManager.global.isShowMenu) || !DataManager.global.isStarted) {
                resolve();
            } else {
                const func = () => {
                    if (!DataManager.global.isPaused && !DataManager.global.sysDialogName && !DataManager.global.isShowMenu) {
                        resolve();
                        DataManager.removeEventListener('change', func);
                    }
                }
                DataManager.addEventListener('change', func);
            }
        });
    }

    async prepareCommand(command) {
        // console.log('prepare command: ', command);
        try {
            const regexp = /\(\$cmd:(.*?)(:(.*?))?\$\)/gm;
            const promises = [];
            command.replace(regexp, (match) => {
                promises.push(this.execCommandString(match));
                return match;
            });
            const results = await Promise.all(promises);
            return command.replace(regexp, () => results.shift());
        }
        catch (error) {
            console.log('prepare command: ', error);
        }
    }

    async execCommandString(cmdString) {
        try {
            const code = String(cmdString).replace(/(\$cmd:(.*?)\$)/gm, '(await this.runCommand("$1"))');
            const result = new AsyncFunction(`return ${code}`).call(this);
            return result;
        }
        catch (error) {
            console.log('exec command: ', error);
        }
    }

    async runCommand(command, pid, prevStepReturns) {
        pid && console.log('run command: ', command);
        command = await this.prepareCommand(command);
        const parse = /\$cmd:(.*?)(:(.*?))?\$/gm.exec(command);
        const cmd = this.commands[parse[1]];

        const args = (parse[3] ? parse[3].split(':') : []).map(arg => {
            return String(arg) === '->|' ? prevStepReturns : arg;
        });

        return new Promise(resolve => {
            try {
                this.dispatchEvent(new CustomEvent('runcommand', { detail: { command, args } }));
                cmd(...args, pid, resolve, prevStepReturns);
                this.dispatchEvent(new CustomEvent('finishcommand', { detail: { command, args } }));
            }
            catch (error) {
                console.log('run command error: ', error);
            }
        });
    }

    async runCommands(commands, pid) {
        return Promise.allSettled(commands.map(command => this.runCommand(command, pid)));
    }

    async checkConditional(conditional) {
        const result = await this.execCommandString(conditional);
        return result;
    }

    async resolveScriptConditional(script) {
        if (await this.execCommandString(script.conditional)) {
            return true;
        }
        if (script.awaitConditional) {
            const result = await new Promise(resolve => {
                const foo = async () => {
                    if (await this.execCommandString(script.conditional)) {
                        DataManager.removeEventListener('change', foo);
                        resolve(true);
                    }
                }
                DataManager.addEventListener('change', foo);
            });
            return result;
        }
        return false;
    }

    async loop(script) {
        // console.log('loop: ', script)
        let count = Number(script.loop ?? 1);
        const loopAsConditional = Boolean(script.loop && isNaN(count));

        if (loopAsConditional) {
            count = await this.checkConditional(script.loop) ? Infinity : 1;
        }

        const pid = this.newProcess(script);
        console.group(`%c${pid}`, 'color: green');
        while (count && this.#process[pid]) {
            let resolver;
            const promise = new Promise(resolve => resolver = resolve);
            setTimeout(async () => {
                if (await this.resolveScriptConditional(script)) {
                    await this.evalCommandChain([...script.steps], pid);
                }
                resolver();
            });

            await promise;

            count = (loopAsConditional && !(await this.checkConditional(script.loop))) ? 0 : count - 1;
        }
        this.killProcess(pid);
    }

    async evalCommandChain(chain, pid, prevStepReturns) {
        // console.log('eval command chain: ', chain, pid);
        if (pid && !this.#process[pid]) return Promise.resolve();
        const step = chain.shift();
        if (step) {
            let result = null;
            await this.pause();
            if (typeof step === 'string') {
                result = await CommandManager.runCommand(step, pid, prevStepReturns);
                // console.log('command result: ', result);
            } else if (Array.isArray(step)) {
                console.group('%cparallel', 'color: blue');
                result = await this.evalCommandParallel([...step], pid, prevStepReturns);
                console.groupEnd();
            } else if (typeof step === 'object') {
                await this.evalScripts([step], false, pid);
            }
            return this.evalCommandChain(chain, pid, result);
        }
    }

    async evalCommandParallel(chains, pid, prevStepReturns) {
        // console.log('eval command parallel: ', chains, pid);
        return Promise.allSettled(chains.map(chain => this.evalCommandChain(safityArrayFrom(chain), pid, prevStepReturns)));
    }

    async evalScriptsChain(chain) {
        // console.log('eval scripts chain: ', chain);
        const step = chain.shift();
        if (step) {
            await this.loop(step);
            return this.evalScriptsChain(chain);
        }
    }

    async evalScriptsParallel(chains) {
        // console.log('eval scripts parallel: ', chains);
        await Promise.allSettled(chains.map(async (chain) => {
            await this.loop(chain);
        }));
    }

    async evalScripts(scripts = [], kill = false, parentId) {
        // console.log('eval scripts', scripts, kill);
        if (kill) {
            for (let proc in this.#process) {
                this.killProcess(proc);
            }
        }

        if (parentId) {
            scripts.forEach(script => script['parentId'] = parentId)
        }

        const series = scripts.filter(script => !script.parallel);
        const parallel = scripts.filter(script => script.parallel);
        this.evalScriptsParallel(parallel);
        await this.evalScriptsChain(series);
    }

    async evalSceneScriptByName(scene, name) {
        return await this.evalScripts(scene?.scripts?.[name]);
    }
}

export const CommandManager = new Interpretator();
window['$commandManager'] = CommandManager; 