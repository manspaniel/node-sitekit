function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

var arrayWithoutHoles = _arrayWithoutHoles;

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

var iterableToArray = _iterableToArray;

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var nonIterableSpread = _nonIterableSpread;

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

var toConsumableArray = _toConsumableArray;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

var arrayWithHoles = _arrayWithHoles;

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

var iterableToArrayLimit = _iterableToArrayLimit;

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var nonIterableRest = _nonIterableRest;

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

var slicedToArray = _slicedToArray;

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var assertThisInitialized = _assertThisInitialized;

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

var possibleConstructorReturn = _possibleConstructorReturn;

var getPrototypeOf = createCommonjsModule(function (module) {
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
});

var setPrototypeOf = createCommonjsModule(function (module) {
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
});

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

var inherits = _inherits;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
}

// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
}

// This implementation is based heavily on node's url.parse
function resolvePathname(to, from) {
  if (from === undefined) from = '';

  var toParts = (to && to.split('/')) || [];
  var fromParts = (from && from.split('/')) || [];

  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  var hasTrailingSlash;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');

  if (
    mustEndAbs &&
    fromParts[0] !== '' &&
    (!fromParts[0] || !isAbsolute(fromParts[0]))
  )
    fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
}

var isProduction = process.env.NODE_ENV === 'production';
function warning(condition, message) {
  if (!isProduction) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

var isProduction$1 = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';
function invariant(condition, message) {
    if (condition) {
        return;
    }
    if (isProduction$1) {
        throw new Error(prefix);
    }
    throw new Error(prefix + ": " + (message || ''));
}

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}
function hasBasename(path, prefix) {
  return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
}
function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}
function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}
function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';
  var hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}
function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;
  var path = pathname || '/';
  if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
  return path;
}

function createLocation(path, state, key, currentLocation) {
  var location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);
    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
    process.env.NODE_ENV !== "production" ? warning(prompt == null, 'A history supports only one prompt at a time') : void 0;
    prompt = nextPrompt;
    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  }

  function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          process.env.NODE_ENV !== "production" ? warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  var listeners = [];

  function appendListener(fn) {
    var isActive = true;

    function listener() {
      if (isActive) fn.apply(void 0, arguments);
    }

    listeners.push(listener);
    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notifyListeners() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  }

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
function getConfirmation(message, callback) {
  callback(window.confirm(message)); // eslint-disable-line no-alert
}
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */

function supportsHistory() {
  var ua = window.navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
  return window.history && 'pushState' in window.history;
}
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */

function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */

function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
}

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
}
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */


function createBrowserHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Browser history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canUseHistory = supportsHistory();
  var needsHashChangeListener = !supportsPopStateOnHashChange();
  var _props = props,
      _props$forceRefresh = _props.forceRefresh,
      forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

  function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
    var path = pathname + search + hash;
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path, state, key);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  var forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allKeys.indexOf(fromLocation.key);
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  }

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key]; // Public interface

  function createHref(location) {
    return basename + createPath(location);
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.pushState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.replaceState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
        window.location.replace(href);
      }
    });
  }

  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

// const Symbol = str => str + '_' + (Math.random() * 10).toFixed(3)
var subject = Symbol('subject');

var Subject = /*#__PURE__*/function () {
  function Subject() {
    classCallCheck(this, Subject);

    defineProperty(this, subject, void 0);

    this[subject] = {
      index: 0,
      listeners: {},
      cancels: {},
      key: function key() {
        return "listener_".concat(this[subject].index++);
      }
    }; // Bind all the methods

    this.on = this.on.bind(this);
    this[subject].key = this[subject].key.bind(this);
    this.emit = this.emit.bind(this);
    this.once = this.once.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  /* Listen to  */


  createClass(Subject, [{
    key: "on",
    value: function on(nameOrCallback, fn) {
      var _this = this;

      var name = nameOrCallback;
      var callback = fn;

      if (!fn && typeof nameOrCallback === 'function') {
        callback = nameOrCallback;
        /* Listen to all events */

        name = subject;
      } // Every event listener is given it's own key


      var key = this[subject].key();
      var eventNames = typeof name === 'string' ? name.split(' ') : [name];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = eventNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var eventName = _step.value;
          // If this is the first listener of type eventName then listeners[eventName] will be empty
          if (!this[subject].listeners[eventName]) this[subject].listeners[eventName] = {}; // Add the listener to the listener object

          this[subject].listeners[eventName][key] = callback;
        } // Cancel function deletes the listener and itself from Subject

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var cancelled = false;

      var _cancels = function cancels() {
        if (cancelled) return;

        _cancels = function cancels() {};

        cancelled = true;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = eventNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var eventName = _step2.value;
            delete _this[subject].listeners[eventName][key];
            delete _this[subject].cancels[key];

            if (!Object.keys(_this[subject].listeners[eventName]).length) {
              delete _this[subject].listeners[eventName];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }; // Add cancel to the subject array


      this[subject].cancels[key] = _cancels; // Return the event diposer

      return _cancels;
    }
  }, {
    key: "emit",
    value: function emit(name) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // @ts-ignore
      if (name !== subject) {
        // @ts-ignore
        this.emit.apply(this, [subject].concat(args));
      } // If this even is in the listeners object


      if (this[subject].listeners[name]) {
        return Object.values(this[subject].listeners[name]).map(function (fn) {
          return fn.apply(void 0, args);
        });
      }
    }
  }, {
    key: "getHandlers",
    value: function getHandlers(name) {
      var _this2 = this;

      return {
        get: function get() {
          var handlers = [];

          for (var _key2 in _this2[subject].listeners[name]) {
            handlers.push(_this2[subject].listeners[name][_key2]);
          }

          return handlers;
        },
        map: function map(fn) {
          var results = [];

          for (var _key3 in _this2[subject].listeners[name]) {
            var handler = _this2[subject].listeners[name][_key3];
            results.push(fn(handler, _key3));
          }

          return results;
        },
        forEach: function forEach(fn) {
          for (var _key4 in _this2[subject].listeners[name]) {
            var handler = _this2[subject].listeners[name][_key4];
            fn(handler, _key4);
          }
        },
        reduce: function reduce(fn, val) {
          var prev = val;

          for (var _key5 in _this2[subject].listeners[name]) {
            var handler = _this2[subject].listeners[name][_key5];
            prev = fn(prev, handler, _key5);
          }
        }
      };
    }
  }, {
    key: "reduce",
    value: function reduce(name) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key6 = 1; _key6 < _len2; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      var value = args[0],
          rest = args.slice(1);
      var prev;

      if (this[subject].listeners[name]) {
        return this.getHandlers(name).reduce(function (memo, fn) {
          var v = fn.apply(void 0, [memo].concat(toConsumableArray(rest)));

          if (typeof v !== 'undefined') {
            prev = v;
            return v;
          } else {
            return prev;
          }
        }, value);
      }

      return value;
    }
  }, {
    key: "asyncReduce",
    value: function () {
      var _asyncReduce = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(name) {
        var _len3,
            args,
            _key7,
            value,
            rest,
            _args = arguments;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                for (_len3 = _args.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key7 = 1; _key7 < _len3; _key7++) {
                  args[_key7 - 1] = _args[_key7];
                }

                value = args[0], rest = args.slice(1);

                if (!this[subject].listeners[name]) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", Object.values(this[subject].listeners[name]).reduce(function (last, fn) {
                  var v = fn.apply(void 0, [last].concat(toConsumableArray(rest)));

                  if (typeof v !== 'undefined') {
                    last = v;
                    return v;
                  }

                  return last;
                }, value));

              case 4:
                return _context.abrupt("return", value);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function asyncReduce(_x) {
        return _asyncReduce.apply(this, arguments);
      }

      return asyncReduce;
    }()
  }, {
    key: "add",
    value: function add(eventName, fn) {
      return this.on(eventName, fn);
    }
  }, {
    key: "once",
    value: function once(name, fn) {
      // Use var to hoist variable (not sure if needed)
      var cancel = this.on(name, function () {
        if (cancel) cancel();
        fn.apply(void 0, arguments);
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      Object.values(this[subject].cancels).forEach(function (fn) {
        return fn();
      });
    }
  }]);

  return Subject;
}();

function on(element, eve, callback) {
  /* Split events by space */
  var events = Array.isArray(eve) ? eve : [eve];
  /* Subscribe to all the events! */

  events.forEach(function (event) {
    return element.addEventListener(event, callback);
  });
  /* Return a disposer */

  return function () {
    return events.forEach(function (event) {
      return element.removeEventListener(event, callback);
    });
  };
}

function traverseDepth(node, forEachNode) {
  if (node.children.length) {
    node.children.forEach(function (node) {
      return traverseDepth(node, forEachNode);
    });
  }

  forEachNode(node);
}

var Loadable = /*#__PURE__*/function (_Subject) {
  inherits(Loadable, _Subject);

  function Loadable(resources) {
    var _this;

    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    classCallCheck(this, Loadable);

    _this = possibleConstructorReturn(this, getPrototypeOf(Loadable).call(this));

    defineProperty(assertThisInitialized(_this), "promises", void 0);

    defineProperty(assertThisInitialized(_this), "loaded", void 0);

    defineProperty(assertThisInitialized(_this), "start", Date.now());

    defineProperty(assertThisInitialized(_this), "timeout", void 0);

    defineProperty(assertThisInitialized(_this), "complete", false);

    _this.promises = resources;
    _this.loaded = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _this.promises[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var promise = _step.value;
        promise.then(function (arg) {
          _this.loaded++;

          _this.emitProgress();

          return arg;
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (timeout) {
      _this.timeout = setTimeout(function () {
        _this.emitComplete();
      }, timeout);
    }

    return _this;
  }

  createClass(Loadable, [{
    key: "finished",
    value: function finished() {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (_this2.complete) {
          resolve();
        } else {
          _this2.once('complete', function (update) {
            resolve();
          });
        }
      });
    }
  }, {
    key: "emitComplete",
    value: function emitComplete() {
      if (this.complete) return;
      this.complete = true;
      this.emit('complete', {
        percent: 1,
        start: this.start,
        time: Date.now() - this.start
      });
    }
  }, {
    key: "emitProgress",
    value: function emitProgress() {
      var update = {
        percent: this.loaded / this.promises.length,
        start: this.start,
        time: Date.now() - this.start
      };
      this.emit('progress', update);

      if (update.percent === 1) {
        this.emitComplete();
      }
    }
  }]);

  return Loadable;
}(Subject);

function traverse(node, forEachNode) {
  forEachNode(node);

  if (node.children.length) {
    node.children.forEach(function (node) {
      return traverse(node, forEachNode);
    });
  }
}

function createAPI() {
  var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "".concat(window.location.host, "/api/");
  var api = {
    base: base,
    get: function get(path) {
      var _this = this;

      return asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var url, response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                url = new URL(path, _this.base);
                _context.next = 3;
                return fetch(url.href, {
                  method: 'POST'
                });

              case 3:
                response = _context.sent;
                return _context.abrupt("return", response.json());

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  };
  return api;
}

var Site = /*#__PURE__*/function () {
  function Site() {
    classCallCheck(this, Site);
  }

  createClass(Site, null, [{
    key: "container",
    value: function container() {
      var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      return el.querySelector(this.containerQuery);
    }
  }, {
    key: "isContainer",
    value: function isContainer(el) {
      return el && el.matches(this.containerQuery);
    }
  }, {
    key: "ready",
    value: function () {
      var _ready = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                document.addEventListener('DOMContentLoaded', function () {
                  console.log('document is ready. I can sleep now');
                });

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function ready() {
        return _ready.apply(this, arguments);
      }

      return ready;
    }()
  }]);

  return Site;
}();

defineProperty(Site, "api", createAPI());

defineProperty(Site, "containerQuery", "#site");

window.Site = Site;

function fromEntries(entries) {
  var result = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entry = _step.value;
      result[entry[0]] = entry[1];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
}

var IS_WIDGET = Symbol('isWidget');
var Widgets = /*#__PURE__*/function () {
  function Widgets() {
    classCallCheck(this, Widgets);
  }

  createClass(Widgets, null, [{
    key: "isWidgetElement",

    /* Keep track of running parts */
    value: function isWidgetElement(el) {
      return el.matches("[widget]");
    }
  }, {
    key: "isWidget",
    value: function isWidget(instance) {
      return _typeof_1(instance) === 'object' && instance[IS_WIDGET];
    }
  }, {
    key: "isWidgetConstructor",
    value: function isWidgetConstructor(type) {
      return typeof type === 'function' && type[IS_WIDGET];
    }
  }, {
    key: "createFiber",
    value: function createFiber(el) {
      var prevFiber = this.getFiberForElement(el);
      if (prevFiber) return prevFiber;
      return {
        element: el,
        instances: [],
        context: {},
        isRoot: Site.isContainer(el),
        children: [],
        parent: null
      };
    }
  }, {
    key: "createTreeFromLeaf",
    value: function createTreeFromLeaf(el) {
      var target = el;

      while (!Site.isContainer(target) && !Widgets.isWidgetElement(target) && !router.isOutlet(target)) {
        target = target.parent;
      }

      var fiber = Widgets.getFiberForElement(target);
      fiber.children = this.createTree({
        children: fiber.children
      });
    }
  }, {
    key: "createTree",
    value: function createTree(el) {
      var _this = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$useCached = _ref.useCached,
          useCached = _ref$useCached === void 0 ? true : _ref$useCached;

      if (!el) {
        el = Site.container();
      }

      if (useCached) {
        var _tree = this.runtime.fibers.get(el);

        if (_tree) return _tree;
      }

      var formTree = function formTree(element) {
        var tree = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _this.createFiber(element);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = element.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            if (_this.isWidgetElement(child)) {
              var fiber = _this.createFiber(child);

              fiber.parent = tree;

              if (!tree.children.includes(fiber)) {
                tree.children.push(fiber);
              }

              formTree(child, fiber);
            } else {
              formTree(child, tree);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return tree;
      };

      var tree = formTree(el);
      return tree;
    }
    /*
    Start just imports all the widget files from their pre known paths. 
    Then calls Widgets.init on the container
    */

  }, {
    key: "start",
    value: function start() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$widgets = _ref2.widgets,
          widgets = _ref2$widgets === void 0 ? [] : _ref2$widgets,
          _ref2$container = _ref2.container,
          container = _ref2$container === void 0 ? null : _ref2$container;

      this.runtime.container = container || Site.container();
      /* Throw if the container doesn't exit */

      if (!this.runtime.container) {
        var noContainerMsg = "Widgets container did not exist, expected element, got ".concat(this.runtime.container);
        throw new Error(noContainerMsg);
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = widgets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var mod = _step2.value;

          if (this.isWidgetConstructor(mod)) {
            Widgets.register(mod);
          }
        }
        /* This can be called as many times as you like on the same dom node. It will only init widgets once */

      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      Widgets.init(this.runtime.container);
    }
    /* Get a widget constructor by type */

  }, {
    key: "getWidgetConstructor",
    value: function getWidgetConstructor(type) {
      return this.runtime.constructors[type];
    }
    /* 
    Check if a fiber has a widget instance of type
    Elements can only have one instance of each widget type attached to them
    */

  }, {
    key: "hasInstanceOfType",
    value: function hasInstanceOfType(fiber, type) {
      return fiber.instances.find(function (x) {
        return x.type === type;
      });
    }
    /* 
    Used for initialising a single widget by dom node
    At the moment this only works if the dom node exists in the tree
    But in the future it could work by recursing up the dom tree until it finds an existing fiber
    and then initializing down from there
    */

  }, {
    key: "initWidget",
    value: function initWidget(element) {
      var fiber = this.getFiberForElement(element);

      if (fiber === null) {
        throw new Error("Initting widgets outside of a tree isn't implemented yet");
      }

      var types = (fiber.element.getAttribute('widget') || '').split(',');
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = types[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var type = _step3.value;
          type = type.trim();
          var widgetAlreadyExists = this.hasInstanceOfType(fiber, type);
          if (widgetAlreadyExists) continue;
          var WidgetFactory = this.getWidgetConstructor(type);
          /* Warn if the widget definition doesnt exist */

          if (!WidgetFactory) {
            var widgetTypeDoesntExistMsg = "Widget type \"".concat(type, "\" does not exist\n");
            console.warn(widgetTypeDoesntExistMsg, fiber.element);
            return;
          }

          var instance = new WidgetFactory(fiber.element);
          fiber.instances.push(instance);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
    /* Init is called from root -> leaves */

  }, {
    key: "init",
    value: function init(container) {
      var _this2 = this;

      /* Get the closest parent that is a widget or page-content */
      var parentNode = container.closest('#site, [widget]');
      var tree = this.createTree(container, {
        useCached: false
      });
      /* 
      We have to figure out what part of the parent tree
      we have to replace using the parentnode
      */

      this.runtime.tree = tree;
      traverse(tree, function (fiber) {
        /* Add node to runtime fibers */
        _this2.runtime.fibers.set(fiber.element, fiber);

        if (!fiber.isRoot) {
          _this2.initWidget(fiber.element);
        }

        fiber.instances.forEach(function (instance) {
          return instance.init && instance.init();
        });
      });
      this.mount(tree.element, tree);
    }
    /* Mount is called from leaves -> root ala componentDidMount */

  }, {
    key: "mount",
    value: function mount(node) {
      var tree = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.createTree(node);
      traverseDepth(tree, function (fiber) {
        fiber.instances.forEach(function (instance) {
          instance.mount();
        });
      });
    }
    /* unmount is called from root -> leaves */

  }, {
    key: "unmount",
    value: function unmount(node) {
      var tree = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.createTree(node);
      traverse(tree, function (fiber) {
        while (fiber.instances.length) {
          var instance = fiber.instances.shift();
          instance === null || instance === void 0 ? void 0 : instance.unmount();
        }
      });
    }
    /* Preload is called from root -> leaves */

  }, {
    key: "preload",
    value: function preload() {
      var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Site.container();
      var promises = [];
      var container = Widgets.isWidgetElement(element) ? element : element.closest('#site, [widget]');
      var tree = this.createTree(element);
      traverse(tree, function (fiber) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          var _loop = function _loop() {
            var instance = _step4.value;
            if (!instance.preload) return "continue";
            var instanceLoads = instance.preload();

            if (Array.isArray(instanceLoads)) {
              promises.push.apply(promises, toConsumableArray(instanceLoads));
            } else if (_typeof_1(instanceLoads) === 'object') {
              var entries = Object.entries(instanceLoads);
              var proms = entries.map(function (_ref3) {
                var _ref4 = slicedToArray(_ref3, 2),
                    k = _ref4[0],
                    v = _ref4[1];

                return v;
              });
              promises.push.apply(promises, toConsumableArray(proms));
              /* 
              When preload returns an object
              the result is mixed into the widget instance so it can access
              on this[property]
              */

              Promise.allSettled(proms).then(function (result) {
                Object.assign(instance, fromEntries(entries.map(function (_ref5) {
                  var _ref6 = slicedToArray(_ref5, 1),
                      k = _ref6[0];

                  return [k, result[k]];
                })));
              });
            } else {
              promises.push(instanceLoads);
            }
          };

          for (var _iterator4 = fiber.instances[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      });
      return new Loadable(promises);
    }
    /* Register a new widget type */

  }, {
    key: "register",
    value: function register(widgetType) {
      this.runtime.constructors[widgetType.type] = widgetType;
    }
  }, {
    key: "getFiberForElement",
    value: function getFiberForElement(el) {
      if (!el) return null;
      return this.runtime.fibers.get(el) || null;
    }
  }, {
    key: "setBaseContext",
    value: function setBaseContext(ctx) {
      this.runtime.baseContext = ctx;
    }
  }, {
    key: "getWidgetElements",
    value: function getWidgetElements(page) {
      return page.querySelectorAll('[widget]');
    }
  }]);

  return Widgets;
}();

defineProperty(Widgets, "runtime", {
  fibers: new WeakMap(),
  baseContext: {},
  tree: null,
  container: null,
  constructors: {}
});

window.Widgets = Widgets;

var history = createBrowserHistory();
/* 
Router's jobs
  - Scroll restore
*/

function toURL(href) {
  if (typeof href === 'string') {
    /* This is an absolute complete domain */
    if (href.indexOf('http') === 0) {
      return new URL(href);
    } else {
      /* This is a relative domain */
      return new URL(href, window.location.host);
    }
  } else {
    return href;
  }
}

function isLocalLink(href) {
  return toURL(href).host === location.host;
}

var externalTarget = /_blank/;

function isLocalTarget(el) {
  return !externalTarget.test(el.target);
}

var Link = /*#__PURE__*/function () {
  function Link(el, router) {
    classCallCheck(this, Link);

    defineProperty(this, "el", void 0);

    defineProperty(this, "router", void 0);

    defineProperty(this, "onClick", void 0);

    this.el = el;
    this.router = router;
    this.mount();
  }

  createClass(Link, [{
    key: "mount",
    value: function mount() {
      var _this = this;

      this.onClick = on(this.el, 'click', function (e) {
        /* Check if the link's url should be opened in the current tab */
        var isLocal = isLocalLink(e.target.href) && isLocalTarget(e.target);
        /* Add the isLocal variable to the event */

        var eve = e;
        /* Patch preventDefault */

        var originalPreventDefault = eve.preventDefault;
        var prevented = false;

        eve.preventDefault = function () {
          prevented = true;
        };
        /* Let widgets prevent default */


        _this.router.emit('linkClick', eve);

        if (!prevented) {
          originalPreventDefault.apply(eve);

          if (isLocal) {
            _this.router.navigate(e.target.href);
          }
        }
        /* Else the link will just navigate like a normal link */

      });
    }
  }, {
    key: "unmount",
    value: function unmount() {
      this.onClick();
    }
  }]);

  return Link;
}();

var Router = /*#__PURE__*/function (_Subject) {
  inherits(Router, _Subject);

  function Router() {
    var _this2;

    classCallCheck(this, Router);

    _this2 = possibleConstructorReturn(this, getPrototypeOf(Router).call(this));
    /* Debugging */

    defineProperty(assertThisInitialized(_this2), "runtime", {
      routlets: [],
      links: []
    });

    defineProperty(assertThisInitialized(_this2), "container", void 0);

    defineProperty(assertThisInitialized(_this2), "started", false);

    defineProperty(assertThisInitialized(_this2), "links", new Map());

    defineProperty(assertThisInitialized(_this2), "loader", new Subject());

    defineProperty(assertThisInitialized(_this2), "options", void 0);

    if (__DEV__) {
      var _loop = function _loop(_ref) {
        _ref2 = slicedToArray(_ref, 2);
        var key = _ref2[0];
        var value = _ref2[1];

        if (typeof value === 'function') {
          if (key !== 'start') {
            _this2[key] = function () {
              if (!_this2.started) {
                throw new Error("You must call \".start()\" on a router before calling any of it's methods");
              }

              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              value.apply(assertThisInitialized(_this2), args);
            };
          }
        }
      };

      for (var _ref in Object.entries(assertThisInitialized(_this2))) {
        var _ref2;

        _loop(_ref);
      }
    }

    return _this2;
  }

  createClass(Router, [{
    key: "start",
    value: function start() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$ga = _ref3.ga,
          ga = _ref3$ga === void 0 ? {} : _ref3$ga;

      /* Always bound to document.body */
      this.container = document.body;
      this.started = false;
      this.options = {
        ga: ga
      };
      window.router = this;
      this.handleLinks(this.container);
    }
    /* 
      Transforms link clicks into router navigations
    */

  }, {
    key: "handleLinks",
    value: function handleLinks() {
      var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.container;
      var links = container.querySelectorAll('a[href]');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = links[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var el = _step.value;

          /* Don't rebind links that have already been bound */
          if (this.links.get(el)) continue;
          var link = new Link(el, this);
          this.links.set(el, link);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    /* Probably should provide some filters here */

  }, {
    key: "navigate",
    value: function () {
      var _navigate = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(href) {
        var options,
            _ref4,
            state,
            url,
            isLocal,
            canNavigate,
            canNavigateAway,
            _args = arguments;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
                _ref4 = options || {}, state = _ref4.state;
                url = toURL(href);
                isLocal = isLocalLink(url);
                _context.next = 6;
                return this.asyncReduce('beforeNavigate', true, url);

              case 6:
                canNavigate = _context.sent;

                if (!canNavigate) {
                  _context.next = 16;
                  break;
                }

                if (!isLocal) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt("return", this.changeContent(url));

              case 12:
                _context.next = 14;
                return this.asyncReduce('beforeNavigateAway', true, url);

              case 14:
                canNavigateAway = _context.sent;

                if (canNavigateAway) {
                  /* Cause the browser to go to the different page */
                  location.href = url.href;
                }

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function navigate(_x) {
        return _navigate.apply(this, arguments);
      }

      return navigate;
    }()
  }, {
    key: "scrollTo",
    value: function scrollTo(y) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      window.scrollTo(x, y);
    }
  }, {
    key: "toHash",
    value: function toHash(hashString) {
      var _window;

      var shouldScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var hash = hashString.indexOf('#') === 0 ? hashString : '#' + hashString;
      var beginning = [window.scrollX, window.scrollY];
      window.location.hash = hash;
      var target = [window.scrollX, window.scrollY];

      (_window = window).scrollTo.apply(_window, beginning);
      /* If you need to trigger a reflow uncomment this */

      /* document.body.offsetLeft */


      if (shouldScroll) {
        window.scrollTo({
          left: target[0],
          top: target[1],
          behavior: 'smooth'
        });
      }
    }
    /*
    Has to be called in the page change animation
    */

  }, {
    key: "restoreScroll",
    value: function restoreScroll() {}
  }, {
    key: "reduceHTML",
    value: function () {
      var _reduceHTML = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(htmlString) {
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.asyncReduce('prepareHTML', htmlString));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function reduceHTML(_x2) {
        return _reduceHTML.apply(this, arguments);
      }

      return reduceHTML;
    }()
  }, {
    key: "preparePage",
    value: function () {
      var _preparePage = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(htmlString) {
        var html, doc;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.reduceHTML(htmlString);

              case 2:
                html = _context3.sent;
                doc = document.createElement('html'); // @ts-ignore

                doc.innerHTML = html;
                return _context3.abrupt("return", this.asyncReduce('prepareDOM', doc));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function preparePage(_x3) {
        return _preparePage.apply(this, arguments);
      }

      return preparePage;
    }()
  }, {
    key: "getOutlets",
    value: function getOutlets() {
      var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.container;
      return el.querySelectorAll("router-outlet");
    }
  }, {
    key: "updateOutlets",
    value: function updateOutlets(current, next) {
      var prevOutlets = this.getOutlets(current);
      var nextOutlets = this.getOutlets(next);
      prevOutlets.forEach(function (node) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = node.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;
            child.dataset['routerRemove'] = 'true';
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      });
      return {
        add: function add() {
          return asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4() {
            return regenerator.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    nextOutlets.forEach(function (outlet, i) {
                      var _prevOutlets$i;

                      (_prevOutlets$i = prevOutlets[i]).append.apply(_prevOutlets$i, toConsumableArray(outlet.children));
                    });

                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }))();
        },
        remove: function remove() {
          return asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
            return regenerator.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    prevOutlets.forEach(function (outlet) {
                      outlet.querySelectorAll("[data-router-remove]").forEach(function (el) {
                        Widgets.unmount(el);
                        el.remove();
                      });
                    });

                  case 1:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }))();
        }
      };
    }
  }, {
    key: "updateHead",
    value: function updateHead(current, next) {
      var head = current.querySelector('head');
      var nextHead = next.querySelector('head');
      console.log(next);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = nextHead.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          switch (node.nodeType) {
            case 'script':
              {
                if (node) {}
              }

            case 'title':
              {
                var titleTag = head.querySelector('title');
                titleTag.text = node.text;
              }

            case 'meta':
              {
                var name = node.getAttribute('name');
                var content = node.getAttribute('content');
                var el = head.querySelector("meta[name=".concat(name, "]"));

                if (!el) {
                  head.appendChild(node);
                  return;
                }

                if (el.getAttribute('content') !== content) {
                  el.setAttribute('content', content);
                }
              }
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } // updateBody(current, next) {
    //   const body = document.body
    //   const nextBody = nextDomNode.querySelector('body') as HTMLBodyElement
    // }

  }, {
    key: "changeContent",
    value: function () {
      var _changeContent = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee8(url) {

        var response, htmlString, nextDocument, outlets;
        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                this.loader.emit('start');
                _context8.next = 3;
                return fetch(url.href);

              case 3:
                response = _context8.sent;
                this.loader.emit('loadedPage');
                _context8.next = 7;
                return response.text();

              case 7:
                htmlString = _context8.sent;
                _context8.next = 10;
                return this.preparePage(htmlString);

              case 10:
                nextDocument = _context8.sent;
                outlets = this.updateOutlets(this.container, Site.container(nextDocument));
                // Widgets.init(nextDomNode)
                // this.loader.emit('initedWidgets')
                // const loadingPromises: Promise<any>[] = []
                // Widgets.preload()
                // this.loader.emit('widgetsPreLoading')
                // this.loader.emit('progress')
                // this.loader.emit('end')


              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function changeContent(_x4) {
        return _changeContent.apply(this, arguments);
      }

      return changeContent;
    }()
  }, {
    key: "swap",
    value: function () {
      var _swap = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee9(previous, next, adder, remover, scroll, container) {
        return regenerator.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                next.style.opacity = '0';
                /* 
                Adds the next page to the dom
                And initializes all the widgets
                */

                next.style.opacity = '0';
                next.style.position = 'absolute';
                _context9.next = 5;
                return adder();

              case 5:
                _context9.next = 7;
                return watch(previous.animate({
                  opacity: [1, 0]
                }));

              case 7:
                _context9.next = 9;
                return remover();

              case 9:
                _context9.next = 11;
                return scroll();

              case 11:
                _context9.next = 13;
                return watch(next.animate({
                  opacity: [0, 1]
                }));

              case 13:
                next.style.position = '';
                next.style.opacity = '';
                /* When this function returns it calls all the transitionIn callbacks */

              case 15:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function swap(_x5, _x6, _x7, _x8, _x9, _x10) {
        return _swap.apply(this, arguments);
      }

      return swap;
    }()
  }], [{
    key: "isOutlet",
    value: function isOutlet(el) {
      return el.matches("router-outlet");
    }
  }]);

  return Router;
}(Subject);

function watch(animation) {
  return new Promise(function (resolve, reject) {
    var onCancelled = on(animation, 'cancel', function () {
      reject();
      onCancelled();
      onFinished();
    });
    var onFinished = on(animation, 'finish', function () {
      resolve();
      onCancelled();
      onFinished();
    });
  });
}

var router = new Router();

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

var superPropBase = _superPropBase;

var get = createCommonjsModule(function (module) {
function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

module.exports = _get;
});

function parseDataset(element) {
  var result = {};
  var keys = Object.keys(element.dataset);

  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    var key = _keys[_i];

    try {
      result[key] = JSON.parse(element.dataset[key]);
    } catch (e) {
      result[key] = element.dataset[key];
    }
  }

  return result;
}

var WidgetType = /*#__PURE__*/function () {
  /* Help identify widgets */

  /* 
  Bunch of functions to call on unmount
  */
  function WidgetType(element) {
    classCallCheck(this, WidgetType);

    defineProperty(this, "element", void 0);

    defineProperty(this, "isCurrentlyMounted", false);

    defineProperty(this, "data", void 0);

    defineProperty(this, IS_WIDGET, true);

    defineProperty(this, "disposables", new Set());

    defineProperty(this, "preload", void 0);

    defineProperty(this, "transitionIn", void 0);

    defineProperty(this, "transitionOut", void 0);

    defineProperty(this, "canPageChange", void 0);

    this.element = element;
    this.bind = this.bind.bind(this);
    this.bind.apply(this);
    this.data = {};

    if (this.element.dataset) {
      this.data = parseDataset(this.element);
    }
  }
  /* Mount is called at the end of initialization */

  /* The super method will always be called before the actual method */


  createClass(WidgetType, [{
    key: "mount",
    value: function mount() {
      this.isCurrentlyMounted = true;
      console.log('super mount');
    }
  }, {
    key: "unmount",
    value: function unmount() {
      this.isCurrentlyMounted = false;
      this.disposables.forEach(function (fn) {
        return fn();
      });
    }
    /* 
    Preload is called after initializing but before mounting 
    if you return an object of promises the result will be mixed into your class
    eg. 
    preload: () => ({ THREE: import('three'), swiper: import('swiper') })
    -> this.THREE and this.swiper
    */

  }, {
    key: "on",
    value: function on$1(element, event, callback) {
      if (typeof element === 'string') {
        return this.dispose(on(this.element, element, event));
      } else {
        return this.dispose(on(element, event, callback));
      }
    }
  }, {
    key: "dispose",
    value: function dispose(fn) {
      var _this = this;

      var off = function off() {
        fn();

        _this.disposables["delete"](off);
      };

      this.disposables.add(off);
      return off;
    }
  }, {
    key: "bind",
    value: function bind() {
      if (this.preload) {
        this.preload = this.preload.bind(this);
      }

      if (this.mount) {
        this.mount = this.mount.bind(this);
      }

      if (this.unmount) {
        this.unmount = this.unmount.bind(this);
      }

      if (this.init) {
        this.init = this.init.bind(this);
      }

      if (this.on) {
        this.on = this.on.bind(this);
      }

      if (this.transitionIn) {
        this.transitionIn = this.transitionIn.bind(this);
      }

      if (this.transitionOut) {
        this.transitionOut = this.transitionOut.bind(this);
      }

      if (this.canPageChange) {
        this.canPageChange = this.canPageChange.bind(this);
      }
    }
  }, {
    key: "context",
    get: function get() {
      return Widgets.getFiberForElement(this.element).context;
    }
    /* 
    Anything bound with this.on will be automatically
    removed when the element is unmout
    */

  }]);

  return WidgetType;
}();

defineProperty(WidgetType, IS_WIDGET, true);
/* Used solely in the below union time */


var WithType = function WithType() {
  classCallCheck(this, WithType);

  defineProperty(this, "type", void 0);
};

defineProperty(WithType, "type", void 0);

export { router as Router, Site, Widgets };
