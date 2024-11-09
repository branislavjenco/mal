import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import { Env, KeyNotFoundError } from './env.mjs';
import { ns } from './core.mjs';
import fs from 'fs';
import { MalList, MalSymbol, MalInt, MalFalse, MalHashMap, MalVector, MalFn, MalNil } from './types.mjs';

const repl_env = new Env(null)
for (const [k, v] of Object.entries(ns)) {
    repl_env.set(k, v);
}

rep("(def! not (fn* (a) (if a false true)))");

function READ(line) {
    return read_str(line);
}

function isSymbol(node, val) {
    return node instanceof MalSymbol && node.val === val;
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
        return env.get(ast.val);
    } else if (ast instanceof MalList && ast.val.length > 0) {
        const first = ast.val[0];
        if (isSymbol(first, "def!")) {
            return env.set(ast.val[1].val, EVAL(ast.val[2], env));
        } else if (isSymbol(first, "let*") && (ast.val[1] instanceof MalList || ast.val[1] instanceof MalVector)) { 
            const newEnv = new Env(env);
            const list = ast.val[1].val;
            for (let i = 0; i < list.length; i = i + 2) {
                const key = list[i].val;
                const val = EVAL(list[i+1], newEnv);
                newEnv.set(key, val);
            }
            return EVAL(ast.val[2], newEnv);
        } else if (isSymbol(first, "do")) {
            for (const item of ast.val.slice(1, -1)) {
                EVAL(item, env);
            }
            return EVAL(ast.val[ast.val.length - 1], env)
        } else if (isSymbol(first, "if")) {
            const condition = EVAL(ast.val[1], env);
            const ifBranch = ast.val[2];
            const elseBranch = ast.val[3];
            if (condition instanceof MalNil || condition instanceof MalFalse) {
                if (elseBranch === undefined) {
                    return new MalNil(); 
                } else {
                    return EVAL(elseBranch, env);
                }
            } else {
                return EVAL(ifBranch, env);
            }
        } else if (isSymbol(first, "fn*")) {
            return new MalFn((...params) => {
                // console.log("params", params)
                // console.log("cl", ast.val[1], ast.val[2])
                const binds = ast.val[1];
                const newEnv = new Env(env, binds, new MalList(params));
                // console.log(newEnv)
                return EVAL(ast.val[2], newEnv);
            })
        } else {
            const evaledList = ast.val.map((item) => EVAL(item, env));
            // console.log(evaledList)
            try {
                return evaledList[0].val(...evaledList.slice(1));
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
