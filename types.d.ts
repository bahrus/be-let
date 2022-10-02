import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {Scope} from 'trans-render/lib/types';
import {
    EndUserProps as BeWatchingEndUserProps,
    VirtualProps as BeWatchingVirtualProps,
    Actions as BeWatchingActions,
} from 'be-watching/types';

export interface EndUserProps extends BeWatchingEndUserProps<HTMLScriptElement>{
    beScoping: Scope;
    Scriptlet: new () => Scriptlet;
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
    onBeScoping(pp: PP): void;
    hookUp(pp: PP): void;
}

export interface doArg<TElement = Element, TScope = EventTarget>{
    target?: TElement,
    value?: string,
    added: boolean,
    scope: TScope
}

export interface Scriptlet<TElement = Element, TScope = EventTarget> {
    do(arg: doArg<TElement, TScope>): Promise<void>;
}



