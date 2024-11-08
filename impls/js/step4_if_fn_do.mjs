import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import { Env, KeyNotFoundError } from './env.mjs';
import { ns } from './core.mjs';
import fs from 'fs';
import { MalList, MalSymbol, MalInt, MalHashMap, MalVector, MalFn } from './types.mjs';

const repl_env = new Env(null)
for (const [k, v] of Object.entries(ns)) {
    repl_env.set(k, v);
}

function READ(line) {
    return read_str(line);
}

function isSymbol(node, val) {
    return node instanceof MalSymbol && node.value === val;
}

function EVAL(ast, env) {
    try {
        const debug = env.get("DEBUG-EVAL");
        if (debug) {
            console.log(`EVAL: ${pr_str(ast, true)}`);
        }
    }
    catch (e) {}
    if (ast instanceof MalSymbol) {
        return env.get(ast.value);
    } else if (ast instanceof MalList && ast.value.length > 0) {
        const first = ast.value[0];
        if (isSymbol(first, "def!")) {
            return env.set(ast.value[1].value, EVAL(ast.value[2], env));
        } else if (isSymbol(first, "let*") && (ast.value[1] instanceof MalList || ast.value[1] instanceof MalVector)) { 
            const newEnv = new Env(env);
            const list = ast.value[1].value;
            for (let i = 0; i < list.length; i = i + 2) {
                const key = list[i].value;
                const val = EVAL(list[i+1], newEnv);
                newEnv.set(key, val);
            }
            return EVAL(ast.value[2], newEnv);
        } else if (isSymbol(first, "do")) {
            for (const item of ast.value.slice(1, -1)) {
                EVAL(item, env);
            }
            return EVAL(ast.value[ast.value.length - 1], env)
        } else if (isSymbol(first, "if")) {
            const condition = EVAL(ast.value[1], env);
            const ifBranch = ast.value[2];
            const elseBranch = ast.value[3];
            if (condition) {
                return EVAL(ifBranch, env);
            } else {
                return EVAL(elseBranch, env);
            }
        } else if (isSymbol(first, "fn*")) {
            return new MalFn((...params) => {
                // console.log("params", params)
                // console.log("cl", ast.value[1], ast.value[2])
                const newEnv = new Env(env, ast.value[1], params);
                // console.log(newEnv)
                return EVAL(ast.value[2], newEnv);
            })
        } else {
            const evaledList = ast.value.map((item) => EVAL(item, env));
            // console.log(evaledList)
            try {
                return evaledList[0].value(...evaledList.slice(1));
            } catch (e) {
                console.log(e);
            }
        }
    } else if (ast instanceof MalVector) {
        return new MalVector(ast.value.map((item) => EVAL(item, env)));
    } else if (ast instanceof MalHashMap) {
        return new MalHashMap(ast.value.map((item) => EVAL(item, env)));
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
