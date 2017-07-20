import { AstNode } from './ast-node';
import { SymbolInfo } from './symbol';

export interface Parser {
    registerPlugin(plugin: string | ParserPlugin): void;
    removePlugin(plugin: string | ParserPlugin): void;
    parse(text: string, context?: Context): MarkdownFile;
}

export interface ParserPlugin {
    visit(node: AstNode, nodeSymbols: SymbolInfo[], context: Context);
    afterVisit?(node: AstNode, nodeSymbols: SymbolInfo[], context: Context);
}

export interface Context {
    absoluteFilePath?: string;
    [key: string]: any;
}

export interface MarkdownFile {
    absolutePath: string; // absolute path
    text: string; // full text of the document
    ast: AstNode; // root ast node
    symbols: SymbolInfo[]; // list of symbols
}