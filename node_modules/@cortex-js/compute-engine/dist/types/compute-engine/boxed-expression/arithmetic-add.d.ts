/* 0.28.0 */import type { BoxedExpression, IComputeEngine } from '../public';
import { Type } from '../../common/type/types';
import { BoxedType } from '../../common/type/boxed-type';
/**
 *
 * The canonical form of `Add`:
 * - canonicalize the arguments
 * - remove `0`
 * - capture complex numbers (`a + ib` or `ai + b`)
 * - sort the terms
 *
 */
export declare function canonicalAdd(ce: IComputeEngine, ops: ReadonlyArray<BoxedExpression>): BoxedExpression;
export declare function addType(args: ReadonlyArray<BoxedExpression>): Type | BoxedType;
export declare function add(...xs: ReadonlyArray<BoxedExpression>): BoxedExpression;
export declare function addN(...xs: ReadonlyArray<BoxedExpression>): BoxedExpression;
