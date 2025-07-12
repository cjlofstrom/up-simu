declare namespace NodeJS {
  interface Timeout {
    hasRef(): boolean;
    ref(): this;
    refresh(): this;
    unref(): this;
  }
}