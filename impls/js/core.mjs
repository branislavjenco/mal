import { pr_str } from './printer.mjs';
import { MalFn, MalInt, MalList, MalNil } from './types.mjs';
export const ns = {
    "+": new MalFn((a, b) => new MalInt(a.value + b.value)),
    "-": new MalFn((a, b) => new MalInt(a.value - b.value)),
    "*": new MalFn((a, b) => new MalInt(a.value * b.value)),
    "/": new MalFn((a, b) => new MalInt(Math.floor(a.value / b.value))),
    "list": new MalFn((...args) => { return new MalList(args)}),
    "list?": new MalFn((l, ...rest) => { return l instanceof MalList }),
    "prn": new MalFn((first, ...rest) => {
        console.log(pr_str(first, true));
        return MalNil;
    }),
    "empty?": new MalFn((l, ...rest) => { return l.value.length === 0 }),
    "count": new MalFn((l, ...rest) => { return l.value.length }),
    "=": new MalFn((a, b) => {
        if (typeof a === typeof b) {
            if (a instanceof MalList) {

            }
            if (a.value )
        }
    })
    
}