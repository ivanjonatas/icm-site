import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {churches} from '../data';
import {Icon} from './ui';
import geography from '../map/portugal-map.json';
import placements from '../map/church-locations.json';
import './ChurchMap.css';

type Point = readonly number[];
type Box = [number, number, number, number];
type MapPart = {d: string; rings: Point[][]};
type FocusRequest = {churchId: string; serial: number};

type Label = {
  id: string;
  text: string;
  x: number;
  y: number;
  anchor: 'start' | 'end';
  font: number;
};

type PanelProps = {
  visibleIds: Set<string>;
  selectedId: string | null;
  hoveredZone: string | null;
  onHover: (zone: string | null) => void;
  onSelect: (id: string) => void;
  showNames: boolean;
  focusRequest: FocusRequest | null;
};

const municipalities = geography.municipalities.filter(
  item => item.region === 'mainland'
);

const mainland = geography.regions.find(
  item => item.id === 'mainland'
)!;

const baseBox: Box = [
  -80,
  -65,
  mainland.width + 160,
  mainland.height + 130,
];

const entries = placements.flatMap(location => {
  const church = churches.find(item => item.id === location.churchId);
  return church ? [{location, church}] : [];
});

function ringContains(point: Point, ring: Point[]) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j];
    const [bx, by] = ring[i];
    const length = (bx - ax) ** 2 + (by - ay) ** 2;

    const t = length
      ? Math.max(
          0,
          Math.min(
            1,
            ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / length
          )
        )
      : 0;

    if (
      Math.hypot(
        x - ax - t * (bx - ax),
        y - ay - t * (by - ay)
      ) < 0.06
    ) {
      return true;
    }

    if (
      (ay > y) !== (by > y) &&
      x < ((bx - ax) * (y - ay)) / (by - ay) + ax
    ) {
      inside = !inside;
    }
  }

  return inside;
}

function splitMapParts(d: string): MapPart[] {
  const rings = (d.match(/M[^M]+/g) || []).map(path => {
    const values = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const points: Point[] = [];

    for (let i = 0; i < values.length; i += 2) {
      points.push([values[i], values[i + 1]]);
    }

    const area = Math.abs(
      points.reduce((sum, point, i) => {
        const next = points[(i + 1) % points.length];
        return sum + point[0] * next[1] - next[0] * point[1];
      }, 0) / 2
    );

    return {d: path, points, area, parent: -1, depth: 0};
  });

  for (const ring of rings) {
    const parents = rings
      .map((item, index) => ({item, index}))
      .filter(
        ({item}) =>
          item.area > ring.area &&
          ringContains(ring.points[0], item.points)
      )
      .sort((a, b) => a.item.area - b.item.area);

    ring.parent = parents[0]?.index ?? -1;
  }

  const depth = (i: number): number =>
    rings[i].parent < 0 ? 0 : depth(rings[i].parent) + 1;

  rings.forEach((ring, i) => {
    ring.depth = depth(i);
  });

  return rings.flatMap((ring, i) =>
    ring.depth % 2
      ? []
      : [{
          d:
            ring.d +
            rings
              .filter(item => item.parent === i)
              .map(item => item.d)
              .join(''),
          rings: [
            ring.points,
            ...rings
              .filter(item => item.parent === i)
              .map(item => item.points),
          ],
        }]
  );
}

function partContains(point: Point, part: MapPart) {
  return (
    ringContains(point, part.rings[0]) &&
    !part.rings.slice(1).some(ring => ringContains(point, ring))
  );
}

const mapParts = new Map(
  municipalities.map(item => [item, splitMapParts(item.d)])
);

const shapes = municipalities.flatMap(municipality =>
  (mapParts.get(municipality) || []).map((part, index) => ({
    zone: municipality.id + ':' + index,
    municipalityId: municipality.id,
    name: municipality.name,
    d: part.d,
    churchIds: entries
      .filter(
        entry =>
          entry.location.municipalityId === municipality.id &&
          partContains(entry.location.point, part)
      )
      .map(entry => entry.church.id),
  }))
);

const churchZones = new Map<string, string>();

for (const shape of shapes) {
  for (const id of shape.churchIds) {
    if (!churchZones.has(id)) {
      churchZones.set(id, shape.zone);
    }
  }
}

const MAX_ZOOM = 24;

type ScreenPoint = {
  x: number;
  y: number;
};

type PanGesture = {
  kind: 'pan';
  box: Box;
  start: ScreenPoint;
  previous: ScreenPoint;
  time: number;
  vx: number;
  vy: number;
  moved: boolean;
};

type PinchGesture = {
  kind: 'pinch';
  box: Box;
  distance: number;
  anchor: ScreenPoint;
};

type Gesture = PanGesture | PinchGesture;

function clampBox(box: Box, base: Box): Box {
  const width = Math.max(
    base[2] / MAX_ZOOM,
    Math.min(base[2], box[2])
  );

  const height = width * base[3] / base[2];
  const marginX = width * .15;
  const marginY = height * .15;

  return [
    Math.max(
      base[0] - marginX,
      Math.min(base[0] + base[2] - width + marginX, box[0])
    ),
    Math.max(
      base[1] - marginY,
      Math.min(base[1] + base[3] - height + marginY, box[1])
    ),
    width,
    height,
  ];
}

function viewport(box: Box, rect: DOMRect) {
  const scale = Math.max(
    .001,
    Math.min(rect.width / box[2], rect.height / box[3])
  );

  return {
    scale,
    left: rect.left + (rect.width - box[2] * scale) / 2,
    top: rect.top + (rect.height - box[3] * scale) / 2,
  };
}

function worldPoint(
  point: ScreenPoint,
  box: Box,
  rect: DOMRect
): ScreenPoint {
  const view = viewport(box, rect);

  return {
    x: box[0] + (point.x - view.left) / view.scale,
    y: box[1] + (point.y - view.top) / view.scale,
  };
}

function boxAtPoint(
  width: number,
  anchor: ScreenPoint,
  point: ScreenPoint,
  rect: DOMRect,
  base: Box
): Box {
  const w = Math.max(
    base[2] / MAX_ZOOM,
    Math.min(base[2], width)
  );

  const h = w * base[3] / base[2];
  const view = viewport([0, 0, w, h], rect);

  return clampBox([
    anchor.x - (point.x - view.left) / view.scale,
    anchor.y - (point.y - view.top) / view.scale,
    w,
    h,
  ], base);
}

function useMapCamera(base: Box, clearHover: () => void) {
  const [box, setBox] = useState<Box>(base);
  const [interacting, setInteracting] = useState(false);

  const svg = useRef<SVGSVGElement>(null);
  const current = useRef<Box>(base);
  const pointers = useRef(new Map<number, ScreenPoint>());
  const gesture = useRef<Gesture | null>(null);
  const ignoreClick = useRef(false);
  const paintFrame = useRef<number | null>(null);
  const motionFrame = useRef<number | null>(null);
  const alive = useRef(true);
  const hover = useRef(clearHover);

  hover.current = clearHover;

  function apply(candidate: Box) {
    const next = clampBox(candidate, base);

    if (
      next.every(
        (value, index) =>
          Math.abs(value - current.current[index]) < .00001
      )
    ) {
      return;
    }

    current.current = next;

    if (paintFrame.current !== null) return;

    paintFrame.current = requestAnimationFrame(() => {
      paintFrame.current = null;

      if (alive.current) {
        setBox([...current.current]);
      }
    });
  }

  function stopMotion() {
    if (motionFrame.current !== null) {
      cancelAnimationFrame(motionFrame.current);
    }

    motionFrame.current = null;
    setInteracting(false);
  }

  function animate(candidate: Box) {
    stopMotion();
    hover.current();

    const target = clampBox(candidate, base);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply(target);
      return;
    }

    const start = [...current.current] as Box;
    const began = performance.now();

    function step(time: number) {
      const progress = Math.min(1, (time - began) / 260);
      const eased = 1 - (1 - progress) ** 3;

      apply(
        start.map(
          (value, index) =>
            value + (target[index] - value) * eased
        ) as Box
      );

      motionFrame.current =
        progress < 1 ? requestAnimationFrame(step) : null;
    }

    motionFrame.current = requestAnimationFrame(step);
  }

  function capturePointers() {
    for (const id of pointers.current.keys()) {
      try {
        svg.current?.setPointerCapture(id);
      } catch {}
    }
  }

  function rebase() {
    if (!svg.current) return;

    const points = [...pointers.current.values()];
    const view = [...current.current] as Box;

    if (points.length >= 2) {
      const centre = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };

      gesture.current = {
        kind: 'pinch',
        box: view,
        distance: Math.max(
          1,
          Math.hypot(
            points[1].x - points[0].x,
            points[1].y - points[0].y
          )
        ),
        anchor: worldPoint(
          centre,
          view,
          svg.current.getBoundingClientRect()
        ),
      };

      ignoreClick.current = true;
      setInteracting(true);
      hover.current();
      capturePointers();
    } else if (points.length === 1) {
      gesture.current = {
        kind: 'pan',
        box: view,
        start: points[0],
        previous: points[0],
        time: performance.now(),
        vx: 0,
        vy: 0,
        moved: ignoreClick.current,
      };
    } else {
      gesture.current = null;
    }
  }

  function onPointerDown(
    event: React.PointerEvent<SVGSVGElement>
  ) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    stopMotion();

    if (pointers.current.size === 0) {
      ignoreClick.current = false;
    }

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    rebase();
  }

  function onPointerMove(
    event: React.PointerEvent<SVGSVGElement>
  ) {
    if (
      !pointers.current.has(event.pointerId) ||
      !svg.current
    ) {
      return;
    }

    const point = {
      x: event.clientX,
      y: event.clientY,
    };

    pointers.current.set(event.pointerId, point);

    const active = gesture.current;
    if (!active) return;

    const rect = svg.current.getBoundingClientRect();

    if (active.kind === 'pinch') {
      const points = [...pointers.current.values()];
      if (points.length < 2) return;

      const centre = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };

      const distance = Math.max(
        1,
        Math.hypot(
          points[1].x - points[0].x,
          points[1].y - points[0].y
        )
      );

      apply(
        boxAtPoint(
          active.box[2] * active.distance / distance,
          active.anchor,
          centre,
          rect,
          base
        )
      );

      return;
    }

    const dx = point.x - active.start.x;
    const dy = point.y - active.start.y;

    if (!active.moved && Math.hypot(dx, dy) < 5) {
      return;
    }

    if (!active.moved) {
      active.moved = true;
      ignoreClick.current = true;
      setInteracting(true);
      hover.current();
      capturePointers();
    }

    const scale = viewport(active.box, rect).scale;
    const time = performance.now();
    const elapsed = Math.max(8, time - active.time);

    active.vx =
      active.vx * .35 -
      (point.x - active.previous.x) / scale / elapsed * .65;

    active.vy =
      active.vy * .35 -
      (point.y - active.previous.y) / scale / elapsed * .65;

    active.previous = point;
    active.time = time;

    apply([
      active.box[0] - dx / scale,
      active.box[1] - dy / scale,
      active.box[2],
      active.box[3],
    ]);
  }

  function glide(active: PanGesture) {
    if (
      !svg.current ||
      performance.now() - active.time > 90 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const scale = viewport(
      current.current,
      svg.current.getBoundingClientRect()
    ).scale;

    let vx = Math.max(
      -2.2 / scale,
      Math.min(2.2 / scale, active.vx)
    );

    let vy = Math.max(
      -2.2 / scale,
      Math.min(2.2 / scale, active.vy)
    );

    if (Math.hypot(vx, vy) * scale < .08) return;

    let previous = performance.now();
    setInteracting(true);

    function step(time: number) {
      const elapsed = Math.min(
        32,
        Math.max(1, time - previous)
      );

      previous = time;

      const view = current.current;

      const next = clampBox([
        view[0] + vx * elapsed,
        view[1] + vy * elapsed,
        view[2],
        view[3],
      ], base);

      if (Math.abs(next[0] - view[0]) < .0001) vx = 0;
      if (Math.abs(next[1] - view[1]) < .0001) vy = 0;

      apply(next);

      const decay = Math.exp(-elapsed / 160);
      vx *= decay;
      vy *= decay;

      if (Math.hypot(vx, vy) * scale > .02) {
        motionFrame.current = requestAnimationFrame(step);
      } else {
        motionFrame.current = null;
        setInteracting(false);
      }
    }

    motionFrame.current = requestAnimationFrame(step);
  }

  function endPointer(
    event: React.PointerEvent<SVGSVGElement>,
    cancelled = false
  ) {
    if (!pointers.current.has(event.pointerId)) return;

    const active = gesture.current;
    pointers.current.delete(event.pointerId);

    try {
      if (svg.current?.hasPointerCapture(event.pointerId)) {
        svg.current.releasePointerCapture(event.pointerId);
      }
    } catch {}

    if (pointers.current.size) {
      rebase();
    } else {
      gesture.current = null;
      setInteracting(false);

      if (
        !cancelled &&
        active?.kind === 'pan' &&
        active.moved
      ) {
        glide(active);
      }
    }
  }

  function zoomBy(
    factor: number,
    point?: ScreenPoint,
    smooth = true
  ) {
    if (!svg.current) return;

    stopMotion();
    hover.current();

    const rect = svg.current.getBoundingClientRect();

    const centre = point ?? {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const anchor = worldPoint(
      centre,
      current.current,
      rect
    );

    const next = boxAtPoint(
      current.current[2] * factor,
      anchor,
      centre,
      rect,
      base
    );

    if (smooth) {
      animate(next);
    } else {
      apply(next);
    }
  }

  function reset() {
    animate(base);
  }

  function pan(x: number, y: number) {
    const view = current.current;

    animate([
      view[0] + x * view[2] / 6,
      view[1] + y * view[3] / 6,
      view[2],
      view[3],
    ]);
  }

  function focus(point: Point) {
    const width = Math.min(
      current.current[2],
      base[2] / 6
    );

    const height = width * base[3] / base[2];

    animate([
      point[0] - width / 2,
      point[1] - height / 2,
      width,
      height,
    ]);
  }

  useEffect(() => {
    alive.current = true;

    const element = svg.current;
    if (!element) return;

    function wheel(event: WheelEvent) {
      const focused =
        element === document.activeElement ||
        element!.contains(document.activeElement);

      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !focused
      ) {
        return;
      }

      event.preventDefault();

      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element!.clientHeight
            : 1;

      const delta = Math.max(
        -120,
        Math.min(120, event.deltaY * unit)
      );

      zoomBy(
        Math.exp(delta * .0025),
        {x: event.clientX, y: event.clientY},
        false
      );
    }

    element.addEventListener('wheel', wheel, {
      passive: false,
    });

    return () => {
      alive.current = false;
      element.removeEventListener('wheel', wheel);

      if (paintFrame.current !== null) {
        cancelAnimationFrame(paintFrame.current);
      }

      if (motionFrame.current !== null) {
        cancelAnimationFrame(motionFrame.current);
      }

      paintFrame.current = null;
      motionFrame.current = null;
      pointers.current.clear();
      gesture.current = null;
    };
  }, [base]);

  return {
    box,
    svg,
    interacting,
    ignoreClick,
    zoomBy,
    reset,
    pan,
    focus,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (
        event: React.PointerEvent<SVGSVGElement>
      ) => endPointer(event),
      onPointerCancel: (
        event: React.PointerEvent<SVGSVGElement>
      ) => endPointer(event, true),
      onLostPointerCapture: (
        event: React.PointerEvent<SVGSVGElement>
      ) => {
        if (event.target === event.currentTarget) {
          endPointer(event, true);
        }
      },
    },
  };
}

function googleMaps(address: string) {
  const query = /Portugal/i.test(address)
    ? address
    : address + ', Portugal';

  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(query)
  );
}

function MapPanel({
  visibleIds,
  selectedId,
  hoveredZone,
  onHover,
  onSelect,
  showNames,
  focusRequest,
}: PanelProps) {
  const camera = useMapCamera(
    baseBox,
    () => onHover(null)
  );

  const {box, svg, ignoreClick} = camera;

  const [size, setSize] = useState({
    width: 440,
    height: 818,
  });

  const titleId = useId();

  const list = useMemo(
    () => entries.filter(
      entry => visibleIds.has(entry.church.id)
    ),
    [visibleIds]
  );

  const zoom = baseBox[2] / box[2];

  const scale = Math.max(
    .01,
    Math.min(
      size.width / box[2],
      size.height / box[3]
    )
  );

  const pinScale = 18 / (38 * scale);

  useEffect(() => {
    if (!svg.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(svg.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!focusRequest) return;

    const entry = entries.find(
      item => item.church.id === focusRequest.churchId
    );

    if (entry && visibleIds.has(entry.church.id)) {
      camera.focus(entry.location.point);
    }
  }, [focusRequest, visibleIds]);

  const choose = useCallback((id: string) => {
    if (!ignoreClick.current) {
      onSelect(id);
    }
  }, [onSelect]);

  const areas = useMemo(
    () => shapes.map(shape => ({
      ...shape,
      churches: shape.churchIds.filter(
        id => visibleIds.has(id)
      ),
    })),
    [visibleIds]
  );

  const municipalityLayer = useMemo(() => (
    <g className="map-municipalities">
      {areas.map(area => {
        const hasChurch = area.churches.length > 0;

        return (
          <path
            key={area.zone}
            d={area.d}
            fillRule="evenodd"
            data-municipality={area.municipalityId}
            data-part={area.zone.split(':')[1]}
            className={
              'map-municipality' +
              (hasChurch ? ' has-church' : '') +
              (
                hasChurch && hoveredZone === area.zone
                  ? ' is-hovered'
                  : ''
              )
            }
            onPointerEnter={event => {
              if (event.pointerType === 'mouse') {
                onHover(hasChurch ? area.zone : null);
              }
            }}
            onPointerLeave={() => onHover(null)}
            onClick={() => {
              if (area.churches[0]) {
                choose(area.churches[0]);
              }
            }}
          >
            <title>
              {
                area.name +
                (
                  hasChurch
                    ? ' · Igreja Cristã Maranata'
                    : ''
                )
              }
            </title>
          </path>
        );
      })}
    </g>
  ), [areas, hoveredZone, onHover, choose]);

  const labels = (() => {
    const width = box[2] * scale;
    const height = box[3] * scale;

    const priority = (id: string) =>
      id === 'caldas-da-rainha'
        ? 2
        : id === selectedId
          ? 1
          : 0;

    const candidates = [...list].sort(
      (a, b) =>
        priority(b.church.id) -
        priority(a.church.id)
    );

    const occupied = list.map(entry => ({
      x:
        (entry.location.point[0] - box[0]) * scale -
        10,
      y:
        (entry.location.point[1] - box[1]) * scale -
        27,
      w: 20,
      h: 29,
    }));

    const result: Label[] = [];

    for (const entry of candidates) {
      const [gx, gy] = entry.location.point;
      const px = (gx - box[0]) * scale;
      const py = (gy - box[1]) * scale;

      if (
        px < 0 ||
        py < 0 ||
        px > width ||
        py > height
      ) {
        continue;
      }

      const text = [
        'maanaim-de-portugal',
        'cruz-pau-amora',
      ].includes(entry.church.id)
        ? entry.location.locality
        : entry.church.name;

      const isCaldas =
        entry.church.id === 'caldas-da-rainha';

      const font = Math.min(
        11,
        (width - 12) / (text.length * 0.64 + 1)
      );

      const w = text.length * font * 0.64 + 4;
      const h = font + 6;

      const offsets = [
        {
          dx: 15,
          dy: isCaldas ? -10 : 0,
          anchor: 'start' as const,
        },
        {
          dx: -15,
          dy: 0,
          anchor: 'end' as const,
        },
      ];

      for (const offset of offsets) {
        let left =
          px +
          offset.dx -
          (offset.anchor === 'end' ? w : 0);

        const top = py + offset.dy - h / 2;

        if (isCaldas) {
          left = Math.max(
            4,
            Math.min(width - w - 4, left)
          );
        }

        if (
          left < 3 ||
          top < 3 ||
          left + w > width - 3 ||
          top + h > height - 3
        ) {
          continue;
        }

        const collides = occupied.some(
          item =>
            left < item.x + item.w + 4 &&
            left + w + 4 > item.x &&
            top < item.y + item.h + 3 &&
            top + h + 3 > item.y
        );

        if (
          collides &&
          !isCaldas &&
          entry.church.id !== selectedId
        ) {
          continue;
        }

        const textX =
          offset.anchor === 'end'
            ? left + w
            : left;

        result.push({
          id: entry.church.id,
          text,
          font,
          anchor: offset.anchor,
          x: box[0] + textX / scale,
          y: gy + offset.dy / scale,
        });

        occupied.push({
          x: left,
          y: top,
          w,
          h,
        });

        break;
      }
    }

    return result;
  })();

  return (
    <section
      className="church-map-panel church-map-panel--mainland"
      aria-label="Mapa de Portugal continental"
    >
      <div className="map-panel-heading">
        <h3>Portugal continental</h3>
        <span>
          278 concelhos · arraste e amplie para explorar
        </span>
      </div>

      <div
        className={
          'map-svg-frame' +
          (camera.interacting ? ' is-interacting' : '')
        }
      >
        <svg
          ref={svg}
          viewBox={box.join(' ')}
          role="group"
          tabIndex={0}
          aria-labelledby={titleId}
          preserveAspectRatio="xMidYMid meet"
          onPointerLeave={() => onHover(null)}
          {...camera.handlers}
          onKeyDown={event => {
            if (
              event.target !== event.currentTarget
            ) {
              return;
            }

            const steps: Record<string, number[]> = {
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
              ArrowUp: [0, -1],
              ArrowDown: [0, 1],
            };

            if (
              [
                '+',
                '=',
                '-',
                'Home',
                ...Object.keys(steps),
              ].includes(event.key)
            ) {
              event.preventDefault();
            }

            if (
              event.key === '+' ||
              event.key === '='
            ) {
              camera.zoomBy(.65);
            }

            if (event.key === '-') {
              camera.zoomBy(1 / .65);
            }

            if (event.key === 'Home') {
              camera.reset();
            }

            const step = steps[event.key];

            if (step) {
              camera.pan(step[0], step[1]);
            }
          }}
        >
          <title id={titleId}>
            Igrejas em Portugal continental e limites dos concelhos
          </title>

          <desc>
            Marcadores numerados nas localizações das igrejas.
            Só as zonas com igreja ficam vermelhas ao passar o rato.
            Arraste com um dedo e use dois dedos para ampliar ou reduzir.
            Também pode usar os botões de zoom ou as setas do teclado.
          </desc>

          {municipalityLayer}

          <g className="map-church-pins">
            {list.map(entry => {
              const zone =
                churchZones.get(entry.church.id) || '';

              return (
                <g
                  key={entry.church.id}
                  className="church-map-pin"
                  data-church={entry.church.id}
                  transform={
                    'translate(' +
                    entry.location.point.join(' ') +
                    ') scale(' +
                    pinScale +
                    ')'
                  }
                  role="button"
                  tabIndex={0}
                  aria-pressed={
                    selectedId === entry.church.id
                  }
                  aria-label={
                    'Selecionar igreja ' +
                    entry.church.name
                  }
                  onClick={event => {
                    event.stopPropagation();
                    choose(entry.church.id);
                  }}
                  onKeyDown={event => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelect(entry.church.id);
                    }
                  }}
                  onPointerEnter={event => {
                    if (
                      event.pointerType === 'mouse'
                    ) {
                      onHover(zone);
                    }
                  }}
                  onPointerLeave={() => onHover(null)}
                >
                  <title>
                    {entry.church.name}
                  </title>

                  <path
                    className="map-pin-target"
                    d="M-47-82H47V12H-47Z"
                  />

                  <path
                    className="map-pin-shape"
                    d="M0 0C-7-10-19-22-19-34a19 19 0 1 1 38 0C19-22 7-10 0 0Z"
                  />

                  <circle
                    className="map-pin-centre"
                    cx="0"
                    cy="-34"
                    r="12.2"
                  />

                  <text
                    x="0"
                    y="-30.1"
                    textAnchor="middle"
                  >
                    {entries.indexOf(entry) + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {showNames && (
            <g
              className="map-place-names"
              aria-hidden="true"
            >
              {labels.map(label => (
                <text
                  key={label.id}
                  data-label={label.text}
                  data-label-for={label.id}
                  x={label.x}
                  y={label.y}
                  fontSize={label.font / scale}
                  textAnchor={label.anchor}
                >
                  {label.text}
                </text>
              ))}
            </g>
          )}
        </svg>

        <div
          className="map-zoom-controls"
          aria-label="Zoom de Portugal continental"
        >
          <button
            type="button"
            onClick={() => camera.zoomBy(.65)}
            disabled={zoom >= MAX_ZOOM - .01}
            aria-label="Ampliar Portugal continental"
            title="Ampliar"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => camera.zoomBy(1 / .65)}
            disabled={zoom <= 1.01}
            aria-label="Reduzir Portugal continental"
            title="Reduzir"
          >
            −
          </button>

          <button
            type="button"
            onClick={() => camera.reset()}
            aria-label="Repor vista de Portugal continental"
            title="Repor vista"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
            </svg>
          </button>
        </div>

        <span className="map-drag-note">
          {
            'Arraste para explorar · ' +
            zoom.toFixed(1) +
            '×'
          }
        </span>
      </div>
    </section>
  );
}

export default function ChurchMap({
  visibleChurchIds,
}: {
  visibleChurchIds?: string[];
}) {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [hoveredZone, setHoveredZone] =
    useState<string | null>(null);

  const [showNames, setShowNames] = useState(true);

  const [focusRequest, setFocusRequest] =
    useState<FocusRequest | null>(null);

  const mapTop = useRef<HTMLDivElement>(null);
  const focusSerial = useRef(0);
  const titleId = useId();

  const filterKey =
    visibleChurchIds === undefined
      ? '__all__'
      : [...visibleChurchIds].sort().join('|');

  const visibleIds = useMemo(
    () => new Set(
      visibleChurchIds ??
      churches.map(item => item.id)
    ),
    [filterKey]
  );

  const list = entries.filter(
    entry => visibleIds.has(entry.church.id)
  );

  const selected = list.find(
    entry => entry.church.id === selectedId
  );

  const hovered = municipalities.find(
    item =>
      item.id === hoveredZone?.split(':')[0]
  );

  useEffect(() => {
    setHoveredZone(null);

    setSelectedId(
      current =>
        current && visibleIds.has(current)
          ? current
          : null
    );
  }, [filterKey]);

  const selectChurch = useCallback((
    id: string,
    focus = true
  ) => {
    if (!visibleIds.has(id)) return;

    setSelectedId(id);
    setHoveredZone(null);

    if (!focus) return;

    setFocusRequest({
      churchId: id,
      serial: ++focusSerial.current,
    });

    if (window.innerWidth < 900) {
      mapTop.current?.scrollIntoView({
        behavior: window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    }
  }, [visibleIds]);

  const selectFromMap = useCallback(
    (id: string) => selectChurch(id, false),
    [selectChurch]
  );

  return (
    <section
      className="church-map-section"
      aria-labelledby={titleId}
    >
      <div className="container">
        <div className="church-map-intro">
          <div>
            <span className="eyebrow">
              A nossa presença em Portugal
            </span>

            <h2 id={titleId}>
              Encontre-nos no mapa.
            </h2>
          </div>
        </div>

        <div
          className="church-map-shell"
          ref={mapTop}
        >
          <div className="church-map-toolbar">
            <span className="map-view-label">
              Portugal continental
            </span>

            <label className="map-names-toggle">
              <input
                type="checkbox"
                checked={showNames}
                onChange={event =>
                  setShowNames(event.target.checked)
                }
              />
              Nomes das localidades
            </label>
          </div>

          <div className="church-map-layout">
            <div className="church-map-atlas">
              <div className="map-atlas-top">
                <span>
                  <strong>PORTUGAL</strong>
                  <small>Limites por concelho</small>
                </span>

                <div className="map-city-shortcuts">
                  <button
                    type="button"
                    disabled={!visibleIds.has('lisboa')}
                    onClick={() =>
                      selectChurch('lisboa')
                    }
                  >
                    Detalhar Lisboa
                  </button>

                  <button
                    type="button"
                    disabled={!visibleIds.has('porto')}
                    onClick={() =>
                      selectChurch('porto')
                    }
                  >
                    Detalhar Porto
                  </button>
                </div>

                <span
                  className="map-north"
                  aria-label="Norte"
                >
                  <svg
                    viewBox="0 0 20 30"
                    aria-hidden="true"
                  >
                    <path
                      d="m10 1 7 22-7-5-7 5Z"
                      fill="currentColor"
                    />
                  </svg>
                  N
                </span>
              </div>

              <div
                className="map-hover-caption"
                aria-hidden="true"
              >
                <strong>
                  {
                    hovered?.name ??
                    'Um território. A mesma esperança.'
                  }
                </strong>

                <span>
                  {
                    hovered
                      ? 'Zona com igreja no diretório'
                      : 'Arraste para navegar. Use dois dedos ou Ctrl + roda do rato para ampliar.'
                  }
                </span>
              </div>

              <MapPanel
                visibleIds={visibleIds}
                selectedId={selectedId}
                hoveredZone={hoveredZone}
                onHover={setHoveredZone}
                onSelect={selectFromMap}
                showNames={showNames}
                focusRequest={focusRequest}
              />

              <div className="map-colour-key">
                <span>
                  <i className="key-church" />
                  Área do concelho com igreja
                </span>

                <span>
                  <i className="key-hover" />
                  Ao passar o rato
                </span>

                <span>
                  <Icon name="pin" />
                  Igreja no diretório
                </span>
              </div>
            </div>

            <aside
              className="church-map-legend"
              aria-label="Legenda das igrejas no mapa"
            >
              <div className="map-legend-heading">
                <span className="eyebrow">
                  Legenda
                </span>

                <h3>As nossas igrejas</h3>

                <p>
                  <strong>{list.length}</strong>
                  {' '}
                  {
                    list.length === 1
                      ? 'igreja disponível'
                      : 'igrejas disponíveis'
                  }
                  {
                    visibleChurchIds !== undefined &&
                    ' nos filtros atuais'
                  }
                </p>
              </div>

              {selected ? (
                <div
                  className="map-selected-card"
                  aria-live="polite"
                >
                  <div className="map-selected-top">
                    <span className="map-legend-number">
                      {
                        entries.indexOf(selected) + 1
                      }
                    </span>

                    <span>Igreja selecionada</span>
                  </div>

                  <h4>{selected.church.name}</h4>

                  <p>{selected.church.address}</p>

                  <a
                    href={googleMaps(
                      selected.church.address
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir no Google Maps
                    <Icon name="external" />

                    <span className="sr-only">
                      {' '}
                      (abre num novo separador)
                    </span>
                  </a>
                </div>
              ) : (
                <p className="map-selection-hint">
                  Selecione uma igreja no mapa ou na legenda
                  para consultar a morada.
                </p>
              )}

              <ol className="map-legend-list">
                {list.map(entry => (
                  <li
                    key={entry.church.id}
                    className={
                      selectedId === entry.church.id
                        ? 'is-selected'
                        : ''
                    }
                  >
                    <button
                      type="button"
                      className="map-legend-choice"
                      aria-pressed={
                        selectedId === entry.church.id
                      }
                      onClick={() =>
                        selectChurch(entry.church.id)
                      }
                    >
                      <span className="map-legend-number">
                        {
                          entries.indexOf(entry) + 1
                        }
                      </span>

                      <span>
                        <strong>
                          {entry.church.name}
                        </strong>

                        <small>
                          {entry.location.locality}
                          {' · '}
                          {
                            municipalities.find(
                              item =>
                                item.id ===
                                entry.location.municipalityId
                            )?.name
                          }
                        </small>

                        <span className="map-legend-address">
                          {entry.church.address}
                        </span>
                      </span>
                    </button>

                    <a
                      className="map-legend-directions"
                      href={googleMaps(
                        entry.church.address
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        'Obter direções para ' +
                        entry.church.name +
                        ' no Google Maps (novo separador)'
                      }
                    >
                      <Icon name="external" />
                    </a>
                  </li>
                ))}
              </ol>

              {!list.length && (
                <p className="map-no-results">
                  Não há igrejas com estes filtros.
                  Limpe a pesquisa para voltar a ver
                  todos os marcadores.
                </p>
              )}

              <a
                className="map-to-list"
                href="#lista-igrejas"
              >
                Consultar a lista e os horários
                <Icon name="arrow" />
              </a>
            </aside>
          </div>

          <div className="church-map-footnote">
            <p>
              Marcadores aproximados por rua ou localidade.
              A ponta de cada símbolo mantém a localização
              geográfica. Amplie para distinguir igrejas próximas.
              Para o percurso, utilize a morada no Google Maps.
            </p>

            <p>
              Cartografia:{' '}
              <a
                href="https://www.dgterritorio.gov.pt/atividades/cartografia/cartografia-tematica/caop"
                target="_blank"
                rel="noopener noreferrer"
              >
                DGT / CAOP
              </a>
              {' · '}
              <a
                href="https://github.com/nmota/caop_GeoJSON"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dados cartográficos
              </a>
              {' · '}
              Localizações:{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © OpenStreetMap contributors
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}