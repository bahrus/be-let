import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { BeWatching, virtualProps, actions as BeWatchingActions } from 'be-watching/be-watching.js';
export class BeLet extends BeWatching {
    #scriptletInstance;
    async onBeScoping({ self, beScoping, proxy }) {
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const el = await findRealm(self, beScoping);
        proxy.scope = el.beDecorated?.scoping?.scope;
        if (proxy.scope === undefined) {
            el.addEventListener('be-decorated.scoping.resolved', e => {
                proxy.scope = el.beDecorated?.scoping?.scope;
            }, { once: true });
            import('be-scoping/be-scoping.js');
            if (!el.matches('[be-scoping],[data-be-scoping],[is-scoping],[data-is-scoping]')) {
                el.setAttribute('be-scoping', '');
            }
        }
    }
    async hookUp(pp) {
        const { proxy, Scriptlet } = pp;
        if (this.#scriptletInstance === undefined) {
            this.#scriptletInstance = new Scriptlet();
        }
        const nodeQueue = Array.from(this.#addedNodeQueue);
        for (const node of nodeQueue) {
            this.handleNode(pp, node, true);
        }
    }
    handleNode(pp, node, added) {
        const { scope, queryInfo } = pp;
        console.log({ queryInfo });
        const value = queryInfo.match === 'A' ? node.getAttribute(queryInfo.attrib) : undefined;
        const args = { target: node, added, scope, value };
        this.#scriptletInstance.do(args);
    }
    #addedNodeQueue = new Set();
    //#removedNodeQueue: Set<Node> = new Set<Node>();
    doAddedNode(pp, node) {
        if (this.#scriptletInstance === undefined) {
            this.#addedNodeQueue.add(node);
        }
        else {
            this.handleNode(pp, node, true);
        }
    }
    doRemovedNode(pp, node) {
        if (this.#scriptletInstance === undefined) {
            this.#addedNodeQueue.delete(node);
        }
        else {
            this.handleNode(pp, node, false);
        }
    }
    importSymbols(pp) {
        const { self, nameOfScriptlet } = pp;
        let inner = self.innerHTML.trim();
        if (inner.indexOf('class ') === -1) {
            inner = `
export const ${nameOfScriptlet} = class {
    do({target, added, value, scope}){
        ${inner}
    }
}
            `;
        }
        self.innerHTML = inner;
        if (self._modExport) {
            this.assignScriptToProxy(pp);
        }
        else {
            self.addEventListener('load', e => {
                this.assignScriptToProxy(pp);
            }, { once: true });
            self.setAttribute('be-exportable', '');
            import('be-exportable/be-exportable.js');
        }
    }
    assignScriptToProxy({ nameOfScriptlet, proxy, self }) {
        proxy.Scriptlet = self._modExport[nameOfScriptlet];
    }
}
const tagName = 'be-let';
const ifWantsToBe = 'let';
const upgrade = 'script';
define({
    config: {
        tagName,
        propDefaults: {
            ifWantsToBe,
            upgrade,
            forceVisible: [upgrade],
            virtualProps: [
                ...virtualProps, 'beScoping', 'scope', 'Scriptlet',
                'nameOfScriptlet'
            ],
            primaryProp: 'for',
            proxyPropDefaults: {
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)'],
                target: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
                nameOfScriptlet: 'Scriptlet'
            }
        },
        actions: {
            ...BeWatchingActions,
            onBeScoping: 'beScoping',
            hookUp: {
                ifAllOf: ['scope', 'Scriptlet']
            },
            importSymbols: 'nameOfScriptlet'
        }
    },
    complexPropDefaults: {
        controller: BeLet
    }
});
register(ifWantsToBe, upgrade, tagName);
