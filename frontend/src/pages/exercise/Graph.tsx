import { useMemo } from "react";
import { formatDate } from "../../lib/date";

import {
  Chart as ChartJS, CategoryScale, PointElement,
  LineElement, Tooltip, TimeScale, ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(CategoryScale, TimeScale, PointElement, LineElement, Tooltip);

export class MinHeap {
  values: any[];
  smallerThan: (a: any, b: any) => boolean;
  constructor(cmp: (a: any, b: any) => boolean) {
    this.values = [];
    this.smallerThan = cmp;
  }

  private swap(a: number, b: number) {
    const temp = this.values[a];
    this.values[a] = this.values[b];
    this.values[b] = temp;
  }

  insert(value: any) {
    this.values.push(value);

    // moving up the tree, swap nodes that violate the min heap property
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.smallerThan(this.values[parent], this.values[index])) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  empty(): boolean { return this.values.length == 0; }

  pop(): any {
    let index = 0; // remove root
    const removed = this.values[index];
    this.values[index] = this.values[this.values.length - 1];
    this.values.pop();

    // heapify the tree (walk up the tree and move smaller values to the top)
    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.values.length &&
        this.smallerThan(this.values[leftChild], this.values[smallest]))
        smallest = leftChild;
      if (rightChild < this.values.length &&
        this.smallerThan(this.values[rightChild], this.values[smallest]))
        smallest = rightChild;

      if (smallest != index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
    return removed;
  }
}

export type Point = { date: Date, value: number };
type Vec2 = { x: number, y: number };
type HeapValue = { area: number, indexA: number, indexB: number, indexC: number; }

// helper functions
const toVec2 = (p: Point): Vec2 => ({ x: p.date.getTime(), y: p.value });
const cmpHeapValues = (a: HeapValue, b: HeapValue): boolean => a.area < b.area;

// get the area of the triangle formed by a, b, c
const getArea = (a: Vec2, b: Vec2, c: Vec2) =>
  0.5 * Math.abs(a.x * b.y + b.x * c.y + c.x * a.y - a.x * c.y - b.x * a.y - c.x * b.y);

const nearestPoint = (data: (Point | null)[], index: number, direction: number) => {
  while (data[index] === null)
    index += direction;
  return index;
}

// Reduce the number of points in the dataset iteratively until the target length is reached
function visvalingamWhyattAlgorithm(data: Point[], targetLength: number) {
  // insert the initial triangle areas into the heap
  const heap = new MinHeap(cmpHeapValues);
  for (let i = 1; i < data.length - 1; i++) {
    const area = getArea(toVec2(data[i - 1]), toVec2(data[i]), toVec2(data[i + 1]));
    heap.insert({ area, indexA: i - 1, indexB: i, indexC: i + 1 });
  }

  let arr = [...data] as (Point | null)[];
  let removedCount = 0;

  // iteratively remove the point that has the smallest triangle area
  while (!heap.empty() && removedCount < (data.length - targetLength)) {
    // only get the min area from points that still exist
    let value = heap.pop() as HeapValue;
    if (!value) break;
    while (!arr[value.indexA] || !arr[value.indexB] || !arr[value.indexC])
      value = heap.pop();

    // remove the point
    arr[value.indexB] = null;
    removedCount++;

    // recompute the triangle areas for the neighboring points
    const prev = nearestPoint(arr, value.indexA - 1, -1);
    if (prev >= 0) {
      const [a, b, c] = [prev, value.indexA, value.indexC];
      const newArea = getArea(toVec2(arr[a]!), toVec2(arr[b]!), toVec2(arr[c]!));
      heap.insert({ area: newArea, indexA: a, indexB: b, indexC: c });
    }

    const next = nearestPoint(arr, value.indexC + 1, 1);
    if (next < arr.length) {
      const [a, b, c] = [value.indexA, value.indexC, next];
      const newArea = getArea(toVec2(arr[a]!), toVec2(arr[b]!), toVec2(arr[c]!));
      heap.insert({ area: newArea, indexA: a, indexB: b, indexC: c });
    }
  }

  // return the new data
  return arr.filter(a => a != null) as Point[];
}

export function LineGraph({ data }: { data: Point[]; }) {
  const targetLength = 50; // TODO: make it based off the screen width?
  const simplified = useMemo(() =>
    visvalingamWhyattAlgorithm(data, targetLength), [data]);

  const dataset = {
    data: simplified.map(p => ({ x: p.date, y: p.value })),
    label: "Graph",
    borderColor: "cyan",
    pointHoverRadius: 4,
    pointRadius: 2,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: { intersect: false },
    scales: {
      x: {
        type: 'time',
        ticks: {
          callback: (value: string | number) =>
            formatDate(new Date(value), true),
        }
      },
    }
  };

  return <Line options={options} data={{ datasets: [dataset] }} />;
}
