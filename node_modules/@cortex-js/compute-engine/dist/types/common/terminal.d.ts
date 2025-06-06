/* 0.28.0 */import { StyledBlock, StyledSpan } from './styled-text';
declare abstract class Terminal {
    width: number | undefined;
    indent: number;
    constructor(options?: {
        indent?: number;
        width?: number;
    });
    renderBlock(block: StyledBlock): string;
    abstract renderSpan(span: StyledSpan): string;
    renderSpans(s: StyledSpan[]): string;
    display(s: StyledSpan[] | StyledBlock): void;
}
export declare const terminal: Terminal;
/** Word-wrap a string that contains ANSI escape sequences.
 *  ANSI escape sequences do not add to the string length.
 */
export declare const wrapAnsiString: (string: string, width: number | undefined) => string[];
export {};
