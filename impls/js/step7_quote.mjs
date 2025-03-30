import fs from "fs";
import readline from "readline";
import { ns } from "./core.mjs";
import { Env, KeyNotFoundError } from "./env.mjs";
import { pr_str } from "./printer.mjs";
import { read_str } from "./reader.mjs";
import {
    isList,
    MalFalse,
    MalFn,
    MalHashMap,
    MalList,
    MalNil,
    MalString,
    MalSymbol,
    MalVector,
} from "./types.mjs";

const args = process.argv.slice(2);

const repl_env = new Env(null);
for (const [k, v] of Object.entries(ns)) {
    repl_env.set(k, v);
}

repl_env.set("eval", new MalFn((ast) => EVAL(ast, repl_env)));
repl_env.set("*ARGV*", new MalList([]));

rep("(def! not (fn* (a) (if a false true)))");
rep(
    '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

function READ(line) {
    return read_str(line);
}

function isSymbol(node, val) {
    return node instanceof MalSymbol && node.val === val;
}

function quasiquote(ast, skipUnquote = false) {
    if (isList(ast)) {
        const first = ast.val[0];
        if (isSymbol(first, "unquote") && !skipUnquote) {
            return ast.val[1];
        } else {
            let res = new MalList([]);
            for (let i = ast.val.length - 1; i >= 0; i--) {
                const elt = ast.val[i]; 
                if (isList(elt) && isSymbol(elt.val[0], "splice-unquote")) {
                    res = new MalList([new MalSymbol("concat"), elt.val[1], res]);
                } else {
                    res = new MalList([new MalSymbol("cons"), quasiquote(elt), res]);
                }
            }
            return res;
        }
    } else if (ast instanceof MalHashMap || ast instanceof MalSymbol) {
        return new MalList([new MalSymbol("quote"), ast]);
    } else if (ast instanceof MalVector) {
        return new MalList([new MalSymbol("vec"), quasiquote(new MalList(ast.val), true)])
    } else {
        return ast;
    }

}

export function EVAL(ast, env) {
    let isError = false
    while (!isError) {
        const debug = env.get("DEBUG-EVAL");
        if (debug) {
            console.log(`EVAL: ${pr_str(ast, true)}`);
        }
        if (ast instanceof MalSymbol) {
            const found = env.get(ast.val);
            if (found) {
                return found;
            } else {
                throw new KeyNotFoundError(`${ast.val} not found.`);
            }
        } else if (isList(ast) && ast.val.length > 0) {
            const first = ast.val[0];
            if (isSymbol(first, "def!")) {
                try {
                    const evaled = EVAL(ast.val[2], env);
                    const res = env.set(ast.val[1].val, evaled);
                    return res;
                } catch (e) {
                    isError = true;
                    throw e;
                }
            } else if (
                isSymbol(first, "let*") &&
                (isList(ast.val[1]) ||
                    ast.val[1] instanceof MalVector)
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
            } else if (isSymbol(first, "quote")) {
                return ast.val[1];
            } else if (isSymbol(first, "quasiquote")) {
                ast = quasiquote(ast.val[1]);
                continue;
            } else {
                // apply
                const evaledList = ast.val.map((item) =>
                    EVAL(item, env)
                );
                const f = evaledList[0];
                const args = evaledList.slice(1);
                if (f.hasOwnProperty("ast")) {
                    // is a fn*
                    ast = f.ast;
                    env = new Env(f.env, f.params, new MalList(args));
                    continue;
                } else {
                    return f.val(...args);
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
}

function PRINT(line) {
    return pr_str(line, true);
}

function rep(line) {
    try {
        const read = READ(line);
        // console.log(read)
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
    repl_env.set(
        "*ARGV*",
        new MalList(args.slice(1).map((s) => new MalString(s)))
    );
    rep(`(load-file "${args[0]}")`);
    process.exit();
}

process.stdin.setEncoding("utf-8");

fs.rmSync("./log.txt", { force: true });
rl.on("line", onLine);
rl.on("close", onClose);
rl.setPrompt("user> ");
rl.prompt();
