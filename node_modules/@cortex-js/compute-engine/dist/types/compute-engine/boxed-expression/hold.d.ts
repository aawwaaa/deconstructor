/* 0.28.0 */import type { BoxedExpression } from './public';
/** Apply the function `f` to each operand of the expression `expr`,
 * account for the 'lazy' property of the function definition:
 *
 * Account for `Hold`, `ReleaseHold`, `Sequence`, `Symbol` and `Nothing`.
 *
 * If `f` returns `null`, the element is not added to the result
 */
export declare function holdMap(expr: BoxedExpression, f: (x: BoxedExpression) => BoxedExpression | null): ReadonlyArray<BoxedExpression>;
export declare function holdMapAsync(expr: BoxedExpression, f: (x: BoxedExpression) => Promise<BoxedExpression | null>): Promise<ReadonlyArray<BoxedExpression>>;
