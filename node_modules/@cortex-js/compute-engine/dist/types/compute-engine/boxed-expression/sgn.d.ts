/* 0.28.0 */import type { BoxedExpression, Sign } from './public';
export declare function sgn(expr: BoxedExpression): Sign | undefined;
export declare function positiveSign(s: Sign | undefined): boolean | undefined;
export declare function nonNegativeSign(s: Sign | undefined): boolean | undefined;
export declare function negativeSign(s: Sign | undefined): boolean | undefined;
export declare function nonPositiveSign(s: Sign | undefined): boolean | undefined;
