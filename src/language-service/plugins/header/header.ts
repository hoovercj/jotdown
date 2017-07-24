import {
    TextDocument,
    AstSymbolInfo,
    EditorSymbolInfo,
    EditorSymbolKind,
    AstLocation,
    Range,
    Position,
} from '../../../interfaces/jotdown'

import { HeaderPlugin as HeaderParserPlugin, HeaderSymbol } from '../../../parser/plugins/header/header';
import { HeaderLinkPlugin } from '../../../parser/plugins/header-link/header-link';

import { Range as RangeComparer } from '../../../utils/range';
import { Position as PositionComparer } from '../../../utils/position';

import {
    LanguageService,
    LanguageServicePlugin,
    Workspace,
    CreateInfo,
    ReferenceContext,
    CompletionItem,
} from '../../../interfaces/language-service';

import { Parser, MarkdownFile } from '../../../interfaces/parser';
import * as Path from 'path';

export class HeaderPlugin implements LanguageServicePlugin {

    private oldLanguageService: LanguageService;
    private newLanguageService: LanguageService;

    // PLUGIN CREATION FUNCTIONS
    create(createInfo: CreateInfo): LanguageService {

        this.oldLanguageService = createInfo.languageService;
        this.newLanguageService = HeaderPlugin.decorateLanguageService(this.oldLanguageService);

        createInfo.parser.registerPlugin(new HeaderParserPlugin());
        createInfo.parser.registerPlugin(new HeaderLinkPlugin());

        this.newLanguageService.provideDocumentSymbols = this.provideDocumentSymbols;
        this.newLanguageService.provideWorkspaceSymbols = this.provideWorkspaceSymbols;
        this.newLanguageService.provideReferences = this.provideReferences;
        this.newLanguageService.provideCompletionItems = this.provideCompletionItems;

        return this.newLanguageService;
    }

    static decorateLanguageService(oldLS: LanguageService): LanguageService {
        const proxy = Object.create(null) as LanguageService;
        for (const k in oldLS) {
            // Only copy functions over
            if (typeof oldLS[k] === 'function') {
                (<any>proxy)[k] = function () {
                    return oldLS[k].apply(oldLS, arguments);
                }
            }
        }

        return proxy;
    }

    // PLUGIN IMPLEMENTATION FUNCTIONS
    provideDocumentSymbols = (document: TextDocument): EditorSymbolInfo[] => {
        // Get symbols found by other plugins
        const oldDocumentSymbols = this.oldLanguageService.provideDocumentSymbols(document) || [];
        
        const workspace = this.newLanguageService.getWorkspace();
        const files = workspace && workspace.files || {};
        const file = files[document.absoluteFilePath];

        const newDocumentSymbols = this.getFileSymbols(file, ['header', 'header-link'])
            .map(this.astSymbolToEditorSymbol);

        return [...oldDocumentSymbols, ...newDocumentSymbols];
    }

    provideWorkspaceSymbols = (query: string): EditorSymbolInfo[] => {
        // Get symbols found by other plugins
        const oldDocumentSymbols = this.oldLanguageService.provideWorkspaceSymbols(query) || [];

        const workspace = this.newLanguageService.getWorkspace();
        const files = workspace && workspace.files || {};
        const workspaceSymbols = this.getWorkspaceSymbols(['header']);
        const filteredSymbols = 
            workspaceSymbols.filter(symbol => symbol.name.indexOf(query || '') >= 0)
        const mappedSymbols = filteredSymbols
            .map(this.astSymbolToEditorSymbol);
        return [...oldDocumentSymbols, ...mappedSymbols];
    }

    provideReferences = (document: TextDocument, position: Position, context?: ReferenceContext): AstLocation[] => { // TODO: check standard type used
        const oldReferences = this.oldLanguageService.provideReferences(document, position, context);

        const workspace = this.newLanguageService.getWorkspace();
        const files = workspace && workspace.files || {};
        const file = files[document.absoluteFilePath];

        const symbol = this.getSymbolAtPosition(document, position);
        if (!symbol) {
            return [];
        }

        const newReferences = this.getReferencesForSymbol(symbol as HeaderSymbol, context)
            .map(reference => reference.location);

        return [...oldReferences, ...newReferences];
    }

    // TODO: This needs improved. Position?
    // typing # in text will provide a list of all workspace headings that are defined, accepting it will generate a link
    provideCompletionItems = (document: TextDocument, query?: string): CompletionItem[] => {
        const oldCompletions = this.oldLanguageService.provideCompletionItems(document, query) || [];

        // Header completions start with a #
        if (!query || query.charAt(0) !== '#') {
            return oldCompletions;
        }

        query = query.substring(1);

        const newCompletions = this.getWorkspaceSymbols(['header'])
            .filter(symbol => symbol.name.toLowerCase().indexOf(query && query.toLowerCase() || '') >= 0)
            .map((symbol: HeaderSymbol): CompletionItem => {
                const absoluteSymbolPath = symbol.data.absoluteSymbolPath;
                const symbolUrlParts = absoluteSymbolPath.split('#');
                const symbolHash = symbolUrlParts[1];
                const symbolFilepath = symbolUrlParts[0];
                const symbolFolder = Path.dirname(symbolFilepath);
                const symbolFilename = Path.basename(symbolFilepath);
                const documentFolder = Path.dirname(document.absoluteFilePath);
                const relativeFolder = Path.relative(documentFolder, symbolFolder);

                const baseUrl = relativeFolder ? Path.join(relativeFolder, symbolFilename) : '';
                return {
                    label: symbol.name,
                    kind: EditorSymbolKind.Array,
                    insertText: `[${symbol.name}](${baseUrl}#${symbolHash})`,
                }
            });

        return [...oldCompletions, ...newCompletions];
    }
    
    // PLUGIN HELPER FUNCTIONS
    private getReferencesForSymbol(symbol: HeaderSymbol, context?: ReferenceContext): AstSymbolInfo[] {
        // If we don't have an absolute symbol path, then we can't identify the symbol
        const absoluteSymbolPath = symbol.data && symbol.data.absoluteSymbolPath;
        if (!absoluteSymbolPath) {
            return [];
        }

        // Get all header symbols
        const allowedKinds = context && context.includeDeclaration ?
            ['header', 'header-link'] :
            ['header-link'];
        const allSymbols = this.getWorkspaceSymbols(allowedKinds);
        // Filter down to symbols that match the symbol path
        const references = allSymbols.filter((symbol: HeaderSymbol) => {
            return absoluteSymbolPath === (symbol.data && symbol.data.absoluteSymbolPath)
        });
        return references;
    }
    
    private getSymbolAtPosition(document: TextDocument, position: Position): AstSymbolInfo {
        const workspace = this.newLanguageService.getWorkspace();
        const files = workspace && workspace.files || {};
        const file = files[document.absoluteFilePath];

        const fileSymbols = this.getFileSymbols(file, ['header', 'header-link']);
        let symbol: AstSymbolInfo;
        let symbolRange: RangeComparer;
        fileSymbols.forEach(candidate => {
            // Check if the given position is within the range of the candidate symbol
            const r = candidate.location.range;
            const candidateRange = new RangeComparer(r.start.line + 1, r.start.character + 1, r.end.line + 1, r.end.character + 1);
            if (!candidateRange.containsPosition(new PositionComparer(position.line + 1, position.character + 1))) {
                return;
            }

            // If we don't already have a symbol, use this
            if (!symbol) {
                symbol = candidate;
                const s = candidate.location.range;
                symbolRange = new RangeComparer(s.start.line + 1, s.start.character + 1, s.end.line + 1, s.end.character + 1);
                return;
            }

            // If the candidate range is contained in the symbol range
            // then it must be more specific, so use that
            if (symbolRange.containsRange(candidateRange)) {
                symbol = candidate;
                symbolRange = candidateRange; 
            }
        });
        return symbol;
    }

    private getWorkspaceSymbols(allowedAstKinds: string[]): AstSymbolInfo[] {
        const symbols: AstSymbolInfo[] = [];
        const workspace = this.newLanguageService.getWorkspace();
        const files = workspace && workspace.files || {};
        Object.keys(files).forEach(fileName => {
            const fileSymbols = this.getFileSymbols(files[fileName], allowedAstKinds)
            symbols.push(...fileSymbols);
        });
        return symbols;
    }

    private getFileSymbols(file: MarkdownFile, allowedAstKinds: string[]): AstSymbolInfo[] {
        if (!file) {
            return [];
        }

        return this.filterAstSymbols(file.symbols, allowedAstKinds);
    }

    private filterAstSymbols = (symbols: AstSymbolInfo[], allowedAstKinds: string[]) => {
        if (!allowedAstKinds || allowedAstKinds.length === 0) {
            return [];
        }
        // Normalize case
        allowedAstKinds = allowedAstKinds.map(kind => kind.toLowerCase());

        return symbols.filter(symbol => {
            return allowedAstKinds.indexOf(symbol.kind.toLowerCase()) >= 0;
        });
    }

    private astSymbolToEditorSymbol(astSymbol: AstSymbolInfo): EditorSymbolInfo {
        let newSymbolKind = EditorSymbolKind.Field;
        switch (astSymbol.kind) {
            case 'header':
                newSymbolKind = EditorSymbolKind.Class;
                break;
            case 'header-link':
                newSymbolKind = EditorSymbolKind.Array;
            default:
                break;
        }
        return {
            ...astSymbol,
            kind: newSymbolKind
        };
    }
}