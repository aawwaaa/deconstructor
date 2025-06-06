/* 0.28.0 */import Decimal from 'decimal.js';
import type { Rational } from '../numerics/rationals';
import type { BoxedExpression } from './public';
export declare function asRational(expr: BoxedExpression): Rational | undefined;
export declare function asBigint(expr: BoxedExpression | undefined): bigint | null;
export declare function asBignum(expr: BoxedExpression | undefined): Decimal | null;
export declare function asSmallInteger(expr: number | BoxedExpression | undefined): number | null;
