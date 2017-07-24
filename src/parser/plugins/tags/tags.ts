import * as path from 'path';
var URL = require('url');

import { AstSymbolInfo, SymbolData, AstNode, ListNode, ListItemNode, ParagraphNode, Position, StrNode } from '../../../interfaces/jotdown';
import { ParserPlugin, Context } from '../../../interfaces/parser';

export interface TagContext extends Context {
    inList: boolean;
    headerStack: AstSymbolInfo[];
}

export interface TagData extends SymbolData {
    label: string;
} 

export interface TagSymbol extends AstSymbolInfo {
    data: TagData;
}

export interface Config {
    labels: string[];
}

export class TagPlugin implements ParserPlugin {

    static DEFAULT_CONFIG = {
        labels: ['tags']
    }

    private config: Config;

    constructor(config?: Config) {
        this.config = config || TagPlugin.DEFAULT_CONFIG;
    }

    visit = (node: AstNode, nodeSymbols: AstSymbolInfo[], context: TagContext) => {
        if (TagPlugin.isListNode(node)) {
            context.inList = true;
            return;
        }

        if (context.inList && TagPlugin.isStrNode(node)) {
            // check tags
            let tags: string[];
            let label: string;
            // iterate over labels to see if any match
            for(let i = 0; i < this.config.labels.length; i++) {
                label = this.config.labels[i];
                tags = this.parseTags(node.value, label);
                if (!tags) {
                    continue;
                }

                const parent = context &&
                               context.headerStack &&
                               context.headerStack[context.headerStack.length -1];
                const symbols = tags.map((tag): TagSymbol => {
                    return {
                        name: tag,
                        kind: 'tag',
                        location: {
                            uri: context.absoluteFilePath,
                            range: node.location, // narrow this down?
                        },
                        data: {
                            label
                        },
                        parent
                    }
                });

                // If there are symbols, return
                // There should only be one type of
                // tag per line
                if (symbols) {
                    nodeSymbols.push(...symbols);
                    return;
                }
            }
        }
    }

    parseTags = (nodeValue: string, labelToMatch: string): string[] => {
        const regex = new RegExp(`${labelToMatch}:\\s+(.+)`, 'i');
        const matches = regex.exec(nodeValue);
        // extract the first capture group, i.e. everything after tags
        const rawMatch = matches && matches[1];
        
        let tags: string[];
        if (rawMatch && rawMatch.length > 1) {
            tags = rawMatch && rawMatch.trim().split(',').map(match => match.trim());
        }

        return tags;
    }

    afterVisit = (node: AstNode, nodeSymbols: AstSymbolInfo[], context: TagContext) => {
        context.inList = false;
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