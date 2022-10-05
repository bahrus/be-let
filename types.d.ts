import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {Target} from 'trans-render/lib/types';
import {
    EndUserProps as BeWatchingEndUserProps,
    VirtualProps as BeWatchingVirtualProps,
    Actions as BeWatchingActions,
} from 'be-watching/types';

export interface EndUserProps extends BeWatchingEndUserProps<HTMLScriptElement>{
    scopeTarget: Target;
    Scriptlet: new () => Scriptlet;
    nameOfScriptlet: string;
}

export interface VirtualProps extends EndUserProps, BeWatchingVirtualProps<HTMLScriptElement>{
    scope: any;
}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy;
}

export type PP = ProxyProps;


export interface Actions extends BeWatchingActions{
    onScopeTarget(pp: PP): void;
    hookUp(pp: PP): void;
    importSymbols(pp: PP): void;
}

export interface Context<TElement = Element, TScope = EventTarget>{
    target?: TElement,
    attrVal?: string | null,
    added: boolean,
    scope: TScope,
    ctx?: Context<TElement, TScope>,
}

export interface Scriptlet<TElement = Element, TScope = EventTarget> {
    reg(ctx: Context<TElement, TScope>): Promise<void>;
    go(ctx: Context<TElement, TScope>): Promise<void>;
}



