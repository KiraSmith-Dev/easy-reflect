import { expect } from 'chai';
import * as easyReflect from '../src/index';

function nestedA<T, U>(callback: (params?: U) => T, params?: U) {
    return nestedB(callback, params);
}

function nestedB<T, U>(callback: (params?: U) => T, params?: U) {
    return nestedC(callback, params);
}

function nestedC<T, U>(callback: (params?: U) => T, params?: U) {
    return callback(params);
}

describe("getStack", () => {
    it("Should get the stack", done => {
        const stack = nestedA(easyReflect.getStack);
        expect(stack[0].getFunctionName()).to.equal('nestedC');
        expect(stack[1].getFunctionName()).to.equal('nestedB');
        expect(stack[2].getFunctionName()).to.equal('nestedA');
        done();
    });
    
    it("Should get the stack with trimDepth", done => {
        const stack = nestedA(easyReflect.getStack, { trimDepth: 1 });
        expect(stack[0].getFunctionName()).to.equal('nestedB');
        expect(stack[1].getFunctionName()).to.equal('nestedA');
        done();
    });
    
    it("Should get the stack with a filter", done => {
        const stack = nestedA(easyReflect.getStack, { 
            filter: callsite => !callsite.getFunctionName()?.endsWith('B') 
        });
        expect(stack[0].getFunctionName()).to.equal('nestedC');
        expect(stack[1].getFunctionName()).to.equal('nestedA');
        done();
    });
});

describe("getCallsite", () => {
    it("Should get the callsite", done => {
        const callsite = nestedA(easyReflect.getCallsite);
        expect(callsite.getFunctionName()).to.equal('nestedC');
        done();
    });
    
    it("Should get the caller callsite when given depth", done => {
        const callsite = nestedA(easyReflect.getCallsite, { depth: 1 });
        expect(callsite.getFunctionName()).to.equal('nestedB');
        done();
    });
});

describe("getCallerCallsite", () => {
    it("Should get the caller callsite", done => {
        const callsite = nestedA(easyReflect.getCallerCallsite);
        expect(callsite.getFunctionName()).to.equal('nestedB');
        done();
    });
});
