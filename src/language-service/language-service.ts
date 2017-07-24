import { MarkdownFile } from '../interfaces/parser';

import {
    TextDocument,
    AstSymbolInfo,
    Range,
    Position,
    EditorSymbolInfo,
    AstLocation,
} from '../interfaces/jotdown'

import {
    LanguageService,
    LanguageServicePlugin,
    Workspace,
    CompletionItem,
    ReferenceContext,
} from '../interfaces/language-service';

import { MarkdownAstParser } from '../parser/parser';
import { Parser } from '../interfaces/parser';

export class LanguageServiceHost implements LanguageService {
    public workspace: Workspace = {
        files: {}
    }

    private parser: Parser;

    private pluginMap: {[pluginName: string]: LanguageServicePlugin} = {};
    private plugins: LanguageServicePlugin[] = [];

    constructor(plugins?: (string | LanguageServicePlugin)[]) {
        if (plugins) {
            plugins.forEach(this.registerPlugin);
        }
    }

    getWorkspace = (): Workspace => {
        return this.workspace;
    }

    init = (): LanguageService => {
        this.parser = new MarkdownAstParser();

        // Initialize plugins
        let languageService: LanguageService = this;
        this.plugins.forEach(plugin => {

            languageService = plugin.create({
                languageService: languageService,
                parser: this.parser
            });
        })

        return languageService;
    }

    onDidChangeTextDocument = (textDocument: TextDocument) => {
        this.workspace.files[textDocument.absoluteFilePath] = this.parser.parse(textDocument);
    }

    // Stub implementations to be overridden by plugins
    provideCompletionItems = (document: TextDocument, query?: string): CompletionItem[] => { return []; }
    provideDefinition = (document: TextDocument, position: Position): EditorSymbolInfo => { return null } // TODO: check standard type used
    provideReferences = (document: TextDocument, position: Position, context?: ReferenceContext): AstLocation[] => { return []; }// TODO: check standard type used
    provideHover = (document: TextDocument, position: Position): string => { return null; } // TODO: marked string?
    provideDocumentLinks =(document: TextDocument): any => { return null; } // TODO: what is this??
    provideDocumentHighlights = (document: TextDocument, position: Position): Range[] => { return []; }// TODO: what is this?
    provideDocumentSymbols = (document: TextDocument): EditorSymbolInfo[] => { return []; }
    provideWorkspaceSymbols = (query?: string): EditorSymbolInfo[] => { return []; }

    registerPlugin = (plugin: string | LanguageServicePlugin): void => {
        if (typeof plugin !== 'string') {
            this.plugins.push(plugin);
            return;
        }

        // only register a plugin once
        if (this.pluginMap[plugin]) {
            return;
        }

        this.pluginMap[plugin] = require(plugin);
        this.plugins.push(this.pluginMap[plugin]);
    }

    // Requires re-initing
    removePlugin = (plugin: string | LanguageServicePlugin): void => {
        let pluginToRemove;
        if (typeof plugin === 'string') {
            pluginToRemove = this.pluginMap[plugin];
        } else {
            pluginToRemove = plugin as LanguageServicePlugin;
        }

        const indexToRemove = this.plugins.indexOf(pluginToRemove);
        if (indexToRemove >= 0) {
            this.plugins.splice(indexToRemove, 1);
        }
    }
}