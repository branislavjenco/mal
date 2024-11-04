import { MalString, MalVector, MalList, MalInt, MalSymbol } from './types.mjs'
import fs from 'fs';

const DEBUG = true;

const logFile = "./log.txt";
function log(msg,r) {
    if (DEBUG) {
        let str = msg + "\n";
        if (r) {
            let charPos;
            if (r.position === 0) {
                charPos = 0;
            } else {
                charPos = r.tokens.slice(0, r.position).join(" ").length + 1;
            }
            str = str + r.tokens.join(",") + "\n"
            str = str + " ".repeat(charPos) + "^" + "\n"
            str = str + "===========\n"
        }
        fs.appendFileSync(logFile, str);
    }
}

class Reader {
    position;
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    next() {
        log("next", this)
        if (this.position === this.tokens.length - 1) {
            return "EOF";
        }
        const current = this.tokens[this.position];
        this.position = this.position + 1;
        return current;
    }

    peek() {
        log("peek", this)
        return this.tokens[this.position];
    }

}

function tokenize(str) {
    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    const results = [];
    let match;
    while ((match = re.exec(str)[1]) != '') {
        if (match[0] === ';') { continue; }
        results.push(match);
    }
    return results;
}

export function read_str(str) {
    log("read str")
    const tokens = tokenize(str);
    const r = new Reader(tokens);
    return read_form(r);
}

function read_atom(r) {
    log("read atom")
    const a = r.peek();
    const asInt = parseInt(r.peek());
    if (!isNaN(asInt)) {
        return new MalInt(asInt);
    } else if (a[0] === '"') {
        return new MalString(a);
    } else{
        return new MalSymbol(a);
    }
}

function read_list(r) {
    log("read list")
    const res = []
    while (true) {
        const n = r.next();
        if (n === "EOF") {
            return "EOF"
        }
        if (r.peek() === ")") {
            break;
        }
        res.push(read_form(r));
    }

    return new MalList(res);
}

function read_vector(r) {
    log("read vector")
    const res = []
    while (true) {
        const n = r.next();
        if (n === "EOF") {
            return "EOF"
        }
        if (r.peek() === "]") {
            break;
        }
        res.push(read_form(r));
    }

    return new MalVector(res);
}

function read_form(r) {
    log("read form")
    const token = r.peek()
    let ret = null;
    if (token[0] === "(") {
        ret = read_list(r);
    } else if (token[0] === "[") {
        ret = read_vector(r);
    } else {
        ret = read_atom(r);
    }
    return ret;

}