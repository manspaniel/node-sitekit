var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global_1 =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var descriptors = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

var objectPropertyIsEnumerable = {
	f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$1 = global_1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
	f: f$1
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var path = {};

var aFunction = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var objectDefineProperty = {
	f: f$2
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






var wrapConstructor = function (NativeConstructor) {
  var Wrapper = function (a, b, c) {
    if (this instanceof NativeConstructor) {
      switch (arguments.length) {
        case 0: return new NativeConstructor();
        case 1: return new NativeConstructor(a);
        case 2: return new NativeConstructor(a, b);
      } return new NativeConstructor(a, b, c);
    } return NativeConstructor.apply(this, arguments);
  };
  Wrapper.prototype = NativeConstructor.prototype;
  return Wrapper;
};

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;

  var nativeSource = GLOBAL ? global_1 : STATIC ? global_1[TARGET] : (global_1[TARGET] || {}).prototype;

  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
  var targetPrototype = target.prototype;

  var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
  var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

  for (key in source) {
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contains in native
    USE_NATIVE = !FORCED && nativeSource && has(nativeSource, key);

    targetProperty = target[key];

    if (USE_NATIVE) if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(nativeSource, key);
      nativeProperty = descriptor && descriptor.value;
    } else nativeProperty = nativeSource[key];

    // export native or implementation
    sourceProperty = (USE_NATIVE && nativeProperty) ? nativeProperty : source[key];

    if (USE_NATIVE && typeof targetProperty === typeof sourceProperty) continue;

    // bind timers to global for call from export context
    if (options.bind && USE_NATIVE) resultProperty = functionBindContext(sourceProperty, global_1);
    // wrap global constructors for prevent changs in this version
    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
    // make static versions for prototype methods
    else if (PROTO && typeof sourceProperty == 'function') resultProperty = functionBindContext(Function.call, sourceProperty);
    // default case
    else resultProperty = sourceProperty;

    // add a flag to not completely full polyfills
    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(resultProperty, 'sham', true);
    }

    target[key] = resultProperty;

    if (PROTO) {
      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!has(path, VIRTUAL_PROTOTYPE)) {
        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
      }
      // export virtual prototype methods
      path[VIRTUAL_PROTOTYPE][key] = sourceProperty;
      // export real prototype methods
      if (options.real && targetPrototype && !targetPrototype[key]) {
        createNonEnumerableProperty(targetPrototype, key, sourceProperty);
      }
    }
  }
};

var slice = [].slice;
var factories = {};

var construct = function (C, argsLength, args) {
  if (!(argsLength in factories)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
var functionBind = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = slice.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};

// `Function.prototype.bind` method
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
_export({ target: 'Function', proto: true }, {
  bind: functionBind
});

var entryVirtual = function (CONSTRUCTOR) {
  return path[CONSTRUCTOR + 'Prototype'];
};

var bind = entryVirtual('Function').bind;

var FunctionPrototype = Function.prototype;

var bind_1 = function (it) {
  var own = it.bind;
  return it === FunctionPrototype || (it instanceof Function && own === FunctionPrototype.bind) ? bind : own;
};

var bind$1 = bind_1;

var bind$2 = bind$1;

var iterators = {};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  } return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});

var sharedStore = store;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;

var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

var isPure = true;

var shared = createCommonjsModule(function (module) {
(module.exports = function (key, value) {
  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.4',
  mode:  'pure' ,
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (nativeWeakMap) {
  var store$1 = new WeakMap$1();
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;
  set = function (it, metadata) {
    wmset.call(store$1, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store$1, it) || {};
  };
  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };
  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor
};

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object(requireObjectCoercible(argument));
};

var correctPrototypeGetter = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var useSymbolAsUid = nativeSymbol
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

var WellKnownSymbolsStore = shared('wks');
var Symbol$1 = global_1.Symbol;
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;


var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
  return O;
};

var aFunction$1 = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global_1[namespace])
    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var html = getBuiltIn('document', 'documentElement');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : objectDefineProperties(result, Properties);
};

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
var objectToString = toStringTagSupport ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

var defineProperty = objectDefineProperty.f;





var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var setToStringTag = function (it, TAG, STATIC, SET_METHOD) {
  if (it) {
    var target = STATIC ? it : it.prototype;
    if (!has(target, TO_STRING_TAG$2)) {
      defineProperty(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
    }
    if (SET_METHOD && !toStringTagSupport) {
      createNonEnumerableProperty(target, 'toString', objectToString);
    }
  }
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





var returnThis = function () { return this; };

var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

var aPossiblePrototype = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var redefine = function (target, key, value, options) {
  if (options && options.enumerable) target[key] = value;
  else createNonEnumerableProperty(target, key, value);
};

var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$1 = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis$1 = function () { return this; };

var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$1]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      iterators[TO_STRING_TAG] = returnThis$1;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if (( FORCED) && IterablePrototype[ITERATOR$1] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
  }
  iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
iterators.Arguments = iterators.Array;

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');

for (var COLLECTION_NAME in domIterables) {
  var Collection = global_1[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype && classof(CollectionPrototype) !== TO_STRING_TAG$3) {
    createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
  }
  iterators[COLLECTION_NAME] = iterators.Array;
}

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$1 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$1(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$1(true)
};

var charAt = stringMultibyte.charAt;



var STRING_ITERATOR = 'String Iterator';
var setInternalState$1 = internalState.set;
var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$1(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$1(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var ITERATOR$2 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || iterators[classof(it)];
};

var getIterator = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject(iteratorMethod.call(it));
};

var getIterator_1 = getIterator;

var getIterator$1 = getIterator_1;

var getIteratorMethod_1 = getIteratorMethod;

var getIteratorMethod$1 = getIteratorMethod_1;

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
var isArray = Array.isArray || function isArray(arg) {
  return classofRaw(arg) == 'Array';
};

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

var process = global_1.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (engineUserAgent) {
  match = engineUserAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = engineUserAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var engineV8Version = version && +version;

var SPECIES$1 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
_export({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
	f: f$3
};

var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;

var toString$1 = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var f$4 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames(toIndexedObject(it));
};

var objectGetOwnPropertyNamesExternal = {
	f: f$4
};

var f$5 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
	f: f$5
};

var f$6 = wellKnownSymbol;

var wellKnownSymbolWrapped = {
	f: f$6
};

var defineProperty$1 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) defineProperty$1(Symbol, NAME, {
    value: wellKnownSymbolWrapped.f(NAME)
  });
};

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod$2 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var boundFunction = functionBindContext(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$2(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod$2(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod$2(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod$2(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod$2(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod$2(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$2(6)
};

var $forEach = arrayIteration.forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var setInternalState$2 = internalState.set;
var getInternalState$2 = internalState.getterFor(SYMBOL);
var ObjectPrototype$1 = Object[PROTOTYPE$1];
var $Symbol = global_1.Symbol;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var nativeDefineProperty$1 = objectDefineProperty.f;
var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore$1 = shared('wks');
var QObject = global_1.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = descriptors && fails(function () {
  return objectCreate(nativeDefineProperty$1({}, 'a', {
    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$1, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype$1[P];
  nativeDefineProperty$1(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$1) {
    nativeDefineProperty$1(ObjectPrototype$1, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty$1;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
  setInternalState$2(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!descriptors) symbol.description = description;
  return symbol;
};

var isSymbol = useSymbolAsUid ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$1) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPrimitive(P, true);
  anObject(Attributes);
  if (has(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive(V, true);
  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
  if (this === ObjectPrototype$1 && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPrimitive(P, true);
  if (it === ObjectPrototype$1 && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$1;
  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype$1, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.github.io/ecma262/#sec-symbol-constructor
if (!nativeSymbol) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype$1) setter.call(ObjectPrototypeSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$1, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
    return getInternalState$2(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
  objectDefineProperty.f = $defineProperty;
  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

  wellKnownSymbolWrapped.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (descriptors) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$2(this).description;
      }
    });
  }
}

_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
  defineWellKnownSymbol(name);
});

_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
  // `Symbol.for` method
  // https://tc39.github.io/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
  // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return objectGetOwnPropertySymbols.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.github.io/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol('asyncIterator');

// `Symbol.hasInstance` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol('hasInstance');

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol('isConcatSpreadable');

// `Symbol.iterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

// `Symbol.match` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.match
defineWellKnownSymbol('match');

// `Symbol.matchAll` well-known symbol
defineWellKnownSymbol('matchAll');

// `Symbol.replace` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.replace
defineWellKnownSymbol('replace');

// `Symbol.search` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.search
defineWellKnownSymbol('search');

// `Symbol.species` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.species
defineWellKnownSymbol('species');

// `Symbol.split` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.split
defineWellKnownSymbol('split');

// `Symbol.toPrimitive` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol('toPrimitive');

// `Symbol.toStringTag` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol('toStringTag');

// `Symbol.unscopables` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol('unscopables');

// Math[@@toStringTag] property
// https://tc39.github.io/ecma262/#sec-math-@@tostringtag
setToStringTag(Math, 'Math', true);

// JSON[@@toStringTag] property
// https://tc39.github.io/ecma262/#sec-json-@@tostringtag
setToStringTag(global_1.JSON, 'JSON', true);

var symbol = path.Symbol;

var symbol$1 = symbol;

var symbol$2 = symbol$1;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};

var ITERATOR$3 = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR$3] === it);
};

// `Array.from` method implementation
// https://tc39.github.io/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var ITERATOR$4 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$4] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$4] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: arrayFrom
});

var from_1 = path.Array.from;

var from_1$1 = from_1;

var from_1$2 = from_1$1;

var nativeConstruct = getBuiltIn('Reflect', 'construct');

// `Reflect.construct` method
// https://tc39.github.io/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails(function () {
  nativeConstruct(function () { /* empty */ });
});
var FORCED$1 = NEW_TARGET_BUG || ARGS_BUG;

_export({ target: 'Reflect', stat: true, forced: FORCED$1, sham: FORCED$1 }, {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (functionBind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = objectCreate(isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});

var construct$1 = path.Reflect.construct;

var construct$2 = construct$1;

var construct$3 = construct$2;

var $stringify$1 = getBuiltIn('JSON', 'stringify');
var re = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var fix = function (match, offset, string) {
  var prev = string.charAt(offset - 1);
  var next = string.charAt(offset + 1);
  if ((low.test(match) && !hi.test(next)) || (hi.test(match) && !low.test(prev))) {
    return '\\u' + match.charCodeAt(0).toString(16);
  } return match;
};

var FORCED$2 = fails(function () {
  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify$1('\uDEAD') !== '"\\udead"';
});

if ($stringify$1) {
  // https://github.com/tc39/proposal-well-formed-stringify
  _export({ target: 'JSON', stat: true, forced: FORCED$2 }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var result = $stringify$1.apply(null, arguments);
      return typeof result == 'string' ? result.replace(re, fix) : result;
    }
  });
}

if (!path.JSON) path.JSON = { stringify: JSON.stringify };

// eslint-disable-next-line no-unused-vars
var stringify = function stringify(it, replacer, space) {
  return path.JSON.stringify.apply(null, arguments);
};

var stringify$1 = stringify;

var stringify$2 = stringify$1;

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

var nativePromiseConstructor = global_1.Promise;

var redefineAll = function (target, src, options) {
  for (var key in src) {
    if (options && options.unsafe && target[key]) target[key] = src[key];
    else redefine(target, key, src[key], options);
  } return target;
};

var SPECIES$2 = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = objectDefineProperty.f;

  if (descriptors && Constructor && !Constructor[SPECIES$2]) {
    defineProperty(Constructor, SPECIES$2, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var anInstance = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};

var iterate_1 = createCommonjsModule(function (module) {
var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
  var iterator, iterFn, index, length, result, next, step;

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = AS_ENTRIES
          ? boundFunction(anObject(step = iterable[index])[0], step[1])
          : boundFunction(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

iterate.stop = function (result) {
  return new Result(true, result);
};
});

var SPECIES$3 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction(S);
};

var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

var location$1 = global_1.location;
var set$1 = global_1.setImmediate;
var clear = global_1.clearImmediate;
var process$1 = global_1.process;
var MessageChannel = global_1.MessageChannel;
var Dispatch = global_1.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global_1.postMessage(id + '', location$1.protocol + '//' + location$1.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (classofRaw(process$1) == 'process') {
    defer = function (id) {
      process$1.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !engineIsIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = functionBindContext(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global_1.addEventListener &&
    typeof postMessage == 'function' &&
    !global_1.importScripts &&
    !fails(post) &&
    location$1.protocol !== 'file:'
  ) {
    defer = post;
    global_1.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task = {
  set: set$1,
  clear: clear
};

var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

var macrotask = task.set;


var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
var process$2 = global_1.process;
var Promise$1 = global_1.Promise;
var IS_NODE = classofRaw(process$2) == 'process';
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (IS_NODE) {
    notify = function () {
      process$2.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  } else if (MutationObserver && !engineIsIos) {
    toggle = true;
    node = document.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    then = promise.then;
    notify = function () {
      then.call(promise, flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global_1, flush);
    };
  }
}

var microtask = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
var f$7 = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
	f: f$7
};

var promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var hostReportErrors = function (a, b) {
  var console = global_1.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var task$1 = task.set;










var SPECIES$4 = wellKnownSymbol('species');
var PROMISE = 'Promise';
var getInternalState$3 = internalState.get;
var setInternalState$3 = internalState.set;
var getInternalPromiseState = internalState.getterFor(PROMISE);
var PromiseConstructor = nativePromiseConstructor;
var TypeError$1 = global_1.TypeError;
var document$2 = global_1.document;
var process$3 = global_1.process;
var $fetch = getBuiltIn('fetch');
var newPromiseCapability$1 = newPromiseCapability.f;
var newGenericPromiseCapability = newPromiseCapability$1;
var IS_NODE$1 = classofRaw(process$3) == 'process';
var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper;

var FORCED$3 = isForced_1(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (engineV8Version === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
  }
  // We need Promise#finally in the pure version for preventing prototype pollution
  if ( !PromiseConstructor.prototype['finally']) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$4] = FakePromise;
  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
});

var INCORRECT_ITERATION$1 = FORCED$3 || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify$1 = function (promise, state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(promise, state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$2.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global_1.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (handler = global_1['on' + name]) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (promise, state) {
  task$1.call(global_1, function () {
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (IS_NODE$1) {
          process$3.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (promise, state) {
  task$1.call(global_1, function () {
    if (IS_NODE$1) {
      process$3.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$3 = function (fn, promise, state, unwrap) {
  return function (value) {
    fn(promise, state, value, unwrap);
  };
};

var internalReject = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify$1(promise, state, true);
};

var internalResolve = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
            bind$3(internalResolve, promise, wrapper, state),
            bind$3(internalReject, promise, wrapper, state)
          );
        } catch (error) {
          internalReject(promise, wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify$1(promise, state, false);
    }
  } catch (error) {
    internalReject(promise, { done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED$3) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromiseConstructor, PROMISE);
    aFunction(executor);
    Internal.call(this);
    var state = getInternalState$3(this);
    try {
      executor(bind$3(internalResolve, this, state), bind$3(internalReject, this, state));
    } catch (error) {
      internalReject(this, state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState$3(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify$1(this, state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState$3(promise);
    this.promise = promise;
    this.resolve = bind$3(internalResolve, promise, state);
    this.reject = bind$3(internalReject, promise, state);
  };
  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

_export({ global: true, wrap: true, forced: FORCED$3 }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false, true);
setSpecies(PROMISE);

PromiseWrapper = getBuiltIn(PROMISE);

// statics
_export({ target: PROMISE, stat: true, forced: FORCED$3 }, {
  // `Promise.reject` method
  // https://tc39.github.io/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability$1(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

_export({ target: PROMISE, stat: true, forced: isPure  }, {
  // `Promise.resolve` method
  // https://tc39.github.io/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve( this === PromiseWrapper ? PromiseConstructor : this, x);
  }
});

_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
  // `Promise.all` method
  // https://tc39.github.io/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate_1(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.github.io/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      iterate_1(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// `Promise.allSettled` method
// https://github.com/tc39/proposal-promise-allSettled
_export({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var promiseResolve = aFunction(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate_1(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'fulfilled', value: value };
          --remaining || resolve(values);
        }, function (e) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'rejected', reason: e };
          --remaining || resolve(values);
        });
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!nativePromiseConstructor && fails(function () {
  nativePromiseConstructor.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.github.io/ecma262/#sec-promise.prototype.finally
_export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor(this, getBuiltIn('Promise'));
    var isFunction = typeof onFinally == 'function';
    return this.then(
      isFunction ? function (x) {
        return promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  }
});

var promise$1 = path.Promise;

var setInternalState$4 = internalState.set;
var getInternalAggregateErrorState = internalState.getterFor('AggregateError');

var $AggregateError = function AggregateError(errors, message) {
  var that = this;
  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message);
  if (objectSetPrototypeOf) {
    that = objectSetPrototypeOf(new Error(message), objectGetPrototypeOf(that));
  }
  var errorsArray = [];
  iterate_1(errors, errorsArray.push, errorsArray);
  if (descriptors) setInternalState$4(that, { errors: errorsArray, type: 'AggregateError' });
  else that.errors = errorsArray;
  if (message !== undefined) createNonEnumerableProperty(that, 'message', String(message));
  return that;
};

$AggregateError.prototype = objectCreate(Error.prototype, {
  constructor: createPropertyDescriptor(5, $AggregateError),
  message: createPropertyDescriptor(5, ''),
  name: createPropertyDescriptor(5, 'AggregateError')
});

if (descriptors) objectDefineProperty.f($AggregateError.prototype, 'errors', {
  get: function () {
    return getInternalAggregateErrorState(this).errors;
  },
  configurable: true
});

_export({ global: true }, {
  AggregateError: $AggregateError
});

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
_export({ target: 'Promise', stat: true }, {
  'try': function (callbackfn) {
    var promiseCapability = newPromiseCapability.f(this);
    var result = perform(callbackfn);
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://github.com/tc39/proposal-promise-any
_export({ target: 'Promise', stat: true }, {
  any: function any(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var promiseResolve = aFunction(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate_1(iterable, function (promise) {
        var index = counter++;
        var alreadyRejected = false;
        errors.push(undefined);
        remaining++;
        promiseResolve.call(C, promise).then(function (value) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyResolved = true;
          resolve(value);
        }, function (e) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyRejected = true;
          errors[index] = e;
          --remaining || reject(new (getBuiltIn('AggregateError'))(errors, PROMISE_ANY_ERROR));
        });
      });
      --remaining || reject(new (getBuiltIn('AggregateError'))(errors, PROMISE_ANY_ERROR));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// TODO: Remove from `core-js@4`




var promise$2 = promise$1;

var promise$3 = promise$2;

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
    promise$3.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new promise$3(function (resolve, reject) {
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

var values = entryVirtual('Array').values;

var values$1 = values;

var ArrayPrototype$1 = Array.prototype;

var DOMIterables = {
  DOMTokenList: true,
  NodeList: true
};

var values_1 = function (it) {
  var own = it.values;
  return it === ArrayPrototype$1 || (it instanceof Array && own === ArrayPrototype$1.values)
    // eslint-disable-next-line no-prototype-builtins
    || DOMIterables.hasOwnProperty(classof(it)) ? values$1 : own;
};

var values$2 = values_1;

var defineProperty$2 = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

var arrayMethodUsesToLength = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !descriptors) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty$2(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
var USES_TO_LENGTH = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES$5 = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES$5];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var slice$1 = entryVirtual('Array').slice;

var ArrayPrototype$2 = Array.prototype;

var slice_1 = function (it) {
  var own = it.slice;
  return it === ArrayPrototype$2 || (it instanceof Array && own === ArrayPrototype$2.slice) ? slice$1 : own;
};

var slice$2 = slice_1;

var slice$3 = slice$2;

// `Array.isArray` method
// https://tc39.github.io/ecma262/#sec-array.isarray
_export({ target: 'Array', stat: true }, {
  isArray: isArray
});

var isArray$1 = path.Array.isArray;

var isArray$2 = isArray$1;

var isArray$3 = isArray$2;

var $includes = arrayIncludes.includes;



var USES_TO_LENGTH$1 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
_export({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$1 }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var includes = entryVirtual('Array').includes;

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
};

var notARegexp = function (it) {
  if (isRegexp(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};

var MATCH$1 = wellKnownSymbol('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (e) {
    try {
      regexp[MATCH$1] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (f) { /* empty */ }
  } return false;
};

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~String(requireObjectCoercible(this))
      .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
  }
});

var includes$1 = entryVirtual('String').includes;

var ArrayPrototype$3 = Array.prototype;
var StringPrototype = String.prototype;

var includes$2 = function (it) {
  var own = it.includes;
  if (it === ArrayPrototype$3 || (it instanceof Array && own === ArrayPrototype$3.includes)) return includes;
  if (typeof it === 'string' || it === StringPrototype || (it instanceof String && own === StringPrototype.includes)) {
    return includes$1;
  } return own;
};

var includes$3 = includes$2;

var includes$4 = includes$3;

var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return objectKeys(toObject(it));
  }
});

var keys$1 = path.Object.keys;

var keys$2 = keys$1;

var keys$3 = keys$2;

var $filter = arrayIteration.filter;



var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('filter');
// Edge 14- issue
var USES_TO_LENGTH$2 = arrayMethodUsesToLength('filter');

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$2 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var filter = entryVirtual('Array').filter;

var ArrayPrototype$4 = Array.prototype;

var filter_1 = function (it) {
  var own = it.filter;
  return it === ArrayPrototype$4 || (it instanceof Array && own === ArrayPrototype$4.filter) ? filter : own;
};

var filter$1 = filter_1;

var filter$2 = filter$1;

var $map = arrayIteration.map;



var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('map');
// FF49- issue
var USES_TO_LENGTH$3 = arrayMethodUsesToLength('map');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$3 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var map = entryVirtual('Array').map;

var ArrayPrototype$5 = Array.prototype;

var map_1 = function (it) {
  var own = it.map;
  return it === ArrayPrototype$5 || (it instanceof Array && own === ArrayPrototype$5.map) ? map : own;
};

var map$1 = map_1;

var map$2 = map$1;

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var $forEach$1 = arrayIteration.forEach;



var STRICT_METHOD = arrayMethodIsStrict('forEach');
var USES_TO_LENGTH$4 = arrayMethodUsesToLength('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH$4) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
  forEach: arrayForEach
});

var forEach = entryVirtual('Array').forEach;

var forEach$1 = forEach;

var ArrayPrototype$6 = Array.prototype;

var DOMIterables$1 = {
  DOMTokenList: true,
  NodeList: true
};

var forEach_1 = function (it) {
  var own = it.forEach;
  return it === ArrayPrototype$6 || (it instanceof Array && own === ArrayPrototype$6.forEach)
    // eslint-disable-next-line no-prototype-builtins
    || DOMIterables$1.hasOwnProperty(classof(it)) ? forEach$1 : own;
};

var forEach$2 = forEach_1;

var $find = arrayIteration.find;



var FIND = 'find';
var SKIPS_HOLES = true;

var USES_TO_LENGTH$5 = arrayMethodUsesToLength(FIND);

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.github.io/ecma262/#sec-array.prototype.find
_export({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$5 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var find = entryVirtual('Array').find;

var ArrayPrototype$7 = Array.prototype;

var find_1 = function (it) {
  var own = it.find;
  return it === ArrayPrototype$7 || (it instanceof Array && own === ArrayPrototype$7.find) ? find : own;
};

var find$1 = find_1;

var find$2 = find$1;

var $indexOf = arrayIncludes.indexOf;



var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD$1 = arrayMethodIsStrict('indexOf');
var USES_TO_LENGTH$6 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$1 || !USES_TO_LENGTH$6 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var indexOf$1 = entryVirtual('Array').indexOf;

var ArrayPrototype$8 = Array.prototype;

var indexOf_1 = function (it) {
  var own = it.indexOf;
  return it === ArrayPrototype$8 || (it instanceof Array && own === ArrayPrototype$8.indexOf) ? indexOf$1 : own;
};

var indexOf$2 = indexOf_1;

var indexOf$3 = indexOf$2;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
_export({ target: 'Object', stat: true, forced: !descriptors, sham: !descriptors }, {
  defineProperty: objectDefineProperty.f
});

var defineProperty_1 = createCommonjsModule(function (module) {
var Object = path.Object;

var defineProperty = module.exports = function defineProperty(it, key, desc) {
  return Object.defineProperty(it, key, desc);
};

if (Object.defineProperty.sham) defineProperty.sham = true;
});

var defineProperty$3 = defineProperty_1;

var defineProperty$4 = defineProperty$3;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;

    defineProperty$4(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var assertThisInitialized = _assertThisInitialized;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
_export({ target: 'Object', stat: true, sham: !descriptors }, {
  create: objectCreate
});

var Object$1 = path.Object;

var create = function create(P, D) {
  return Object$1.create(P, D);
};

var create$1 = create;

var create$2 = create$1;

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
_export({ target: 'Object', stat: true }, {
  setPrototypeOf: objectSetPrototypeOf
});

var setPrototypeOf = path.Object.setPrototypeOf;

var setPrototypeOf$1 = setPrototypeOf;

var setPrototypeOf$2 = setPrototypeOf$1;

var setPrototypeOf$3 = createCommonjsModule(function (module) {
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = setPrototypeOf$2 || function _setPrototypeOf(o, p) {
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

  subClass.prototype = create$2(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf$3(subClass, superClass);
}

var inherits = _inherits;

var iterator = wellKnownSymbolWrapped.f('iterator');

var iterator$1 = iterator;

var iterator$2 = iterator$1;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol('asyncDispose');

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol('dispose');

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol('observable');

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol('patternMatch');

// TODO: remove from `core-js@4`


defineWellKnownSymbol('replaceAll');

// TODO: Remove from `core-js@4`


var symbol$3 = symbol;

var symbol$4 = symbol$3;

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof symbol$4 === "function" && typeof iterator$2 === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof symbol$4 === "function" && obj.constructor === symbol$4 && obj !== symbol$4.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

var possibleConstructorReturn = _possibleConstructorReturn;

var FAILS_ON_PRIMITIVES$1 = fails(function () { objectGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !correctPrototypeGetter }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return objectGetPrototypeOf(toObject(it));
  }
});

var getPrototypeOf = path.Object.getPrototypeOf;

var getPrototypeOf$1 = getPrototypeOf;

var getPrototypeOf$2 = getPrototypeOf$1;

var getPrototypeOf$3 = createCommonjsModule(function (module) {
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = setPrototypeOf$2 ? getPrototypeOf$2 : function _getPrototypeOf(o) {
    return o.__proto__ || getPrototypeOf$2(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
});

function _defineProperty(obj, key, value) {
  if (key in obj) {
    defineProperty$4(obj, key, {
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

var defineProperty$5 = _defineProperty;

var slice$4 = [].slice;
var MSIE = /MSIE .\./.test(engineUserAgent); // <- dirty ie9- check

var wrap$1 = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice$4.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
_export({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap$1(global_1.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap$1(global_1.setInterval)
});

var setTimeout$1 = path.setTimeout;

var setTimeout$2 = setTimeout$1;

var promise$4 = promise$1;

var promise$5 = promise$4;

var concat = entryVirtual('Array').concat;

var ArrayPrototype$9 = Array.prototype;

var concat_1 = function (it) {
  var own = it.concat;
  return it === ArrayPrototype$9 || (it instanceof Array && own === ArrayPrototype$9.concat) ? concat : own;
};

var concat$1 = concat_1;

var concat$2 = concat$1;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$3 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction(callbackfn);
    var O = toObject(that);
    var self = indexedObject(O);
    var length = toLength(O.length);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
  left: createMethod$3(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
  right: createMethod$3(true)
};

var $reduce = arrayReduce.left;



var STRICT_METHOD$2 = arrayMethodIsStrict('reduce');
var USES_TO_LENGTH$7 = arrayMethodUsesToLength('reduce', { 1: 0 });

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || !USES_TO_LENGTH$7 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var reduce = entryVirtual('Array').reduce;

var ArrayPrototype$a = Array.prototype;

var reduce_1 = function (it) {
  var own = it.reduce;
  return it === ArrayPrototype$a || (it instanceof Array && own === ArrayPrototype$a.reduce) ? reduce : own;
};

var reduce$1 = reduce_1;

var reduce$2 = reduce$1;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof symbol$2 === "undefined" || getIteratorMethod$1(o) == null) { if (isArray$3(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = getIterator$1(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { var _context28; if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = slice$3(_context28 = Object.prototype.toString.call(o)).call(_context28, 8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return from_1$2(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf$3(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf$3(this).constructor; result = construct$3(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !construct$3) return false; if (construct$3.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(construct$3(Date, [], function () {})); return true; } catch (e) { return false; } }

var jQuery = function () {
  var oldjQuery = window.jQuery;
  var old$ = window.$;

  var jQuery = window.jQuery = window.$ = require('jquery.transit');

  require('jquery-ui/ui/version');

  require('jquery-ui/ui/keycode');

  require('jquery-ui/ui/widget');

  window.jQuery = oldjQuery;
  window.$ = old$;
  return jQuery;
}();

var $ = jQuery;

var EventEmitter = require('events').EventEmitter;

var flatten = function flatten(arr) {
  var _context, _context2;

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return reduce$2(_context = concat$2(_context2 = []).call(_context2, arr, args)).call(_context, function (res, obj) {
    return clone(res, obj);
  }, {});
};

var clone = function clone() {
  var _context3;

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return $.extend.apply($, concat$2(_context3 = [{}]).call(_context3, args));
};

function wait(t) {
  return new promise$5(function (resolve) {
    return setTimeout$2(resolve, t);
  });
}

var SiteInstance = /*#__PURE__*/function (_EventEmitter) {
  inherits(SiteInstance, _EventEmitter);

  var _super = _createSuper(SiteInstance);

  function SiteInstance() {
    var _context4, _context5, _context6, _context7;

    var _this;

    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';

    classCallCheck(this, SiteInstance);

    _this = _super.call(this);

    if (SiteInstance.apps[name]) {
      throw Error("Site ".concat(name, " already exists"));
    }

    SiteInstance.apps[name] = assertThisInitialized(_this);
    _this.EVENTS = {
      LOADED: 'loaded',
      READY: 'ready',
      AFTER_WIDGETS_INIT: 'afterWidgetsInit',
      XHR_LOAD_START: 'xhrLoadStart',
      XHR_TRANSITIONING_OUT: 'xhrTransitioningOut',
      XHR_LOAD_MIDDLE: 'xhrLoadMiddle',
      XHR_LOAD_END: 'xhrLoadEnd',
      XHR_WILL_TRANSITION: 'xhrWillTransition',
      XHR_WILL_TRANSITION_OUT: 'xhrWillTransitionOut',
      XHR_WILL_SWAP_CONTENT: 'xhrWillSwapContent',
      XHR_WILL_TRANSITION_WIDGETS_IN: 'xhrWillTransitionWidgetsIn',
      XHR_WILL_SCROLL_TO_PREV_POSITION: 'xhrWillScrollToPrevPosition',
      XHR_PAGE_CHANGED: 'xhrPageChanged',
      XHR_LOADING_START: 'xhrLoadingStart',
      XHR_LOADING_STOP: 'xhrLoadingStop',
      XHR_POP_STATE: 'xhrPopState',
      XHR_LINK_CLICK: 'xhrLinkClick'
    };
    var size = 40;

    var style = concat$2(_context4 = concat$2(_context5 = concat$2(_context6 = concat$2(_context7 = "\n\t\t\tfont-size: 1px;\n\t\t\tline-height:".concat(size * 0.5, "px;padding:")).call(_context7, size * 0.25, "px ")).call(_context6, size * 0.5, "px;\n\t\t\tbackground-size: ")).call(_context5, size, "px ")).call(_context4, size * 0.75, "px;\n\t\t\tbackground-image: url(\"data:image/svg+xml;charset=UTF-8,%3csvg class='header-logo' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 84 45' enable-background='new 0 0 84 45' xml:space='preserve'%3e%3cstyle%3e %23ED_Logo%7btransition: transform 0.3s;%7d %23ED_Logo:hover%7btransform: scale(1.1);%7d %3c/style%3e%3cg id='ED_Logo'%3e%3cg%3e%3cpath d='M11.4,34.4h19.2V45H0V0h30.6v10.6H11.4v6.6h18.8v10.7H11.4V34.4z'%3e%3c/path%3e%3cpath d='M51.1,0c15.3,0,23,11.3,23,22.6c0,11.2-7.7,22.4-23,22.4H33.6V0H51.1z M51.1,34.5c7.8,0,11.8-6,11.8-12 c0-5.9-4-12.2-11.8-12.2h-6.2v24.1C44.9,34.5,48.2,34.5,51.1,34.5z'%3e%3c/path%3e%3cpath d='M84,39.3c0,2.8-2.6,5.7-6.2,5.7c-3.3,0-6-2.9-6-5.7c0-3.4,2.7-5.7,6-5.7C81.4,33.6,84,35.9,84,39.3z'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/svg%3e\");\n\t\t\tbackground-repeat:no-repeat;\n\t\t\tbackground-position:center;\n    ");

    console.log('%c ', style, '\nSite by ED.\nhttps://ed.com.au');
    _this.$ = jQuery;
    _this.preloadedImages = [];
    _this.pageCache = {};
    _this.preloadedPages = {};
    _this.pagePreloadQueue = [];
    _this.isPreloadingPages = false;
    _this.XHRRequestCounter = 0;
    _this.xhrOptions = {
      scrollAnimation: {
        duration: 220
      },
      xhrEnabled: true,
      loadImages: true,
      autoScrollRestore: true,
      imageLoadTimeout: 3000,
      widgetTransitionDelay: 0,
      cachePages: true,
      swapBodyClasses: function swapBodyClasses(newClasses) {
        return new promise$5(function (resolve) {
          setTimeout$2(function () {
            document.body.className = newClasses;
            resolve();
          }, (_this.xhrOptions.widgetTransitionDelay || 500) / 2);
        });
      },
      swapContent: function swapContent(container, originalContent, newContent, direction) {
        var duration = _this.xhrOptions.widgetTransitionDelay || 500; // Fade out old content

        originalContent.fadeOut({
          duration: duration / 2,
          complete: function complete() {
            // Not forgetting to remove the old content
            originalContent.remove(); // Fade in new content

            newContent.css({
              display: 'block',
              opacity: 0
            }).animate({
              opacity: 1
            }, {
              duration: duration / 2
            });
          }
        });
        return duration + 500;
      },
      filterBodyClasses: function filterBodyClasses(oldClasses, newClasses) {
        return newClasses;
      }
    }; // Init dev mode

    _this.initLiveReload();

    _this.components = {}; // Wait for DOM load

    jQuery(function () {
      return _this.domReady();
    });
    return _this;
  }

  createClass(SiteInstance, [{
    key: "domReady",
    value: function domReady() {
      var _this2 = this;

      if (this._domReadyCalled) return;
      this._domReadyCalled = true;
      this.pageState = $('pagestate:last').data('state');
      this.initWidgets();
      this.initXHRPageSystem();
      this.preloadWidgets($(document.body), function () {
        _this2.emit(_this2.EVENTS.LOADED);
      });
      this.transitionWidgetsIn($(document.body), this.pageState, {
        initial: true
      }, function () {});
      this.emit(this.EVENTS.READY);
    }
  }, {
    key: "initLiveReload",
    value: function initLiveReload() {
      return;
    }
  }, {
    key: "setGlobalState",
    value: function setGlobalState(state, reset) {
      for (var k in this.components) {
        var component = this.components[k];

        if (component && component.setState) {
          if (k in state || reset !== false) {
            component.setState(state[k] || {});
          }
        }
      }
    }
  }, {
    key: "findWidgets",
    value: function findWidgets(name, el) {
      var result = [];
      var widgets = $('[data-widget]', el || document.body).each(function (k, el) {
        var widgetNames = $.data(el, 'widgetNames');

        if (widgetNames && indexOf$3(widgetNames).call(widgetNames, name) != -1) {
          var instance = $(el)[name]('instance');
          result.push(instance);
        }
      });
      return result;
    }
  }, {
    key: "findWidget",
    value: function findWidget(name, el) {
      var widgets = this.findWidgets(name, el);

      if (widgets && widgets.length) {
        return widgets[0];
      } else {
        return null;
      }
    }
  }, {
    key: "getAllWidgets",
    value: function getAllWidgets(el) {
      var result = [];
      var widgets = $('[data-widget]', el || document.body);
      if (el) widgets = widgets.add(el);
      widgets.each(function (k, el) {
        var widgetNames = $.data(el, 'widgetNames');

        for (var _k in widgetNames) {
          var instance = $(el)[widgetNames[_k]]('instance');

          if (instance) {
            result.push(instance);
          }
        }
      });
      return result;
    }
  }, {
    key: "triggerAllWidgets",
    value: function triggerAllWidgets(methodName) {
      var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var widgets = this.getAllWidgets(target);

      for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      for (var k in widgets) {
        var widget = widgets[k];

        if (widget && methodName in widget) {
          widget[methodName].apply(widget, args);
        }
      }
    }
  }, {
    key: "getWidgetDefs",
    value: function getWidgetDefs(el) {
      el = $(el);
      var widgets = (el.attr('data-widget') || el.attr('data-widgets')).split(/\,\s*/g);
      var isInitialized = el.data('hasBeenInitialized');

      for (var k in widgets) {
        var widgetInfo = widgets[k].split('#');
        widgets[k] = {
          name: widgetInfo[0],
          identifier: widgetInfo[1],
          instance: isInitialized ? el[widgetInfo[0]]('instance') : null
        };
      }

      return widgets;
    }
  }, {
    key: "initWidgets",
    value: function initWidgets(targetEl) {
      var _this3 = this;

      targetEl = $(targetEl || document.body);
      var instances = []; // Look for uninitialized widgets

      find$2(targetEl).call(targetEl, '[data-widget]').each(function (k, thisEl) {
        // Grab the element and data
        var el = $(thisEl);
        var data = el.data(); // Only initialize once

        if (data.hasBeenInitialized) return; // Prepare options

        var options = {};

        for (var _k2 in data) {
          if (_k2[0] !== '_') {
            options[_k2] = data[_k2];
          }
        }

        var widgets = _this3.getWidgetDefs(el);

        var widgetNames = [];

        for (var i = 0; i < widgets.length; i++) {
          var widget = widgets[i];
          widgetNames.push(widget.name); // Throw an error if that widget doesn't exist

          if (widget.name in $.fn === false) {
            if (data.widgetOptional === true) {
              return;
            } else {
              console.error("Could not initialize widget '" + widget.name + "', as no widget with this name has been declared.");
              return;
            }
          } // Spawn the widget, and grab it's instance


          try {
            el[widget.name](options);
            var instance = el[widget.name]('instance');
            instances.push(instance); // Save it to the components object

            if (widget.identifier) {
              _this3.components[widget.identifier] = instance;
            }
          } catch (err) {
            _this3.reportError("Error initializing widget '".concat(widget.name, "'"), err);

            console.error(err);
          }
        } // Mark as initialized


        el.data('hasBeenInitialized', true);
        $.data(thisEl, 'widgetNames', widgetNames);
      });

      for (var _i = 0, _instances = instances; _i < _instances.length; _i++) {
        var inst = _instances[_i];

        if (inst._ready) {
          inst._ready();
        }
      }

      this.emit(this.EVENTS.AFTER_WIDGETS_INIT);
    }
  }, {
    key: "reportError",
    value: function reportError() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      for (var _i2 = 0, _args = args; _i2 < _args.length; _i2++) {
        var arg = _args[_i2];
        console.error(arg);
      }
    }
  }, {
    key: "propsToSave",
    value: function propsToSave() {
      return ['_create', '_destroy', '_transitionIn', '_transitionOut'];
    }
  }, {
    key: "saveWidgetProps",
    value: function saveWidgetProps(self, mixins, name) {
      var _context8;

      return reduce$2(_context8 = this.propsToSave()).call(_context8, function (result, key) {
        // Replaces the protected prop with a function that sequentially calls
        // the protected prop on all extensions
        result[key] = function () {
          var _this4 = this;

          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          if (typeof self[key] === 'function') self[key].apply(this, args);

          forEach$2(mixins).call(mixins, function (mixin) {
            if (typeof mixin[key] === 'function') {
              mixin[key].apply(_this4, args);
            }
          });
        };

        return result;
      }, {});
    }
  }, {
    key: "prepWidgetExtensions",
    value: function prepWidgetExtensions(name, def) {
      var _this5 = this;

      var mixins = def.use;
      var meta = [];

      var mixeds = map$2(mixins).call(mixins, function (mixin) {
        meta.push({
          name: mixin.name
        });
        return mixin(_this5, _this5.$, name, clone(def));
      }); // Warn of overwritten props


      forEach$2(mixeds).call(mixeds, function (mix, curr) {
        var _context9, _context10;

        forEach$2(_context9 = filter$2(_context10 = keys$3(mix)).call(_context10, function (k) {
          var _context11;

          return !includes$4(_context11 = _this5.propsToSave()).call(_context11, k);
        })).call(_context9, function (k) {
          var _context13, _context14;

          if (def[k]) {
            var _context12;

            console.warn(concat$2(_context12 = "The prop ".concat(k, " will be overwritten by extension ")).call(_context12, mixins[curr].name || curr));
          } // only check mixins below this current one


          forEach$2(_context13 = filter$2(_context14 = map$2(mixeds).call(mixeds, function (mixed, i) {
            return {
              mix: mixed,
              name: meta[i].name
            };
          })).call(_context14, function (_, i) {
            return i < curr;
          })).call(_context13, function (mixed, i) {
            if (mixed.mix[k]) {
              var _context15, _context16;

              console.warn(concat$2(_context15 = concat$2(_context16 = "The prop ".concat(k, " from extension ")).call(_context16, mixed.name || i, " will be overwritten by extension ")).call(_context15, mixins[curr].name || curr));
            }
          });
        });
      });

      var saved = this.saveWidgetProps(def, mixeds, name);
      return clone(def, flatten(mixeds, saved));
    }
  }, {
    key: "widget",
    value: function widget(name, def, explicitBase) {
      var finalDef = def; // widget.use is an array we will treat it as an array of extensions

      if (def.use) {
        if (isArray$3(def.use)) {
          finalDef = this.prepWidgetExtensions(name, def);
        } else {
          console.warn("The ".concat(name, " widget has property 'use' but it is not an array."));
        }
      }

      if (indexOf$3(name).call(name, '.') === -1) {
        name = 'ui.' + name;
      }

      $.widget(name, $.extend({}, baseWidget, explicitBase || {}, finalDef));
    }
  }, {
    key: "preloadImages",
    value: function preloadImages(srcs, timeout, callback) {
      var _this6 = this;

      var images = [];
      var callbackCalled = false;

      var triggerCallback = function triggerCallback() {
        if (!callbackCalled) {
          callbackCalled = true;
          if (callback) callback();
        }
      };

      if (srcs.length === 0) {
        triggerCallback();
        return;
      }

      var loaded = function loaded(img) {
        images.push(img);

        _this6.preloadedImages.push(img[0]);

        if (images.length == srcs.length) {
          triggerCallback();
        }
      };

      if (timeout !== false) {
        setTimeout$2(function () {
          triggerCallback();
        }, timeout);
      }

      var preloadItem = function preloadItem(src) {
        var img = $('<img>');
        var hasLoaded = false;
        img.on('load', function () {
          if (!hasLoaded) {
            loaded(img);
          }
        });
        img[0].src = src;

        if (img[0].width || img[0].naturalWidth) {
          if (!hasLoaded) {
            hasLoaded = true;
            loaded(img);
          }
        }
      };

      map$2(srcs).call(srcs, preloadItem);
    }
    /*
    Preloads images from the specified elements, with an optional timeout.
    Callback will be triggered when their all elements have loaded, or when the timeout (in milliseconds) is reached.
    Set timeout to false for no timeout.
    	eg.
    	Site.preloadContent(els, 5000, callback)
    	Site.preloadContent(els, false, callback)
    */

  }, {
    key: "preloadContent",
    value: function preloadContent(els, timeout, callback) {
      var images = [];
      $(els).each(function (k, el) {
        var self = $(el); // Get images from 'style' attribute of div elements only

        find$2(self).call(self, '[style], .preload').each(function (k, el) {
          var backgroundImage = $(el).css('backgroundImage');

          if (backgroundImage) {
            var match = backgroundImage.match(/url\((.+)\)/);

            if (match) {
              var src = match[1].replace(/(^[\'\"]|[\'\"]$)/g, '');
              images.push(src);
            }
          }
        }); // Get 'src' attributes from images


        find$2(self).call(self, 'img').each(function (k, el) {
          images.push(el.src);
        });
      });
      this.preloadImages(images, timeout, callback);
    }
  }, {
    key: "getURLPath",
    value: function getURLPath(input) {
      var match = input.match(/:\/\/[^\/]+([^#?]*)/);

      if (match) {
        return match[1].replace(/\/$/, '');
      } else {
        return '';
      }
    }
  }, {
    key: "resizeToFit",
    value: function resizeToFit(width, height, viewportWidth, viewportHeight, cover) {
      var result = {};

      if (cover && width / height > viewportWidth / viewportHeight || !cover && width / height < viewportWidth / viewportHeight) {
        result.width = viewportHeight * width / height;
        result.height = viewportHeight;
      } else {
        result.width = viewportWidth;
        result.height = viewportWidth * height / width;
      }

      result.top = viewportHeight / 2 - result.height / 2;
      result.left = viewportWidth / 2 - result.width / 2;
      return result;
    }
  }, {
    key: "forceResizeWindow",
    value: function forceResizeWindow() {
      window.resizeTo(window.outerWidth, window.outerHeight);
    }
  }, {
    key: "preloadPages",
    value: function preloadPages() {
      var _this7 = this;

      if (this.isPreloadingPages) return;
      this.isPreloadingPages = true;

      var loadNext = function loadNext() {
        var _context17;

        // Filter out pre-preloaded urls
        _this7.pagePreloadQueue = filter$2(_context17 = _this7.pagePreloadQueue).call(_context17, function (url) {
          return _this7.preloadedPages[url] ? false : true;
        });

        if (_this7.pagePreloadQueue.length === 0) {
          _this7.isPreloadingPages = false;
        } else {
          var url = _this7.pagePreloadQueue.shift();

          _this7.getContent(url, function () {
            setTimeout$2(loadNext);
          }, true);
        }
      };

      loadNext();
    }
  }, {
    key: "getRefreshes",
    value: function getRefreshes(target) {
      var itemsToRefresh = find$2(target).call(target, '[data-xhr-refresh]').addBack('[data-xhr-refresh]').not('[data-page-container] [data-xhr-refresh]').get();

      var items = filter$2(itemsToRefresh).call(itemsToRefresh, function (el) {
        var id = $(el).attr('id'); // Warn

        if (!id) {
          console.warn('Refreshed item', el, 'is missing an id attribute. Include one to refresh the element on page change');
          return false;
        }

        return true;
      });

      return items;
    }
  }, {
    key: "doRefreshes",
    value: function doRefreshes(result) {
      var _context18,
          _context19,
          _this8 = this;

      var $page = this.XHRPageContainer.parent().children().not('[data-page-container]');
      var swapping = [];
      var leaving = [];
      var entering = [];

      var removeAttributes = function removeAttributes(el) {
        var attr = slice$3(Array.prototype).call(el.prop('attributes'));

        forEach$2(attr).call(attr, function (attr) {
          el.removeAttr(attr.name);
        });
      };

      var copyAttributes = function copyAttributes(from, to) {
        var attr = slice$3(Array.prototype).call(from.prop('attributes'));

        forEach$2(attr).call(attr, function (attr) {
          to.attr(attr.name, from.attr(attr.name));
        });
      };

      forEach$2(_context18 = this.getRefreshes($page)).call(_context18, function (item) {
        var $item = $(item);
        var id = $item.attr('id');
        var oldKey = $item.attr('data-xhr-refresh');

        var newRefresh = find$2(result).call(result, "#".concat(id, "[data-xhr-refresh]")).addBack("#".concat(id, "[data-xhr-refresh]")); // This item isn't in the new dom


        if (!newRefresh.length) {
          leaving.push(item);
        } // Diff the item


        var newKey = newRefresh.attr('data-xhr-refresh'); // Invalidated by key. Completely refresh that thing!
        // (If it's the same we will probably leave it 😀)

        if (newKey !== oldKey) {
          swapping.push([item, newRefresh.get(0)]);
        }
      });

      forEach$2(_context19 = this.getRefreshes(result)).call(_context19, function (item) {
        if (find$2(swapping).call(swapping, function (swapped) {
          return swapped[1] === item;
        })) {
          // Already swapping this item... ignore
          return;
        }

        entering.push(item);
      });

      var returnVal = {
        swapping: {
          items: swapping,
          swap: function swap() {
            return new promise$5(function (resolve) {
              forEach$2(swapping).call(swapping, function (item) {
                var $item1 = $(item[0]);
                var $item2 = $(item[1]);
                $item1.html($($item2).html());
                removeAttributes($item1);
                copyAttributes($item2, $item1);

                _this8.initWidgets($item1.parent());

                _this8.handleXHRLinks($item1.parent());
              });

              resolve();
            });
          }
        },
        leaving: {
          items: leaving,
          $items: $(leaving)
        },
        entering: {
          items: entering,
          $items: $(entering)
        }
      };
      return returnVal;
    }
  }, {
    key: "restoreScroll",
    value: function restoreScroll(fn) {
      var _history = history,
          state = _history.state;

      if (state && typeof state.scrollY === 'number' && !state.dontAutoScroll) {
        this.emit(this.EVENTS.XHR_WILL_SCROLL_TO_PREV_POSITION);

        if (typeof fn === 'function') {
          return new promise$5(function (resolve) {
            return resolve(fn(state));
          });
        } else {
          return new promise$5(function (resolve) {
            window.scrollTo(0, state.scrollY);
            resolve(true);
          });
        }
      } else {
        return new promise$5(function (resolve) {
          return resolve(false);
        });
      }
    }
  }, {
    key: "getContent",
    value: function getContent(url, callback, isPreload) {
      var _this9 = this;

      url = url.replace(/\#.+/, '');

      if (indexOf$3(url).call(url, '?') == -1) {
        url += '?xhr-page=true';
      } else {
        url += '&xhr-page=true';
      } // Mark as preloaded (even if it's not). It won't appear in pageCache until it's been completely loaded. This is just to prevent the page from being preloaded more than once.


      if (isPreload && this.preloadedPages[url]) {
        callback();
        return;
      }

      this.preloadedPages[url] = true;

      if (this.xhrOptions.cachePages && this.pageCache[url]) {
        callback(this.pageCache[url]);
      } else {
        $.ajax({
          url: url,
          async: true,
          global: !isPreload,
          success: function success(response, textStatus) {
            callback(response, textStatus, null);

            if (response && _this9.xhrOptions.cachePages) {
              _this9.pageCache[url] = response;
            }
          },
          error: function error(jqXHR, textStatus, _error) {
            callback(jqXHR.responseText, textStatus, _error);
          }
        });
      }
    }
  }, {
    key: "goToURL",
    value: function goToURL(url, dontPush) {
      var _this10 = this;

      var originalURL = url;
      var requestID = ++this.XHRRequestCounter;
      this.lastURL = url; // See if any widgets want to intercept this request instead

      var allWidgets = this.getAllWidgets();
      var urlPath = url.replace(/\#.+$/, '').match(/:\/\/[^\/]+(.*)/);

      for (var k in allWidgets) {
        var widget = allWidgets[k];

        if (widget && widget.xhrPageWillLoad) {
          var result = widget.xhrPageWillLoad(urlPath, url, dontPush ? 'back' : 'forward');

          if (result === false) {
            history.pushState({}, null, originalURL);

            if (window.ga) {
              // Inform Google Analytics
              ga('send', {
                hitType: 'pageview',
                page: location.pathname
              });
            }

            return;
          }
        }
      }

      var scrollToSave = this.generateReplaceState();

      if (this.xhrOptions.scrollAnimation) {
        var htmlBody = $('html,body').stop(true).animate({
          scrollTop: 0
        }, this.xhrOptions.scrollAnimation).one('scroll', function () {
          htmlBody.stop(true);
        });
      }

      this.emit(this.EVENTS.XHR_LOAD_START, dontPush);
      this.getContent(originalURL, function (response, textStatus) {
        if (requestID !== _this10.XHRRequestCounter) {
          // Looks like another request was made after this one, so ignore the response.
          return;
        }

        _this10.emit(_this10.EVENTS.XHR_TRANSITIONING_OUT); // Alter the response to keep the body tag


        response = response.replace(/(<\/?)body([^a-z])/g, '$1bodyfake$2');
        response = response.replace(/(<\/?)head([^a-z])/g, '$1headfake$2'); // Convert the text response to DOM structure

        var result = $('<div>' + response + '</div>'); // Pull out the contents

        var foundPageContainer = find$2(result).call(result, '.xhr-page-contents, [data-page-container]').first();

        if (foundPageContainer.length === 0) {
          // Could not find a page container element :/ just link to the page
          window.location.href = originalURL;
          console.error('Could not find an element with a `data-page-container` attribute within the fetched XHR page response. Sending user directly to the page.');
          return;
        } // Grab content


        var newContent = $("<div class='xhr-page-contents'></div>").append(foundPageContainer.children());

        _this10.emit(_this10.EVENTS.XHR_LOAD_MIDDLE);

        var finalize = function finalize() {
          var _context20, _context21, _context22, _context23;

          _this10.emit(_this10.EVENTS.XHR_LOAD_END); // Grab the page title


          var title = find$2(result).call(result, 'title').html(); // Grab any resources


          var includes = find$2(_context20 = find$2(result).call(result, 'headfake')).call(_context20, 'script, link[rel=stylesheet]'); // Grab the body class


          var bodyClass = find$2(result).call(result, 'bodyfake').attr('class');

          bodyClass = _this10.xhrOptions.filterBodyClasses(document.body.className, bodyClass);
          var oldPageState = _this10.pageState;
          _this10.pageState = find$2(_context21 = result.add(newContent)).call(_context21, 'pagestate:last').data('state'); // Look for gravity forms scripts in the footer
          // result.find("script").each((k, el) => {
          //   if(!el.getAttribute('src') && el.innerHTML.indexOf("var gf_global")) {
          //
          //   }
          // })
          // Set page title

          $('head title').html(title);

          _this10.xhrOptions.swapBodyClasses(bodyClass + ' xhr-transitioning-out');

          var existingScripts = find$2(_context22 = $(document.head)).call(_context22, 'script');

          var existingStylesheets = find$2(_context23 = $(document.head)).call(_context23, 'link[rel=stylesheet]'); // Swap menus out


          var swapMenus = function swapMenus() {
            find$2(result).call(result, 'ul.menu').each(function (k, item) {
              if (item.parentNode.parentNode.getAttribute('data-swap-classes')) {
                // Just swap classes for each li
                var id = item.getAttribute('id');
                if (!id) return; // var el = $('#'+id.replace(/\-[0-9]+/, ''))

                var el = $('#' + id);

                var existingItems = find$2(el).call(el, 'li');

                if (existingItems.length) {
                  var _context24;

                  find$2(_context24 = $(item)).call(_context24, 'li').each(function (k, li) {
                    existingItems[k].className = li.className;
                  });
                }
              } else {
                // Swap the entire contents (default behaviour)
                var id = item.getAttribute('id');
                if (!id) return; // var el = $('#'+id.replace(/\-[0-9]+/, ''))

                var el = $('#' + id).html(item.innerHTML);

                _this10.handleXHRLinks(el);
              }
            });
          }; // Swap WP 'Edit Post' link


          var editButton = find$2(result).call(result, '#wp-admin-bar-edit');

          if (editButton.length) {
            $('#wp-admin-bar-edit').html(editButton.html());
          } // Apply any missing scripts


          includes.each(function (i, el) {
            if ($(el).parents('[data-page-container]').length) return;

            if (el.tagName == 'SCRIPT') {
              var scriptSrc = el.src.replace(/\?.*$/, '');
              var includeScript = true;
              existingScripts.each(function (k, el) {
                var elSrc = el.src.replace(/\?.*$/, '');

                if (scriptSrc == elSrc) {
                  includeScript = false;
                }
              });

              if (includeScript) {
                $(el).appendTo(document.head);
              }
            } else if (el.tagName == 'LINK') {
              var linkHref = el.href.replace(/\?.*$/, '');
              var includeStyles = true;
              existingStylesheets.each(function (k, el) {
                var elHref = el.href.replace(/\?.*$/, '');

                if (linkHref == elHref) {
                  includeStyles = false;
                }
              });

              if (includeStyles) {
                $(el).appendTo(document.head);
              }
            }
          }); // Grab old content, by wrapping it in a span

          var oldContent = _this10.XHRPageContainer.children('.xhr-page-contents');

          if (oldContent.length === 0) {
            _this10.XHRPageContainer.wrapInner("<span class='xhr-page-contents'></span>");

            oldContent = _this10.XHRPageContainer.children().first();
          }

          var refreshes = _this10.doRefreshes(result); // Add new content to the page


          try {
            _this10.XHRPageContainer.append(newContent);
          } catch (e) {}

          newContent.hide(); // Apply to history

          if (!dontPush) {
            // Replace the last state just before move on
            history.replaceState(clone(history.state, scrollToSave), null); // Move on

            history.pushState({}, title, originalURL);

            if (window.ga) {
              // Inform Google Analytics
              var trackerName = '';

              try {
                trackerName = values$2(ga.getAll()[0].a.data)[':name'];
              } catch (err) {}

              ga(trackerName ? trackername + '.send' : 'send', {
                hitType: 'pageview',
                page: location.pathname
              });
            }
          }

          _this10.emit(_this10.EVENTS.XHR_WILL_TRANSITION); // Destroy existing widgets


          var steps = [function (next) {
            _this10.initWidgets(newContent);

            promise$5.race([new promise$5(function (resolve) {
              return _this10.preloadWidgets(newContent, resolve);
            }), new promise$5(function (resolve) {
              return setTimeout$2(resolve, 6000);
            })]).then(next);
          }, function (next) {
            _this10.transitionWidgetsOut(oldContent, oldPageState, _this10.pageState, true, next);
          }, /*#__PURE__*/function () {
            var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(next) {
              var delayOrPromise;
              return regenerator.wrap(function _callee$(_context25) {
                while (1) {
                  switch (_context25.prev = _context25.next) {
                    case 0:
                      // Set up links and widgets
                      swapMenus();
                      newContent.show();

                      _this10.forceResizeWindow();

                      _this10.handleXHRLinks(newContent);

                      newContent.hide(); // Perform the swap!

                      _this10.emit(_this10.EVENTS.XHR_WILL_SWAP_CONTENT);

                      delayOrPromise = _this10.xhrOptions.widgetTransitionDelay;
                      delayOrPromise = _this10.xhrOptions.swapContent(_this10.XHRPageContainer, oldContent, newContent, dontPush ? 'back' : 'forward', // NEW: Everything after newContent is now in an Object
                      {
                        refreshes: refreshes,
                        toPage: _this10.pageState,
                        fromPage: oldPageState
                      });

                      if (!(typeof delayOrPromise === 'number')) {
                        _context25.next = 13;
                        break;
                      }

                      _context25.next = 11;
                      return wait(delayOrPromise);

                    case 11:
                      _context25.next = 15;
                      break;

                    case 13:
                      _context25.next = 15;
                      return delayOrPromise;

                    case 15:
                      next();

                    case 16:
                    case "end":
                      return _context25.stop();
                  }
                }
              }, _callee);
            }));

            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }(), function (next) {
            _this10.emit(_this10.EVENTS.XHR_WILL_TRANSITION_WIDGETS_IN);

            if (_this10.xhrOptions.autoScrollRestore) _this10.restoreScroll();

            _this10.transitionWidgetsIn(newContent, _this10.pageState, oldPageState, next);
          }];
          var stepIndex = 0;

          var next = function next() {
            if (stepIndex < steps.length) {
              steps[stepIndex++](next);
            } else {
              _this10.emit(_this10.EVENTS.XHR_PAGE_CHANGED);
            }
          };

          next();
        };

        if (_this10.xhrOptions.loadImages) {
          _this10.preloadContent(newContent, _this10.xhrOptions.imageLoadTimeout, finalize);
        } else {
          finalize();
        }
      });
    }
  }, {
    key: "preloadWidgets",
    value: function preloadWidgets(targetEl, callback) {
      var _context26, _context27;

      var promises = map$2(_context26 = filter$2(_context27 = this.getAllWidgets(targetEl)).call(_context27, function (widget) {
        return widget._preloadWidget;
      })).call(_context26, function (widget) {
        // Create a 'promise to load'
        widget.__promiseToLoad = new promise$5(function (resolve) {
          try {
            widget._preloadWidget(function () {
              resolve();
            });
          } catch (err) {
            resolve();
            console.error(err);
          }
        });
        return widget.__promiseToLoad;
      });

      promise$5.all(promises).then(callback)["catch"](function (err) {
        return callback();
      });
    }
  }, {
    key: "generateReplaceState",
    value: function generateReplaceState(s) {
      if ('scrollRestoration' in history && history.scrollRestoration !== 'manual') {
        history.scrollRestoration = 'manual';
      }

      var t = {
        scrollY: window.scrollY || window.pageYOffset || document.documentElement.scrollTop,
        scrollX: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft
      }; // console.log(s, t)

      return t;
    }
  }, {
    key: "transitionWidgetsIn",
    value: function transitionWidgetsIn(targetEl, newState, oldState, callback) {
      var _this11 = this;

      var foundTransition = false;
      var finalDelay = 0;

      find$2(targetEl).call(targetEl, '[data-widget]').each(function (index, el) {
        el = $(el);

        var widgets = _this11.getWidgetDefs(el);

        for (var k in widgets) {
          if (widgets[k].instance && widgets[k].instance._transitionIn) {
            var delay;

            (function () {
              var widget = widgets[k].instance;

              if (widget.__promiseToLoad) {
                widget.__promiseToLoad.then(function () {
                  widget._transitionIn(newState, oldState, _this11.xhrOptions.widgetTransitionDelay);
                });
              } else {
                delay = widget._transitionIn(newState, oldState, _this11.xhrOptions.widgetTransitionDelay);
                foundTransition = true;
                finalDelay = Math.max(delay, finalDelay);
              }
            })();
          }
        }
      });

      if (foundTransition && finalDelay) {
        setTimeout$2(callback, finalDelay);
      } else if (foundTransition && !finalDelay) {
        setTimeout$2(callback, this.xhrOptions.widgetTransitionDelay);
      } else {
        callback();
      }
    }
  }, {
    key: "transitionWidgetsOut",
    value: function transitionWidgetsOut(targetEl, newState, oldState, destroy, callback) {
      var foundTransition = false;
      var finalDelay = 0;
      var widgets = this.getAllWidgets(targetEl);

      var _iterator = _createForOfIteratorHelper(widgets),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var widget = _step.value;
          foundTransition = true;

          if (widget._transitionOut) {
            var delay = widget._transitionOut(newState, oldState, this.xhrOptions.widgetTransitionDelay);

            finalDelay = Math.max(delay, finalDelay);

            if (destroy) {
              widget.destroy();
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (foundTransition && finalDelay) {
        setTimeout$2(callback, finalDelay);
      } else if (foundTransition && !finalDelay) {
        setTimeout$2(callback, this.xhrOptions.widgetTransitionDelay);
      } else {
        callback();
      }
    }
  }, {
    key: "wrapXHRInner",
    value: function wrapXHRInner() {
      var target = this.XHRPageContainer;
      var wrapper = $("<span class='xhr-page-contents'></span>");
      wrapper.appendTo(target).append(target.children());
    }
  }, {
    key: "initXHRPageSystem",
    value: function initXHRPageSystem() {
      var _this12 = this;

      if (!this.xhrOptions.xhrEnabled) return; // Grab the page container, if one exists

      this.XHRPageContainer = $('[data-page-container]:first');

      if (this.XHRPageContainer.length === 0) {
        this.XHRPageContainer = null;
        return;
      } // Add event listeners to jQuery which will add/remove the 'xhr-loading' class


      $(document).ajaxStart(function () {
        $(document.body).addClass('xhr-loading');

        _this12.emit(_this12.EVENTS.XHR_LOADING_START);
      }).ajaxStop(function () {
        $(document.body).removeClass('xhr-loading');

        _this12.emit(_this12.EVENTS.XHR_LOADING_STOP);
      }); // Add event listeners to links where appropriate

      this.handleXHRLinks();

      if (history.replaceState) {
        history.replaceState(window.history.state, window.title, window.location.href);
      } // Handle browser back button


      window.addEventListener('popstate', function (e) {
        if (e.state) {
          var wasDefaultPrevented = false;

          e.preventDefault = function () {
            wasDefaultPrevented = true;
          };

          _this12.emit(_this12.EVENTS.XHR_POP_STATE, e);

          if (!wasDefaultPrevented) {
            _this12.goToURL(window.location.href, true);
          }
        }
      });
    }
  }, {
    key: "handleXHRLinks",
    value: function handleXHRLinks(targetEl) {
      var _this13 = this;

      targetEl = $(targetEl || document.body);
      var baseURL = window.location.origin;

      find$2(targetEl).call(targetEl, 'a').each(function (index, el) {
        var linkEl = $(el);
        if (linkEl.data('prevent-xhr') || linkEl.data('xhr-event-added')) return;
        if (linkEl.attr('target')) return;
        if (linkEl.parents('#wpadminbar').length || linkEl.parents('[data-prevent-xhr]').length) return; // Ensure the URL is usable

        var url = el.href;

        if (indexOf$3(url).call(url, baseURL) !== 0) {
          // Link is not on this site
          return;
        }

        if (url.match(/(wp-admin|wp-login)/g)) {
          // A bit too wordpressy
          return;
        }

        if (url.match(/\.[a-z]$/i) || url.match(/(mailto|tel):/i)) {
          // Link is a file
          return;
        }

        if (url.match(/\#/)) {
          // link contains a hashbang
          return;
        }

        if (_this13.xhrOptions.cachePages) {
          if (!linkEl.data('no-preload') && linkEl.parents('[data-no-preload]').length === 0) {
            _this13.pagePreloadQueue.push(el.href);

            _this13.preloadPages();
          }
        }

        linkEl.click(function (e) {
          if (!e.metaKey && !e.ctrlKey) {
            _this13.emit(_this13.EVENTS.XHR_LINK_CLICK, e, $(linkEl)); // A dev can use e.preventDefault() to also prevent any XHR transitions!


            if (!e.isDefaultPrevented()) {
              e.preventDefault();

              if (!_this13.clickingDisabled) {
                _this13.goToURL(el.href);
              }
            }
          }
        });
      });
    }
  }, {
    key: "disableClickingFor",
    value: function disableClickingFor(duration) {
      var _this14 = this;

      if (this.clickingDisabled) {
        duration = Math.max(this.clickingDisabled, duration);
      }

      this.clickingDisabled = duration;
      clearTimeout(this.disabledClickTimer);
      this.disabledClickTimer = setTimeout$2(function () {
        _this14.clickingDisabled = false;
      }, duration);
    }
  }, {
    key: "callAPI",
    value: function callAPI(method, args, callback) {
      if (args instanceof Function) {
        callback = args;
        args = null;
      }

      return new promise$5(function (resolve, reject) {
        $.ajax({
          method: 'post',
          url: '/json-api/' + method,
          data: stringify$2(args),
          dataType: 'json',
          success: function success(response) {
            if (callback) callback(response.error, response.result);

            if (response.error) {
              reject(response.error);
            } else {
              resolve(response.result);
            }
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            var message = '';

            if (textStatus && XHRErrorCodes[textStatus]) {
              message = XHRErrorCodes[textStatus];
            } else {
              message = 'Server error occurred while making API request';
            }

            if (errorThrown && message) {
              message += ': ' + errorThrown;
            }

            if (callback) {
              callback({
                code: textStatus || errorThrown,
                message: message,
                info: null
              }, null);
            }

            reject({
              code: textStatus || errorThrown,
              message: message,
              info: null
            });
          }
        });
      });
    }
  }]);

  return SiteInstance;
}(EventEmitter);

defineProperty$5(SiteInstance, "apps", {});

var XHRErrorCodes = {
  timeout: 'Timed out while making API request',
  abort: 'XHR request was aborted',
  error: 'XHR request encountered an error',
  parsererror: 'Unable to parse API request'
};
var baseWidget = {
  debounce: function debounce(callback, time, name) {
    var _this15 = this;

    var self = this;
    name = name || '_';
    self._scheduledTimers = self._scheduledTimers || {};
    clearTimeout(this._scheduledTimers[name]);
    this._scheduledTimers[name] = setTimeout$2(function () {
      callback.call(_this15);
    }, time);
  },
  throttle: function throttle(callback, time, name, val) {
    var _this16 = this;

    var self = this;
    name = name || '_';
    self._throttled = self._throttled || {};
    self._scheduledTimers = self._scheduledTimers || {};

    if (self._throttled[name] === undefined) {
      clearTimeout(this._scheduledTimers[name]);
      this._scheduledTimers[name] = setTimeout$2(function () {
        _this16._scheduledTimers[name] = null;
        self._throttled[name] = undefined;
      }, time);
      self._throttled[name] = val;
      callback();
    }
  },
  afterInit: function afterInit(callback) {
    var _context29,
        _this17 = this;

    bind$2(_context29 = $(document)).call(_context29, 'afterWidgetsInit.' + this.uuid, function () {
      callback.call(_this17);
      $(document).unbind('afterWidgetsInit.' + _this17.uuid);
    });
  },
  instance: function instance() {
    return this;
  }
}; // Add static properties to the Site definition

Site.$ = $;
Site.jQuery = jQuery;
function Widget(name, def) {
  return {
    isWidget: true,
    name: name,
    def: def
  };
}
function Site() {
  var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
  return SiteInstance.apps[instance];
}

export default SiteInstance;
export { Site, Widget };
//# sourceMappingURL=index.es.js.map
