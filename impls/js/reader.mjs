import { MalString, MalVector, MalList, MalInt, MalSymbol, MalNil, MalFalse, MalTrue, MalHashMap } from './types.mjs'
import fs from 'fs';

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
    const r = new Reader(tokens);
    try {
        return read_form(r);
    } catch(e) {
        return EOF;
    }
}


export function unescape_string(str) {
    return str.replaceAll(`\\"`, `\"`).replace("\\\\", "\\");
}

function read_atom(r) {
    log("read atom")
    const a = r.peek();
    const asInt = parseInt(r.peek());
    if (!isNaN(asInt)) {
        return new MalInt(asInt);
    } else if (a === "nil") {
        return new MalNil();
    } else if (a === "true") {
        return new MalTrue();
    } else if(a === "false") {
        return new MalFalse();
    } else if (a[0] === ":") {
        return new MalString(a, true);
    } else if (a[0] === '"') {
        if (a[a.length-1] !== '"') {
            throw new EOFError("EOF while reading string")
        }
        // console.log("before", a.split(""))
        try {
            let _ = JSON.stringify(a);
            // console.log("stringified", _)
        } catch(e) {
            throw new EOFError("EOF while reading string")
        }
        const a_escaped = a;
        // console.log("after", a_escaped.split(""))
        if (a_escaped === "\"") {
            throw new EOFError("EOF while reading string")
        }

        return new MalString(a_escaped.slice(1, a_escaped.length -1 ));
    } else{
        return new MalSymbol(a);
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
        return new MalList(res);
    } else if (delimiter === "[") {
        return new MalVector(res);
    } else {
        return new MalHashMap(res);
    }

}

function read_form(r) {
    log("read form")
    const token = r.peek()
    let ret = null;
    const first_char = token[0];
    if (["(", "[", "{"].includes(first_char)) {
        ret = read_list(r, first_char);
    } else {
        ret = read_atom(r);
    }
    return ret;

}