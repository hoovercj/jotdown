import { TextDocument, EditorSymbolInfo, EditorSymbolKind, Position, AstLocation } from './jotdown';
import { MarkdownFile, Parser } from './parser';

export interface LanguageServicePlugin {
    create(createInfo: CreateInfo): LanguageService;
}

export interface CreateInfo {
    languageService: LanguageService;
    parser: Parser;
}

export interface LanguageService {
    getWorkspace(): Workspace;
    registerPlugin(plugin: string | LanguageServicePlugin): void;
    removePlugin(plugin: string | LanguageServicePlugin): void;
    onDidChangeTextDocument(document: TextDocument);
    provideCompletionItems(document: TextDocument, query?: string): CompletionItem[];
    provideDefinition(document: TextDocument, position: Position): EditorSymbolInfo; // TODO: check standard type used
    provideReferences(document: TextDocument, position: Position, context?: ReferenceContext): AstLocation[] // TODO: check standard type used
    provideHover(document: TextDocument, position: Position): string; // TODO: marked string?
    provideDocumentLinks(document: TextDocument): any; // TODO: what is this??
    provideDocumentHighlights(document: TextDocument, position: Position): any // TODO: what is this?
    provideDocumentSymbols(document: TextDocument): EditorSymbolInfo[];
    provideWorkspaceSymbols(query?: string): EditorSymbolInfo[];
    // TODO: more?
}

export interface CompletionItem {
    label: string;
    kind?: EditorSymbolKind;
    detail?: string;
    insertText?: string;
}

export interface ReferenceContext {
    includeDeclaration: boolean;
}

export interface Workspace {
    files: {[absoluteFilePath: string]: MarkdownFile};
}