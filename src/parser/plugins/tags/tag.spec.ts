import { MarkdownAstParser } from '../../parser';
import { Parser, ParserPlugin, MarkdownFile, Context } from '../../../interfaces/parser';
import { AstSymbolInfo } from '../../../interfaces/jotdown';
import { TagPlugin, TagSymbol, Config } from './tags';

import * as Path from 'path';

describe('HeaderPlugin', () => {
    describe('#visit', () => {

        let parser: Parser;
        let tagPlugin: TagPlugin;

        beforeEach(() => {
            // Arrange
            tagPlugin = new TagPlugin();
            parser = new MarkdownAstParser([tagPlugin]);
        });

        it('should extract tags', () => {
            // Act
            const file = parser.parse({text: '# Test1\n- tags: this, that, other'});

            // Assert
            const tags = file.symbols.map(tag => tag.name);
            expect(tags).toEqual(['this', 'that', 'other']);
        });

        it('should assign the nearest header as parent', () => {
            // Arrange
            // TagPlugin assigns the parent based on the top
            // value of the headerStack.
            const parent = { name: 'parent' } as AstSymbolInfo;
            const context = { headerStack: [parent] };

            // Act
            const file = parser.parse({ text: '# Test1\n- tags: this, that, other'}, context);

            // Assert
            expect(file.symbols[0].parent).toBe(parent);
        });

        it('should extract aliases', () => {
            // Arrange
            parser.removePlugin(tagPlugin);
            const aliasesPlugin = new TagPlugin({ labels: ['aliases'] });
            parser.registerPlugin(aliasesPlugin);

            // Assert
            const file = parser.parse({ text: '# Test1\n## Info\n- aliases: this, that, other'});
            const symbolLabels = file.symbols.map((symbol: TagSymbol) => symbol.data.label);
            expect(symbolLabels).toEqual(['aliases', 'aliases', 'aliases']);
        });
    });
});