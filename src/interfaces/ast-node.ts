// Modified from: https://github.com/textlint/textlint/blob/master/typings/txtast.ts
// Node
export interface AstNode {
    type: string;
    raw: string;
    range: [number, number];
    loc: LineLocation;
    value?: string
    children?: AstNode[];
}
export interface LineLocation {
    start: Position;
    end: Position;
}
export interface Position {
    line: number; // start with 1
    column: number;// start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
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