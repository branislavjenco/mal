import { isInt, isString, isSymbol, isList, isVector, isTrue, isFalse, isNil, isHashMap, isFn, isAtom } from './types.mjs';


export function escape_string(str) {
    return str.replace("\\", "\\\\").replaceAll(`\"`, `\\"`);
}
export function pr_str(node, print_readably) {
    // console.log("?", node)
    if (!node) {
        return ""
    }
    if (node === "EOF") {
        return node;
    }
    if (isInt(node)) {
        return node.val.toString();
    } else if (isString(node)) {
        if (node.val[0] === "\u029e") {
            return ":" + node.val.slice(1);
        }
        if (print_readably) {
            return JSON.stringify(node.val);
        } else {
            return node.val;
        }
    } else if (isSymbol(node)) {
        return node.val;
    } else if (isList(node)) {
        return "(" + node.val.map(el => pr_str(el, print_readably)).join(" ") + ")";
    } else if (isVector(node)) {
        return "[" + node.val.map(el => pr_str(el, print_readably)).join(" ") + "]";
    } else if (isTrue(node)) {
        return "true";
    } else if (isFalse(node)) {
        return "false";
    } else if (isNil(node)) {
        return "nil";
    } else if (isHashMap(node)) {
        return "{" + node.val.map(el => pr_str(el, print_readably)).join(" ") + "}";
    } else if (isFn(node)) {
        return "#\<function>";
    } else if (isAtom(node)) {
        return "(atom " + pr_str(node.val, print_readably) + ")";
    } else {
        return "Unknown AST node: " + JSON.stringify(node)
    }
}