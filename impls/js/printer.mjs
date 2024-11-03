import { MalList, MalInt, MalSymbol } from './types.mjs';

export function pr_str(node) {
    if (node instanceof MalInt) {
        return node.i.toString();
    } else if (node instanceof MalSymbol) {
        return node.name;
    } else if (node instanceof MalList) {
        return "(" + node.list.map(el => pr_str(el)).join(" ") + ")";
    }
}