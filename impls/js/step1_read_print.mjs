import readline from 'readline';
import { read_str } from './reader.mjs';
import { pr_str } from './printer.mjs';
import fs from 'fs';

function READ(line) {
    return read_str(line);
}

function EVAL(line) {
    return line;
}

function PRINT(line) {
    return pr_str(line);
}

function rep(line) {
    return PRINT(EVAL(READ(line)));
}

var rl = readline.createInterface({input: process.stdin, output: process.stdout});
function onLine(line) {
    console.log(rep(line));
    rl.prompt();
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
