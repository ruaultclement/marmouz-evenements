"use client";

type GroupPoint = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

type GroupsMapProps = {
  points: GroupPoint[];
};

const FRANCE_BOUNDS = {
  minLat: 41,
  maxLat: 51.5,
  minLng: -5.5,
  maxLng: 9.8,
};

function toPercent(lat: number, lng: number) {
  const x =
    ((lng - FRANCE_BOUNDS.minLng) /
      (FRANCE_BOUNDS.maxLng - FRANCE_BOUNDS.minLng)) *
    100;
  const y =
    ((FRANCE_BOUNDS.maxLat - lat) /
      (FRANCE_BOUNDS.maxLat - FRANCE_BOUNDS.minLat)) *
    100;

  return {
    left: Math.min(96, Math.max(4, x)),
    top: Math.min(94, Math.max(6, y)),
  };
}

export default function GroupsMap({ points }: GroupsMapProps) {
  if (points.length === 0) {
    return (
      <div className="festival-map flex items-center justify-center p-8 text-center">
        <p className="text-sm text-[#2F5D50]">
          La carte des groupes s&apos;affichera dès que les candidatures incluront une
          ville localisable.
        </p>
      </div>
    );
  }

  return (
    <div className="festival-map relative overflow-hidden">
      <div className="festival-map-glow" />
      {points.map((point) => {
        const { left, top } = toPercent(point.lat, point.lng);
        return (
          <div
            key={point.id}
            className="festival-pin"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`${point.name} · ${point.city}`}
          >
            <span className="festival-pin-dot" />
            <span className="festival-pin-label">{point.name}</span>
          </div>
        );
      })}
    </div>
  );
}
