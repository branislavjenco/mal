import { readFileSync } from 'fs';
import { pr_str } from './printer.mjs';
import { read_str } from './reader.mjs';
import { MalAtom, MalFn, MalInt, MalList, MalNil, MalVector, MalTrue, MalFalse, MalString, MalSymbol, MalHashMap } from './types.mjs';

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
    "list": new MalFn((...args) => { return new MalList(args) }),
    "list?": new MalFn((l, ...rest) => { return malBoolean(l instanceof MalList) }),
    "pr-str": new MalFn((...args) => {
        return new MalString(args.map(arg => pr_str(arg, true)).join(" "));
    }),
    "str": new MalFn((...args) => {
        return new MalString(args.map(arg => pr_str(arg, false)).join(""));
    }),
    "prn": new MalFn((...args) => {
        const result = args.map(arg => pr_str(arg, true)).join(" ");
        console.log(result);
        return new MalNil();
    }),
    "println": new MalFn((...args) => {
        console.log(args.map(arg => pr_str(arg, false)).join(" "));
        return new MalNil();
    }),
    "cons": new MalFn((start, listOrVector) => {
        return new MalList([start, ...listOrVector.val])
    }),
    "vec": new MalFn((arg) => {
        if (arg instanceof MalVector) {
            return arg;
        } else {
            if (arg instanceof MalList) {
                return new MalVector(arg.val);
            } else {
                return new MalVector([arg])
            }
        }
    }),
    "nth": new MalFn((listOrVector, i) => {
        if (i.val > listOrVector.val.length - 1) {
            throw new Error("Index out of range")
        }
        return listOrVector.val[i.val];
    }),
    "first": new MalFn(l => {
        if (l instanceof MalNil || l.val.length < 1) {
            return new MalNil();
        }
        return l.val[0];
    }),
    "rest": new MalFn(l => {
        if (l instanceof MalNil || l.val.length < 1) {
            return new MalList([]);
        }
        return new MalList(l.val.slice(1));
    }),
    "macro?": new MalFn(f => {
        if (f.isMacro) {
            return new MalTrue();
        }
        return new MalFalse();
    }),
    "concat": new MalFn((...listsOrVectors) => new MalList(listsOrVectors.map(l => l.val).flat())),
    "empty?": new MalFn((l, ...rest) => { return malBoolean(l.val.length === 0) }),
    "count": new MalFn((l, ...rest) => { 
        if (l instanceof MalList || l instanceof MalVector) {
            return new MalInt(l.val.length) 
        } else {
            return new MalInt(0);
        }
    }),
    "read-string": new MalFn((str) => { 
        try {
            // console.log(str.val.split(""))
            return read_str(str.val); 
        } catch(e) {
            return new MalNil();
        }
    }),
    "slurp": new MalFn((filename) => {
        try {
            // console.log(filename)
            return new MalString(readFileSync(filename.val, { encoding: 'utf8', flag: 'r' }));
        } catch(e) {
            console.log(e)
            return new MalNil();
        }
    }),
    "atom": new MalFn((malType) => new MalAtom(malType)),
    "atom?": new MalFn((l, ...rest) => { return malBoolean(l instanceof MalAtom) }),
    "deref": new MalFn((malAtom) => malAtom.val),
    "reset!": new MalFn((malAtom, malType) => {
        malAtom.val = malType;
        return malType;
    }),
    "swap!": new MalFn((malAtom, malFn, ...args)=>{
        let res;
        if (malFn.hasOwnProperty("fn")) { // todo this more elegant
            res = malFn.fn.val(malAtom.val, ...args);
        } else {
            res = malFn.val(malAtom.val, ...args);
        }
        malAtom.val = res;
        return res; 
    }), 
    "throw": new MalFn((x) => { throw Error(x.val) }),
    "apply": new MalFn((...args) => {
        const f = args[0];
        const listOrVector = args[args.length-1];
        let combined = listOrVector.val;
        if (args.length > 2) {
            const toConcat = args.slice(1, args.length-1)
            combined = toConcat.concat(combined)
        }
        if (f.hasOwnProperty("ast")) {
            return f.fn.val(...combined)
        } else {
            return f.val(...combined);
        }
        throw Error(`Argument to apply must be list or vector, was ${listOrVector.type()}`)


    }),
    "map": new MalFn((f, listOrVector) => {
        if (f.hasOwnProperty("ast")) {
            f = f.fn
        }
        if (listOrVector instanceof MalList) {
            return new MalList(listOrVector.val.map(f.val))
        } else if (listOrVector instanceof MalVector) {
            return new MalVector(listOrVector.val.map(f.val))
        }
        throw Error("Argument to map must be list or vector")
    }),
    "nil?": new MalFn((x) => malBoolean(x instanceof MalNil)),
    "true?": new MalFn((x) => malBoolean(x instanceof MalTrue)),
    "false?": new MalFn((x) => malBoolean(x instanceof MalFalse)),
    "symbol?": new MalFn((x) => malBoolean(x instanceof MalSymbol)),
    "symbol": new MalFn((x) => new MalSymbol(x.val)),
    "keyword?": new MalFn((x) => malBoolean(x.val[0] === "\u029e")),
    "keyword": new MalFn((x) => {
        if (x.val[0] === "\u029e") {
            return x;
        } else {
            return new MalString("\u029e" + x.val)
        }
    }),
    "vector": new MalFn((...args) => new MalVector(args)),
    "vector?": new MalFn((x) => malBoolean(x instanceof MalVector)),
    "sequential?": new MalFn((x) => malBoolean(x instanceof MalVector || x instanceof MalList)),
    "hash-map": new MalFn((...args) => {
        return new MalHashMap(args);
    }),
    "map?": new MalFn((x) => malBoolean(x instanceof MalHashMap)),
    "assoc": new MalFn((hm, ...rest) => {
        return new MalHashMap(hm.val.concat(rest));
    }),
    "+": new MalFn((a, b) => new MalInt(a.val + b.val)),
    "-": new MalFn((a, b) => new MalInt(a.val - b.val)),
    "*": new MalFn((a, b) => new MalInt(a.val * b.val)),
    "/": new MalFn((a, b) => new MalInt(Math.floor(a.val / b.val))),
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