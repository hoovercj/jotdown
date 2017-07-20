export interface SymbolInfo {
    name: string;
    kind: string;
    location: SymbolLocation;
    parent?: SymbolInfo;
    data?: SymbolData;
}

export interface SymbolData {

}

export interface SymbolLocation {
    uri: string;
    range: Range
}

export interface Range {
    start: Position;
}

export interface Position {
    line: number;
    column: number;
}