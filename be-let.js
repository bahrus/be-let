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
            if (!el.matches('[be-scoping],[data-be-scoping],[is-scoping][data-is-scoping]')) {
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
        const { scope } = pp;
        const args = { target: node, added, scope };
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
            virtualProps: [...virtualProps, 'beScoping', 'scope', 'Scriptlet'],
            primaryProp: 'for',
            proxyPropDefaults: {
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
            }
        },
        actions: {
            ...BeWatchingActions,
            onBeScoping: 'beScoping',
            hookUp: {
                ifAllOf: ['scope', 'Scriptlet']
            },
        }
    },
    complexPropDefaults: {
        controller: BeLet
    }
});
register(ifWantsToBe, upgrade, tagName);
