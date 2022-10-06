import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { BeWatching, virtualProps, actions as BeWatchingActions } from 'be-watching/be-watching.js';
export class BeLet extends BeWatching {
    #scriptletInstance;
    async onScopeTarget({ self, scopeTarget, proxy, readyEvent, injectScope, propPath }) {
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const { getVal } = await import('trans-render/lib/getVal.js');
        const el = await findRealm(self, scopeTarget);
        const getValArg = { host: el };
        proxy.scope = await getVal(getValArg, propPath);
        if (proxy.scope === undefined && injectScope) {
            el.addEventListener(readyEvent, async (e) => {
                proxy.scope = await getVal(getValArg, propPath);
            }, { once: true });
            import('be-scoped/be-scoped.js');
            if (!el.matches('[be-scoped],[data-be-scoped],[is-scoped],[data-is-scoped]')) {
                el.setAttribute('be-scoped', '');
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
        const attrVal = queryInfo.match === 'A' ? node.getAttribute(queryInfo.attrib) : undefined;
        const ctx = { target: node, added, scope, attrVal };
        ctx.ctx = ctx;
        this.#scriptletInstance.reg(ctx);
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
    async importSymbols(pp) {
        const { self, nameOfScriptlet } = pp;
        if (!self.src) {
            const { rewrite } = await import('./rewrite.js');
            await rewrite(pp, this);
        }
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
                ...virtualProps, 'scopeTarget', 'scope', 'Scriptlet',
                'nameOfScriptlet', 'doOn', 'injectScope', 'propPath', 'readyEvent',
            ],
            primaryProp: 'forAll',
            proxyPropDefaults: {
                subtree: true,
                childList: true,
                scopeTarget: ['us', ':not(script)'],
                target: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
                nameOfScriptlet: 'Scriptlet',
                injectScope: true,
                propPath: '.beDecorated.scoped.scope',
                readyEvent: 'be-decorated.scoped.resolved',
            }
        },
        actions: {
            ...BeWatchingActions,
            onScopeTarget: 'scopeTarget',
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
