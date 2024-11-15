import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import fs from 'fs';
import { isList, isVec, isHash, makeVec, makeList, makeHash } from './types.mjs';

const repl_env = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.floor(a / b),
}

class NotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function READ(line) {
    return read_str(line);
}

function EVAL(ast, env) {
    if (typeof ast === 'symbol') {
        if (env.hasOwnProperty(ast.description)) {
            return env[ast.description];
        } else {

            throw new NotFoundError(`${ast} not defined.`); 
        }
    } else if (isList(ast) && ast.length > 0) { 
        const evaledList = makeList(...ast.map(item => EVAL(item, env)));
        try {
            const args = makeList(...evaledList.slice(1))
            return evaledList[0](...args);
        } catch(e) {
            console.log(e)
        }
    } else if (isVec(ast)) {
        return makeVec(...ast.map(item => EVAL(item, env)))
    } else if (isHash(ast)) {
        return makeHash(...ast.map(item => EVAL(item, env)))
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
