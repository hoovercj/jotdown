import { TextDocument, AstNode, AstSymbolInfo, Position, Range } from '../interfaces/jotdown';
import { Parser, ParserPlugin, Context, MarkdownFile } from '../interfaces/parser';
const MarkdownToAst: { parse(text: string): AstNode } = require('markdown-to-ast');

export interface RawNode extends AstNode {
    loc: RawLocation;
}
export interface RawLocation {
    start: RawPosition;
    end: RawPosition;
}
export interface RawPosition {
    line: number; // start with 1
    column: number;// start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
}

export class MarkdownAstParser implements Parser {

    private pluginMap: {[pluginName: string]: ParserPlugin} = {};
    private plugins: ParserPlugin[] = [];

    constructor(plugins?: (string | ParserPlugin)[]) {
        if (plugins && plugins.length) {
            plugins.forEach(this.registerPlugin);
        }
    }

    registerPlugin = (plugin: string | ParserPlugin): void => {
        if (typeof plugin !== 'string') {
            this.plugins.push(plugin);
            return;
        }

        // only register a plugin once
        if (this.pluginMap[plugin]) {
            return;
        }

        this.pluginMap[plugin] = require(plugin);
        this.plugins.push(this.pluginMap[plugin]);
    }

    removePlugin = (plugin: string | ParserPlugin): void => {
        let pluginToRemove;
        if (typeof plugin === 'string') {
            pluginToRemove = this.pluginMap[plugin];
        } else {
            pluginToRemove = plugin as ParserPlugin;
        }

        const indexToRemove = this.plugins.indexOf(pluginToRemove);
        if (indexToRemove >= 0) {
            this.plugins.splice(indexToRemove, 1);
        }
    }

    parse = (textDocument: TextDocument, initialContext: Context): MarkdownFile => {

        if (!textDocument || !textDocument.text) {
            return;
        }

        const ast = MarkdownToAst.parse(textDocument.text);
        if (!ast) {
            return;
        }

        const fileSymbols: AstSymbolInfo[] = [];

        // Set up context object
        const context = {
            absoluteFilePath: textDocument.absoluteFilePath
        };
        Object.keys(initialContext || {}).forEach(key => context[key] = initialContext[key]);

        const walk = (node: AstNode) => {
            const nodeSymbols = [];

            this.normalizeNode(node as RawNode)

            // Visit this node with each plugin
            if (this.plugins && this.plugins.length > 0) {
                this.plugins.forEach(plugin => {
                    plugin.visit(node, nodeSymbols, context);
                });
            }

            // If any symbols were generated, push them
            if (nodeSymbols && nodeSymbols.length > 0) {
                fileSymbols.push(...nodeSymbols);
            }

            // If the node has children, walk them too
            if (node.children && node.children.length > 0) {
                node.children.forEach(walk);
            }

            // Notify all plugins that the visit has ended
            if (this.plugins && this.plugins.length > 0) {
                this.plugins.forEach(plugin => {
                    plugin.afterVisit && plugin.afterVisit(node, nodeSymbols, context);
                });
            }
        }

        walk(ast);

        return {
            text: textDocument.text,
            absoluteFilePath: textDocument.absoluteFilePath,
            symbols: fileSymbols,
            ast,
        }
    }

    private normalizeNode(node: RawNode): void {
        node.location = {
            start: {
                line: node.loc.start.line - 1,
                character: node.loc.start.column
            },
            end: {
                line: node.loc.end.line - 1,
                character: node.loc.end.column
            }
        }
    }
}