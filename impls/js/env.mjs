import { MalList } from "./types.mjs";

export class KeyNotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}


export class Env {
    outer;
    data;
    constructor(outer, binds = new MalList([]), exprs = []) {
        this.outer = outer;
        this.data = {};
        for (let i = 0; i < binds.value.length; i++) {
            this.data[binds.value[i].value] = exprs[i];
        }
    }

    set(key, val) {
        this.data[key] = val;
        return val;
    }

    get(key) {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        } else {
            if (this.outer !== null) {
                return this.outer.get(key);
            } else {
                throw new KeyNotFoundError(`${key} not found`);
            }
        }

    }
}