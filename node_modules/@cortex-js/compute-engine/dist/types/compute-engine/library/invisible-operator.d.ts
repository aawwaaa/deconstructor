/* 0.28.0 */import type { IComputeEngine, BoxedExpression } from '../public';
export declare function canonicalInvisibleOperator(ops: ReadonlyArray<BoxedExpression>, { engine: ce }: {
    engine: IComputeEngine;
}): BoxedExpression | null;
