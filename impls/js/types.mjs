export class MalInt {
    value;
    constructor(value) {
        this.value = value;
    }
}

export class MalSymbol {
    name;
    constructor(name) {
        this.name = name;
    }
}

export class MalList {
    list;
    constructor(list) {
        this.list = list;
    }

}
export class MalVector {
    list;
    constructor(list) {
        this.list = list;
    }
}

export class MalString {
    str;
    constructor(str, is_keyword=false) {
        if (is_keyword) {
            this.str = 0x29E + str;
        }
        this.str = str;
    }
}

export class MalTrue {

}

export class MalFalse {

}

export class MalNil {

}

export class MalHashMap {
    map;
    constructor(map) {

        this.map = map;
    }
}