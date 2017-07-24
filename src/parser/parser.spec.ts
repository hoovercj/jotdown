import { MarkdownAstParser } from './parser';
import { Parser, ParserPlugin, MarkdownFile, Context } from '../interfaces/parser';
import { AstSymbolInfo, AstNode } from '../interfaces/jotdown';

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
            parser.parse({ text: '# Test1' });
        });

        it('should build a MarkdownFile', () => {
            const plugin = class implements ParserPlugin {
                visit(node: AstNode, nodeSymbols: AstSymbolInfo[], context: Context) {
                    nodeSymbols.push({} as AstSymbolInfo);
                }
            };
            parser.registerPlugin(new plugin());
            const file = parser.parse({text: '# Hi', absoluteFilePath: 'path' })
            expect(file.absoluteFilePath).toEqual('path');
            expect(file.text).toBe('# Hi');
            expect(file.ast).toBeTruthy();
            expect(file.symbols.length).toBeGreaterThan(0);
        });
    });
});