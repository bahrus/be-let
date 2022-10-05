export function rewrite({ self, nameOfScriptlet }, instance) {
    let inner = self.innerHTML.trim();
    if (inner.indexOf('class ') === -1) {
        inner = `
export const ${nameOfScriptlet} = class {
    async reg(ctx){
        if(ctx.added){
            this.do(ctx);
        }
    }
    async do({target, scope, value, added, ctx}){
        ${inner}
    }
}
        `;
    }
    self.innerHTML = inner;
}
