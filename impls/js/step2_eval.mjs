import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import fs from 'fs';
import { MalList, MalSymbol, MalInt } from './types.mjs';

const repl_env = {'+': (a,b) => new MalInt(a.value+b.value),
    '-': (a,b) => new MalInt(a.value-b.value),
    '*': (a,b) => new MalInt(a.value*b.value),
    '/': (a,b) => new MalInt(Math.floor(a.value/b.value))}

class NotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function READ(line) {
    return read_str(line);
}

function EVAL(ast, env) {
    if (ast instanceof MalSymbol) {
        if (env.hasOwnProperty(ast.name)) {
            return env[ast.name];
        } else {

            throw new NotFoundError(`${ast.name} not defined.`); 
        }
    } else if (ast instanceof MalList && ast.list.length > 0) { 
        const evaledList = ast.list.map(item => EVAL(item, env))
        try {
            return evaledList[0](...evaledList.slice(1));
        } catch(e) {
            console.log(e)
        }
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
