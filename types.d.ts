import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {Scope} from 'trans-render/lib/types';
import {
    EndUserProps as BeWatchingEndUserProps,
    VirtualProps as BeWatchingVirtualProps,
} from 'be-watching/types';

export interface EndUserProps extends BeWatchingEndUserProps{
    beScoping: Scope;
}

export interface VirtualProps extends EndUserProps, BeWatchingVirtualProps{}

export type Proxy = Element & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy;
}

export type PP = ProxyProps;


export interface Actions{
    onBeScoping(pp: PP): void;
}