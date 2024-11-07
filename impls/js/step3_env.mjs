import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import { Env } from './env.mjs';
import fs from 'fs';
import { MalList, MalSymbol, MalInt, MalHashMap, MalVector } from './types.mjs';

const repl_env = new Env(null)
repl_env.set("+", (a, b) => new MalInt(a.value + b.value));
repl_env.set("-", (a, b) => new MalInt(a.value - b.value));
repl_env.set("*", (a, b) => new MalInt(a.value * b.value));
repl_env.set("/", (a, b) => new MalInt(Math.floor(a.value / b.value)));


class NotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function READ(line) {
    return read_str(line);
}

function EVAL(ast, env) {
    console.log(ast, env)
    if (ast instanceof MalSymbol) {
        return env.get(ast.name);
    } else if (ast instanceof MalList && ast.list.length > 0) {
        if (ast.list[0] instanceof MalSymbol && ast.list[0].name === "def!") {
            return env.set(ast.list[1].name, EVAL(ast.list[2], env));
        } else {
            const evaledList = ast.list.map((item) => EVAL(item, env));
            try {
                return evaledList[0](...evaledList.slice(1));
            } catch (e) {
                console.log(e);
            }
        }
    } else if (ast instanceof MalVector) {
        return new MalVector(ast.list.map((item) => EVAL(item, env)));
    } else if (ast instanceof MalHashMap) {
        return new MalHashMap(ast.map.map((item) => EVAL(item, env)));
    } else {
        return ast;
    }
}

function PRINT(line) {
    return pr_str(line, true);
}

function rep(line) {
    try {
        return PRINT(EVAL(READ(line), repl_env));
    } catch(e) {
        return e;
    }
}

var rl = readline.createInterface({input: process.stdin, output: process.stdout});
function onLine(line) {
    let output;
    try {
        output = rep(line);
        console.log(output);
    } catch(e) {

    } finally {
        rl.prompt();
    }
}

function onClose() {
    console.log('input has closed');
    rl.close();
}

process.stdin.setEncoding('utf-8');

fs.rmSync("./log.txt", {force: true})
rl.setPrompt('user> ');
rl.prompt();
rl.on('line', onLine);
rl.on('close', onClose);
