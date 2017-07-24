export interface TextDocument {
    text: string;
    absoluteFilePath?: string;
}

export interface SymbolInfo {
    name: string;
    // TODO: differentiate between AST SymbolInfo and Editor SymbolInfo
    location: AstLocation;
    parent?: SymbolInfo;
    data?: SymbolData;
}

export interface AstSymbolInfo extends SymbolInfo {
    kind: string;
}

export interface EditorSymbolInfo extends SymbolInfo {
    kind: EditorSymbolKind;
}

export interface SymbolData {
    // TODO: why do I have this?
}

export interface AstNode {
    type: string;
    raw: string;
    range: [number, number];
    location: Range; 
    value?: string
    children?: AstNode[];
}

export interface AstLocation {
    uri: string;
    range: Range
}

export interface Range {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    character: number;
}

export enum EditorSymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25
}

export interface HeaderNode extends AstNode {
    depth: number;
}

export interface LinkNode extends AstNode {
    title: string;
    url: string;
}

export interface ListNode extends AstNode {
    ordered: boolean;
    loose: boolean;
    start: any;
}

export interface ListItemNode extends AstNode {
    loose: boolean;
    checked: any;
}

export interface ParagraphNode extends AstNode {

}

export interface StrNode extends AstNode {
    value: string;
}