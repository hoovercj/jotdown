import { AstNode, LineLocation } from './ast-node';

export interface Workspace {
    files: {[absoluteFilePath: string]: MarkdownFile};
    // If I store this for each file, do I need it here?
    // entityMap: {[key: string]: any}; // Map of all entities
}

export interface MarkdownFile {
    absolutePath: string; // absolute path
    text: string; // full text of the document
    ast: AstNode; // root ast node
    declarations: DeclarationInfo[]; // Map of entity names to entity objects
    usages: UsageInfo[];
}

// export type UsageMap = {[absoluteSymbolPath: string]: Usage[]};
// export type DeclarationMap = {[absoluteSymbolPath: string]: Declaration };

/**
 * Data structure representing an entity declaration
 * example:
 * # Jane Doe
 * ## Info
 * * tags: this, that, other
 * * aliases: J, John
 * @property tags strings parsed from a list item beginning with tags
 * @property aliases strings parsed from a list item beginning with aliases
 * @property name the value of the H1 header
 * @property absoluteFilePath the path to the file this declaration exists in
 * @property location the line and column range that this declaration exists at
 * @interface Declaration
 */
export interface DeclarationInfo extends SymbolInfo {
    tags: string[];
    aliases: string[];
}

/**
 * Data structure representing a markdown link
 * example: [value](../../filename#heading-title)
 *
 * @property value refers to the actual text, surrounded by []
 * This could be the official name or an alias or whatever
 * the user has changed it to
 * @property url The link, a url or a relative path to the markdown file
 * including a hash to the heading of the declaration it refers to.
 * @property absoluteFilePath the filepath that this usage exists in
 * @property location the line and column range that this usage exists at
 * @interface Usage
 */
export interface UsageInfo extends SymbolInfo {
    url: string;
}

export interface SymbolInfo {
    name: string;
    type: SymbolKind;
    absoluteSymbolPath: string;
    location: SymbolLocation;
}

export enum SymbolKind {
    declaration,
    usage,
}

export interface SymbolLocation {
    range: LineLocation;
    uri: string;
}