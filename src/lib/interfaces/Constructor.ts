export interface Constructor<C> {
    new (...args: any[]): C;
}