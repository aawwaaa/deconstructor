/* 0.28.0 */import type { BoxedSymbol } from './boxed-symbol';
import type { BoxedExpression } from './public';
export declare function isWildcard(expr: BoxedExpression): expr is BoxedSymbol;
export declare function wildcardName(expr: BoxedExpression): string | null;
