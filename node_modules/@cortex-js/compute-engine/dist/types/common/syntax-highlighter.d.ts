/* 0.28.0 */import { Buffer } from './buffer';
import { StyledBlock, StyledSpan } from './styled-text';
export type CodeTag = 
/** Plain text in default foreground/background color */
'default'
/** A literal such as a number, string or regex */
 | 'literal'
/** A comment */
 | 'comment'
/** A language keyword: if, while, export */
 | 'keyword'
/** An operator such as =, >=, +, etc... */
 | 'operator'
/** A punctuation such as `;`, `,`, `:` */
 | 'punctuation'
/** An identifier such as "foo" or "bar" */
 | 'identifier'
/** A type such as `boolean` or `number` */
 | 'type';
export type CodeSpan = {
    tag: CodeTag;
    content: string;
};
export type SyntaxGrammar = {
    comment?: (buf: Buffer) => undefined | CodeSpan;
    number?: (buf: Buffer) => undefined | CodeSpan;
    string?: (buf: Buffer) => undefined | CodeSpan;
    regex?: (buf: Buffer) => undefined | CodeSpan;
    identifier?: (buf: Buffer) => undefined | CodeSpan;
    keyword?: (buf: Buffer) => undefined | CodeSpan;
};
export declare function parseCode(text: string, grammar?: SyntaxGrammar, pos?: number): CodeSpan[];
/** Return a style span of the input code */
export declare function highlightCodeSpan(code: string, grammar?: SyntaxGrammar): StyledSpan[];
/** Return a style block of the input code, including a
 * gutter with line numbers and an optional highlighted line
 */
export declare function highlightCodeBlock(code: string, lineStart?: number | undefined, markIndicator?: string, grammar?: SyntaxGrammar): StyledBlock;
export declare function mark(line: StyledSpan[], mark: string): StyledSpan[];
/** JS sample  */
