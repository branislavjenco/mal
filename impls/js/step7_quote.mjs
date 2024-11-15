import readline from "readline";
import { read_str } from "./reader.mjs";
import { pr_str } from "./printer.mjs";
import { Env, KeyNotFoundError } from "./env.mjs";
import { ns } from "./core.mjs";
import fs from "fs";
import {
    isSymbol,
    isList,
    isHash,
    isVec,
    makeList,
    makeVec,
} from "./types.mjs";

const args = process.argv.slice(2);

const max_iterations = 1000;
let iterations = 0;

const repl_env = new Env(null);
for (const [k, v] of Object.entries(ns)) {
    repl_env.set(k, v);
}

repl_env.set("eval", (ast) => EVAL(ast, repl_env));
repl_env.set("*ARGV*", makeList())

rep("(def! not (fn* (a) (if a false true)))");
rep(
    '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

function READ(line) {
    return read_str(line);
}

function quasiquote(ast, skipUnquote = false) {
    if (isList(ast)) {
        const first = ast[0];
        if (isSymbol(first, "unquote") && !skipUnquote) {
            return ast[1];
        } else {
            let res = makeList();
            for (let i = ast.length - 1; i >= 0; i--) {
                const elt = ast[i];
                if (isList(elt) && isSymbol(elt[0], "splice-unquote")) {
                    res = makeList(Symbol.for("concat"), elt[1], res);
                } else {
                    res = makeList(Symbol.for("cons"), quasiquote(elt), res);
                }
            }
            return res;
        }
    } else if (isHash(ast) || typeof ast === "symbol") {
        return makeList(Symbol.for("quote"), ast);
    } else if (isVec(ast)) {
        return makeList(Symbol.for("vec"), quasiquote(makeList(ast), true));
    } else {
        return ast;
    }
}

export function EVAL(ast, env) {
    while (iterations < max_iterations) {
        iterations = iterations + 1;
        const debug = env.get("DEBUG-EVAL");
        if (debug) {
            console.log(`EVAL: ${pr_str(ast, true)}`);
        }
        if (typeof ast === "symbol") {
            const found = env.get(ast.description);
            if (found !== undefined) {
                return found;
            } else {
                throw new KeyNotFoundError(`${ast.description} not found.`);
            }
        } else if (isList(ast) && ast.length > 0) {
            const first = ast[0];
            if (isSymbol(first, "def!")) {
                try {
                    const evaled = EVAL(ast[2], env);
                    const res = env.set(ast[1].description, evaled);
                    return res;
                } catch (e) {
                    throw e;
                }
            } else if (
                isSymbol(first, "let*") &&
                (isList(ast[1]) || isVec(ast[1]))
            ) {
                const newEnv = new Env(env);
                const list = ast[1];
                for (let i = 0; i < list.length; i = i + 2) {
                    const key = list[i].description;
                    const val = EVAL(list[i + 1], newEnv);
                    newEnv.set(key, val);
                }
                env = newEnv;
                ast = ast[2];
                continue;
            } else if (isSymbol(first, "do")) {
                for (const item of ast.slice(1, -1)) {
                    EVAL(item, env);
                }
                ast = ast[ast.length - 1];
                continue;
            } else if (isSymbol(first, "if")) {
                const condition = EVAL(ast[1], env);
                const ifBranch = ast[2];
                const elseBranch = ast[3];
                if (
                    condition === null ||
                    condition === false
                ) {
                    if (elseBranch === undefined) {
                        return null;
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
                    ast: ast[2],
                    params: ast[1],
                    env: env,
                    fn: (...params) => {
                        const binds = ast[1];
                        const newEnv = new Env(env, binds, [params]);
                        return EVAL(ast[2], newEnv);
                    },
                };
            } else if (isSymbol(first, "quote")) {
                return ast[1];
            } else if (isSymbol(first, "quasiquote")) {
                ast = quasiquote(ast[1]);
                continue;
            } else {
                // apply
                // console.log("before",ast)
                const evaledList = makeList(...ast.map((item) => EVAL(item, env)));
                // console.log("after", evaledList)
                const f = evaledList[0];
                const args = evaledList.slice(1);
                if (f.hasOwnProperty("ast")) {
                    // is a fn*
                    ast = f.ast;
                    env = new Env(f.env, f.params, makeList(args));
                    continue;
                } else {
                    return f(...args);
                }
            }
        } else if (isVec(ast)) {
            // console.log("making vec from", ast)
            return makeVec(...ast.map((item) => EVAL(item, env)));
        } else if (isHash(ast)) {
            return makeHash(...ast.map((item) => EVAL(item, env)));
        } else {
            // console.log("returning", ast)
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
        // console.log(read);
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
    repl_env.set(
        "*ARGV*",
        makeList(args.slice(1))
    );
    rep(`(load-file "${args[0]}")`);
    // console.log("Done", repl_env.get("*ARGV*"));
    process.exit();
}

process.stdin.setEncoding("utf-8");

fs.rmSync("./log.txt", { force: true });
rl.on("line", onLine);
rl.on("close", onClose);
rl.setPrompt("user> ");
rl.prompt();
