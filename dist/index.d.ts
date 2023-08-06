import { Callsite } from './types';
export { Callsite } from './types';
interface ReflectOptions {
    trimDepth: number;
    depth: number;
    showInternal: boolean;
    filter: (callsite: Callsite) => boolean;
}
export declare function getStack(_options?: Partial<ReflectOptions>): Callsite[];
export declare function getCallsite(_options?: Partial<ReflectOptions>): Callsite;
export declare function getCallerCallsite(_options?: Partial<ReflectOptions>): Callsite;
//# sourceMappingURL=index.d.ts.map