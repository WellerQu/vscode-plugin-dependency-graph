import * as selection from "d3-selection";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  SimulationNodeDatum,
  SimulationLinkDatum,
  forceCenter,
  ForceLink
} from "d3-force";
import { scaleOrdinal } from "d3-scale";
import { schemeTableau10 } from "d3-scale-chromatic";
import { zoom, zoomIdentity } from 'd3-zoom';

// eslint-disable-next-line
interface vscode {
  postMessage(message: any): void
  setState(state: object): void
  getState<T extends object>(): T
}

declare const acquireVsCodeApi: () => vscode;

export interface Node extends SimulationNodeDatum {
  path: string;
  size: number;
}

export interface Link extends SimulationLinkDatum<Node> { }

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface Options {
  container: HTMLDivElement;
  invalidationTimeout?: number
}

const chart = (options: Options) => {
  const width = 800;
  const height = 600;

  const handleZoomed = () => {
    selection
      .select(container)
      .select("svg")
      .select("g.root")
      .attr("transform", selection.event.transform);
  };

  const svgZoom = zoom()
    .scaleExtent([0.5, 32])
    .on("zoom", handleZoomed);

  const svg = selection
    .select(container)
    .selectAll("svg")
    .data([0])
    .join(enter => {
      const svg = enter
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(svgZoom)
        .call(svgZoom.transform, zoomIdentity);

      svg
        .append("defs")
        .append("marker")
        .attr("id", "Triangle")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 1)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr('fill', '#bababa')
        .attr("d", "M 0 0 L 10 5 L 0 10 z");

      return svg.append('g').attr('class', 'root');
    });

  let link = svg
    .append("g")
    .attr("class", "links")
    .selectAll<SVGPolylineElement, Link>("polyline");

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll<SVGGElement, Node>('g.node');

  let invalidation = 0;

  const handleTicked = () => {
    node
      .attr('transform', d => `translate(${[d.x, d.y].join(',')})`);

    link.attr("points", d => {
      const nodeSource = d.source as Node;
      const nodeTarget = d.target as Node;
      const middle = [
        nodeSource.x! + (nodeTarget.x! - nodeSource.x!) / 2,
        nodeSource.y! + (nodeTarget.y! - nodeSource.y!) / 2
      ];
      return `${nodeSource.x},${nodeSource.y} ${middle.join(",")} ${
        nodeTarget.x
        },${nodeTarget.y}`;
    });
  };

  const simulation = forceSimulation()
    .force("charge", forceManyBody().strength(-800).distanceMax(200))
    .force("link", forceLink<Node, Link>().id(d => d.path))
    .force("center", forceCenter(width / 2, height / 2))
    .on("tick", handleTicked);

  const setData = (graph: GraphData) => {
    const colorScale = scaleOrdinal(schemeTableau10);
    const nodes = graph.nodes.map<Node>(d => Object.create(d));
    const links = graph.links.map(d => Object.create(d));
    const { container } = options;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    selection
      .select(container)
      .select('svg')
      .attr('width', width)
      .attr('height', height);

    node = node.data<Node>(nodes).join(
      enter => {
        const group = enter.append('g').attr('class', 'node');
        group
          .append("circle")
          .attr("r", 10)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .attr("fill", d => colorScale(d.path));
        group
          .append('title')
          .text(d => d.path);
        group
          .append('text')
          .attr('x', 0)
          .attr('y', 26)
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('opacity', 0.6)
          .text(d => d.path.split('/').slice(-1)[0]);
        return group;
      },
      update => update.attr("fill", d => colorScale(d.path)),
      exit => exit.remove()
    );

    link = link.data<Link>(links).join(enter => {
      const line = enter
        .append("polyline")
        .attr("stroke-width", 1.5)
        .attr("stroke", "#bababa")
        .attr("marker-mid", "url(#Triangle)");
      return line;
    });

    simulation.nodes(nodes);
    simulation.force<ForceLink<Node, Link>>("link")!.links(links);
    simulation.alpha(1).restart();

    window.clearTimeout(invalidation);
    invalidation = window.setTimeout(() => simulation.stop(), options.invalidationTimeout ?? 9000);
  };

  const setOptions = () => { };

  const dispose = () => { 
    window.clearTimeout(invalidation);
    simulation.stop();
  };

  return [setData, setOptions, dispose];
};


const container = document.querySelector('#chart') as HTMLDivElement | undefined;

if (container) {
  const vscode = acquireVsCodeApi();
  const [setData] = chart({ container });
  const oldGraph: GraphData = vscode.getState() ?? { nodes: [], links: [] };

  window.addEventListener('message', (ev) => {
    try {
      const message = ev.data as { type: string, payload: GraphData };
      if (message.type !== 'data')  {
        return;
      }

      const newGraph = Object.assign(oldGraph, message.payload); 
      setData(newGraph);

      vscode.setState(newGraph);
    } catch (e) {
      console.error(e);
    }
  });

  window.addEventListener('resize', () => {
    setData(oldGraph);
  });

  vscode.postMessage({ type: 'notify', payload: 'ready' });
}