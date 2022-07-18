export interface DialogDelegate<T> {
    (payload: T): void;
}