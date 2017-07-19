import {
    MarkdownFile,
    DeclarationInfo,
    UsageInfo,
    SymbolKind,
} from '../interfaces/markdown-file';
import {
    AstNode,
    HeaderNode,
    LinkNode,
    ListNode,
    ListItemNode,
    ParagraphNode,
    StrNode,
} from '../interfaces/ast-node';
import { titleToAnchor } from '../utils/url-utils/url-utils'
import * as Path from 'path';
const { URL } = require('url');

const MarkdownToAst: { parse(text: string): AstNode } = require('markdown-to-ast');

export interface Context {
    absolutePath?: string;
}

// Limitations:
// * Aliases cannot contain commas

export class Parser {
    
    static parse(text: string, context?: Context): MarkdownFile {
        if (!context) {
            context = {};
        }

        const ast = MarkdownToAst.parse(text);

        // Symbol maps
        const declarations: DeclarationInfo[] = [];
        const usages: UsageInfo[] = [];

        // Loop variables
        let declaration: DeclarationInfo;
        let declarationName: string;
        let usage: UsageInfo;
        let absoluteSymbolPath: string;
        let value: string;
        let child: AstNode;
        let matches: RegExpMatchArray;
        let rawMatch: string;
        let urlParts: string[];
        let baseUrl: string;
        let hash: string;
        let isWeb: boolean;
        let dirname: string;

        // Loop state
        let inH1 = false;
        let inInfo = false;
        let inList = false;

        // Iterate over children
        // For each H1, create a new entity
        // For each link, create a usage (how to know if usage link or not?)
        const walk = (parent: AstNode) => {
            if (!parent || !parent.children) {
                return;
            }
            let node: AstNode;
            for (let i = 0; i < parent.children.length; i++) {
                node = parent.children[i];
                if (Parser.isHeaderNode(node)) {
                    // Header 1's are automatically declarations
                    inInfo = false;
                    if (node.depth === 1) {
                        // Only needs set once
                        inH1 = true;
                        declarationName = node.raw.substr(1).trim();
                        absoluteSymbolPath = `${context.absolutePath}#${titleToAnchor(declarationName)}`
                        declaration = {
                            type: SymbolKind.declaration,
                            absoluteSymbolPath: absoluteSymbolPath,
                            name: declarationName,
                            location: {
                                uri: context.absolutePath,
                                range: node.loc
                            },
                            tags: [],
                            aliases: [],
                        }
                        declarations.push(declaration);
                    // ## Info is parsed for info
                    } else if (node.raw.indexOf('## Info') === 0) {
                        inInfo = true;
                    }
                } else if (Parser.isLinkNode(node)) {
                    child = node.children && node.children[0];
                    if (Parser.isStrNode(child)) {
                        if (Parser.isWeb(node.url)) {
                            // Only accept path urls
                            continue;
                        } else {
                            urlParts = node.url.split('#');
                            if (urlParts[0]) { // path is relative
                                dirname = Path.dirname(context.absolutePath || '');
                                baseUrl = Path.resolve(dirname, urlParts[0]);
                            } else { // no path, use this absolute path
                                baseUrl = context.absolutePath;
                            }
                            hash = urlParts[1];
                            absoluteSymbolPath = `${baseUrl}${hash && `#${hash}`}`;
                        }

                        usages.push({
                            type: SymbolKind.usage,
                            absoluteSymbolPath,
                            name: child.value,
                            location: {
                                uri: context.absolutePath,
                                range: node.loc,
                            },
                            url: node.url,
                        });
                    }
                } else if (Parser.isListNode(node)) {
                    inList = true;
                    walk(node);
                    inList = false;
                } else if (Parser.isStrNode(node)) {
                    if (inInfo && inList) {
                        // check tags
                        matches = node.value.match(/tags:\s+(.+)/)
                        rawMatch = matches && matches[1];
                        if (rawMatch && rawMatch.length > 1) {
                            declaration.tags = rawMatch && rawMatch.trim().split(',').map(match => match.trim());
                        }

                        // check aliases
                        matches = node.value.match(/aliases:\s+(.+)/)
                        rawMatch = matches && matches[1];
                        if (rawMatch && rawMatch.length > 1) {
                            declaration.aliases = rawMatch && rawMatch.trim().split(',').map(match => match.trim());
                        }
                    }
                } else {
                    walk(node);
                }
            }
        }
        walk(ast);
        return {
            ast,
            declarations,
            usages,
            absolutePath: context.absolutePath,
            text
        };
    }

    static isWeb = (url: string): boolean => {
        try {
            new URL(url);
        } catch(error) {
            return false;
        }
        return true;
    }

    static isHeaderNode(node: AstNode): node is HeaderNode {
        return node && node.type === 'Header';
    }

    static isLinkNode(node: AstNode): node is LinkNode {
        return node && node.type === 'Link';
    }

    static isListNode(node: AstNode): node is ListNode {
        return node && node.type === 'List';
    }

    static isListItemNode(node: AstNode): node is ListItemNode {
        return node && node.type === 'ListItem';
    }

    static isParagraphNode(node: AstNode): node is ParagraphNode {
        return node && node.type === 'Paratraph';
    }

    static isStrNode(node: AstNode): node is StrNode {
        return node && node.type === 'Str';
    }
}