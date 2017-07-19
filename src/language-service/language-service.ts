import {
    Workspace,
    MarkdownFile,
    DeclarationInfo,
    UsageInfo,
    SymbolInfo,
} from '../interfaces/markdown-file';

import { Parser } from '../parser/parser';

export class LanguageService {
    private workspace: Workspace = {
        files: {}
    }

    updateFile = (absolutePath: string, content: string) => {
        this.workspace.files[absolutePath] = Parser.parse(content, { absolutePath });
    }

    getFileSymbols = (absolutePath: string): SymbolInfo[] => {
        const declarations = this.getFileDeclarations(absolutePath);
        const usages = this.getFileUsages(absolutePath);
        return [...declarations, ...usages];
    }

    getFileDeclarations = (absolutePath: string): DeclarationInfo[] => {
        const file = this.workspace.files[absolutePath];
        if (file) {
            return file.declarations;
        }
        return [];
    }

    getFileUsages = (absoluteFilePath: string): UsageInfo[] => {
        const file = this.workspace.files[absoluteFilePath];
        if (file) {
            return file.usages;
        }
        return [];
    }

    getWorkspaceDeclarations = (): DeclarationInfo[] => {
        const declarations: DeclarationInfo[] = [];

        let file: MarkdownFile;
        let fileDeclarations: DeclarationInfo;
        Object.keys(this.workspace.files).forEach(path => {
            declarations.push(...this.getFileDeclarations(path));
        });

        return declarations;
    }

    /**
     * Gets usages across the workspace for a symbol.
     * @param absoluteSymbolPath The absolute path to a symbol, e.g. "C:/path/to/file.md#symbol-name"
     * 
     * @memberof LanguageService
     */
    getWorkspaceSymbolReferences = (absoluteSymbolPath: string, includeDeclaration = true): SymbolInfo[] => {
        const usages: SymbolInfo[] = [];

        let fileUsages: UsageInfo[];
        Object.keys(this.workspace.files).forEach(path => {
            fileUsages = this.getFileUsages(path);
            if (fileUsages && fileUsages.length > 0) {
                usages.push(...fileUsages.filter(usage => {
                    return usage.absoluteSymbolPath === absoluteSymbolPath;
                }));
            }
        });

        if (includeDeclaration) {
            const declaration = this.getWorkspaceDeclarations().find(declaration => {
                return declaration.absoluteSymbolPath === absoluteSymbolPath;
            });
            if (declaration) {
                usages.push(declaration);
            }
        }

        return usages;
    }
}