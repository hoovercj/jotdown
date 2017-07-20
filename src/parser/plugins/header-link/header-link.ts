import * as path from 'path';
var URL = require('url');

import { AstNode, LinkNode, StrNode } from '../../../interfaces/ast-node';
import { SymbolInfo, SymbolData } from '../../../interfaces/symbol';
import { ParserPlugin, Context } from '../../../interfaces/parser';

export interface HeaderLinkSymbol extends SymbolInfo {
    data: HeaderLinkData;
}

export interface HeaderLinkData extends SymbolData {
    value: string;
    url: string;
    absoluteSymbolPath: string;
} 

export class HeaderLinkPlugin implements ParserPlugin {

    visit(node: AstNode, nodeSymbols: SymbolInfo[], context: Context) {
        if (!HeaderLinkPlugin.isLinkNode(node)) {
            return;
        }
        const child = node.children && node.children[0];
        if (HeaderLinkPlugin.isStrNode(child)) {
            if (HeaderLinkPlugin.isWeb(node.url)) {
                // Only accept path urls
                return;
            }
            const urlParts = node.url.split('#');
            let baseUrl = '';
            if (urlParts[0]) { // path is relative
                const dirname = path.dirname(context.absolutePath || '');
                baseUrl = path.resolve(dirname, urlParts[0]);
            } else { // no path, use this absolute path
                baseUrl = context.absolutePath;
            }
            const hash = urlParts[1];
            const absoluteSymbolPath = `${baseUrl}${hash && `#${hash}`}`;

            const data: HeaderLinkData = {
                url: node.url,
                value: child && child.value,
                absoluteSymbolPath,
            }
            nodeSymbols.push({
                kind: 'header-link',
                name: child.value,
                location: {
                    uri: context.absolutePath,
                    range: node.loc,
                },
                data,
            });
        }
    }

    static isLinkNode(node: AstNode): node is LinkNode {
        return node && node.type === 'Link';
    }

    static isStrNode(node: AstNode): node is StrNode {
        return node && node.type === 'Str';
    }

    static isWeb = (url: string): boolean => {
        try {
            new URL(url);
        } catch(error) {
            return false;
        }
        return true;
    }

}