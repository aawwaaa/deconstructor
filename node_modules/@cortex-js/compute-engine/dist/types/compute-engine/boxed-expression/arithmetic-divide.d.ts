/* 0.28.0 */import type { BoxedExpression } from '../public';
/**
 * Canonical form of 'Divide' (and 'Rational')
 * - remove denominator of 1
 * - simplify the signs
 * - factor out negate (make the numerator and denominator positive)
 * - if numerator and denominator are integer literals, return a rational number
 *   or Rational expression
 * - evaluate number literals
 */
export declare function canonicalDivide(op1: BoxedExpression, op2: BoxedExpression): BoxedExpression;
export declare function div(num: BoxedExpression, denom: number | BoxedExpression): BoxedExpression;
