/* eslint-disable no-undef, no-unused-vars */

declare module 'jsencrypt' {
  interface JSEncryptPrototype {
    setKey(key: string): void;
    encrypt(value: string): string|boolean;
  }
  const JSEncrypt: {
    new (): JSEncryptPrototype;
  };
}
