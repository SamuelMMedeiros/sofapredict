import { useMemo } from "react";

interface TeamStats {
  name: string;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  passes: number;
  passAccuracy: number;
}

interface TacticalRadarProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
}

export default function TacticalRadar({ homeTeam, awayTeam }: TacticalRadarProps) {
  const radarData = useMemo(() => {
    const size = 200;
    const center = size / 2;
    const maxValue = 100;
    const levels = 5;

    // Normalize stats to 0-100 scale
    const normalizeStats = (team: TeamStats) => ({
      possession: team.possession,
      shots: Math.min((team.shots / 20) * 100, 100),
      accuracy: team.passAccuracy,
      corners: Math.min((team.corners / 15) * 100, 100),
      fouls: Math.min((team.fouls / 20) * 100, 100),
    });

    const home = normalizeStats(homeTeam);
    const away = normalizeStats(awayTeam);

    // Generate radar points
    const categories = ["Posse", "Chutes", "Precisão", "Escanteios", "Faltas"];
    const homeValues = [home.possession, home.shots, home.accuracy, home.corners, home.fouls];
    const awayValues = [away.possession, away.shots, away.accuracy, away.corners, away.fouls];

    // Calculate SVG path
    const angleSlice = (Math.PI * 2) / categories.length;

    const calculatePoint = (value: number, index: number, radius: number) => {
      const angle = angleSlice * index - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x, y };
    };

    const radiusScale = (size / 2 - 20) / maxValue;

    // Generate paths
    const generatePath = (values: number[]) => {
      return values
        .map((value, i) => {
          const point = calculatePoint(value * radiusScale, i, 1);
          return `${point.x},${point.y}`;
        })
        .join(" ");
    };

    const homePath = generatePath(homeValues);
    const awayPath = generatePath(awayValues);

    // Generate grid lines
    const gridLines = [];
    for (let i = 1; i <= levels; i++) {
      const radius = (size / 2 - 20) * (i / levels);
      const points = categories
        .map((_, index) => {
          const point = calculatePoint(1, index, radius);
          return `${point.x},${point.y}`;
        })
        .join(" ");
      gridLines.push(points);
    }

    // Generate axis lines
    const axisLines = categories.map((_, index) => {
      const point = calculatePoint(1, index, size / 2 - 20);
      return { x: point.x, y: point.y };
    });

    return {
      size,
      center,
      homePath,
      awayPath,
      gridLines,
      axisLines,
      categories,
      homeValues,
      awayValues,
    };
  }, [homeTeam, awayTeam]);

  return (
    <div className="w-full space-y-4">
      {/* SVG Radar */}
      <div className="flex justify-center bg-[#0c1322] border border-[#1e293b] rounded-lg p-4">
        <svg width={radarData.size} height={radarData.size} viewBox={`0 0 ${radarData.size} ${radarData.size}`}>
          {/* Grid circles */}
          {radarData.gridLines.map((points, i) => (
            <polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Axis lines */}
          {radarData.axisLines.map((point, i) => (
            <line
              key={`axis-${i}`}
              x1={radarData.center}
              y1={radarData.center}
              x2={point.x}
              y2={point.y}
              stroke="#1e293b"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Home team polygon */}
          <polygon
            points={radarData.homePath}
            fill="#10b981"
            fillOpacity="0.25"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Away team polygon */}
          <polygon
            points={radarData.awayPath}
            fill="#3b82f6"
            fillOpacity="0.25"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Category labels */}
          {radarData.categories.map((category, i) => {
            const angle = (Math.PI * 2 * i) / radarData.categories.length - Math.PI / 2;
            const x = radarData.center + (radarData.size / 2 - 5) * Math.cos(angle);
            const y = radarData.center + (radarData.size / 2 - 5) * Math.sin(angle);
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="bold"
              >
                {category}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend and Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Home Team */}
        <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <h3 className="text-white font-semibold text-sm">{homeTeam.name}</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Posse:</span>
              <span className="text-white font-bold">{homeTeam.possession}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Chutes:</span>
              <span className="text-white font-bold">{homeTeam.shots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Precisão:</span>
              <span className="text-white font-bold">{homeTeam.passAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Escanteios:</span>
              <span className="text-white font-bold">{homeTeam.corners}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Faltas:</span>
              <span className="text-white font-bold">{homeTeam.fouls}</span>
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <h3 className="text-white font-semibold text-sm">{awayTeam.name}</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Posse:</span>
              <span className="text-white font-bold">{awayTeam.possession}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Chutes:</span>
              <span className="text-white font-bold">{awayTeam.shots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Precisão:</span>
              <span className="text-white font-bold">{awayTeam.passAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Escanteios:</span>
              <span className="text-white font-bold">{awayTeam.corners}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Faltas:</span>
              <span className="text-white font-bold">{awayTeam.fouls}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
