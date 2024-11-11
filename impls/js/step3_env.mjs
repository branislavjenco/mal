import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import { Env, KeyNotFoundError } from './env.mjs';
import fs from 'fs';
import { MalList, MalSymbol, MalInt, MalHashMap, MalVector } from './types.mjs';

const repl_env = new Env(null)
repl_env.set("+", (a, b) => new MalInt(a.val + b.val));
repl_env.set("-", (a, b) => new MalInt(a.val - b.val));
repl_env.set("*", (a, b) => new MalInt(a.val * b.val));
repl_env.set("/", (a, b) => new MalInt(Math.floor(a.val / b.val)));

function READ(line) {
    return read_str(line);
}

function EVAL(ast, env) {
    const debug = env.get("DEBUG-EVAL");
    if (debug) {
        console.log(`EVAL: ${pr_str(ast, true)}`);
    }
    if (ast instanceof MalSymbol) {
        const found = env.get(ast.val)
        if (found) {
            return found;
        } else {
            throw new KeyNotFoundError(`${ast.val} not found.`);
        }
    } else if (ast instanceof MalList && ast.val.length > 0) {
        if (ast.val[0] instanceof MalSymbol && ast.val[0].val === "def!") {
            return env.set(ast.val[1].val, EVAL(ast.val[2], env));
        } else if (ast.val[0] instanceof MalSymbol && ast.val[0].val === "let*" && (ast.val[1] instanceof MalList || ast.val[1] instanceof MalVector)) { 
            const newEnv = new Env(env);
            const list = ast.val[1].val;
            for (let i = 0; i < list.length; i = i + 2) {
                const key = list[i].val;
                const val = EVAL(list[i+1], newEnv);
                newEnv.set(key, val);
            }
            return EVAL(ast.val[2], newEnv);
        } else {
            const evaledList = ast.val.map((item) => EVAL(item, env));
            try {
                return evaledList[0](...evaledList.slice(1));
            } catch (e) {
                console.log(e);
            }
        }
    } else if (ast instanceof MalVector) {
        return new MalVector(ast.val.map((item) => EVAL(item, env)));
    } else if (ast instanceof MalHashMap) {
        return new MalHashMap(ast.val.map((item) => EVAL(item, env)));
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
        return e.message;
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
