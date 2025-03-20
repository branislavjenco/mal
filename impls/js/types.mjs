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
export class MalAtom extends MalType {
    static get type() {
        return MalAtom.prototype.constructor.name;
    }
}

export class MalInt extends MalType {
    static get type() {
        return MalInt.prototype.constructor.name;
    }
}

export class MalSymbol extends MalType {
    static get type() {
        return MalSymbol.prototype.constructor.name;
    }
}

export class MalList extends MalType {
    static get type() {
        return MalList.prototype.constructor.name;
    }
}

export class MalVector extends MalType {
    static get type() {
        return MalVector.prototype.constructor.name;
    }
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
export class MalFn extends MalType {
    static get type() {
        return MalFn.prototype.constructor.name;
    }

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

export class MalTrue extends MalType {
    static get type() {
        return MalTrue.prototype.constructor.name;
    }
    constructor() {
        super(true);
    }
}

export class MalFalse extends MalType {
    static get type() {
        return MalFalse.prototype.constructor.name;
    }
    constructor() {
        super(false);
    }
}

export class MalNil extends MalType {
    static get type() {
        return MalNil.prototype.constructor.name;
    }
    constructor() {
        super(null);
    }
}
