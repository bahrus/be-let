import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps} from './types';
import {register} from 'be-hive/register.js';
import {BeWatching, virtualProps, actions as BeWatchingActions} from 'be-watching/be-watching.js';
import { def } from '../trans-render/lib/def';

export class BeLet extends BeWatching implements Actions{
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
            virtualProps: [...virtualProps],
            //primaryProp:
            proxyPropDefaults:{
                subtree: true,
                childList: true,

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