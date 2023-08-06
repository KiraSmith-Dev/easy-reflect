# Easy Reflect

[![Build](https://github.com/int3nse-git/easy-reflect/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/int3nse-git/easy-reflect/actions/workflows/build.yml)

Easy Reflect is a simple yet powerful package that makes working with call stacks and call sites a breeze. It's designed to simplify the process of accessing and manipulating call stack information, making it super easy to trace function calls and inspect the call hierarchy.

## Installation

```
npm install https://github.com/int3nse-git/easy-reflect
```

## Usage

Easy Reflect provides three handy functions for working with call stacks and call sites:

### getStack(options: Partial\<ReflectOptions\> = {}): Callsite[]

This function retrieves an array of call sites, representing the current call stack. You can pass an optional `options` object with various properties to customize the output:

- trimDepth: Use this to remove a specific number of additional levels from the beginning of the call stack (default is 0).
- depth: Set this to determine the depth at which you want to retrieve the call site (default is 0).
- showInternal: Set this to `true` if you want to include callsites from internal Node.js modules (default is `false`).
- filter: Provide a custom function to filter call sites based on specific criteria (default allows all callsites).

### getCallsite(options: Partial\<ReflectOptions\> = {}): Callsite

This function returns a single call site from the call stack. You can also pass the same `options` object as in `getStack`, but by default, it returns the current call site.

### getCallerCallsite(options: Partial\<ReflectOptions\> = {}): Callsite

This function retrieves the call site of the caller of the function that invokes it. It's useful for finding out who called the function that calls `getCallerCallsite`. Again, you can use the same `options` object as in `getStack`, but the `depth` property is automatically incremented by 1.

## Note

Keep in mind that the `easy-reflect` package depends on the V8 Error API. Therefore, it is not compatible with environments or runtimes that lack support for this API.

During initialization, Easy Reflect checks for the V8 Error API. If it's missing, the package will throw an error to let you know about the problem.

## Contributing

Feel free to open an issue or submit a pull request.

## License

This package is distributed under the ISC License.

<sub><sup>This README partially written by GPT 3.5</sup></sub>
