/* 0.28.0 */import type { BoxedExpression } from './public';
import { NumericValue } from '../numeric-value/public';
/** Combine rational expressions into a single fraction */
export declare function together(op: BoxedExpression): BoxedExpression;
/**
 * Return an expression factored as a product.
 * - 2x + 4 -> 2(x + 2)
 * - 2x < 4 -> x < 2
 * - (2x) * (2y) -> 4xy
 */
export declare function factor(expr: BoxedExpression): BoxedExpression;
export declare function getPiTerm(expr: BoxedExpression): [k: NumericValue, t: NumericValue];
