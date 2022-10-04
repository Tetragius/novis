export const name = 'inventory';

const defineComponents = (GameElement, DataManager, CommandManager) => {
    class InventoryWindow extends GameElement {
        constructor() {
            super();
        }

        defineItems() {
            const temp = document.createElement('div');
            Object.entries(DataManager.global.inventory).forEach(([_, name]) => {
                const button = document.createElement('g-button');
                button.innerHTML = name;
                temp.appendChild(button);
            });
            return temp.innerHTML;
        }

        update() {
            super.update();
            const dialog = (this.shadowRoot ?? this).querySelector(':not(style)');
            dialog.innerHTML = Object.keys(DataManager.global.inventory).length ? this.defineItems() : 'Инвентарь пуст';
        }

        template = `<g-dialog-system></g-dialog-system>`;
    }

    customElements.define('pg-inventory', InventoryWindow);
}

export default class InventoryPlugin {
    constructor({
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }) {
        DataManager.global['inventory'] = {};
        DataManager.global['inventoryItems'] = { 1: 'Изолента' };
        DataManager.global['isShowInventory'] = false;
        CommandManager.registrCommands(this.commands);

        this.dm = DataManager;

        defineComponents(GameElement, DataManager, CommandManager);
        this.init();
    }

    init = () => {
        document.body.addEventListener('keydown', this.keyDownHandler);
        this.draw();
    }

    postLoad = async () => {
        // console.log('plugin post load');
        return true;
    }

    draw = () => {
        const entry = document.getElementById('g-entry');
        const layer = document.createElement('g-layer');
        layer.id = `plugin-${name}`;
        layer.setAttribute('conditional', '$cmd:get-gloabl-data:isShowInventory$');
        const inventory = document.createElement('pg-inventory');
        layer.appendChild(inventory);
        entry.after(layer);
    }

    keyDownHandler = (e) => {
        if (this.dm.global.isStarted) {
            const key = e.key.toUpperCase();
            if (key === 'I' || key === 'Ш') {
                this.dm.setGlobalData('isShowInventory', !this.dm.global.isShowInventory);
            }
        }
    }


    commands = {
        'pg-inventory-set-item': (id, resolver) => {
            this.dm.global.inventory[id] = this.dm.global.inventoryItems[id];
            this.dm.notify();
            resolver('pg-inventory-set-item');
        },
        'pg-inventory-remove-item': (id, resolver) => {
            delete this.dm.global.inventory[id];
            this.dm.notify();
            resolver('pg-inventory-remove-item');
        },
        'pg-inventory-has-item': (id, resolver) => {
            resolver(this.dm.global.inventory[id]);
        },
    }
}