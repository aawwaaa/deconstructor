/* 0.28.0 */import type { Expression } from '../../math-json/types';
import type { BoxedExpression, IComputeEngine, JsonSerializationOptions } from '../public';
export declare function serializeJson(ce: IComputeEngine, expr: BoxedExpression, options: Readonly<JsonSerializationOptions>): Expression;
