import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps, ProxyProps, Scriptlet} from './types';
import {register} from 'be-hive/register.js';
import {BeWatching, virtualProps, actions as BeWatchingActions} from 'be-watching/be-watching.js';

export class BeLet extends BeWatching implements Actions{

    #scriptletInstance: Scriptlet | undefined;
    async onBeScoping({self, beScoping, proxy}: PP){
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const el = await findRealm(self, beScoping) as Element;
        proxy.scope = (<any>el).beDecorated?.scoping?.scope;
        if(proxy.scope === undefined){
            el.addEventListener('be-decorated.scoping.resolved', e => {
                proxy.scope = (<any>el).beDecorated?.scoping?.scope;
            }, {once: true});
            import('be-scoping/be-scoping.js');
            if(!el.matches('[be-scoping],[data-be-scoping],[is-scoping][data-is-scoping]')){
                el.setAttribute('be-scoping', '');
            }
            
        }

    }

    async hookUp({proxy, Scriptlet}: PP){
        if(this.#scriptletInstance === undefined){
            this.#scriptletInstance = new Scriptlet();
        }
    }

    handleNode(pp: PP, node: Node, added?: boolean){

    }
    #addedNodeQueue: Set<Node> = new Set<Node>();
    //#removedNodeQueue: Set<Node> = new Set<Node>();
    doAddedNode(pp: PP, node: Node): void | Promise<void> {
        if(this.#scriptletInstance === undefined){
            this.#addedNodeQueue.add(node);
        }else{
            this.handleNode(pp, node, true);
        }
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
            virtualProps: [...virtualProps, 'beScoping', 'scope', 'Scriptlet'],
            primaryProp: 'for',
            proxyPropDefaults:{
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
            }
        },
        actions:{
            ...BeWatchingActions,
            onBeScoping: 'beScoping',
            hookUp: {
                ifAllOf: ['scope', 'Scriptlet']
            },
        }
    },
    complexPropDefaults:{
        controller: BeLet
    }
});

register(ifWantsToBe, upgrade, tagName);