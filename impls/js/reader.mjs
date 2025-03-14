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
    // console.log("t", tokens)
    const r = new Reader(tokens);
    try {
        return read_form(r);
    } catch(e) {
        return EOF;
    }
}

function read_string(str) {
  if (str.length < 2 || str[0] !== '"' || str[str.length-1] !== '"') {
    throw new Error("Not a valid string literal");
  }
  
  let result = '';
  let state = 'NORMAL';
  
  for (let i = 1; i < str.length - 1; i++) {
    const char = str[i];
    
    if (state === 'NORMAL') {
      if (char === '\\') {
        state = 'ESCAPE';
      } else {
        result += char;
      }
    } else if (state === 'ESCAPE') {
      switch (char) {
        case 'n': result += '\n'; break;
        case 't': result += '\t'; break;
        case 'r': result += '\r'; break;
        case '"': result += '"'; break;
        case '\\': result += '\\'; break;
        default: result += char;
      }
      state = 'NORMAL';
    }
  }
  
  // Check if we ended in the ESCAPE state, which is an error
  if (state === 'ESCAPE') {
    throw new Error("EOF while reading string - escape sequence not completed");
  }
  
  return result;
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
        const res = read_string(a);
        return new MalString(res);
    } else {
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
    if (first_char === "@") {
        r.next();
        return new MalList([new MalSymbol("deref"), read_form(r)])
    } else if (first_char === "'") {
        r.next();
        return new MalList([new MalSymbol("quote"), read_form(r)])
    } else if (first_char === "`") {
        r.next();
        return new MalList([new MalSymbol("quasiquote"), read_form(r)])
    } else if (first_char === "~" && token[1] === "@") {
        r.next();
        return new MalList([new MalSymbol("splice-unquote"), read_form(r)])
    } else if (first_char === "~") {
        r.next();
        return new MalList([new MalSymbol("unquote"), read_form(r)])
    }

    if (["(", "[", "{"].includes(first_char)) {
        ret = read_list(r, first_char);
    } else {
        ret = read_atom(r);
    }
    return ret;

}