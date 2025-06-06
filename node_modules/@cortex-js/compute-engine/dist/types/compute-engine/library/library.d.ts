/* 0.28.0 */import { LibraryCategory } from '../latex-syntax/public';
import { IComputeEngine, IdentifierDefinitions } from '../public';
export declare function getStandardLibrary(categories: LibraryCategory[] | LibraryCategory | 'all'): readonly IdentifierDefinitions[];
export declare const LIBRARIES: {
    [category in LibraryCategory]?: IdentifierDefinitions | IdentifierDefinitions[];
};
/**
 * Set the symbol table of the current context (`engine.context`) to `table`
 *
 * `table` can be an array of symbol tables, in order to deal with circular
 * dependencies: it is possible to partition a library into multiple
 * symbol tables, to control the order in which they are processed and
 * avoid having expressions in the definition of an entry reference a symbol
 * or function name that has not yet been added to the symbol table.
 *
 */
export declare function setIdentifierDefinitions(engine: IComputeEngine, table: IdentifierDefinitions): void;
