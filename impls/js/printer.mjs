import { MalList, MalString, MalInt, MalSymbol, MalVector, MalTrue, MalHashMap, MalFalse, MalNil } from './types.mjs';


export function escape_string(str) {
    return str.replace("\\", "\\\\").replaceAll(`\"`, `\\"`);
}
export function pr_str(node, print_readably) {
    if (node === "EOF") {
        return node;
    }
    if (node instanceof MalInt) {
        return node.i.toString();
    } else if (node instanceof MalString) {
        if (node.str[0] === 0x29E) {
            return ":" + node.str.slice(1);
        }
        if (print_readably) {
            // console.log("before", node.str.split(""))
            const escaped = escape_string(node.str);
            // console.log("after", escaped.split(""))
            return '"' + escaped + '"';
        } else {
            return node.str;
        }
    } else if (node instanceof MalSymbol) {
        return node.name;
    } else if (node instanceof MalList) {
        return "(" + node.list.map(el => pr_str(el)).join(" ") + ")";
    } else if (node instanceof MalVector) {
        return "[" + node.list.map(el => pr_str(el)).join(" ") + "]";
    } else if (node instanceof MalTrue) {
        return "true";
    } else if (node instanceof MalFalse) {
        return "false";
    } else if (node instanceof MalNil) {
        return "nil";
    } else if (node instanceof MalHashMap) {
        return "{" + node.map.map(el => pr_str(el)).join(" ") + "}";
    }
}