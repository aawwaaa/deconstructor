/* 0.28.0 */import type { BoxedExpression } from './public';
export type AsciiMathSerializer = (expr: BoxedExpression, precedence?: number) => string;
export type AsciiMathOptions = {
    symbols: Record<string, string>;
    operators: Record<string, [
        string | ((expr: BoxedExpression) => string),
        number
    ]>;
    functions: Record<string, string | ((expr: BoxedExpression, serialize: AsciiMathSerializer) => string)>;
};
export declare function toAsciiMath(expr: BoxedExpression, options?: Partial<AsciiMathOptions>, precedence?: number): string;
