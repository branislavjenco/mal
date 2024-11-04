import { MalList, MalString, MalInt, MalSymbol, MalVector } from './types.mjs';

export function pr_str(node) {
    if (node === "EOF") {
        return node;
    }
    if (node instanceof MalInt) {
        return node.i.toString();
    } else if (node instanceof MalString) {
        return node.str;
    } else if (node instanceof MalSymbol) {
        return node.name;
    } else if (node instanceof MalList) {
        return "(" + node.list.map(el => pr_str(el)).join(" ") + ")";
    } else if (node instanceof MalVector) {
        return "[" + node.list.map(el => pr_str(el)).join(" ") + "]";
    }
}