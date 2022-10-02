import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps, ProxyProps} from './types';
import {register} from 'be-hive/register.js';
import {BeWatching, virtualProps, actions as BeWatchingActions} from 'be-watching/be-watching.js';

export class BeLet extends BeWatching implements Actions{

    async onBeScoping({self, beScoping}: PP){
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const el = findRealm(self, beScoping);

    }

    doAddedNode(pp: PP, node: Node): void | Promise<void> {
        
    }

    doRemovedNode(pp: PP, node: Node): void | Promise<void> {
        
    }
}

const tagName = 'be-let';

const ifWantsToBe = 'let';

const upgrade = 'script';

define<Proxy & BeDecoratedProps<Proxy, Actions>, Actions>({
    config: {
        tagName,
        propDefaults:{
            ifWantsToBe,
            upgrade,
            forceVisible: [upgrade],
            virtualProps: [...virtualProps, 'beScoping'],
            //primaryProp:
            proxyPropDefaults:{
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)']
            }
        },
        actions:{
            ...BeWatchingActions
        }
    },
    complexPropDefaults:{
        controller: BeLet
    }
});

register(ifWantsToBe, upgrade, tagName);