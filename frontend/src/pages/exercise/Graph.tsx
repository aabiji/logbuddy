import { useEffect, useMemo, useRef, useState } from "react";
import { visvalingamWhyattAlgorithm, Point, Vec2 } from "../../lib/simplify";
import { dayOfYear, yearLength, formatDate } from "../../lib/date";

interface LineGraphProps {
  data: Point[];
  spacingY: number;
  maxNumPoints: number;
  padding: Vec2;
  unit: string;
}

export function LineGraph({ data, padding, spacingY, maxNumPoints, unit }: LineGraphProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [numTicksY, setNumTicksY] = useState(0);
  const [srcSize, setSrcSize] = useState({
    min: { x: 0, y: 0 }, max: { x: 0, y: 0 }
  }); // min/max values of the dataset

  useEffect(() => {
    if (divRef.current) {
      const width = divRef.current.parentElement!.getBoundingClientRect().width;
      const realWidth = Math.max(0, width - padding.x * 2);
      setWidth(realWidth);

      const height = window.screen.height / 4;
      const realHeight = Math.max(0, height - padding.y * 2);
      setHeight(realHeight);

      setNumTicksY(Math.round(height / spacingY) + 1);
    }
  }, [padding.x, padding.y, spacingY]);

  const points = useMemo(() => {
    if (data.length == 0) return [];
    return visvalingamWhyattAlgorithm(data, maxNumPoints);
  }, [data, maxNumPoints]);

  useEffect(() => {
    const size = {
      min: { x: Number.MAX_VALUE, y: Number.MAX_VALUE },
      max: { x: 0, y: 0 }
    };
    for (const p of points) {
      size.min.x = Math.min(p.date.getTime(), size.min.x);
      size.max.x = Math.max(p.date.getTime(), size.max.x);
      size.min.y = Math.min(p.value, size.min.y);
      size.max.y = Math.max(p.value, size.max.y);
    }
    setSrcSize(size);
  }, [points, spacingY, height]);

  const svgPath = useMemo(() => {
    if (points.length == 0) return "";
    if (srcSize.min.x == 0 && srcSize.max.x == 0 &&
      srcSize.min.y == 0 && srcSize.max.y == 0) return "";

    const domain = srcSize.max.x - srcSize.min.x;
    const range = srcSize.max.y - srcSize.min.y;

    let path = "";
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const xPercent = (p.date.getTime() - srcSize.min.x) / domain;
      const x = padding.x + xPercent * width;

      const yPercent = (p.value - srcSize.min.y) / range;
      const y = padding.y + yPercent * height;

      const prefix = i == 0 ? "M" : "L"; // move to or line to
      path += ` ${prefix} ${x} ${y}`;
    }

    return path + " Z"; // end the path at the end
  }, [height, padding.x, padding.y, points, width, srcSize]);

  return (
    <div ref={divRef}>
      {points.length > 0 && (
        <svg
          width="100%" height="100%"
          viewBox={`0 0 ${width + padding.x * 2} ${height + padding.y * 2}`}
          xmlns="http://www.w3.org/2000/svg">

          {/* X axis point labels */}
          {Array.from({ length: points.length }, (_, i) => {
            const domain = srcSize.max.x - srcSize.min.x;
            const xPercent = (points[i].date.getTime() - srcSize.min.x) / domain;
            const x = padding.x + xPercent * width;
            return (
              <text key={i} x={x} y={padding.y * 2 + height} textAnchor="middle">
                {formatDate(points[i].date, true)}
              </text>
            );
          })}

          {/* Y axis spacing lines and tick values */}
          {Array.from({ length: numTicksY }, (_, i) => {
            const y = (padding.y + height) - i * spacingY; // draw bottom up
            const step = Math.round((srcSize.max.y - srcSize.min.y) / numTicksY);
            const value = srcSize.min.y + i * step;

            return (
              <g key={i}>
                <line className="spacing-line"
                  x1={padding.x} y1={y} x2={width + padding.x} y2={y} />
                <text x={padding.x} y={y} textAnchor="end" dominantBaseline="middle">
                  {value} {unit}
                </text>
              </g>
            );
          })}

          {/* (x, y) axis and the data */}
          <line x1={padding.x} y1={height + padding.y} x2={width + padding.x} y2={height + padding.y} />
          <line x1={padding.x} y1={height + padding.y} x2={padding.x} y2={padding.y} />
          <path d={svgPath}></path>
        </svg>
      )}
    </div>
  );
}

function interpolateHSL(hsl1: string, hsl2: string, percent: number) {
  const parse = (hsl: string) => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)!;
    return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
  };

  const [c1, c2] = [parse(hsl1), parse(hsl2)];
  const h = Math.round(c1.h + (c2.h - c1.h) * percent);
  const s = Math.round(c1.s + (c2.s - c1.s) * percent);
  const l = Math.round(c1.l + (c2.l - c1.l) * percent);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

interface HeatmapProps {
  data: Point[];
  padding: Vec2;
  innerPadding: number;
}

export function Heatmap({ data, padding, innerPadding }: HeatmapProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ x: 0, y: 0 });
  const [realSize, setRealSize] = useState({ x: 0, y: 0 });
  const [valueRange, setValueRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (divRef.current) {
      // account for the outer padding and the padding gaps
      // 52 gaps between 53 columsn and 6 gaps between 7 rows
      const height = window.screen.height / 4;
      const width = divRef.current.parentElement!.getBoundingClientRect().width;
      const realWidth = Math.max(0, width - padding.x * 2 - innerPadding * 52);
      const realHeight = Math.max(0, height - padding.y * 2 - innerPadding * 5);

      setRealSize({ x: width, y: height });
      setSize({ x: realWidth, y: realHeight });
    }
  }, [padding.x, padding.y]);

  useEffect(() => {
    const range = { min: Number.MAX_VALUE, max: 0 };
    for (const p of data) {
      range.min = Math.min(p.value, range.min);
      range.max = Math.max(p.value, range.max);
    }
    setValueRange(range);
  }, [data]);

  const createTile = (dayIndex: number, value: number) => {
    const tileSize = { x: size.x / 53, y: size.y / 7 };
    const week = Math.floor(dayIndex / 7);
    const day = dayIndex % 7;

    let color = "#E0E5E8";
    if (value > 0) {
      const colorStart = "hsl(202, 98%, 80%)";  // #9AD9FE
      const colorEnd = "hsl(199, 98%, 37%)";    // #0277BD
      const percent = (value - valueRange.min) / (valueRange.max - valueRange.min);
      color = interpolateHSL(colorStart, colorEnd, percent);
    }

    return (
      <rect
        key={dayIndex} fill={color}
        width={tileSize.x} height={tileSize.y}
        x={padding.x + week * tileSize.x + week * innerPadding}
        y={padding.y + day * tileSize.y + day * innerPadding}
     />
    );
  }

  return (
    <div ref={divRef}>
      <svg
        width="100%" height="100%"
        viewBox={`0 0 ${realSize.x} ${realSize.y}`}
        xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: yearLength() }, (_, i) => createTile(i, -1))}
          {data.map((p, _) => createTile(dayOfYear(p.date), p.value))}
      </svg>
    </div>
  );
}
