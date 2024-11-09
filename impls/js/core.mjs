import { pr_str } from './printer.mjs';
import { MalFn, MalInt, MalList, MalNil, MalVector, MalTrue, MalFalse, MalString } from './types.mjs';

function malBoolean(val) {
    if (val) {
        return new MalTrue();
    } else {
        return new MalFalse();
    }
}

function malEqual(a, b) {
        if (a.type === b.type || ([MalVector.type, MalList.type].includes(a.type) && [MalVector.type, MalList.type].includes(b.type))) {
            if (a instanceof MalList || a instanceof MalVector) {
                if (a.val.length === b.val.length) {
                    for (let i = 0; i < a.val.length; i++) {
                        if (malEqual(a.val[i], b.val[i]) instanceof MalFalse) {
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
        return new MalNil();
    }),
    "pr-str": new MalFn((...args) => {
        return new MalString(args.map(arg => pr_str(arg, true)).join(" "));
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
        return malEqual(a, b);
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