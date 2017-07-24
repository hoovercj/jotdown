import { LanguageServiceHost } from '../../language-service';
import { LanguageService } from '../../../interfaces/language-service';
import { HeaderPlugin } from './header';
import * as fs from 'fs';
import * as path from 'path';

const testDataDir = path.resolve(__dirname, '..', 'test-data');
const filePath1 = path.join(testDataDir, 'file1.md');
const filePath2 = path.join(testDataDir, 'file2.md');
const filePath3 = path.join(testDataDir, 'folder', 'file3.md');

// Declaration 1, tags, aliases, reference to declaration 2
// Declaration 2, reference to declaration 1
const file1 = fs.readFileSync(filePath1).toString();
// Reference to declaration 1 and 3
const file2 = fs.readFileSync(filePath2).toString();
// Reference to declaration 1
const file3 = fs.readFileSync(filePath3).toString();

describe('HeaderPlugin', () => {

    let ls: LanguageService;
    beforeEach(() => {
        let header = new HeaderPlugin();
        ls = new LanguageServiceHost([header]).init();
    });

    describe('#provideWorkspaceSymbols', () => {

        it('should return all header symbols in a workspace', () => {
            // Arrange
            ls.onDidChangeTextDocument({ absoluteFilePath: filePath1, text: file1 });
            ls.onDidChangeTextDocument({ absoluteFilePath: filePath2, text: file2 });

            // intentionally use filepath3 with file1 contents
            ls.onDidChangeTextDocument({ absoluteFilePath: filePath3, text: file1 });

            // Act
            const symbols = ls.provideWorkspaceSymbols();

            // Assert
            expect(symbols.length).toEqual(6);
        });
    });

    describe('#updateFile', () => {

        it('should reparse the file for symbols', () => {
            // Arrange
            ls.onDidChangeTextDocument({ absoluteFilePath: filePath1, text: file1 });
            const symbolsBefore = ls.provideWorkspaceSymbols();

            // Act
            // intentionally using contents of file2 with filePath1
            ls.onDidChangeTextDocument({ absoluteFilePath: filePath1, text: file2 });
            const symbolsAfter = ls.provideWorkspaceSymbols();

            // Assert
            expect(symbolsBefore).not.toEqual(symbolsAfter);
        })

    });

    describe('#provideDocumentSymbols', () => {

        it ('should return all headers and header links in a file', () => {
            // Arrange
            const document = { absoluteFilePath: filePath1, text: file1 };
            ls.onDidChangeTextDocument(document);

            // Act
            const symbols = ls.provideDocumentSymbols(document);

            // Assert
            expect(symbols.length).toEqual(5);
        });

        it ('should return only symbols in the specified file', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            // intentionally use filepath2 with file1 contents
            const document2 = { absoluteFilePath: filePath2, text: file1 }
            ls.onDidChangeTextDocument(document1);
            ls.onDidChangeTextDocument(document2);

            // Act
            const symbols = ls.provideDocumentSymbols(document1);

            // Assert
            expect(symbols.length).toEqual(5);
        });
    });

    describe('#provideReferences', () => {

        it ('should return all references to a symbol', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            const document2 = { absoluteFilePath: filePath2, text: file2 };
            ls.onDidChangeTextDocument(document1);
            ls.onDidChangeTextDocument(document2);

            // Act
            const symbols = ls.provideReferences(document1, { line: 0, character: 0 }, { includeDeclaration: true });

            // Assert
            expect(symbols.length).toEqual(3);
        });

        it ('should not return the declaration if false is passed in', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            const document2 = { absoluteFilePath: filePath2, text: file2 };
            ls.onDidChangeTextDocument(document1);
            ls.onDidChangeTextDocument(document2);

            // Act
            const symbols = ls.provideReferences(document1, { line: 0, character: 0 }, { includeDeclaration: false });

            // Assert
            expect(symbols.length).toEqual(2);
        });
    });

    describe('#provideCompletion', () => {
        it('should return no headers with no query', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            ls.onDidChangeTextDocument(document1);

            // Act
            const completions = ls.provideCompletionItems(document1);

            // Assert
            expect(completions.length).toEqual(0);
        });

        it('should return all headers with no query', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            ls.onDidChangeTextDocument(document1);

            // Act
            const completions = ls.provideCompletionItems(document1, '#');

            // Assert
            expect(completions.length).toEqual(3);
        });

        it('should return headers filtered by query', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            ls.onDidChangeTextDocument(document1);

            // Act
            const completions = ls.provideCompletionItems(document1, '#declaration 2');

            // Assert
            expect(completions.length).toEqual(1);
        });

        it('should return a markdown link insertText', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            ls.onDidChangeTextDocument(document1);

            // Act
            const completions = ls.provideCompletionItems(document1, '#declaration 2');

            // Assert
            expect(completions[0].insertText).toEqual('[Declaration 2](#declaration-2)');
        });

        it('should use relative links for cross-file links to a symbol in a parent folder', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            const document2 = { absoluteFilePath: filePath3, text: file3 };
            ls.onDidChangeTextDocument(document1);
            ls.onDidChangeTextDocument(document2);

            // Act
            const completions = ls.provideCompletionItems(document2, '#declaration 1');

            // Assert
            const linkPath = path.join('..', 'file1.md');
            expect(completions[0].insertText).toEqual(`[Declaration 1](${linkPath}#declaration-1)`);
        });

        it('should use relative links for cross-file links to a symbol in a sub folder', () => {
            // Arrange
            const document1 = { absoluteFilePath: filePath1, text: file1 };
            const document2 = { absoluteFilePath: filePath3, text: file3 };
            ls.onDidChangeTextDocument(document1);
            ls.onDidChangeTextDocument(document2);

            // Act
            const completions = ls.provideCompletionItems(document1, '#declaration 3');

            // Assert
            const linkPath = path.join('folder', 'file3.md');
            expect(completions[0].insertText).toEqual(`[Declaration 3](${linkPath}#declaration-3)`);
        });
    });
});

describe('Path', () => {
    describe('#relative', () => {
        it('should be understood', () => {
            let path1 = 'C:/file1.md';
            let path2 = 'C:/folder/file2.md';
            let path3 = 'C:/file3.md';

            // Full path -- it adds a .. for the filename
            expect(path.relative(path2, path1)).toBe('..\\..\\file1.md');
            expect(path.relative(path1, path2)).toBe('..\\folder\\file2.md');
            expect(path.relative(path1, path3)).toBe('..\\file3.md');
            
            // Dirname only
            expect(path.relative(path.dirname(path2), path.dirname(path1))).toBe('..');
            expect(path.relative(path.dirname(path1), path.dirname(path2))).toBe('folder');
            expect(path.relative(path.dirname(path1), path.dirname(path3))).toBe('');
        });
    });
});