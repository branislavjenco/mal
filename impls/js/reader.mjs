import fs from 'fs';
import { makeList } from './types.mjs';

const DEBUG = true;
const EOF = "EOF";

class EOFError extends Error {
    constructor(msg) {
        super(msg);
    }
}

class NoTokensError extends Error {
    constructor(msg) {
        super(msg);
    }
}

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
            return EOF;
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
    if (tokens.length < 1) {
        throw new NoTokensError(); 
    }
    // console.log("t", tokens)
    const r = new Reader(tokens);
    try {
        return read_form(r);
    } catch(e) {
        return EOF;
    }
}

function read_atom(r) {
    log("read atom")
    const a = r.peek();
    const asInt = parseInt(r.peek());
    if (!isNaN(asInt)) {
        return asInt;
    } else if (a === "nil") {
        return null;
    } else if (a === "true") {
        return true;
    } else if(a === "false") {
        return false;
    } else if (a[0] === ":") {
        return a;
    } else if (a[0] === '"') {
        try {
            // this doesn't quite work correctly
            const res = eval(a);
            return res;
        } catch(e) {
            if (a[a.length-1] === '"' ) {
                return a.slice(1, a.length-1);
            } else {
                return "EOF";
            }
        }
    } else {
        return Symbol.for(a);
    }
}

function read_list(r, delimiter) {
    log("read list/vector/hashmap")
    const delimiterMap = {
        "(": ")",
        "{": "}",
        "[": "]"
    }
    const res = []
    while (true) {
        const n = r.next();
        if (n === "EOF") {
            throw new EOFError("EOF while reading list/vector/hashmap");
        }
        if (r.peek() === delimiterMap[delimiter]) {
            break;
        }
        res.push(read_form(r));
    }
    if (delimiter === "(") {
        res.type = "list";
        return res;
    } else if (delimiter === "[") {
        res.type = "vec";
        return res;
    } else {
        res.type = "hash";
        return res;
    }

}

function read_form(r) {
    log("read form")
    const token = r.peek()
    let ret = null;
    const first_char = token[0];
    if (first_char === "@") {
        r.next();
        return makeList(Symbol.for("deref"), read_form(r));
    } else if (first_char === "'") {
        r.next();
        return makeList(Symbol.for("quote"), read_form(r));
    } else if (first_char === "`") {
        r.next();
        return makeList(Symbol.for("quasiquote"), read_form(r));
    } else if (first_char === "~" && token[1] === "@") {
        r.next();
        return makeList(Symbol.for("splice-unquote"), read_form(r));
    } else if (first_char === "~") {
        r.next();
        return makeList(Symbol.for("unquote"), read_form(r));
    }

    if (["(", "[", "{"].includes(first_char)) {
        ret = read_list(r, first_char);
    } else {
        ret = read_atom(r);
    }
    return ret;

}