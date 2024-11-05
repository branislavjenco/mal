import { unescape_string } from "./reader.mjs";


const inputs =   ["foo", "", '\\"', '\\\\', '\\n'];
const expected = ["foo", "", '"', '\\', '\n'];
for (let i = 0; i < inputs.length; i++) {
    const output = unescape_string(inputs[i]);
    console.assert(output === expected[i], `${output} not the same as ${expected[i]}`);
}