import { Callsite } from './types';
export { Callsite } from './types';

const primordials = {
    Error
};

function errMsg(msg: string) {
    return `easy-reflect: ${msg}`;
}

if (!(primordials.Error as any).stackTraceLimit)
    throw new Error(errMsg('Failed to load because V8 Error API is missing'));

function pushPop<T>(object: T, key: keyof T, value: T[keyof T]) {
    const oldValue = object[key];
    object[key] = value;
    return () => object[key] = oldValue;
}

type WrappedStack = {
    value: Callsite[];
    unwind: (count?: number) => void;
}

function wrapStack(stack: Callsite[]) {
    if (!stack)
        throw new Error('easy-reflect: Stack trace failed');
    
    const wrappedStack: WrappedStack = {
        value: stack,
        unwind: (count = 1) => {
            wrappedStack.value = wrappedStack.value.slice(count);
        }
    };
    
    return wrappedStack;
}

interface ReflectOptions {
    trimDepth: number;
    depth: number;
    showInternal: boolean;
    filter: (callsite: Callsite) => boolean;
}

function validateOptions(options: Partial<ReflectOptions>): ReflectOptions {
    const validOptions: ReflectOptions = {
        trimDepth: options.trimDepth ?? 0,
        depth: options.depth ?? 0,
        showInternal: options.showInternal ?? false,
        filter: options.filter ?? (() => true)
    }
    
    if (typeof validOptions.trimDepth !== 'number')
        throw new TypeError('easy-reflect: trimDepth must be a number');
    
    if (validOptions.trimDepth < 0)
        throw new RangeError('easy-reflect: trimDepth must be a positive number');
    
    if (typeof validOptions.depth !== 'number')
        throw new TypeError('easy-reflect: depth must be a number');
    
    if (validOptions.depth < 0)
        throw new RangeError('easy-reflect: depth must be a positive number');
        
    if (typeof validOptions.showInternal !== 'boolean')
        throw new TypeError('easy-reflect: showInternal must be a boolean');
    
    if (typeof validOptions.filter !== 'function')
        throw new TypeError('easy-reflect: filter must be a function');
    
    return validOptions;
}

function _getStack(options: ReflectOptions) {
    const popStackTrace = pushPop(primordials.Error, 'prepareStackTrace', (_: unknown, stack: unknown) => stack);
    const popTraceLimit = pushPop(primordials.Error, 'stackTraceLimit', 100);
    
    // V8 gives us a CallSite[], TS thinks we'd get a string | undefined
	const stack = (new primordials.Error()).stack as unknown as Callsite[];
    if (!Array.isArray(stack))
        throw new Error('easy-reflect: Stack trace gave unexpected result');
    
	popStackTrace();
    popTraceLimit();
    
    const wrappedStack = wrapStack(stack);
    wrappedStack.unwind(1 + options.trimDepth);
    
    wrappedStack.value = wrappedStack.value.filter(callsite => {
        if (!options.showInternal) {
            const fileName = callsite.getFileName();
            if (fileName !== null && fileName.startsWith('node:internal'))
                return false;
        }
        
        return options.filter(callsite);
    });
    
	return wrappedStack;
}

export function getStack(_options: Partial<ReflectOptions> = {}): Callsite[] {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    const wrappedStack = _getStack(options);
    return wrappedStack.value;
}

export function getCallsite(_options: Partial<ReflectOptions> = {}): Callsite {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    const callsite = getStack(options)[options.depth];
    if (!callsite)
        throw new Error(`easy-reflect: Callsite at deptch ${options.depth} does not exist`);
    
    return callsite;
}

export function getCallerCallsite(_options: Partial<ReflectOptions> = {}): Callsite {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    options.depth += 1;
    return getCallsite(options);
}
