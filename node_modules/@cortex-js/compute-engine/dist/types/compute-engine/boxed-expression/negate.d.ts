/* 0.28.0 */import type { BoxedExpression, IComputeEngine } from '../public';
export declare function canonicalNegate(expr: BoxedExpression): BoxedExpression;
/**
 * Distribute `Negate` (multiply by -1) if expr is a number literal, an
 * addition or multiplication or another `Negate`.
 *
 * It is important to do all these to handle cases like
 * `-3x` -> ["Negate, ["Multiply", 3, "x"]] -> ["Multiply, -3, x]
 */
export declare function negate(expr: BoxedExpression): BoxedExpression;
export declare function negateProduct(ce: IComputeEngine, args: ReadonlyArray<BoxedExpression>): BoxedExpression;
