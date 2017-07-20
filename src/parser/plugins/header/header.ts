import { AstNode, HeaderNode } from '../../../interfaces/ast-node';
import { SymbolInfo, SymbolData } from '../../../interfaces/symbol';
import { ParserPlugin, Context } from '../../../interfaces/parser';
import { titleToAnchor } from '../../../utils/url-utils/url-utils'

export interface HeaderContext extends Context {
    headerStack: HeaderSymbol[];
}

export interface HeaderSymbol extends SymbolInfo {
    data: HeaderData;
}

export interface HeaderData extends SymbolData {
    depth: number;
    absoluteSymbolPath: string;
} 

export class HeaderPlugin implements ParserPlugin {


    visit(node: AstNode, nodeSymbols: SymbolInfo[], context: HeaderContext) {
        if (!HeaderPlugin.isHeaderNode(node)) {
            return;
        }

        if (!context.headerStack) {
            context.headerStack = [];
        }

        const headers = context.headerStack;

        // Pop all headers off the stack that aren't parents to this
        // TODO: extract to function and check that data exists
        while (headers.length > 0 && headers[headers.length - 1].data.depth >= node.depth) {
            headers.pop();
        }

        const parent = headers[headers.length - 1];
        const name = node.raw.substr(1).trim();
        const absoluteSymbolPath = `${context.absoluteFilePath}#${titleToAnchor(name)}`

        const symbolData: HeaderData = {
            depth: node.depth,
            absoluteSymbolPath: absoluteSymbolPath,
        };

        const symbol: HeaderSymbol = {
            kind: 'header',
            name: name,
            parent: parent,
            location: {
                uri: context.absoluteFilePath,
                range: node.loc
            },
            data: symbolData
        }
        // add self to the header stack
        headers.push(symbol);
        // add self to the symbols
        nodeSymbols.push(symbol);
    }

    static isHeaderNode(node: AstNode): node is HeaderNode {
        return node && node.type === 'Header';
    }
}