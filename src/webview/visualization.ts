import { chart as topology, GraphData } from './topology';

// eslint-disable-next-line
declare interface vscode {
  postMessage(message: any): void
  setState(state: object): void
  getState<T extends object>(): T
}

declare function acquireVsCodeApi(): vscode;

const container = document.querySelector("#chart") as HTMLDivElement | undefined;
// clear waiting info
container.innerHTML = '';

const vs = acquireVsCodeApi();
const [setData] = topology ({ container });

const oldGraph: GraphData = vs.getState() ?? { nodes: [], links: [] };

window.addEventListener("message", (ev) => {
  try {
    const message = ev.data as { type: string, payload: GraphData };
    if (message.type !== "topology-data") {
      return;
    }

    const newGraph = Object.assign(oldGraph, message.payload);
    setData(newGraph);

    vs.setState(newGraph);
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener("resize", () => {
  setData(oldGraph);
});

vs.postMessage({ type: "topology" });
