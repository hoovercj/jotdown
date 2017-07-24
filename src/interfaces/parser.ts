import { TextDocument, AstNode, AstSymbolInfo } from './jotdown';

export interface Parser {
    registerPlugin(plugin: string | ParserPlugin): void;
    removePlugin(plugin: string | ParserPlugin): void;
    parse(textDocument: TextDocument, initialContext?: Context): MarkdownFile;
}

export interface ParserPlugin {
    visit(node: AstNode, nodeSymbols: AstSymbolInfo[], context: Context);
    afterVisit?(node: AstNode, nodeSymbols: AstSymbolInfo[], context: Context);
}

export interface Context {
    absoluteFilePath?: string;
    [key: string]: any;
}

export interface MarkdownFile extends TextDocument {
    ast: AstNode; // root ast node
    symbols: AstSymbolInfo[]; // list of symbols
}