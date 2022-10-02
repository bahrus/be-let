import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {Scope} from 'trans-render/lib/types';
import {
    EndUserProps as BeWatchingEndUserProps,
    VirtualProps as BeWatchingVirtualProps,
    Actions as BeWatchingActions,
} from 'be-watching/types';

export interface EndUserProps extends BeWatchingEndUserProps<HTMLScriptElement>{
    beScoping: Scope;
}

export interface VirtualProps extends EndUserProps, BeWatchingVirtualProps<HTMLScriptElement>{}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy;
}

export type PP = ProxyProps;


export interface Actions extends BeWatchingActions{
    onBeScoping(pp: PP): void;
}