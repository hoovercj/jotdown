// src: https://github.com/showdownjs/showdown/blob/d499feb2aa4433a66f31574e788de3bcd98b9e71/src/subParsers/headers.js
export function titleToAnchor(title: string): string {
    return title
        // replace each space with a hyphen
        .replace(/\s/g, '-')
        //replace previously escaped chars (&, ~ and $)
        .replace(/&amp;/g, '')
        .replace(/~T/g, '')
        .replace(/~D/g, '')
        //replace rest of the chars (&~$ are repeated as they might have been escaped)
        // borrowed from github's redcarpet (some they should produce similar results)
        .replace(/[&+$,\/:;=?@"#{}|^~\[\]`\\*)(%.!'<>]/g, '')
        .toLowerCase();
}