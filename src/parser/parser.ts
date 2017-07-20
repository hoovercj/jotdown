import { AstNode } from '../interfaces/ast-node';
import { SymbolInfo } from '../interfaces/symbol';
import { Parser, ParserPlugin, Context, MarkdownFile } from '../interfaces/parser';
const MarkdownToAst: { parse(text: string): AstNode } = require('markdown-to-ast');


// Limitations:
// * Aliases cannot contain commas

export class MarkdownAstParser implements Parser {

    private pluginMap: {[pluginName: string]: ParserPlugin} = {};

    private plugins: ParserPlugin[] = [];

    constructor(plugins?: (string | ParserPlugin)[]) {
        if (!plugins) {
            return;
        }

        plugins.forEach(this.registerPlugin);
    }

    registerPlugin = (plugin: string | ParserPlugin): void => {
        if (typeof plugin === 'string') {
            this.pluginMap[plugin] = require('plugin');
            this.plugins.push(this.pluginMap[plugin]);
        } else {
            this.plugins.push(plugin);
        }
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

    parse = (text: string, context?: Context): MarkdownFile => {
        context = context || {};

        if (!text) {
            return;
        }

        const ast = MarkdownToAst.parse(text);
        if (!ast) {
            return;
        }

        const fileSymbols: SymbolInfo[] = [];

        const walk = (node: AstNode) => {
            const nodeSymbols = [];

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
            absolutePath: context.absoluteFilePath,
            symbols: fileSymbols,
            ast,
            text,
        }
    }
}