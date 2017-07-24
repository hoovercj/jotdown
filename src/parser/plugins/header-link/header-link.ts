import * as path from 'path';
var URL = require('url');

import { AstSymbolInfo, SymbolData, AstNode, LinkNode, StrNode } from '../../../interfaces/jotdown';
import { ParserPlugin, Context } from '../../../interfaces/parser';

export interface HeaderLinkSymbol extends AstSymbolInfo {
    data: HeaderLinkData;
}

export interface HeaderLinkData extends SymbolData {
    value: string;
    url: string;
    absoluteSymbolPath: string;
} 

export class HeaderLinkPlugin implements ParserPlugin {

    visit(node: AstNode, nodeSymbols: AstSymbolInfo[], context: Context) {
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
                const dirname = path.dirname(context.absoluteFilePath || '');
                baseUrl = path.resolve(dirname, urlParts[0]);
            } else { // no path, use this absolute path
                baseUrl = context.absoluteFilePath;
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
                    uri: context.absoluteFilePath,
                    range: node.location,
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