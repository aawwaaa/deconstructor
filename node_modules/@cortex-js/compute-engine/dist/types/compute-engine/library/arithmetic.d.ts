/* 0.28.0 */import type { IdentifierDefinitions } from '../public';
import { BoxedExpression } from '../boxed-expression/public';
export type CanonicalArithmeticOperators = 'Add' | 'Negate' | 'Multiply' | 'Divide' | 'Power' | 'Sqrt' | 'Root' | 'Ln';
export declare const ARITHMETIC_LIBRARY: IdentifierDefinitions[];
export declare function isPrime(expr: BoxedExpression): boolean | undefined;
