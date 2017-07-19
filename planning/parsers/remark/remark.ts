import * as Path from 'path';
import * as fs from 'fs';
const remark = require('remark')();

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));
const fileContents = file.toString();

const output = remark.parse(fileContents);

const outputString = JSON.stringify(output,null, '  ');
console.log(outputString);
fs.writeFileSync(Path.resolve(__dirname, 'output.json'), outputString);