import readline from "readline";
import { read_str } from "./reader.mjs";
import { pr_str } from "./printer.mjs";
import { Env, KeyNotFoundError } from "./env.mjs";
import { ns } from "./core.mjs";
import fs from "fs";
import {
    MalList,
    isList,isVector, isHashMap,
    MalSymbol,
    MalString,
    MalFalse,
    MalHashMap,
    MalVector,
    MalFn,
    MalNil,
} from "./types.mjs";

const args = process.argv.slice(2);

let iterations = 0;

const repl_env = new Env(null);
for (const [k, v] of Object.entries(ns)) {
    repl_env.set(k, v);
}

repl_env.set("eval", new MalFn((ast) => EVAL(ast, repl_env)));
repl_env.set("*ARGV*", new MalList([]) )

rep("(def! not (fn* (a) (if a false true)))");
rep(`(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\\nnil)")))))`);

function READ(line) {
    return read_str(line);
}

function isSymbol(node, val) {
    return node instanceof MalSymbol && node.val === val;
}

export function EVAL(ast, env) {
    let isError = false
    while (!isError) {
        try {
            const debug = env.get("DEBUG-EVAL");
            if (debug) {
                console.log(`EVAL: ${pr_str(ast, true)}`);
            }
            if (ast instanceof MalSymbol) {
                // console.log("poop")
                const found = env.get(ast.val)
                if (found) {
                    // console.log("piss", found)
                    return found;
                } else {
                    throw new KeyNotFoundError(`${ast.val} not found.`);
                }
            } else if (isList(ast) && ast.val.length > 0) {
                const first = ast.val[0];
                if (isSymbol(first, "def!")) {
                    try {
                        // console.log("poop")
                        const evaled = EVAL(ast.val[2], env);
                        const res =env.set(ast.val[1].val, evaled); 
                        // console.log(env)
                        return res;
                    } catch (e) {
                        isError = true;
                        throw e; 
                    }
                } else if (
                    isSymbol(first, "let*") &&
                    (isList(ast.val[1]) ||
                        isVector(ast.val[1]))
                ) {
                    const newEnv = new Env(env);
                    const list = ast.val[1].val;
                    for (let i = 0; i < list.length; i = i + 2) {
                        const key = list[i].val;
                        const val = EVAL(list[i + 1], newEnv);
                        newEnv.set(key, val);
                    }
                    env = newEnv;
                    ast = ast.val[2];
                    // console.log("foo", ast, env)
                    continue;
                } else if (isSymbol(first, "do")) {
                    for (const item of ast.val.slice(1, -1)) {
                        EVAL(item, env);
                    }
                    ast = ast.val[ast.val.length - 1];
                    continue;
                } else if (isSymbol(first, "if")) {
                    const condition = EVAL(ast.val[1], env);
                    const ifBranch = ast.val[2];
                    const elseBranch = ast.val[3];
                    if (
                        condition instanceof MalNil ||
                        condition instanceof MalFalse
                    ) {
                        if (elseBranch === undefined) {
                            return new MalNil();
                        } else {
                            ast = elseBranch;
                            continue;
                        }
                    } else {
                        ast = ifBranch;
                        continue;
                    }
                } else if (isSymbol(first, "fn*")) {
                    return {
                        ast: ast.val[2],
                        params: ast.val[1],
                        env: env,
                        fn: new MalFn((...params) => {
                            const binds = ast.val[1];
                            const newEnv = new Env(
                                env,
                                binds,
                                new MalList(params)
                            );
                            return EVAL(ast.val[2], newEnv);
                        }),
                    };
                } else {
                    // apply
                    try {
                        // console.log("before eval", ast.val)
                        const evaledList = ast.val.map((item) =>
                            EVAL(item, env)
                        );
                        // console.log("after eval", evaledList);
                        const f = evaledList[0];
                        const args = evaledList.slice(1);
                        if (f.hasOwnProperty("ast")) {
                            // is a fn*
                            ast = f.ast;
                            env = new Env(f.env, f.params, new MalList(args));
                            continue;
                        } else {
                            // console.log(f.val, args)
                            return f.val(...args);
                        }
                    } catch (e) {
                        isError = true;
                        throw e;
                    }
                }
            } else if (isVector(ast)) {
                return new MalVector(ast.val.map((item) => EVAL(item, env)));
            } else if (isHashMap(ast)) {
                return new MalHashMap(ast.val.map((item) => EVAL(item, env)));
            } else {
                return ast;
            }
        } catch (e) {
            isError = true;
            throw e;
        }
    }
}

function PRINT(line) {
    return pr_str(line, true);
}

function rep(line) {
    try {
        const read = READ(line);
        // console.log("read",line, read)
        // console.log("===")
        return PRINT(EVAL(read, repl_env));
    } catch (e) {
        return e.message;
    }
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function onLine(line) {
    let output;
    try {
        output = rep(line);
        console.log(output);
    } catch (e) {
        console.log(e);
    } finally {
        rl.prompt();
    }
}

function onClose() {
    console.log("input has closed");
    rl.close();
}

if (args.length > 0) {
    // console.log("Running file ", args[0])
    // console.log("foo",args)
    repl_env.set("*ARGV*", new MalList(args.slice(1).map(s => new MalString(s))) )
    rep(`(load-file "${args[0]}")`);
    // console.log("Done", repl_env.get("*ARGV*").val);
    process.exit();
}

process.stdin.setEncoding("utf-8");

fs.rmSync("./log.txt", { force: true });
rl.on("line", onLine);
rl.on("close", onClose);
rl.setPrompt("user> ");
rl.prompt();
