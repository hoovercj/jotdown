import { MarkdownAstParser } from './parser';
import { Parser, ParserPlugin, MarkdownFile, Context } from '../interfaces/parser';
import { AstNode } from '../interfaces/ast-node';
import { SymbolInfo } from '../interfaces/symbol';

import * as Path from 'path';

describe('MarkdownAstParser', () => {
    describe('#parse', () => {
        
        let parser: Parser;
        
        beforeEach(() => {
            // Arrange
            parser = new MarkdownAstParser();
        });

        it('should call visit', (done) => {
            // Arrange
            const plugin = class implements ParserPlugin {
                visit() {
                    // Assert
                    done();
                }
            };
            parser.registerPlugin(new plugin());
            
            // Act
            parser.parse('# Test1');
        });

        it('should build a MarkdownFile', () => {
            const plugin = class implements ParserPlugin {
                visit(node: AstNode, nodeSymbols: SymbolInfo[], context: Context) {
                    nodeSymbols.push({} as SymbolInfo);
                }
            };
            parser.registerPlugin(new plugin());
            const file = parser.parse('# Hi', { absoluteFilePath: 'path' })
            expect(file.absolutePath).toEqual('path');
            expect(file.text).toBe('# Hi');
            expect(file.ast).toBeTruthy();
            expect(file.symbols.length).toBeGreaterThan(0);
        });
    });
});