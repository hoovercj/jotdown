import { MarkdownAstParser } from '../../parser';
import { Parser, ParserPlugin, MarkdownFile, Context } from '../../../interfaces/parser';
import { AstSymbolInfo } from '../../../interfaces/jotdown';
import { HeaderPlugin, HeaderSymbol } from './header';

import * as Path from 'path';

describe('HeaderPlugin', () => {
    describe('#visit', () => {

        let parser: Parser;
        let plugin: ParserPlugin;

        beforeEach(() => {
            // Arrange
            plugin = new HeaderPlugin();
            parser = new MarkdownAstParser([plugin]);
        });

        it('should collect a header', () => {
            // Act
            const file = parser.parse({ text: '# Test1'});

            // Assert
            expect(file.symbols[0].name).toBe('Test1');
        });

        it('should set the kind to "header"', () => {
            // Act
            const file = parser.parse({ text: '# Test1'});

            // Assert
            expect(file.symbols[0].kind).toBe('header');
        });

        it('should collect multiple headers', () => {
            // Act
            const file = parser.parse({ text: '# Test1\n# Test2'});

            // Assert
            const symbolNames = file.symbols.map(symbol => symbol.name);
            expect(symbolNames).toEqual(['Test1', 'Test2']);
        })

        it('should set the depth for H2 headers', () => {
        // it('should add a parent to H3 headers', () => {
            // Act
            const file = parser.parse({ text: '# Test1\n## Test2', absoluteFilePath: 'path'});

            // Assert
            const symbol: HeaderSymbol = file.symbols[1] as HeaderSymbol;
            expect(symbol.data.depth).toBe(2);
        });

        it('should add a parent to H2 headers', () => {
            // Act
            const file = parser.parse({ text: '# Test1\n## Test2'});

            // Assert
            const h1 = file.symbols[0];
            const h2 = file.symbols[1];
            expect(h2.parent).toBe(h1);
        });
    });
});