import { Parser } from './parser';
import { MarkdownFile } from '../interfaces/markdown-file';
import * as Path from 'path';

describe('Parser', () => {
    describe('#parse', () => {
        it('should preserve the original text', () => {
            const file = Parser.parse('# Test1');
            expect(file.text).toBe('# Test1')
        });

        it('should extract H1s', () => {
            const file = Parser.parse('# Test1\n# Test2'); 
            const declarationNames = file.declarations.map(declaration => declaration.name);
            expect(declarationNames).toEqual(['Test1', 'Test2']);
        });

        it('should ignore H2s', () => {
            const file = Parser.parse('# Test1\n##Test2\n# Test3');
            const declarationNames = file.declarations.map(declaration => declaration.name);
            expect(declarationNames).toEqual(['Test1', 'Test3']);
        });

        it('should extract tags', () => {
            const file = Parser.parse('# Test1\n## Info\n- tags: this, that, other');
            const test1 = file.declarations[0];
            expect(test1.tags).toEqual(['this', 'that', 'other']);
        });
        it('should extract aliases', () => {
            const file = Parser.parse('# Test1\n## Info\n- aliases: this, that, other');
            const test1 = file.declarations[0];
            expect(test1.aliases).toEqual(['this', 'that', 'other']);
        });
        it('should extract links', () => {
            const absolutePath = Path.join('C:', 'test.md');
            const file = Parser.parse('[text](#url)', {
                absolutePath
            });

            const usages = file.usages;
            expect(usages.length).toEqual(1);

            const usage = usages[0];
            expect(usage.url).toEqual('#url');
            expect(usage.name).toEqual('text');
            expect(usage.absoluteSymbolPath).toEqual(`${absolutePath}#url`)
        });
        it('should parse relative path links', () => {
            const sourcePath = Path.join('C:', 'folder', 'usage.md');
            const file = Parser.parse('[text](../declaration.md#url)', {
                absolutePath: sourcePath
            });
            const symbolPath = Path.join('C:', 'declaration.md');
            const usages = file.usages;
            const usage = usages[0];
            expect(usage.url).toEqual('../declaration.md#url');
            expect(usage.absoluteSymbolPath).toEqual(`${symbolPath}#url`)
        });
    });
});