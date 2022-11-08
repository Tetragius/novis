import { DataManager } from "./dataManager.js";

// script interface
// conditional: boolean or command string
// loop?: number or condtitional as command string
// parallel?: boolean
// awaitConditional?: boolean
// poolId?: string
// steps: Array of string or subArrays or scripts

export const AsyncFunction = (async function () { }).constructor;

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

    newProcess(chain, pid) {
        const id = pid ?? chain.name ?? String(Math.random()).split('.')[1];
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

    async execCommandString(cmdString, pid) {
        try {
            const code = String(cmdString).replace(/(\$cmd:(.*?)\$)/gm, '(await this.runCommand("$1", pid))');
            const result = new AsyncFunction('pid', `return ${code}`).call(this, pid);
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
        prevStepReturns = Array.isArray(prevStepReturns) ? prevStepReturns : [prevStepReturns];
        const args = (parse[3] ? parse[3].split(':') : []).map(arg => {
            const temp = /{(\d)}/.exec(String(arg))?.[1];
            return temp ? prevStepReturns[Number(temp)] : arg;
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

    async runCommands(commands, pid, attrs) {
        this.newProcess(command, pid);
        await Promise.all(commands.map(command => this.runCommand(command, pid, attrs)));
        this.killProcess(pid);
        return;
    }

    async checkConditional(conditional, pid) {
        const result = await this.execCommandString(conditional, pid);
        return result;
    }

    async resolveScriptConditional(script, pid) {
        // console.log('resolveScriptConditional: ', script.conditional);
        if (await this.execCommandString(script.conditional, pid)) {
            // console.log('resolveScriptConditional complete: ', true);
            return true;
        }
        if (script.awaitConditional) {
            const result = await new Promise(resolve => {
                const foo = async () => {
                    if (await this.execCommandString(script.conditional, pid)) {
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

    async loop(script, poolId) {
        // console.log('loop: ', script)    
        if (poolId && !this.#process[poolId]) return Promise.resolve();
        const pid = this.newProcess(script);

        let count = Number(script.loop ?? 1);
        const loopAsConditional = Boolean(script.loop && isNaN(count));

        if (loopAsConditional) {
            count = await this.checkConditional(script.loop, pid) ? Infinity : 1;
        }

        console.group(`%c${pid}`, 'color: green');
        while (count && this.#process[pid]) {
            let resolver;
            const promise = new Promise(resolve => resolver = resolve);
            setTimeout(async () => {
                if (await this.resolveScriptConditional(script, pid)) {
                    try {
                        await this.evalCommandChain([...script.steps], pid);
                    }
                    catch (error) {
                        resolver();
                    }
                }
                resolver();
            });

            await promise;

            count = (loopAsConditional && !(await this.checkConditional(script.loop, pid))) ? 0 : count - 1;
        }
        this.killProcess(pid);
    }

    async evalCommandChain(chain, pid, prevStepReturns) {
        // console.log('eval command chain: ', chain, pid, !this.#process[pid]);
        if (pid && !this.#process[pid]) return Promise.reject();
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
        return prevStepReturns;
    }

    async evalCommandParallel(chains, pid, prevStepReturns) {
        // console.log('eval command parallel: ', chains, pid);
        return Promise.all(chains.map(chain => this.evalCommandChain(safityArrayFrom(chain), pid, prevStepReturns)));
    }

    // TODO: Кажется это лишнее
    async evalScriptsChain(chain, poolId) {
        // console.log('eval scripts chain: ', chain);
        const step = chain.shift();
        if (step) {
            await this.loop(step, poolId);
            return this.evalScriptsChain(chain, poolId);
        }
    }

    // TODO: Кажется это лишнее
    async evalScriptsParallel(chains, poolId) {
        // console.log('eval scripts parallel: ', chains);
        await Promise.all(chains.map(async (chain) => {
            await this.loop(chain, poolId);
        }));
    }

    async evalScripts(scripts = [], kill = false, parentId = this.newProcess(scripts)) {

        if (parentId) {
            scripts.forEach(script => script['parentId'] = parentId);
        }

        const series = scripts.filter(script => !script.parallel);
        const parallel = scripts.filter(script => script.parallel);
        this.evalScriptsParallel(parallel, parentId);
        await this.evalScriptsChain(series, parentId);
        this.killProcess(parentId);

        // console.log('eval scripts', scripts, kill);
        if (kill) {
            for (let proc in this.#process) {
                this.killProcess(proc);
            }
        }
    }

    async evalSceneScriptByName(scene, name) {
        return await this.evalScripts(scene?.scripts?.[name]);
    }
}

export const CommandManager = new Interpretator();
window['$commandManager'] = CommandManager; 