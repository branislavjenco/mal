import { readFileSync } from 'fs';
import { pr_str } from './printer.mjs';
import { read_str } from './reader.mjs';
import { MalAtom, MalFn, MalInt, MalList, MalNil, MalVector, MalTrue, MalFalse, MalString } from './types.mjs';

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
            } else if (typeof a === 'symbol' && typeof b === 'symbol') {
                return malBoolean(a === b);
            } else {
                return malBoolean(a.val === b.val);
            }
        } else {
            return new MalFalse();
        }
}

export const ns = {
    "list": (...args) => { return new MalList(args) },
    "list?": (l, ...rest) => { return malBoolean(l instanceof MalList) },
    "prn": (first, ...rest) => {
        console.log(pr_str(first, true));
        return new MalNil();
    },
    "pr-str": (...args) => {
        return new MalString(args.map(arg => pr_str(arg, true)).join(" "));
    },
    "str": (...args) => {
        return new MalString(args.map(arg => pr_str(arg, false)).join(""));
    },
    "prn": (args) => {
        console.log(pr_str(args, true));
        return new MalNil();
    },
    "println": (...args) => {
        console.log(args.map(arg => pr_str(arg, false)).join(" "));
        return new MalNil();
    },
    "cons": (start, listOrVector) => {
        // console.log("consing", start, list)
        return new MalList([start, ...listOrVector.val])
    },
    "vec": (arg) => {
        if (arg instanceof MalVector) {
            return arg;
        } else {
            if (arg instanceof MalList) {
                return new MalVector(arg.val);
            } else {
                return new MalVector([arg])
            }
        }
    },
    "concat": (...listsOrVectors) => new MalList(listsOrVectors.map(l => l.val).flat()),
    "empty?": (l, ...rest) => malBoolean(l.val.length === 0),
    "count": (l, ...rest) => { 
        if (l instanceof MalList || l instanceof MalVector) {
            return new MalInt(l.val.length) 
        } else {
            return new MalInt(0);
        }
    },
    "read-string": (str) => { 
        try {
            // console.log(str.val.split(""))
            return read_str(str.val); 
        } catch(e) {
            return new MalNil();
        }
    },
    "slurp": (filename) => {
        try {
            // console.log(filename)
            return new MalString(readFileSync(filename.val, { encoding: 'utf8', flag: 'r' }));
        } catch(e) {
            console.log(e)
            return new MalNil();
        }
    },
    "atom": (malType) => new MalAtom(malType),
    "atom?": (l, ...rest) => { return malBoolean(l instanceof MalAtom) },
    "deref": (malAtom) => malAtom.val,
    "reset!": (malAtom, malType) => {
        malAtom.val = malType;
        return malType;
    },
    "swap!": (malAtom, malFn, ...args)=>{
        let res;
        if (malFn.hasOwnProperty("fn")) { // todo this more elegant
            res = malFn.fn.val(malAtom.val, ...args);
        } else {
            res = malFn.val(malAtom.val, ...args);
        }
        malAtom.val = res;
        return res; 
    }, 
    "+": (a, b) => new MalInt(a.val + b.val),
    "-": (a, b) => new MalInt(a.val - b.val),
    "*": (a, b) => new MalInt(a.val * b.val),
    "/": (a, b) => new MalInt(Math.floor(a.val / b.val)),
    "=": (a, b, ...rest) => {
        return malEqual(a, b);
    },
    "<": (a, b, ...rest) => {
        return malBoolean(a.val < b.val);
    },
    ">": (a, b, ...rest) => {
        return malBoolean(a.val > b.val);
    },
    "<=": (a, b, ...rest) => {
        return malBoolean(a.val <= b.val);
    },
    ">=": (a, b, ...rest) => {
        return malBoolean(a.val >= b.val);
    },
}