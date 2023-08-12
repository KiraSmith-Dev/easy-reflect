"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallerCallsite = exports.getCallsite = exports.getStack = void 0;
// Using the same tactic as node internals here - we keep a reference to the
// original Error constructor, so if it's messed with later we stay consistent
const primordials = {
    Error
};
function errMsg(msg) {
    return `easy-reflect: ${msg}`;
}
if (!primordials.Error.stackTraceLimit)
    throw new Error(errMsg('Failed to load because V8 Error API is missing'));
function pushPop(object, key, value) {
    const oldValue = object[key];
    object[key] = value;
    return () => object[key] = oldValue;
}
function wrapStack(stack) {
    if (!stack)
        throw new Error(errMsg('Stack trace failed'));
    const wrappedStack = {
        value: stack,
        unwind: (count = 1) => {
            wrappedStack.value = wrappedStack.value.slice(count);
        }
    };
    return wrappedStack;
}
function validateOptions(options) {
    var _a, _b, _c, _d;
    const validOptions = {
        trimDepth: (_a = options.trimDepth) !== null && _a !== void 0 ? _a : 0,
        depth: (_b = options.depth) !== null && _b !== void 0 ? _b : 0,
        showInternal: (_c = options.showInternal) !== null && _c !== void 0 ? _c : false,
        filter: (_d = options.filter) !== null && _d !== void 0 ? _d : (() => true)
    };
    if (typeof validOptions.trimDepth !== 'number')
        throw new TypeError(errMsg('trimDepth must be a number'));
    if (validOptions.trimDepth < 0)
        throw new RangeError(errMsg('trimDepth must be a positive number'));
    if (typeof validOptions.depth !== 'number')
        throw new TypeError(errMsg('depth must be a number'));
    if (validOptions.depth < 0)
        throw new RangeError(errMsg('depth must be a positive number'));
    if (typeof validOptions.showInternal !== 'boolean')
        throw new TypeError(errMsg('showInternal must be a boolean'));
    if (typeof validOptions.filter !== 'function')
        throw new TypeError(errMsg('filter must be a function'));
    return validOptions;
}
function _getStack(options) {
    const popStackTrace = pushPop(primordials.Error, 'prepareStackTrace', (_, stack) => stack);
    const popTraceLimit = pushPop(primordials.Error, 'stackTraceLimit', 100);
    let stack = null;
    try {
        // V8 gives us a CallSite[], TS thinks we'd get a string | undefined
        stack = (new primordials.Error()).stack;
    }
    catch (ex) {
        throw new Error(errMsg('Unexpected error while getting stack trace: ' + ex));
    }
    finally { // Huh, an actually useful finally block
        popStackTrace();
        popTraceLimit();
    }
    if (!Array.isArray(stack))
        throw new Error(errMsg('Stack trace gave unexpected result'));
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
function getStack(_options = {}) {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    const wrappedStack = _getStack(options);
    return wrappedStack.value;
}
exports.getStack = getStack;
function getCallsite(_options = {}) {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    const callsite = getStack(options)[options.depth];
    if (!callsite)
        throw new Error(`easy-reflect: Callsite at deptch ${options.depth} does not exist`);
    return callsite;
}
exports.getCallsite = getCallsite;
function getCallerCallsite(_options = {}) {
    const options = validateOptions(_options);
    options.trimDepth += 1;
    options.depth += 1;
    return getCallsite(options);
}
exports.getCallerCallsite = getCallerCallsite;
//# sourceMappingURL=index.js.map