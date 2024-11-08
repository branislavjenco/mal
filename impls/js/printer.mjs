import { MalList, MalString, MalInt, MalSymbol, MalVector, MalTrue, MalHashMap, MalFalse, MalNil, MalFn } from './types.mjs';


export function escape_string(str) {
    return str.replace("\\", "\\\\").replaceAll(`\"`, `\\"`);
}
export function pr_str(node, print_readably) {
    if (node === "EOF") {
        return node;
    }
    if (node instanceof MalInt) {
        return node.val.toString();
    } else if (node instanceof MalString) {
        if (node.val[0] === "\u029e") {
            return ":" + node.val.slice(1);
        }
        if (print_readably) {
            return '"' + node.val + '"';
        } else {
            return '"' + node.val + '"';
        }
    } else if (node instanceof MalSymbol) {
        return node.val;
    } else if (node instanceof MalList) {
        return "(" + node.val.map(el => pr_str(el, true)).join(" ") + ")";
    } else if (node instanceof MalVector) {
        return "[" + node.val.map(el => pr_str(el, true)).join(" ") + "]";
    } else if (node instanceof MalTrue) {
        return "true";
    } else if (node instanceof MalFalse) {
        return "false";
    } else if (node instanceof MalNil) {
        return "nil";
    } else if (node instanceof MalHashMap) {
        return "{" + node.val.map(el => pr_str(el, true)).join(" ") + "}";
    } else if (node instanceof MalFn) {
        return "#\<function>";
    }
}