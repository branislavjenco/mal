export class MalInt {
    value;
    constructor(value) {
        this.value = value;
    }
}

export class MalSymbol {
    value;
    constructor(value) {
        this.value = value;
    }
}

export class MalList {
    value;
    constructor(value) {
        this.value = value;
    }

}
export class MalVector {
    value;
    constructor(value) {
        this.value = value;
    }
}

export class MalHashMap {
    value;
    constructor(value) {
        this.value = value;
    }
}

export class MalString {
    value;
    constructor(value, is_keyword=false) {
        if (is_keyword) {
            this.value = "\u029e" + value.slice(1);
        } else {
            this.value = value;
        }
    }
}

export class MalFn {
    value;
    constructor(value) {
        this.value = value;
    }

}

export class MalTrue {

}

export class MalFalse {

}

export class MalNil {

}

