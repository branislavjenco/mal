import { MalList, MalString, MalInt, MalSymbol, MalVector, MalTrue, MalHashMap, MalFalse, MalNil, MalFn, MalAtom } from './types.mjs';


export function escape_string(str) {
    return str.replace("\\", "\\\\").replaceAll(`\"`, `\\"`);
}
export function pr_str(node, print_readably) {
    // console.log("?", node)
    if (!node) {
        return "AST undefined"
    }
    if (node === "EOF") {
        return node;
    }
    if (node instanceof MalInt) {
        return node.val.toString();
    } else if (node instanceof MalString) {
            // console.log(node.val)
        if (node.val[0] === "\u029e") {
            return ":" + node.val.slice(1);
        }
        if (print_readably) {
            return JSON.stringify(node.val);
        } else {
            return node.val;
        }
    } else if (node instanceof MalSymbol) {
        return node.val;
    } else if (node instanceof MalList) {
        return "(" + node.val.map(el => pr_str(el, print_readably)).join(" ") + ")";
    } else if (node instanceof MalVector) {
        return "[" + node.val.map(el => pr_str(el, print_readably)).join(" ") + "]";
    } else if (node instanceof MalTrue) {
        return "true";
    } else if (node instanceof MalFalse) {
        return "false";
    } else if (node instanceof MalNil) {
        return "nil";
    } else if (node instanceof MalHashMap) {
        return "{" + node.val.map(el => pr_str(el, print_readably)).join(" ") + "}";
    } else if (node instanceof MalFn || node.hasOwnProperty("fn")) {
        return "#\<function>";
    } else if (node instanceof MalAtom) {
        return "(atom " + pr_str(node.val, print_readably) + ")";
    } else {
        return "Dunno what to do with" + JSON.stringify(node)
    }
}