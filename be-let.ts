import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps, ProxyProps, Scriptlet, doArg} from './types';
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
            if(!el.matches('[be-scoping],[data-be-scoping],[is-scoping],[data-is-scoping]')){
                el.setAttribute('be-scoping', '');
            }
            
        }

    }

    async hookUp(pp: PP){
        const {proxy, Scriptlet} = pp;
        if(this.#scriptletInstance === undefined){
            this.#scriptletInstance = new Scriptlet();
        }
        const nodeQueue = Array.from(this.#addedNodeQueue);
        for(const node of nodeQueue){
            this.handleNode(pp, node, true);
        }
    }

    handleNode(pp: PP, node: Node, added: boolean){
        const {scope} = pp;
        const args: doArg = {target: node as Element, added, scope};
        this.#scriptletInstance!.do(args);
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
        if(this.#scriptletInstance === undefined){
            this.#addedNodeQueue.delete(node);
        }else{
            this.handleNode(pp, node, false);
        }
    }

    importSymbols(pp: PP): void {
        const {self, nameOfScriptlet} = pp;
        const inner = self.innerHTML.trim();
        if(inner.indexOf('class ') === -1){
            const str = `
export const ${nameOfScriptlet} = class {
    do({target, added, value, scope}) => {
        ${inner}
    }
}
            `
        }
        self.innerHTML = inner;
        if((self as any)._modExport){
            this.assignScriptToProxy(pp)
        }else{
            self.addEventListener('load', e =>{
                this.assignScriptToProxy(pp);
            }, {once: true});
            self.setAttribute('be-exportable', '');
            import('be-exportable/be-exportable.js');
        }
        

    }

    assignScriptToProxy({nameOfScriptlet, proxy, self}: PP){
        proxy.Scriptlet = (self as any)._modExport[nameOfScriptlet];
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
            virtualProps: [
                ...virtualProps, 'beScoping', 'scope', 'Scriptlet',
                'nameOfScriptlet'
            ],
            primaryProp: 'for',
            proxyPropDefaults:{
                subtree: true,
                childList: true,
                beScoping: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
                nameOfScriptlet: 'Scriptlet'
            }
        },
        actions:{
            ...BeWatchingActions,
            onBeScoping: 'beScoping',
            hookUp: {
                ifAllOf: ['scope', 'Scriptlet']
            },
            importSymbols: 'nameOfScriptlet'
        }
    },
    complexPropDefaults:{
        controller: BeLet
    }
});

register(ifWantsToBe, upgrade, tagName);