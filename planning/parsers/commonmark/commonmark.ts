import * as Path from 'path';
import * as fs from 'fs';
const Commonmark = require('commonmark');
const parseXml = require('xml2js').parseString;
const commonmark = new Commonmark.Parser();
const writer = new Commonmark.XmlRenderer({sourcepos: true});

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));
const fileContents = file.toString();

const ast = commonmark.parse(fileContents);
const xml = writer.render(ast);

fs.writeFileSync(Path.resolve(__dirname, 'xml-output.xml'), xml);

const json = parseXml(xml, function (err, result) {
    const astOutputString = JSON.stringify(result,null, '  ');
    console.log(astOutputString);
    fs.writeFileSync(Path.resolve(__dirname, 'converted-output.json'), astOutputString);
});