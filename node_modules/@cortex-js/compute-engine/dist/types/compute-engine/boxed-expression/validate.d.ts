/* 0.28.0 */import type { BoxedExpression } from './public';
import type { IComputeEngine } from '../public';
import { Type } from '../../common/type/types';
/**
 * Check that the number of arguments is as expected.
 *
 * Converts the arguments to canonical, and flattens the sequence.
 */
export declare function checkArity(ce: IComputeEngine, ops: ReadonlyArray<BoxedExpression>, count: number): ReadonlyArray<BoxedExpression>;
/**
 * Validation of arguments is normally done by checking the signature of the
 * function vs the arguments of the expression. However, we have a fastpath
 * for some common operations (add, multiply, power, neg, etc...) that bypasses
 * the regular checks. This is its replacements.
 *
 * Since all those fastpath functions are numeric (i.e. have numeric arguments
 * and a numeric result), we do a simple numeric check of all arguments, and
 * verify we have the number of expected arguments.
 *
 * We also assume that the function is threadable.
 *
 * The arguments are made canonical.
 *
 * Flattens sequence expressions.
 */
export declare function checkNumericArgs(ce: IComputeEngine, ops: ReadonlyArray<BoxedExpression>, options?: number | {
    count?: number;
    flatten?: string;
}): ReadonlyArray<BoxedExpression>;
/**
 * Check that an argument is of the expected type.
 *
 * Converts the arguments to canonical
 */
export declare function checkType(ce: IComputeEngine, arg: BoxedExpression | undefined | null, type: Type | undefined): BoxedExpression;
export declare function checkTypes(ce: IComputeEngine, args: ReadonlyArray<BoxedExpression>, types: Type[]): ReadonlyArray<BoxedExpression>;
/**
 * Check that the argument is pure.
 */
export declare function checkPure(ce: IComputeEngine, arg: BoxedExpression | BoxedExpression | undefined | null): BoxedExpression;
/**
 *
 * If the arguments match the parameters, return null.
 *
 * Otherwise return a list of expressions indicating the mismatched
 * arguments.
 *
 */
export declare function validateArguments(ce: IComputeEngine, ops: ReadonlyArray<BoxedExpression>, signature: Type, lazy?: boolean, threadable?: boolean): ReadonlyArray<BoxedExpression> | null;
