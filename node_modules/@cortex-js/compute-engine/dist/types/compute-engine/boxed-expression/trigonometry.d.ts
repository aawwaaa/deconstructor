/* 0.28.0 */import type { BoxedExpression, IComputeEngine, RuleStep, Sign } from './public';
export declare function Fu(exp: BoxedExpression): RuleStep | undefined;
/** Assuming x in an expression in radians, convert to current angular unit. */
export declare function radiansToAngle(x: BoxedExpression | undefined): BoxedExpression | undefined;
export declare function evalTrig(name: string, op: BoxedExpression | undefined): BoxedExpression | undefined;
export declare function processInverseFunction(ce: IComputeEngine, xs: ReadonlyArray<BoxedExpression>): BoxedExpression | undefined;
export declare function trigSign(operator: string, x: BoxedExpression): Sign | undefined;
export declare function isConstructible(x: string | BoxedExpression): boolean;
export declare function constructibleValues(operator: string, x: BoxedExpression | undefined): undefined | BoxedExpression;
/**
 * Return the angle in the range [0, 2π) that is equivalent to the given angle.
 *
 * @param x
 * @returns
 */
export declare function canonicalAngle(x: BoxedExpression | undefined): BoxedExpression | undefined;
