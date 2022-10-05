import {PP} from './types';
import {BeLet} from './be-let.js';

export async function rewrite({self, nameOfScriptlet, doOn}: PP, instance: BeLet){
    let inner = self.innerHTML.trim();
    const doOnArr = typeof doOn === 'string' ? [doOn] : doOn;
    let controllers: string[] = [];
    let eventHandlers: string[] = [];
    if(doOnArr !== undefined){
        const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
        const cc = doOnArr.map(s => [s, `#${lispToCamel(s)}AbortController`, ]);
        controllers = cc.map(s => `
${s[1]} = new AbortController();
`);
        eventHandlers = cc.map(s => `
ctx.target.addEventListener('${s[0]}', e => {
    this.go(ctx);
}, {signal: this.${s[1]}.signal});
`);
    }
    if(inner.indexOf('class ') === -1){
        inner = `

export const ${nameOfScriptlet} = class {
    ${controllers.join('')}
    async reg(ctx){
        ${eventHandlers.join('')}
        if(ctx.added){
            this.go(ctx);
        }
    }
    async go({target, scope, attrVal, added, ctx}){
        ${inner}
    }
}
        `;

    }
    self.innerHTML = inner;
}