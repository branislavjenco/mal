export class MalType {
    static get type() {
        return MalType.prototype.constructor.name;
    }
    get type() {
        return this.constructor.name
    }
    val;
    constructor(val) {
        this.val = val;
    }
}

export class MalInt extends MalType {}

export class MalSymbol extends MalType {}

export class MalList extends MalType {}
export class MalVector extends MalType {}
export class MalHashMap extends MalType {}
export class MalFn extends MalType {}
export class MalString extends MalType {
    constructor(val, is_keyword=false) {
        if (is_keyword) {
            super("\u029e" + val.slice(1));
        } else {
            super(val);
        }
    }
}

export class MalTrue extends MalType {
    constructor() {
        super(true);
    }
}

export class MalFalse extends MalType {
    constructor() {
        super(false);
    }
}

export class MalNil extends MalType {
    constructor() {
        super(null);
    }
}