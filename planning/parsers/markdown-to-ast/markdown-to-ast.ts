import * as Path from 'path';
import * as fs from 'fs';
const parse = require('markdown-to-ast').parse;
import { AstNode } from './ast-node';

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));
const fileContents = file.toString();

const output: AstNode = parse(fileContents);

const outputString = JSON.stringify(output,null, '  ');
console.log(outputString);
fs.writeFileSync(Path.resolve(__dirname, 'output.json'), outputString);