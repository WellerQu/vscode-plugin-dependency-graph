declare global {
  // eslint-disable-next-line
  interface vscode {
    postMessage(message: any): void
    setState(state: object): void
    getState<T extends object>(): T
  }

  function acquireVsCodeApi(): vscode;
}

export {};