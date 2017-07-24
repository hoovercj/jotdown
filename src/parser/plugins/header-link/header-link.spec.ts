import { MarkdownAstParser } from '../../parser';
import { Parser, ParserPlugin, MarkdownFile, Context } from '../../../interfaces/parser';
import { AstSymbolInfo } from '../../../interfaces/jotdown';
import { HeaderLinkPlugin, HeaderLinkSymbol } from './header-link';

import * as Path from 'path';

describe('HeaderLinkPlugin', () => {
    describe('#visit', () => {

        let parser: Parser;
        let plugin: ParserPlugin;

        beforeEach(() => {
            // Arrange
            plugin = new HeaderLinkPlugin();
            parser = new MarkdownAstParser([plugin]);
        });

        it('should extract links', () => {
            const absolutePath = Path.join('C:', 'test.md');
            const file = parser.parse({
                text: '[text](#url)',
                absoluteFilePath: absolutePath
            });

            const symbols = file.symbols;
            expect(symbols.length).toEqual(1);

            const symbol = symbols[0] as HeaderLinkSymbol;
            expect(symbol.data.url).toEqual('#url');
            expect(symbol.name).toEqual('text');
            expect(symbol.data.value).toEqual('text');
            expect(symbol.data.absoluteSymbolPath).toEqual(`${absolutePath}#url`)
        });

        it('should parse relative path links', () => {
            const sourcePath = Path.join('C:', 'folder', 'usage.md');
            const file = parser.parse({
                text: '[text](../declaration.md#url)',
                absoluteFilePath: sourcePath
            });
            const symbolPath = Path.join('C:', 'declaration.md');
            const symbols = file.symbols;
            const symbol = symbols[0] as HeaderLinkSymbol;
            expect(symbol.data.url).toEqual('../declaration.md#url');
            expect(symbol.data.absoluteSymbolPath).toEqual(`${symbolPath}#url`)
        });
    });
});