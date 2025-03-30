
export class MalType {
    static get type() {
        return MalType.prototype.constructor.name;
    }
    get type() {
        return this.constructor.name;
    }
    val;
    constructor(val) {
        this.val = val;
    }
}

export function isAtom(val) {
    return val instanceof MalAtom;
}

export class MalAtom extends MalType {
    static get type() {
        return MalAtom.prototype.constructor.name;
    }
}

export function isInt(val) {
    return val instanceof MalInt;
}

export class MalInt extends MalType {
    static get type() {
        return MalInt.prototype.constructor.name;
    }
}

export function isSymbol(val) {
    return val instanceof MalSymbol;
}

export class MalSymbol extends MalType {
    static get type() {
        return MalSymbol.prototype.constructor.name;
    }
}

export function isList(val) {
    return val instanceof MalList;
}

export class MalList extends MalType {
    static get type() {
        return MalList.prototype.constructor.name;
    }

    get meta() {
        return this.meta;
    }

    set meta(malValue) {
        this.meta = malValue;
    }
}

export function isVector(val) {
    return val instanceof MalVector;
}

export class MalVector extends MalType {
    static get type() {
        return MalVector.prototype.constructor.name;
    }
    get meta() {
        return this.meta;
    }

    set meta(malValue) {
        this.meta = malValue;
    }
}

export function isHashMap(val) {
    return val instanceof MalHashMap;
}

export class MalHashMap extends MalType {
    static get type() {
        return MalHashMap.prototype.constructor.name;
    }

    get keys() {
        return this.val.filter((_, i) => i % 2 === 0);
    }

    get vals() {
        return this.val.filter((_, i) => i % 2 === 1);
    }

    get meta() {
        return this.meta;
    }

    set meta(malValue) {
        this.meta = malValue;
    }


    contains(key) {
        return this.keys.map(k => k.val).includes(key.val);
    }

    get(key) {
        if (this.contains(key)) {
            return this.vals[this.keys.map(k => k.val).indexOf(key.val)];
        } else {
            return null;
        }
    }
}

export function isFn(val) {
    return val instanceof MalFn || val.hasOwnProperty("fn");
}

export class MalFn extends MalType {
    static get type() {
        return MalFn.prototype.constructor.name;
    }

    get meta() {
        return this.meta;
    }

    set meta(malValue) {
        this.meta = malValue;
    }
}

export function isString(val) {
    return val instanceof MalString;
}

export class MalString extends MalType {
    static get type() {
        return MalString.prototype.constructor.name;
    }
    constructor(val, is_keyword = false) {
        if (is_keyword) {
            super("\u029e" + val.slice(1));
        } else {
            super(val);
        }
    }
}

export function isTrue(val) {
    return val instanceof MalTrue;
}

export class MalTrue extends MalType {
    static get type() {
        return MalTrue.prototype.constructor.name;
    }
    constructor() {
        super(true);
    }
}

export function isFalse(val) {
    return val instanceof MalFalse;
}

export class MalFalse extends MalType {
    static get type() {
        return MalFalse.prototype.constructor.name;
    }
    constructor() {
        super(false);
    }
}

export function isNil(val) {
    return val instanceof MalNil;
}

export class MalNil extends MalType {
    static get type() {
        return MalNil.prototype.constructor.name;
    }
    constructor() {
        super(null);
    }
}
