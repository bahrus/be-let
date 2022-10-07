import {define, BeDecoratedProps } from 'be-decorated/be-decorated.js';
import {Actions, Proxy, PP, VirtualProps, ProxyProps, Scriptlet, Context} from './types';
import {register} from 'be-hive/register.js';
import {BeWatching, virtualProps, actions as BeWatchingActions} from 'be-watching/be-watching.js';
import {getValArg} from 'trans-render/lib/types';

export class BeLet extends BeWatching implements Actions{

    #scriptletInstance: Scriptlet | undefined;
    async onScopeTarget({self, scopeTarget, proxy, readyEvent, injectScope, propPath}: PP){
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const {getVal} = await import('trans-render/lib/getVal.js');
        const el = await findRealm(self, scopeTarget!) as Element;
        const getValArg = {host: el} as getValArg;
        proxy.scope = await getVal(getValArg, propPath!);
        if(proxy.scope === undefined && injectScope){
            el.addEventListener(readyEvent!, async e => {
                proxy.scope = await getVal(getValArg, propPath!)
            }, {once: true});
            import('be-scoped/be-scoped.js');
            const {getLocalName} = await import('be-hive/getLocalName.js');
            const localName = await (await getLocalName(self, 'be-scoped'));
            if(!el.matches(`[be-${localName}],[data-be-${localName}],[is-${localName}],[data-${localName}]`)){
                el.setAttribute('be-scoped', '');
            }
            
        }

    }

    async hookUp(pp: PP){
        const {proxy, Scriptlet} = pp;
        if(this.#scriptletInstance === undefined){
            this.#scriptletInstance = new Scriptlet!();
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
            await rewrite(pp, this);
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
        proxy.Scriptlet = (self as any)._modExport[nameOfScriptlet!];
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
                'nameOfScriptlet', 'doOn', 'injectScope', 'propPath', 'readyEvent', 'do', 'and'
            ],
            primaryProp: 'forAll',
            proxyPropDefaults:{
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
                do: 'reg',
                and: 'go'
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