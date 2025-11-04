import { useEffect, useMemo, useRef, useState } from "react";
import { visvalingamWhyattAlgorithm, Point, Vec2 } from "../../lib/simplify";
import { dayOfYear, formatDate } from "../../lib/date";
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
  const [quarterIndex, setQuarterIndex] = useState(0); // 0, 1, or 2 for three 4-month periods

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const width = container.offsetWidth;
      setDimensions({ width, height: 0 }); // Height will be calculated based on content
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
      const latestYear = availableYears[availableYears.length - 1];
      setSelectedYear(latestYear);

      // Set quarter based on current month
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 0 && currentMonth <= 3) {
        setQuarterIndex(0); // Jan-Apr
      } else if (currentMonth >= 4 && currentMonth <= 7) {
        setQuarterIndex(1); // May-Aug
      } else {
        setQuarterIndex(2); // Sep-Dec
      }
    }
  }, [availableYears]);

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

  // Determine date range for current view (4 months)
  const { startMonth, endMonth, startDay, endDay, label } = useMemo(() => {
    let start, end, startM, endM, lbl;

    if (quarterIndex === 0) {
      // Jan-Apr
      start = new Date(selectedYear, 0, 1);
      end = new Date(selectedYear, 3, 30);
      startM = 0;
      endM = 3;
      lbl = 'Jan-Apr';
    } else if (quarterIndex === 1) {
      // May-Aug
      start = new Date(selectedYear, 4, 1);
      end = new Date(selectedYear, 7, 31);
      startM = 4;
      endM = 7;
      lbl = 'May-Aug';
    } else {
      // Sep-Dec
      start = new Date(selectedYear, 8, 1);
      end = new Date(selectedYear, 11, 31);
      startM = 8;
      endM = 11;
      lbl = 'Sep-Dec';
    }

    return {
      startMonth: startM,
      endMonth: endM,
      startDay: dayOfYear(start),
      endDay: dayOfYear(end),
      label: lbl
    };
  }, [selectedYear, quarterIndex]);

  const tileWidth = 18;
  const tileHeight = 12;
  const daysInRange = endDay - startDay + 1;
  const weeksInRange = Math.ceil(daysInRange / 7);

  // Calculate SVG dimensions based on content
  const contentWidth = padding.x + 7 * (tileWidth + innerPadding) + padding.x;
  const svgHeight = padding.y + weeksInRange * (tileHeight + innerPadding) + padding.y;

  // Center horizontally
  const offsetX = Math.max(0, (dimensions.width - contentWidth) / 2);

  // Get month boundaries for labels (only for visible months)
  const monthStarts = useMemo(() => {
    const months: { week: number; name: string }[] = [];

    for (let month = startMonth; month <= endMonth; month++) {
      const date = new Date(selectedYear, month, 1);
      const dayOfYearNum = dayOfYear(date);
      const week = Math.floor((dayOfYearNum - startDay) / 7);
      months.push({
        week,
        name: date.toLocaleString('default', { month: 'short' })
      });
    }
    return months;
  }, [selectedYear, startMonth, endMonth, startDay]);

  const canGoBack = () => {
    if (quarterIndex === 0) {
      return availableYears.length > 0 && selectedYear > availableYears[0];
    }
    return true; // Can always go back within same year
  };

  const canGoForward = () => {
    if (quarterIndex === 2) {
      return availableYears.length > 0 && selectedYear < availableYears[availableYears.length - 1];
    }
    return true; // Can always go forward within same year
  };

  const handleBack = () => {
    if (quarterIndex === 0) {
      setSelectedYear(y => y - 1);
      setQuarterIndex(2);
    } else {
      setQuarterIndex(q => q - 1);
    }
  };

  const handleForward = () => {
    if (quarterIndex === 2) {
      setSelectedYear(y => y + 1);
      setQuarterIndex(0);
    } else {
      setQuarterIndex(q => q + 1);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div className="horizontal-strip">
        <IonButton fill="clear" onClick={handleBack} disabled={!canGoBack()}>
          <IonIcon slot="icon-only" color="white" icon={arrowBack} />
        </IonButton>
        <p>{selectedYear} ({label})</p>
        <IonButton fill="clear" onClick={handleForward} disabled={!canGoForward()}>
          <IonIcon slot="icon-only" color="white" icon={arrowForward} />
        </IonButton>
      </div>

      <svg width={dimensions.width} height={svgHeight} xmlns="http://www.w3.org/2000/svg">
        {/* weekday labels (top) - only M, W, F, starting from Sunday */}
        {[
          { label: "M", index: 1 },
          { label: "W", index: 3 },
          { label: "F", index: 5 }
        ].map(({ label, index }) => (
          <text
            key={label}
            x={offsetX + padding.x + index * (tileWidth + innerPadding) + tileWidth / 2}
            y={padding.y - 8}
            fontSize="10"
            fill="var(--ion-color-medium)"
            textAnchor="middle"
            dominantBaseline="bottom"
          >
            {label}
          </text>
        ))}

        {/* month labels (left side) */}
        {monthStarts.map(({ week, name }) => (
          <text
            key={name + week}
            x={offsetX + padding.x - 8}
            y={padding.y + week * (tileHeight + innerPadding) + tileHeight / 2}
            fontSize="10"
            fill="var(--ion-color-medium)"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {name}
          </text>
        ))}

        {/* grid cells - vertical stacking, Sunday first, only showing current 4-month range */}
        {Array.from({ length: daysInRange }, (_, i) => {
          const dayIndex = startDay + i - 1; // Convert to 0-based day of year
          const date = new Date(selectedYear, 0, dayIndex + 1);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const week = Math.floor(i / 7);
          const key = `${selectedYear}-${dayIndex + 1}`;
          const value = dataMap.get(key) ?? -1;

          let color = "#E0E5E8";
          if (value > 0) {
            const percent = (value - valueRange.min) / (valueRange.max - valueRange.min || 1);
            color = interpolateHSL("hsl(202, 98%, 80%)", "hsl(199, 98%, 37%)", percent);
          }

          return (
            <rect
              key={i}
              fill={color}
              width={tileWidth}
              height={tileHeight}
              x={offsetX + padding.x + dayOfWeek * (tileWidth + innerPadding)}
              y={padding.y + week * (tileHeight + innerPadding)}
              rx="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
