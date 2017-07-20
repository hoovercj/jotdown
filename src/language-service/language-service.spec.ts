// import { LanguageService } from './language-service';
// import * as fs from 'fs';
// import * as path from 'path';

// const testDataDir = path.join(__dirname, 'test-data');
// const filePath1 = path.join(testDataDir, 'file1.md');
// const filePath2 = path.join(testDataDir, 'file2.md');
// const filePath3 = path.join(testDataDir, 'folder', 'file3.md');

// // Declaration 1, tags, aliases, reference to declaration 2
// // Declaration 2, reference to declaration 1
// const file1 = fs.readFileSync(filePath1).toString();
// // Reference to declaration 1 and 3
// const file2 = fs.readFileSync(filePath2).toString();
// // Reference to declaration 1
// const file3 = fs.readFileSync(filePath3).toString();

// describe('LanguageService', () => {
//     describe('#getWorkspaceDeclarations', () => {
//         it('should return all declarations in a workspace', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             ls.updateFile(filePath2, file2);
//             // intentionally use filepath3 with file1 contents 
//             ls.updateFile(filePath3, file1);

//             // Act
//             const declarations = ls.getWorkspaceDeclarations();

//             // Assert
//             expect(declarations.length).toEqual(4);
//         });
//     });

//     describe('#updateFile', () => {
//         it('should reparse the file for symbols', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath2, file2);
//             const declarations1 = ls.getWorkspaceDeclarations();

//             // Act
//             ls.updateFile(filePath2, file1);
//             const declarations2 = ls.getWorkspaceDeclarations();

//             // Assert
//             expect(declarations1).not.toEqual(declarations2);
//         })

//     });

//     describe('#getFileSymbols', () => {
//         it ('should return all symbols in a file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);

//             // Act
//             const symbols = ls.getFileSymbols(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(4);
//         });

//         it ('should return only symbols in the specified file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             // intentionally use filepath2 with file1 contents
//             ls.updateFile(filePath2, file2);

//             // Act
//             const symbols = ls.getFileSymbols(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(4);
//         });
//     });

//     describe('#getFileDeclarations', () => {
//         it ('should return declarations in a file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);

//             // Act
//             const symbols = ls.getFileDeclarations(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(2);
//         });

//         it ('should return only declarations from the specified file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             // intentionally use filepath 2 with file1 contents
//             ls.updateFile(filePath2, file1);

//             // Act
//             const symbols = ls.getFileDeclarations(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(2);
//         });
//     });

//     describe('#getFileUsages', () => {
//         it ('should return usages in a file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);

//             // Act
//             const symbols = ls.getFileUsages(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(2);
//         });

//         it ('should return only usages from the specified file', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             // intentionally use filepath 2 with file1 contents
//             ls.updateFile(filePath2, file1);

//             // Act
//             const symbols = ls.getFileUsages(filePath1);

//             // Assert
//             expect(symbols.length).toEqual(2);
//         });
//     });

//     describe('#getWorkspaceSymbolReferences', () => {
//         it ('should return all references to a symbol', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             ls.updateFile(filePath2, file2);
//             const symbolPath = `${filePath1}#declaration-1`;

//             // Act
//             const symbols = ls.getWorkspaceSymbolReferences(symbolPath);

//             // Assert
//             expect(symbols.length).toEqual(3);
//         });

//         it ('should not return the declaration if false is passed in', () => {
//             // Arrange
//             const ls = new LanguageService();
//             ls.updateFile(filePath1, file1);
//             ls.updateFile(filePath2, file2);
//             const symbolPath = `${filePath1}#declaration-1`;

//             // Act
//             const symbols = ls.getWorkspaceSymbolReferences(symbolPath, false);

//             // Assert
//             expect(symbols.length).toEqual(2);
//         });
//     });
// });