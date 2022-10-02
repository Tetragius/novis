import { DataManager } from "./dataManager.js";

const AsyncFunction = (async function () { }).constructor;

export class Interpretator {
    constructor() { }

    commands = {};

    async defineCommands(src) {
        const module = await import(src);
        this.commands = { ...this.commands, ...module.commands };
        return true;
    }

    #process = {};

    newProcess(chain) {
        const id = chain.name ?? String(Math.random()).split('.')[1];
        chain['pid'] = id;
        this.#process[id] = chain;
        return id;
    }

    killProcess(id) {
        if (this.#process[id]) {
            delete this.#process[id].pid;
            delete this.#process[id];
        }
    };

    async pause() {
        return new Promise(resolve => {
            if (!DataManager.global.isPaused) {
                resolve();
            }
            else {
                const func = () => {
                    if (!DataManager.global.isPaused) {
                        resolve();
                        DataManager.removeEventListener('change', func);
                    }
                }
                DataManager.addEventListener('change', func);
            }
        });
    }

    async prepareCommand(command) {
        console.log('prepare command: ', command);
        try {
            const regexp = /\(\$cmd:(.*?)(:(.*?))?\$\)/gm;
            const promises = [];
            command.replace(regexp, (match) => {
                promises.push(this.checkScriptConditional(match));
                return match;
            });
            const results = await Promise.all(promises);
            return command.replace(regexp, () => results.shift());
        }
        catch (error) {
            console.log('prepare command: ', error);
        }
    }

    async runCommand(command, pid) {
        console.log('run command: ', command, pid);
        command = await this.prepareCommand(command);
        const parse = /\$cmd:(.*?)(:(.*?))?\$/gm.exec(command);
        const cmd = this.commands[parse[1]];
        const args = parse[3] ? parse[3].split(':') : [];
        return new Promise(resolve => {
            try {
                cmd(...args, resolve, pid);
            }
            catch (error) {
                console.log('run command error: ', error);
            }
        });
    }

    async evalCommandChain(chain, pid) {
        console.log('eval command chain: ', chain, pid);
        if (pid && !this.#process[pid]) return Promise.resolve();
        const step = chain.shift();
        if (step) {
            await this.pause();
            if (typeof step === 'string') {
                const result = await CommandManager.runCommand(step, pid);
                console.log('command result: ', result);
            }
            else if (Array.isArray(step)) {
                await this.evalCommandParallel([...step], pid);
            }
            else if (typeof step === 'object') {
                await this.evalScripts([step]);
            }
            return this.evalCommandChain(chain, pid);
        }
    }

    async evalCommandParallel(chains, pid) {
        console.log('eval command parallel: ', chains, pid);
        return Promise.allSettled(chains.map(chain => this.evalCommandChain([...chain], pid)));
    }

    async checkScriptConditional(conditional) {
        const code = conditional.replace(/(\$cmd:(.*?)\$)/gm, '(await this.runCommand("$1"))');
        const result = new AsyncFunction(`return ${code}`).call(this);
        return result;
    }

    async evalScriptsChain(chain) {
        console.log('eval scripts chain: ', chain);
        const step = chain.shift();
        if (step) {
            if (await this.checkScriptConditional(step.conditional)) {
                const pid = this.newProcess(chain);
                await this.evalCommandParallel(step.steps, pid);
                this.killProcess(pid)
            }
            return this.evalScriptsChain(chain);
        }
    }

    async evalScriptsParallel(chains) {
        console.log('eval scripts parallel: ', chains);
        await Promise.allSettled(chains.map(async (chain) => {
            const pid = this.newProcess(chain);
            let count = Number(chain.loop ?? 1);
            console.log('count: ', count)
            while (count && this.#process[pid]) {
                let resolver;
                const promise = new Promise(resolve => resolver = resolve);
                setTimeout(async () => {
                    if (await this.checkScriptConditional(chain.conditional)) {
                        await this.evalCommandParallel([...chain.steps], pid);
                    }
                    count--;
                    resolver();
                })
                await promise;
            }
            this.killProcess(pid);
        }));
    }

    async evalScripts(scripts = [], kill = false) {
        console.log('eval scripts', scripts, kill);
        if (kill) {
            for (let proc in this.#process) {
                this.killProcess(proc);
            }
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
window['$CommandManager'] = CommandManager; 