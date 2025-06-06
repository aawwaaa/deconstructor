/* 0.28.0 */import { Complex } from 'complex-esm';
import { Decimal } from 'decimal.js';
import type { BoxedExpression } from '../public';
export declare function apply(expr: BoxedExpression, fn: (x: number) => number | Complex, bigFn?: (x: Decimal) => Decimal | Complex | number, complexFn?: (x: Complex) => number | Complex): BoxedExpression | undefined;
export declare function apply2(expr1: BoxedExpression, expr2: BoxedExpression, fn: (x1: number, x2: number) => number | Complex, bigFn?: (x1: Decimal, x2: Decimal) => Decimal | Complex | number, complexFn?: (x1: Complex, x2: number | Complex) => Complex | number): BoxedExpression | undefined;
