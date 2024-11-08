import { pr_str } from './printer.mjs';
import { MalFn, MalInt, MalList, MalNil, MalVector, MalTrue, MalFalse} from './types.mjs';

function malBoolean(val) {
    if (val) {
        return new MalTrue();
    } else {
        return new MalFalse();
    }
}

export const ns = {
    "+": new MalFn((a, b) => new MalInt(a.val + b.val)),
    "-": new MalFn((a, b) => new MalInt(a.val - b.val)),
    "*": new MalFn((a, b) => new MalInt(a.val * b.val)),
    "/": new MalFn((a, b) => new MalInt(Math.floor(a.val / b.val))),
    "list": new MalFn((...args) => { return new MalList(args) }),
    "list?": new MalFn((l, ...rest) => { return malBoolean(l instanceof MalList) }),
    "prn": new MalFn((first, ...rest) => {
        console.log(pr_str(first, true));
        return MalNil;
    }),
    "empty?": new MalFn((l, ...rest) => { return malBoolean(l.val.length === 0) }),
    "count": new MalFn((l, ...rest) => { 
        if (l instanceof MalList || l instanceof MalVector) {
            return new MalInt(l.val.length) 
        } else {
            return new MalInt(0);
        }
    }),
    "=": new MalFn((a, b, ...rest) => {
        if (a.type === b.type) {
            if (a instanceof MalList || a instanceof MalVector) {
                if (a.val.length === b.val.length) {
                    for (let i = 0; i < a.val.length; i++) {
                        if (a.val[i] !== b.val[i]) {
                            return new MalFalse();
                        }
                    }
                    return new MalTrue();
                } else {
                    return new MalFalse();
                }
            } else {
                return malBoolean(a.val === b.val);
            }
        } else {
            return new MalFalse();
        }
    }),
    "<": new MalFn((a, b, ...rest) => {
        return malBoolean(a.val < b.val);
    }),
    ">": new MalFn((a, b, ...rest) => {
        return malBoolean(a.val > b.val);
    }),
    "<=": new MalFn((a, b, ...rest) => {
        return malBoolean(a.val <= b.val);
    }),
    ">=": new MalFn((a, b, ...rest) => {
        return malBoolean(a.val >= b.val);
    }),
}