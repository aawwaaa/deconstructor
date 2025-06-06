/* 0.28.0 */import type { BoxedExpression, IComputeEngine } from '../public';
/**
 * The canonical form of `Multiply`:
 * - removes `1` anb `-1`
 * - simplifies the signs:
 *    - i.e. `-y \times -x` -> `x \times y`
 *    - `2 \times -x` -> `-2 \times x`
 * - arguments are sorted
 * - complex numbers promoted (['Multiply', 2, 'ImaginaryUnit'] -> 2i)
 * - Numeric values are promoted (['Multiply', 2, 'Sqrt', 3] -> 2√3)
 *
 * The input ops may not be canonical, the result is canonical.
 */
export declare function canonicalMultiply(ce: IComputeEngine, ops: ReadonlyArray<BoxedExpression>): BoxedExpression;
export declare function mul(...xs: ReadonlyArray<BoxedExpression>): BoxedExpression;
export declare function mulN(...xs: ReadonlyArray<BoxedExpression>): BoxedExpression;
