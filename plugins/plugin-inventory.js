export const name = 'inventory';

const defineComponents = (GameElement, DataManager, CommandManager) => {
    class InventoryWindow extends GameElement {
        constructor() {
            super();
        }

        defineItems() {
            const temp = document.createElement('div');
            Object.entries(DataManager.global.inventory).forEach(([_, item]) => {
                const img = document.createElement('g-image');
                img.src = item.src;
                img.title = item.name;
                img.w = '128px';
                img.h = '128px';
                temp.appendChild(img);
            });
            return temp.innerHTML;
        }

        update() {
            super.update();
            const dialog = (this.shadowRoot ?? this).querySelector(':not(style)');
            dialog.innerHTML = Object.keys(DataManager.global.inventory).length ? this.defineItems() : 'Инвентарь пуст';
        }

    }

    customElements.define('pg-inventory', InventoryWindow);
}

export default class InventoryPlugin {
    constructor({
        GameManager,
        DataManager,
        CommandManager,
        AnimationManager,
        SceneManager,
        PluginManager,
        GameElement
    }) {
        DataManager.global['inventory'] = {};
        DataManager.global['inventoryItems'] = { 1: { name: 'Изолента', src: '/img/изолента.png' } };
        CommandManager.registrCommands(this.commands);

        this.dm = DataManager;
        this.gm = GameManager;
        this.cm = CommandManager;

        defineComponents(GameElement, DataManager, CommandManager);
        this.init();
    }

    init = () => {
        document.body.addEventListener('keydown', this.keyDownHandler);
        this.draw();
        this.drawMenuButton();
    }

    postLoad = async () => {
        // console.log('plugin post load');
        return true;
    }

    draw = () => {
        const layer = document.createElement('g-layer');
        layer.id = `plugin-${name}`;
        layer.setAttribute('conditional', '$cmd:get-global-data:sysDialogName$ === "inventory"');
        const inventory = document.createElement('pg-inventory');
        layer.appendChild(inventory);
        this.gm.settingsBlockRef.after(layer);
    }

    toggle = () => {
        if (this.dm.global.sysDialogName) {
            this.gm.dispatchEvent(new CustomEvent('continue'));
            this.dm.setGlobalData('sysDialogName', '');
            return;
        }
        this.gm.dispatchEvent(new CustomEvent('pause'));
        this.dm.setGlobalData('sysDialogName', 'inventory');
    }

    drawMenuButton = () => {
        const button = document.createElement('g-button');
        button.onclick = () => this.toggle();
        button.setAttribute('conditional', '$cmd:get-global-data:isStarted$')
        button.innerHTML = 'Инвентарь';

        this.gm.bottomGroupRef.append(button);
        const menuButton = button.cloneNode(true);
        menuButton.onclick = button.onclick;
        this.gm.menuGroupRef.append(menuButton);
    };

    keyDownHandler = (e) => {
        if (this.dm.global.isStarted) {
            const keyCode = e.keyCode;
            if (keyCode === 73) {
                this.toggle();
            }
        }
    }


    commands = {
        'pg-inventory-set-item': (id, pid, resolver) => {
            this.dm.global.inventory[id] = this.dm.global.inventoryItems[id];
            this.dm.notify();
            resolver('pg-inventory-set-item');
        },
        'pg-inventory-remove-item': (id, pid, resolver) => {
            delete this.dm.global.inventory[id];
            this.dm.notify();
            resolver('pg-inventory-remove-item');
        },
        'pg-inventory-has-item': (id, pid, resolver) => {
            resolver(this.dm.global.inventory[id]);
        },
    }
}