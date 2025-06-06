/* 0.28.0 */import { BoxedExpression, IdentifierDefinitions } from '../public';
export declare const LOGIC_LIBRARY: IdentifierDefinitions;
export declare function simplifyLogicFunction(x: BoxedExpression): {
    value: BoxedExpression;
    because: string;
} | undefined;
