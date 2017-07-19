import * as Path from 'path';
import * as fs from 'fs';
const MarkdownIt = require('markdown-it');
var markdownItAST = require('markdown-it-ast');
const markdownIt = new MarkdownIt();

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));
const fileContents = file.toString();

const markdownTokens = markdownIt.parse(fileContents);
const tokenOutputString = JSON.stringify(markdownTokens,null, '  ');
console.log(tokenOutputString);
fs.writeFileSync(Path.resolve(__dirname, 'token-output.json'), tokenOutputString);

const markdownAst = markdownItAST.makeAST(markdownTokens);

const astOutputString = JSON.stringify(markdownAst,null, '  ');
console.log(astOutputString);
fs.writeFileSync(Path.resolve(__dirname, 'ast-output.json'), astOutputString);