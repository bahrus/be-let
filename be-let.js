import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { BeWatching, virtualProps, actions as BeWatchingActions } from 'be-watching/be-watching.js';
export class BeLet extends BeWatching {
    async onBeScoping({ self, beScoping }) {
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const el = await findRealm(self, beScoping);
        console.log({ el });
    }
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
            virtualProps: [...virtualProps, 'beScoping'],
            primaryProp: 'for',
            proxyPropDefaults: {
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)']
            }
        },
        actions: {
            ...BeWatchingActions,
            'onBeScoping': 'beScoping'
        }
    },
    complexPropDefaults: {
        controller: BeLet
    }
});
register(ifWantsToBe, upgrade, tagName);
