interface Array<T> {
    toReversed(): T[];
}

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
  }