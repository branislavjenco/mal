import { readFileSync } from 'fs';
import { pr_str } from './printer.mjs';
import { read_str } from './reader.mjs';
import { isList, MalAtom, makeList, isVec, makeVec } from './types.mjs';

export const ns = {
    "list": (...args) => makeList(...args),
    "list?": l => isList(l),
    "prn": first => {
        console.log(pr_str(first, true));
        return null;
    },
    "pr-str": (...args) => {
        return args.map(arg => pr_str(arg, true)).join(" ");
    },
    "str": (...args) => {
        return args.map(arg => pr_str(arg, false)).join("");
    },
    "prn": args => {
        console.log(pr_str(args, true));
        return null;
    },
    "println": (...args) => {
        console.log(args.map(arg => pr_str(arg, false)).join(" "));
        return null;
    },
    "cons": (start, listOrVector) => {
        return makeList(start, ...listOrVector);
    },
    "vec": arg => {
        if (isVec(arg)) {
            return arg;
        } else {
            if (isList(arg)) {
                return makeVec(...arg);
            } else {
                return makeVec(arg);
            }
        }
    },
    "concat": (...listsOrVectors) => makeList(...listsOrVectors.flat()),
    "empty?": l => l.length === 0,
    "count": l => { 
        if (l instanceof Array) {
            return l.length; 
        } else {
            return 0;
        }
    },
    "read-string": str => { 
        try {
            return read_str(str); 
        } catch(e) {
            return null;
        }
    },
    "slurp": filename => {
        try {
            return readFileSync(filename, { encoding: 'utf8', flag: 'r' });
        } catch(e) {
            console.log(e)
            return null;
        }
    },
    "atom": malType => new MalAtom(malType),
    "atom?": l => l instanceof MalAtom,
    "deref": malAtom => malAtom.val,
    "reset!": (malAtom, malType) => {
        malAtom.val = malType;
        return malType;
    },
    "swap!": (malAtom, malFn, ...args) => {
        let res;
        if (malFn.hasOwnProperty("fn")) { // todo this more elegant
            res = malFn.fn.val(malAtom.val, ...args);
        } else {
            res = malFn.val(malAtom.val, ...args);
        }
        malAtom.val = res;
        return res; 
    }, 
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.floor(a / b),
    "=": (a, b) => compare(a, b),
    "<": (a, b) => a < b,
    ">": (a, b) => a > b,
    "<=": (a, b) => a <= b,
    ">=": (a, b) => a >= b,
}

function compare(a, b) {
    if (a instanceof Array && b instanceof Array) {
        if (a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (!compare(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    return a === b;
}