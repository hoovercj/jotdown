import * as Path from 'path';
import * as fs from 'fs';
var drafter = require('drafter');

const file = fs.readFileSync(Path.resolve(__dirname, 'spec.md'));

const prefix = "# Data Structures\n"

const fileContents = file.toString().replace(/\r/gm,'');

drafter.parse(`${prefix}${fileContents}`, { /*type: "ast" */ generateSourceMap: true }, (error, results) => {
    if (error) {
        const errorString = JSON.stringify(error,null, '  ');
        console.error(errorString);
        fs.writeFileSync(Path.resolve(__dirname, 'error.json'), errorString);
    } 
    
    if (results) {
        const outputString = JSON.stringify(results,null, '  ');
        console.error(outputString);
        fs.writeFileSync(Path.resolve(__dirname, 'output.json'), outputString);
    }
});