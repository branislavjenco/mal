import { MalAtom, isList, isVec, isHash } from './types.mjs';


export function escape_string(str) {
    return str.replace("\\", "\\\\").replaceAll(`\"`, `\\"`);
}
export function pr_str(node, print_readably) {
    // console.log("?", node)
    if (node === undefined) {
        return "AST undefined"
    }
    if (node === "EOF") {
        return node;
    }
    if (typeof node === 'number') {
        return node.toString();
    } else if (typeof node === 'string') {
        console.log("nooode", node)
            // console.log(node.val)
        if (node[0] === "\u029e") {
            console.log("boni")
            return ":" + node.slice(1);
        }
        if (print_readably) {
            return JSON.stringify(node);
        } else {
            return node;
        }
    } else if (typeof node === 'symbol') {
        return node.description;
    } else if (isList(node)) {
        return "(" + node.map(el => pr_str(el, print_readably)).join(" ") + ")";
    } else if (isVec(node)) {
        return "[" + node.map(el => pr_str(el, print_readably)).join(" ") + "]";
    } else if (typeof node === 'boolean' && node === true) {
        return "true";
    } else if (typeof node === 'boolean' && node === false) {
        return "false";
    } else if (node === null) {
        return "nil";
    } else if (isHash(node)) {
        return "{" + node.map(el => pr_str(el, print_readably)).join(" ") + "}";
    } else if (typeof node === 'function' || node.hasOwnProperty("fn")) {
        return "#\<function>";
    } else if (node instanceof MalAtom) {
        return "(atom " + pr_str(node.val, print_readably) + ")";
    } else {
        return "Dunno what to do with" + JSON.stringify(node)
    }
}