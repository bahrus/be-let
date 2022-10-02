import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { BeWatching, virtualProps, actions as BeWatchingActions } from 'be-watching/be-watching.js';
export class BeLet extends BeWatching {
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
    async hookUp({ proxy }) {
    }
    handleNode(pp, node, added) {
    }
    #addedNodeQueue = new Set();
    #removedNodeQueue = new Set();
    doAddedNode(pp, node) {
    }
    doRemovedNode(pp, node) {
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
            virtualProps: [...virtualProps, 'beScoping', 'scope', 'scriptlet'],
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
                ifAllOf: ['scope', 'scriptlet']
            },
        }
    },
    complexPropDefaults: {
        controller: BeLet
    }
});
register(ifWantsToBe, upgrade, tagName);
