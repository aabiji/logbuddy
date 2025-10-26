import { useEffect, useMemo, useRef, useState } from "react";
import { visvalingamWhyattAlgorithm, Point, Vec2 } from "../../lib/simplify";
import { dayOfYear, formatDate, yearLength } from "../../lib/date";
import { IonButton, IonIcon } from "@ionic/react";
import { arrowBack, arrowForward } from "ionicons/icons";
import "../../theme/styles.css";

interface LineGraphProps {
  data: Point[];
  spacingY: number;
  maxNumPoints: number;
  padding: Vec2;
  unit: string;
}

export function LineGraph({ data, padding, spacingY, maxNumPoints, unit }: LineGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const width = container.offsetWidth;
      const height = Math.min(300, window.innerHeight / 3);
      setDimensions({ width, height });
    };

    updateDimensions();
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const width = Math.max(0, dimensions.width - padding.x * 2);
  const height = Math.max(0, dimensions.height - padding.y * 2);
  const numTicksY = Math.max(3, Math.round(height / spacingY));

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return visvalingamWhyattAlgorithm(data, maxNumPoints);
  }, [data, maxNumPoints]);

  const srcSize = useMemo(() => {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }
    
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
    
    const yPadding = (size.max.y - size.min.y) * 0.1;
    size.min.y = Math.max(0, size.min.y - yPadding);
    size.max.y = size.max.y + yPadding;
    
    return size;
  }, [points]);

  const svgPath = useMemo(() => {
    if (points.length === 0) return "";
    if (srcSize.min.x === 0 && srcSize.max.x === 0) return "";

    const domain = srcSize.max.x - srcSize.min.x || 1;
    const range = srcSize.max.y - srcSize.min.y || 1;

    let path = "";
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const xPercent = (p.date.getTime() - srcSize.min.x) / domain;
      const x = padding.x + xPercent * width;

      const yPercent = (p.value - srcSize.min.y) / range;
      const y = padding.y + height - (yPercent * height);

      const prefix = i === 0 ? "M" : "L";
      path += `${prefix} ${x} ${y} `;
    }

    return path.trim();
  }, [height, padding.x, padding.y, points, width, srcSize]);

  if (points.length === 0) {
    return <div ref={containerRef} style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
  }

  return (
    <div ref={containerRef}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        xmlns="http://www.w3.org/2000/svg">

        {/* Y axis spacing lines and tick values */}
        {Array.from({ length: numTicksY }, (_, i) => {
          const yPercent = i / (numTicksY - 1);
          const y = padding.y + height - (yPercent * height);
          const value = srcSize.min.y + (srcSize.max.y - srcSize.min.y) * yPercent;

          return (
            <g key={i}>
              <line
                strokeWidth="1"
                x1={padding.x} y1={y}
                x2={width + padding.x} y2={y}
                className="spacing-line"
              />
              <text
                x={padding.x - 5}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12">
                {Math.round(value)} {unit}
              </text>
            </g>
          );
        })}

        {/* X axis point labels */}
        {points.map((p, i) => {
          const domain = srcSize.max.x - srcSize.min.x || 1;
          const xPercent = (p.date.getTime() - srcSize.min.x) / domain;
          const x = padding.x + xPercent * width;
          return (
            <text
              key={i} x={x}
              y={padding.y + height + 20}
              textAnchor="middle"
              fontSize="12">
              {formatDate(p.date, true)}
            </text>
          );
        })}

        {/* X and Y axis lines */}
        <line
          x1={padding.x}
          y1={height + padding.y}
          x2={width + padding.x}
          y2={height + padding.y}
        />
        <line x1={padding.x} y1={height + padding.y} x2={padding.x} y2={padding.y} />

        {/* Data line */}
        <path d={svgPath} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => {
          const domain = srcSize.max.x - srcSize.min.x || 1;
          const range = srcSize.max.y - srcSize.min.y || 1;
          const xPercent = (p.date.getTime() - srcSize.min.x) / domain;
          const yPercent = (p.value - srcSize.min.y) / range;
          const x = padding.x + xPercent * width;
          const y = padding.y + height - (yPercent * height);
          
          return <circle key={i} cx={x} cy={y} r="4" />;
        })}
      </svg>
    </div>
  );
}

interface HeatmapProps {
  data: Point[];
  padding: Vec2;
  innerPadding: number;
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

export function Heatmap({ data, padding, innerPadding }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const width = container.offsetWidth;
      const height = Math.min(300, window.innerHeight / 3);
      setDimensions({ width, height });
    };

    updateDimensions();
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const p of data) {
      years.add(p.date.getFullYear());
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  useEffect(() => {
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears]);

  const width = Math.max(0, dimensions.width - padding.x * 2);
  const height = Math.max(0, dimensions.height - padding.y * 2);

  const valueRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 };
    
    const range = { min: Number.MAX_VALUE, max: 0 };
    for (const p of data) {
      range.min = Math.min(p.value, range.min);
      range.max = Math.max(p.value, range.max);
    }
    return range;
  }, [data]);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of data) {
      if (p.date.getFullYear() === selectedYear) {
        const key = `${p.date.getFullYear()}-${dayOfYear(p.date)}`;
        map.set(key, p.value);
      }
    }
    return map;
  }, [data, selectedYear]);

  const tileSize = { x: width / 53, y: height / 7 };
  const daysInYear = yearLength(selectedYear);

  const canGoBack = availableYears.length > 0 && selectedYear > availableYears[0];
  const canGoForward = availableYears.length > 0 && selectedYear < availableYears[availableYears.length - 1];

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div className="horizontal-strip">
        <IonButton fill="clear" onClick={() => setSelectedYear(y => y - 1)} disabled={!canGoBack}>
          <IonIcon slot="icon-only" color="white" icon={arrowBack} />
        </IonButton>
        <p>{selectedYear}</p>
        <IonButton fill="clear" onClick={() => setSelectedYear(y => y + 1)} disabled={!canGoForward}>
          <IonIcon slot="icon-only" color="white" icon={arrowForward} />
        </IonButton>
      </div>

      <svg width={dimensions.width} height={dimensions.height} xmlns="http://www.w3.org/2000/svg">
        {/* weekday labels (left side) */}
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <text
            key={day}
            x={padding.x - 8}
            y={padding.y + i * (tileSize.y + innerPadding) + tileSize.y / 2}
            fontSize="10"
            fill="var(--ion-color-medium)"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {day}
          </text>
        ))}

        {/* grid cells */}
        {Array.from({ length: daysInYear }, (_, dayIndex) => {
          const week = Math.floor(dayIndex / 7);
          const day = dayIndex % 7;
          const key = `${selectedYear}-${dayIndex + 1}`;
          const value = dataMap.get(key) ?? -1;

          let color = "#E0E5E8";
          if (value > 0) {
            const percent = (value - valueRange.min) / (valueRange.max - valueRange.min || 1);
            color = interpolateHSL("hsl(202, 98%, 80%)", "hsl(199, 98%, 37%)", percent);
          }

          return (
            <rect
              key={dayIndex}
              fill={color}
              width={tileSize.x}
              height={tileSize.y}
              x={padding.x + week * (tileSize.x + innerPadding)}
              y={padding.y + day * (tileSize.y + innerPadding)}
              rx="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
