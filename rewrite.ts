import {PP} from './types';
import {BeLet} from './be-let.js';

export function rewrite({self, nameOfScriptlet}: PP, instance: BeLet){
    let inner = self.innerHTML.trim();
    if(inner.indexOf('class ') === -1){
        inner = `
export const ${nameOfScriptlet} = class {
    async reg(ctx){
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