import "lodash";

declare global {
    interface Array<T> {
        flatten<K>(selector: (item: T, index?: number, array?: T[]) => K[]): K[];
        flattenRec(selector: (item: T, index?: number, array?: T[]) => T[]): T[];
        /**
         * Returns values with different key.
         * @param keySelector Returns a key for an array item.
         * @returns Array of items with different key value.
         */
        distinct<TKey>(keySelector: (item: T, index?: number, array?: T[]) => TKey): T[];
        toHash<TValue>(key: (item: T, index?: number, array?: T[]) =>
                           number
                           | string, valueSelector: (item: T, index?: number, array?: T[]) =>
                           TValue
                           | TValue[]): { [key: string]: TValue[] };
        toHash(key: (item: T, index?: number, array?: T[]) => number | string): { [key: string]: T[] };
        pushDistinct(...item: T[]): number;

        min<TVal>(selector: (item: T, index?: number, array?: T[]) => TVal, defaultValue?: TVal): TVal | undefined;
        max<TVal>(selector: (item: T, index?: number, array?: T[]) => TVal, defaultValue?: TVal): TVal | undefined;

        mapLookBehind<K>(selector: (item: T, previousResultItem: K
                                        | null, index?: number, array?: T[], result?: K[]) => K): K[];

        orderBy(builder: (predicateBuilder: SortBuilder<T>) => SortBuilder<T>): T[];
    }

    export type KeyValueArray<T> = [keyof T, T[keyof T]];

    interface ObjectConstructor {
        entries<T>(obj: T): [keyof T, T[keyof T]][];
        values(obj: any): any[];
        values<T>(obj: { [prop: string]: T }): T[];
    }

    class SortBuilder<T> {
        public thenBy<K>(keySelector: (item: T) => K, desc?: boolean): SortBuilder<T>;

        public thenSort(compareFunction: (first: T, second: T) => number): SortBuilder<T>;
    }
}

// Array
if (!Array.prototype.flatten) {
    Array.prototype.flatten = function <T, K>(this: T[], selector?: (item: T, index?: number, array?: T[]) => K[]): K[] {
        selector = selector || (i => (i as any) as K[]);

        return this.reduce<K[]>((result, item, index, array) => {
            const nested = selector(item, index, array) || [];
            return [...nested, ...result];
        }, []);
    };
}

if (!Array.prototype.flattenRec) {
    Array.prototype.flattenRec = function <T>(this: T[], selector?: (item: T, index?: number, array?: T[]) => T[]): T[] {
        selector = selector || (i => (i as any) as T[]);

        return this.reduce<T[]>((result, item, index, array) => {
            const nested = selector(item, index, array);
            return [...(nested ? nested.flattenRec(selector) : []), ...(nested || []), ...result];
        }, []);
    };
}

if (!Array.prototype.distinct) {
    Array.prototype.distinct = function distinct<T, TKey>(this: T[], keySelector: (item: T, index?: number, array?: T[]) => TKey): T[] {
        const arr = this.map((item, index, arr) => ({ element: item, key: keySelector(item, index, arr) }));

        const result: typeof arr = [];
        for (const item of arr) {
            if (!result.some(e => e.key === item.key)) {
                result.push(item);
            }
        }

        return result.map(r => r.element);
    };
}

if (!Array.prototype.toHash) {
    Array.prototype.toHash = function <T, TValue>(this: T[],
                                                  keySelector: (item: T, index?: number, array?: T[]) =>
                                                      number
                                                      | string,
                                                  valueSelector?: (item: T, index?: number, array?: T[]) =>
                                                      TValue
                                                      | TValue[]): { [key: string]: TValue[] } {

        if (!valueSelector) {
            valueSelector = i => (i as any) as TValue;
        }

        return this.reduce<{ [key: string]: TValue[] }>((result, item, index, array) => {
            const key = keySelector(item, index, array);
            const rawValue = valueSelector(item, index, array);

            const value = Array.isArray(rawValue) ? rawValue : [rawValue];

            const arr = result[key] || [];
            result[key] = arr;


            for (const v of value) {
                if (!arr.some(i => i === v)) {
                    arr.push(v);
                }
            }

            return result;
        }, {});
    };
}

if (!Array.prototype.pushDistinct) {
    Array.prototype.pushDistinct = function <T>(this: T[], ...items: T[]): number {
        for (const i of items) {
            if (!this.some(a => a === i)) {
                this.push(i);
            }
        }

        return this.length;
    };
}

if (!Array.prototype.min) {
    Array.prototype.min = function <T, TVal>(this: T[], selector: (item: T, index?: number, array?: T[]) => TVal, defaultValue?: TVal): TVal
        | undefined {
        const result = this.reduce<TVal>((prev, item, index, array) => {
            const val = selector(item, index, array);
            if (index === 0) {
                return val;
            }

            return val < prev ? val : prev;

        }, undefined);

        if (result === null || result === undefined) {
            return defaultValue;
        }

        return result;
    };
}

if (!Array.prototype.max) {
    Array.prototype.max = function <T, TVal>(this: T[], selector: (item: T, index?: number, array?: T[]) => TVal, defaultValue?: TVal): TVal
        | undefined {
        const result = this.reduce<TVal>((prev, item, index, array) => {
            const val = selector(item, index, array);
            if (index === 0) {
                return val;
            }

            return val > prev ? val : prev;

        }, undefined);

        if (result === null || result === undefined) {
            return defaultValue;
        }

        return result;
    };
}

if (!Array.prototype.mapLookBehind) {
    Array.prototype.mapLookBehind = function mapLookBehind<T, K>(this: T[], selector: (item: T, previousResultItem: K
                                                                                           | null, index?: number, array?: T[], result?: K[]) => K): K[] {
        const result: K[] = [];

        for (let i = 0; i < this.length; i++) {
            const previousResultItem = i === 0 ? null : result[i - 1];
            const newItem = selector(this[i], previousResultItem, i, this, result);
            result.push(newItem);
        }

        return result;
    };
}

interface KeyPredicate<T> {
    type: "key";
    desc: boolean;
    keySelector: (item: T) => any;
}

interface ComparePredicate<T> {
    type: "compare";
    compare: (first: T, second: T) => number;
}

export class SortBuilder<T> {
    private predicates: (KeyPredicate<T> | ComparePredicate<T>)[] = [];

    public thenBy<K>(keySelector: (item: T) => K, desc?: boolean): SortBuilder<T> {
        this.predicates.push({
            type: "key",
            desc: desc || false,
            keySelector
        });

        return this;
    }

    public thenSort(compareFunction: (first: T, second: T) => number): SortBuilder<T> {
        this.predicates.push({
            type: "compare",
            compare: compareFunction
        });

        return this;
    }

    public toCompareFunction(): (first: T, second: T) => number {
        return (first: T, second: T): number => {

            for (let i = 0; i < this.predicates.length; i++) {
                const predicate = this.predicates[i];

                switch (predicate.type) {
                    case "key": {
                        const firstKey = predicate.keySelector(first);
                        const secondKey = predicate.keySelector(second);

                        if (firstKey === secondKey) {
                            return 0;
                        }

                        return (firstKey < secondKey ? -1 : 1) * (predicate.desc ? -1 : 1);
                    }
                    case "compare": {
                        return predicate.compare(first, second);
                    }
                }

            }

            return 0;
        };
    }
}

if (!Array.prototype.orderBy) {
    Array.prototype.orderBy = function <T>(this: T[], builder: (predicateBuilder: SortBuilder<T>) => SortBuilder<T>): T[] {
        const b = builder(new SortBuilder<T>());

        const copy = [...this];
        copy.sort(b.toCompareFunction());

        return copy;
    };
}

// Object
if (!Object.entries) {
    Object.entries = (obj: any): [string, any][] => {
        return Object.keys(obj)
            .map<[string, any]>(name => {
                const value = obj[name];
                return ([name, value]);
            });
    };
}

if (!Object.values) {
    Object.values = (obj: any): any[] => {
        return Object.keys(obj).map(prop => obj[prop]);
    };
}