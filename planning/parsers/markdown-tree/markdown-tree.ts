import * as Path from 'path';
import * as fs from 'fs';
const markdownTree = require('markdown-tree');

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));
const fileContents = file.toString().replace(/\r/gm,'');

const output = markdownTree(fileContents);

const outputString = JSON.stringify(output,null, '  ');
console.log(outputString);
fs.writeFileSync(Path.resolve(__dirname, 'output.json'), outputString);