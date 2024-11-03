import readline from 'readline';

function READ(line) {
    return line;
}

function EVAL(line) {
    return line;
}

function PRINT(line) {
    return line;
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

rl.setPrompt('user> ');
rl.prompt();
rl.on('line', onLine);
rl.on('close', onClose);