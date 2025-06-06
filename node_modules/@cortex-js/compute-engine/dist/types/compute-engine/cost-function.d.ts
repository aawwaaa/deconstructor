/* 0.28.0 */import type { BoxedExpression } from './public';
/**
 * The default cost function, used to determine if a new expression is simpler
 * than the old one.
 *
 * To change the cost function used by the engine, set the
 * `ce.costFunction` property of the engine or pass a custom cost function
 * to the `simplify` function.
 *
 */
export declare function costFunction(expr: BoxedExpression): number;
export declare function leafCount(expr: BoxedExpression): number;
export declare const DEFAULT_COST_FUNCTION: typeof costFunction;
