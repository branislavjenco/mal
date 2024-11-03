import { MalList, MalInt, MalSymbol } from './types.mjs'

class Reader {
    position;
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    next() {
        console.log(`nexting from ${this.position}, ${this.tokens}`)
        const current = this.tokens[this.position];
        this.position = this.position + 1;
        return current;
    }

    peek() {
        console.log(`peeeking at ${this.position}, ${this.tokens}`)
        return this.tokens[this.position];
    }
}




function tokenize(str) {
    const re = new RegExp(/[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g);
    let match;
    const matches = [];
    while (match = re.exec(str)) {
        matches.push(match);
    }
    console.log("matches", matches)
    return matches.slice(0, matches.length - 1);
}

export function read_str(str) {
    const tokens = tokenize(str);
    const r = new Reader(tokens);
    return read_form(r);
}

function read_atom(r) {
    const asInt = parseInt(r.peek());
    if (!isNaN(asInt)) {
        return new MalInt(asInt);
    } else {
        return new MalSymbol(r.peek())
    }
}

function read_list(r) {
    const res = []
    while (true) {
        r.next();
        if (r.peek() === ")") {
            break;
        }
        res.push(read_form(r));
    }

    return new MalList(res);
}

function read_form(r) {
    const token = r.peek()
    let ret = null;
    if (token[0] === "(") {
        ret = read_list(r);
    } else {
        ret = read_atom(r);
    }
    console.log("form" ,ret);
    return ret;

}