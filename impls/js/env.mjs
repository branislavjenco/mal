import { MalList } from "./types.mjs";

export class KeyNotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}


export class Env {
    outer;
    data;
    constructor(outer, binds = new MalList([]), exprs = new MalList([])) {
        // console.log("binds", binds);
        // console.log("exprs", exprs)
        this.outer = outer;
        this.data = {};
        for (let i = 0; i < binds.val.length; i++) {
            const bind = binds.val[i].val;
            if (bind === "&") {
                this.data[binds.val[i+1].val] = new MalList(exprs.val.slice(i));
                break;
            } else {
                this.data[bind] = exprs.val[i];
            }
        }
        // console.log(this.data);
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
                return null;
            }
        }

    }
}