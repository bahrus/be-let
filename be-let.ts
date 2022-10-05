import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps, ProxyProps, Scriptlet, Context} from './types';
import {register} from 'be-hive/register.js';
import {BeWatching, virtualProps, actions as BeWatchingActions} from 'be-watching/be-watching.js';

export class BeLet extends BeWatching implements Actions{

    #scriptletInstance: Scriptlet | undefined;
    async onScopeTarget({self, scopeTarget, proxy}: PP){
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const el = await findRealm(self, scopeTarget) as Element;
        proxy.scope = (<any>el).beDecorated?.scoped?.scope;
        if(proxy.scope === undefined){
            el.addEventListener('be-decorated.scoped.resolved', e => {
                proxy.scope = (<any>el).beDecorated?.scoped?.scope;
            }, {once: true});
            import('be-scoped/be-scoped.js');
            if(!el.matches('[be-scoped],[data-be-scoped],[is-scoped],[data-is-scoped]')){
                el.setAttribute('be-scoped', '');
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
        const {scope, queryInfo} = pp;
        const attrVal = queryInfo!.match === 'A' ? (node as Element).getAttribute(queryInfo!.attrib!) : undefined;
        const ctx: Context = {target: node as Element, added, scope, attrVal};
        ctx.ctx = ctx;
        this.#scriptletInstance!.reg(ctx);
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

    async importSymbols(pp: PP){
        const {self, nameOfScriptlet} = pp;
        if(!self.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(pp, this);
        }
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
                ...virtualProps, 'scopeTarget', 'scope', 'Scriptlet',
                'nameOfScriptlet'
            ],
            primaryProp: 'for',
            proxyPropDefaults:{
                subtree: true,
                childList: true,
                scopeTarget: ['us', ':not(script)'],
                target: ['us', ':not(script)'],
                doInit: true,
                beWatchFul: true,
                nameOfScriptlet: 'Scriptlet'
            }
        },
        actions:{
            ...BeWatchingActions,
            onScopeTarget: 'scopeTarget',
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