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
}

const chart = (options: Options) => {
  const { container } = options;
  const colorScale = scaleOrdinal(schemeTableau10);

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  const svg = selection
    .select(container)
    .selectAll("svg")
    .data([0])
    .join(enter => {
      const svg = enter
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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
        .attr("d", "M 0 0 L 10 5 L 0 10 z");

      return svg;
    });

  let link = svg
    .append("g")
    .attr("class", "links")
    .selectAll<SVGPolylineElement, Link>("polyline");

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll<SVGCircleElement, Node>("circle");

  const handleTicked = () => {
    node
      .attr("cx", d => d.x!)
      .attr("cy", d => d.y!);

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
    .force("charge", forceManyBody().strength(-1000).distanceMax(300))
    .force("link", forceLink<Node, Link>().id(d => d.path))
    .force("center", forceCenter(width / 2, height / 2))
    .on("tick", handleTicked);

  const setData = (graph: GraphData) => {
    const nodes = graph.nodes.map(d => Object.create(d));
    const links = graph.links.map(d => Object.create(d));

    node = node.data<Node>(nodes).join(
      enter => {
        const circle = enter
          .append("circle")
          .attr("r", d => d.size)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .attr("fill", d => colorScale(d.path));
        return circle;
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
  };

  const setOptions = () => { };

  const dispose = () => { };

  return [setData, setOptions, dispose];
};

const container = document.querySelector('#chart') as HTMLDivElement | undefined;

if (container) {
  const [setData] = chart({ container });

  window.addEventListener('message', (ev) => {
    const graphData = ev.data as GraphData;
    setData(graphData);
  });
}