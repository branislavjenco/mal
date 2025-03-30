import { readFileSync } from 'fs';
import { pr_str } from './printer.mjs';
import { read_str } from './reader.mjs';
import { isList, isInt, isVector, isHashMap,MalAtom, MalFn, MalInt, MalList, MalNil, MalVector, MalTrue, MalFalse, MalString, MalSymbol, MalHashMap } from './types.mjs';

function malBoolean(val) {
    if (val) {
        return new MalTrue();
    } else {
        return new MalFalse();
    }
}

function malEqual(a, b) {
    if (a.type === b.type || ([MalVector.type, MalList.type].includes(a.type) && [MalVector.type, MalList.type].includes(b.type))) {
        if (isList(a) || isVector(a)) {
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
        } else if (isHashMap(a)) {
            if (a.val.length === b.val.length) {
                let sameCount = 0;
                for (let i = 0; i < a.keys.length; i++) {
                    const k = a.keys[i];
                    // todo this won't work for nested collections
                    const indexInB = b.keys.map(x => x.val).indexOf(k.val)
                    if (indexInB >= 0 && malEqual(b.vals[indexInB], a.vals[i]) instanceof MalTrue) {
                        sameCount++;
                    }
                } 
                if (sameCount === a.keys.length) {
                    return new MalTrue();
                } else {
                    return new MalFalse();
                }
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
    "list?": new MalFn((l, ...rest) => { return malBoolean(isList(l)) }),
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
        if (isVector(arg)) {
            return arg;
        } else {
            if (isList(arg)) {
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
        if (isList(l) || isVector(l)) {
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
    "throw": new MalFn((x) => { throw x }),
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
        return new MalList(listOrVector.val.map(f.val))
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
    "vector?": new MalFn((x) => malBoolean(isVector(x))),
    "sequential?": new MalFn((x) => malBoolean(isVector(x) || isList(x))),
    "hash-map": new MalFn((...args) => {
        return new MalHashMap(args);
    }),
    "map?": new MalFn((x) => malBoolean(isHashMap(x))),
    "assoc": new MalFn((hm, ...rest) => {
        const result = [...hm.val];
        for (let i = 0; i < rest.length; i+=2) {
            const key = rest[i];
            const val = rest[i+1];
            let found = false;
            for (let j = 0; j < result.length; j+=2) {
                if (result[j].val === key.val) {
                    result[j+1] = val;
                    found = true;
                    break;
                }
            }
            if (!found) {
                result.push(key);
                result.push(val);
            }
        }
        return new MalHashMap(result);
    }),
    "dissoc": new MalFn((hm, ...keys) => {
        const result = [];
        for (let i = 0; i < hm.val.length; i+=2) {
            if (!keys.map(x => x.val).includes(hm.val[i].val)) {
                result.push(hm.val[i]);
                result.push(hm.val[i+1]);
            }
        }
        return new MalHashMap(result);
    }),
    "get": new MalFn((hm, key) => {
        if (!isHashMap(hm)) {
            return new MalNil();
        }
        const result = hm.get(key);
        if (result === null) {
            return new MalNil();
        }
        return result;
    }),
    "contains?": new MalFn((hm, key) => {
        return malBoolean(hm.contains(key));
    }),
    "keys": new MalFn((hm) => new MalList(hm.keys)),
    "vals": new MalFn((hm) => new MalList(hm.vals)),
    "readline": new MalFn((str) => new MalList(hm.vals)),
    "fn?": new MalFn((f) => malBoolean(f instanceof MalFn || (f.hasOwnProperty('ast') && !f.isMacro))),
    "string?": new MalFn((s) => malBoolean(isString(s))),
    "number?": new MalFn((s) => malBoolean(isInt(s))),
    "seq": new MalFn((str) => new MalNil()),
    "conj": new MalFn((str) => new MalNil()),
    "time-ms": new MalFn((str) => new MalNil()),
    "meta": new MalFn((malVal) => malVal.meta),
    "with-meta": new MalFn((malVal, meta) => {
        malVal.meta = meta;
        return malVal;
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