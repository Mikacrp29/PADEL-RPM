interface WeekPoint {
  weekStart: string;
  value: number;
}

interface MiniBarChartProps {
  label: string;
  color: string;
  data: WeekPoint[];
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 110;
const BAR_GAP = 4;

/**
 * A small, dependency-free bar chart — no charting library is installed in
 * this project, and adding one would require an `npm install` this app's
 * owner can't run locally (no Node.js on their machine, only the GitHub
 * web editor). A dozen SVG rects is simpler and has zero deploy risk.
 */
export function MiniBarChart({ label, color, data }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = CHART_WIDTH / data.length - BAR_GAP;

  const formatWeek = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <div className="rounded-2xl border border-court-700 bg-court-900 p-4">
      <p className="mb-3 text-sm font-medium text-mist-300">{label}</p>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 100 }}
      >
        {data.map((point, i) => {
          const barHeight = Math.max(1, (point.value / max) * (CHART_HEIGHT - 4));
          const x = i * (barWidth + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;
          return (
            <rect key={point.weekStart} x={x} y={y} width={barWidth} height={barHeight} fill={color} rx={2}>
              <title>{`Semaine du ${formatWeek(point.weekStart)} : ${point.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-mist-600">
        <span>{data[0] ? formatWeek(data[0].weekStart) : ''}</span>
        <span>{data[data.length - 1] ? formatWeek(data[data.length - 1].weekStart) : ''}</span>
      </div>
    </div>
  );
}