
export class KeyNotFoundError extends Error {
    constructor(msg) {
        super(msg);
    }
}


export class Env {
    outer;
    data;
    constructor(outer, binds = [], exprs = []) {
        // console.log("binds", binds);
        // console.log("exprs", exprs)
        this.outer = outer;
        this.data = {};
        for (let i = 0; i < binds.length; i++) {
            const bind = binds[i];
            if (bind === "&") {
                this.data[binds[i+1]] = exprs.slice(i);
                break;
            } else {
                this.data[bind] = exprs[i];
            }
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
                return undefined;
            }
        }

    }
}