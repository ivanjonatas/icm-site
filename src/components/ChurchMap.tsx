import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {churches} from '../data';
import {Icon} from './ui';
import geography from '../map/portugal-map.json';
import placements from '../map/church-locations.json';
import './ChurchMap.css';

type RegionId = 'mainland' | 'azores' | 'madeira' | 'selvagens';
type View = 'all' | 'mainland';
type Point = readonly number[];
type Box = [number, number, number, number];
type MapPart = {d: string; rings: Point[][]};
type FocusRequest = {churchId: string; serial: number};
type Label = {
  id: string; text: string; x: number; y: number;
  anchor: 'start' | 'end'; font: number;
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

const municipalities = geography.municipalities;
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
      ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / length))
      : 0;
    if (Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) < 0.06) return true;
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

function splitMapParts(d: string): MapPart[] {
  const rings = (d.match(/M[^M]+/g) || []).map(path => {
    const values = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const points: Point[] = [];
    for (let i = 0; i < values.length; i += 2) points.push([values[i], values[i + 1]]);
    const area = Math.abs(points.reduce((sum, point, i) => {
      const next = points[(i + 1) % points.length];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0) / 2);
    return {d: path, points, area, parent: -1, depth: 0};
  });
  for (const ring of rings) {
    const parents = rings.map((item, index) => ({item, index}))
      .filter(({item}) => item.area > ring.area && ringContains(ring.points[0], item.points))
      .sort((a, b) => a.item.area - b.item.area);
    ring.parent = parents[0]?.index ?? -1;
  }
  const depth = (i: number): number => rings[i].parent < 0 ? 0 : depth(rings[i].parent) + 1;
  rings.forEach((ring, i) => {ring.depth = depth(i);});
  return rings.flatMap((ring, i) => ring.depth % 2 ? [] : [{
    d: ring.d + rings.filter(item => item.parent === i).map(item => item.d).join(''),
    rings: [ring.points, ...rings.filter(item => item.parent === i).map(item => item.points)],
  }]);
}

function partContains(point: Point, part: MapPart) {
  return ringContains(point, part.rings[0]) &&
    !part.rings.slice(1).some(ring => ringContains(point, ring));
}

const mapParts = new Map(municipalities.map(item => [item, splitMapParts(item.d)]));

function clampBox(box: Box, base: Box): Box {
  const width = Math.max(base[2] / 12, Math.min(base[2], box[2]));
  const height = width * base[3] / base[2];
  return [
    Math.max(base[0], Math.min(base[0] + base[2] - width, box[0])),
    Math.max(base[1], Math.min(base[1] + base[3] - height, box[1])),
    width, height,
  ];
}

function googleMaps(address: string) {
  const query = /Portugal/i.test(address) ? address : address + ', Portugal';
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

function MapPanel({visibleIds, selectedId, hoveredZone, onHover, onSelect,
  showNames, focusRequest}: PanelProps) {
  const spec = geography.regions.find(item => item.id === 'mainland')!;
  const base = useMemo<Box>(() => [-80, -65, spec.width + 160, spec.height + 130], [spec]);
  const [box, setBox] = useState<Box>(base);
  const [size, setSize] = useState({width: 440, height: 970});
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{x: number; y: number; box: Box; pointer: number; moved: boolean} | null>(null);
  const ignoreClick = useRef(false);
  const titleId = useId();
  const rows = useMemo(() => municipalities.filter(item => item.region === 'mainland'), []);
  const list = entries.filter(entry => visibleIds.has(entry.church.id));
  const zoom = base[2] / box[2];
  const scale = Math.max(0.01, Math.min(size.width / box[2], size.height / box[3]));
  // The same 18 px width is used for every marker, including selected markers.
  const pinScale = 18 / (38 * scale);

  useEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({width: entry.contentRect.width, height: entry.contentRect.height});
    });
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!focusRequest) return;
    const entry = entries.find(item => item.church.id === focusRequest.churchId);
    if (!entry || !visibleIds.has(entry.church.id)) return;
    const width = base[2] / 6;
    const height = base[3] / 6;
    setBox(clampBox([
      entry.location.point[0] - width / 2,
      entry.location.point[1] - height / 2,
      width, height,
    ], base));
  }, [focusRequest, base]);

  function changeZoom(factor: number) {
    onHover(null);
    setBox(current => {
      const width = Math.max(base[2] / 12, Math.min(base[2], current[2] * factor));
      const height = width * base[3] / base[2];
      return clampBox([
        current[0] + (current[2] - width) / 2,
        current[1] + (current[3] - height) / 2,
        width, height,
      ], base);
    });
  }

  function choose(id: string) {
    if (!ignoreClick.current) onSelect(id);
  }

  const labels = (() => {
    const width = box[2] * scale;
    const height = box[3] * scale;
    const priority = (id: string) => id === 'caldas-da-rainha' ? 2 : id === selectedId ? 1 : 0;
    const candidates = [...list].sort((a, b) => priority(b.church.id) - priority(a.church.id));
    const occupied = list.map(entry => ({
      x: (entry.location.point[0] - box[0]) * scale - 10,
      y: (entry.location.point[1] - box[1]) * scale - 27,
      w: 20, h: 29,
    }));
    const result: Label[] = [];
    for (const entry of candidates) {
      const [gx, gy] = entry.location.point;
      const px = (gx - box[0]) * scale;
      const py = (gy - box[1]) * scale;
      if (px < 0 || py < 0 || px > width || py > height) continue;
      const text = ['maanaim-de-portugal', 'cruz-pau-amora'].includes(entry.church.id)
        ? entry.location.locality : entry.church.name;
      const isCaldas = entry.church.id === 'caldas-da-rainha';
      const font = Math.min(11, (width - 12) / (text.length * 0.64 + 1));
      const w = text.length * font * 0.64 + 4;
      const h = font + 6;
      const offsets = [
        {dx: 15, dy: isCaldas ? -10 : 0, anchor: 'start' as const},
        {dx: -15, dy: 0, anchor: 'end' as const},
      ];
      for (const offset of offsets) {
        let left = px + offset.dx - (offset.anchor === 'end' ? w : 0);
        const top = py + offset.dy - h / 2;
        if (isCaldas) left = Math.max(4, Math.min(width - w - 4, left));
        if (left < 3 || top < 3 || left + w > width - 3 || top + h > height - 3) continue;
        const collides = occupied.some(item =>
          left < item.x + item.w + 4 && left + w + 4 > item.x &&
          top < item.y + item.h + 3 && top + h + 3 > item.y
        );
        if (collides && !isCaldas && entry.church.id !== selectedId) continue;
        const textX = offset.anchor === 'end' ? left + w : left;
        result.push({
          id: entry.church.id, text, font, anchor: offset.anchor,
          x: box[0] + textX / scale, y: gy + offset.dy / scale,
        });
        occupied.push({x: left, y: top, w, h});
        break;
      }
    }
    return result;
  })();

  return (
    <section className="church-map-panel church-map-panel--mainland" aria-label="Mapa de Portugal continental">
      <div className="map-panel-heading">
        <h3>Portugal continental</h3>
        <span>278 concelhos · amplie para distinguir igrejas próximas</span>
      </div>
      <div className={'map-svg-frame' + (zoom > 1.01 ? ' is-zoomed' : '')}>
        <svg ref={svg} viewBox={box.join(' ')} role="group" tabIndex={0}
          aria-labelledby={titleId} preserveAspectRatio="xMidYMid meet"
          onPointerLeave={() => onHover(null)}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return;
            const steps: Record<string, number[]> = {
              ArrowLeft: [-1, 0], ArrowRight: [1, 0],
              ArrowUp: [0, -1], ArrowDown: [0, 1],
            };
            if (['+', '=', '-', 'Home', ...Object.keys(steps)].includes(event.key)) event.preventDefault();
            if (event.key === '+' || event.key === '=') changeZoom(0.65);
            if (event.key === '-') changeZoom(1 / 0.65);
            if (event.key === 'Home') {setBox(base); onHover(null);}
            const step = steps[event.key];
            if (step) {
              onHover(null);
              setBox(current => clampBox([
                current[0] + step[0] * current[2] / 6,
                current[1] + step[1] * current[3] / 6,
                current[2], current[3],
              ], base));
            }
          }}
          onPointerDown={event => {
            ignoreClick.current = false;
            if (event.button !== 0 || zoom <= 1.01) return;
            drag.current = {x: event.clientX, y: event.clientY, box: [...box], pointer: event.pointerId, moved: false};
          }}
          onPointerMove={event => {
            const current = drag.current;
            if (!current || current.pointer !== event.pointerId || !svg.current) return;
            const dx = event.clientX - current.x;
            const dy = event.clientY - current.y;
            if (Math.abs(dx) + Math.abs(dy) < 5 && !current.moved) return;
            current.moved = true;
            ignoreClick.current = true;
            onHover(null);
            svg.current.setPointerCapture(event.pointerId);
            const rect = svg.current.getBoundingClientRect();
            const s = Math.min(rect.width / current.box[2], rect.height / current.box[3]);
            setBox(clampBox([
              current.box[0] - dx / s, current.box[1] - dy / s,
              current.box[2], current.box[3],
            ], base));
          }}
          onPointerUp={event => {
            if (svg.current?.hasPointerCapture(event.pointerId)) svg.current.releasePointerCapture(event.pointerId);
            drag.current = null;
          }}
          onPointerCancel={() => {drag.current = null; ignoreClick.current = false; onHover(null);}}
          onLostPointerCapture={() => {drag.current = null;}}
        >
          <title id={titleId}>Igrejas em Portugal continental e limites dos concelhos</title>
          <desc>Marcadores numerados nas localizações das igrejas. Só as zonas com igreja ficam vermelhas ao passar o rato. Use a legenda, o zoom ou as setas para explorar.</desc>
          <g className="map-municipalities">
            {rows.map(municipality => (mapParts.get(municipality) || []).map((part, index) => {
              const local = list.filter(entry => entry.location.municipalityId === municipality.id && partContains(entry.location.point, part));
              const hasChurch = local.length > 0;
              const zone = municipality.id + ':' + index;
              const hovered = hasChurch && hoveredZone === zone;
              return (
                <path key={zone} d={part.d} fillRule="evenodd"
                  data-municipality={municipality.id} data-part={index}
                  className={'map-municipality' + (hasChurch ? ' has-church' : '') + (hovered ? ' is-hovered' : '')}
                  onPointerEnter={event => {
                    if (event.pointerType === 'mouse') onHover(hasChurch ? zone : null);
                  }}
                  onPointerLeave={() => onHover(null)}
                  onClick={() => {if (local[0]) choose(local[0].church.id);}}
                >
                  <title>{municipality.name + (hasChurch ? ' · Igreja Cristã Maranata' : '')}</title>
                </path>
              );
            }))}
          </g>
          <g className="map-church-pins">
            {list.map(entry => {
              const municipality = rows.find(item => item.id === entry.location.municipalityId)!;
              const partIndex = (mapParts.get(municipality) || []).findIndex(part => partContains(entry.location.point, part));
              const zone = municipality.id + ':' + partIndex;
              return (
                <g key={entry.church.id} className="church-map-pin"
                  data-church={entry.church.id}
                  transform={'translate(' + entry.location.point.join(' ') + ') scale(' + pinScale + ')'}
                  role="button" tabIndex={0} aria-pressed={selectedId === entry.church.id}
                  aria-label={'Selecionar igreja ' + entry.church.name}
                  onClick={event => {event.stopPropagation(); choose(entry.church.id);}}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault(); event.stopPropagation(); onSelect(entry.church.id);
                    }
                  }}
                  onPointerEnter={event => {if (event.pointerType === 'mouse') onHover(zone);}}
                  onPointerLeave={() => onHover(null)}
                >
                  <title>{entry.church.name}</title>
                  <path className="map-pin-target" d="M-27-62H27V7H-27Z" />
                  <path className="map-pin-shape" d="M0 0C-7-10-19-22-19-34a19 19 0 1 1 38 0C19-22 7-10 0 0Z" />
                  <circle className="map-pin-centre" cx="0" cy="-34" r="12.2" />
                  <text x="0" y="-30.1" textAnchor="middle">{entries.indexOf(entry) + 1}</text>
                </g>
              );
            })}
          </g>
          {showNames && (
            <g className="map-place-names" aria-hidden="true">
              {labels.map(label => (
                <text key={label.id} data-label={label.text} data-label-for={label.id}
                  x={label.x} y={label.y} fontSize={label.font / scale} textAnchor={label.anchor}>
                  {label.text}
                </text>
              ))}
            </g>
          )}
        </svg>
        <div className="map-zoom-controls" aria-label="Zoom de Portugal continental">
          <button type="button" onClick={() => changeZoom(0.65)} disabled={zoom >= 11.99} aria-label="Ampliar Portugal continental" title="Ampliar">+</button>
          <button type="button" onClick={() => changeZoom(1 / 0.65)} disabled={zoom <= 1.01} aria-label="Reduzir Portugal continental" title="Reduzir">−</button>
          <button type="button" onClick={() => {setBox(base); onHover(null);}} aria-label="Repor vista de Portugal continental" title="Repor vista">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>
          </button>
        </div>
        <span className="map-drag-note">{zoom > 1.01 ? 'Arraste para explorar · ' + zoom.toFixed(1) + '×' : 'Amplie para distinguir igrejas próximas'}</span>
      </div>
    </section>
  );
}

function IslandOverview({region}: {region: 'azores' | 'madeira'}) {
  const spec = geography.regions.find(item => item.id === region)!;
  const titleId = useId();
  const title = region === 'azores' ? 'Açores' : 'Madeira';
  return (
    <section className={'map-island-overview map-island-overview--' + region} aria-labelledby={titleId}>
      <h3 id={titleId}>{title}</h3>
      <svg viewBox={'-55 -40 1110 ' + (spec.height + 80)} role="img" aria-label={'Silhueta do arquipélago: ' + title}>
        <g className="map-island-silhouette">
          {municipalities.filter(item => item.region === region).map(item => (
            <path key={item.id} d={item.d} fillRule="evenodd" />
          ))}
        </g>
        {region === 'madeira' && (
          <g className="map-island-silhouette" transform="translate(820 700) scale(.14)">
            {municipalities.filter(item => item.region === 'selvagens').map(item => (
              <path key={item.id} d={item.d} fillRule="evenodd" />
            ))}
          </g>
        )}
      </svg>
    </section>
  );
}

export default function ChurchMap({visibleChurchIds}: {visibleChurchIds?: string[]}) {
  const [view, setView] = useState<View>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const mapTop = useRef<HTMLDivElement>(null);
  const focusSerial = useRef(0);
  const titleId = useId();
  const filterKey = visibleChurchIds === undefined ? '__all__' : [...visibleChurchIds].sort().join('|');
  const visibleIds = useMemo(() => new Set(visibleChurchIds ?? churches.map(item => item.id)), [filterKey]);
  const list = entries.filter(entry => visibleIds.has(entry.church.id));
  const selected = list.find(entry => entry.church.id === selectedId);
  const hovered = municipalities.find(item => item.id === hoveredZone?.split(':')[0]);

  useEffect(() => {
    setHoveredZone(null);
    setSelectedId(current => current && visibleIds.has(current) ? current : null);
  }, [filterKey]);

  function selectChurch(id: string) {
    if (!visibleIds.has(id)) return;
    setSelectedId(id);
    setHoveredZone(null);
    setFocusRequest({churchId: id, serial: ++focusSerial.current});
    if (window.innerWidth < 900) {
      mapTop.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  return (
    <section className="church-map-section" aria-labelledby={titleId}>
      <div className="container">
        <div className="church-map-intro">
          <div><span className="eyebrow">A nossa presença em Portugal</span><h2 id={titleId}>Encontre-nos no mapa.</h2></div>

        </div>
        <div className="church-map-shell" ref={mapTop}>
          <div className="church-map-toolbar">
            <div className="map-view-tabs" aria-label="Zona do mapa">
              {([{id: 'all', name: 'Portugal completo'}, {id: 'mainland', name: 'Continente'}] as const).map(item => (
                <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => {setView(item.id); setHoveredZone(null);}}>{item.name}</button>
              ))}
            </div>
            <label className="map-names-toggle"><input type="checkbox" checked={showNames} onChange={event => setShowNames(event.target.checked)} />Nomes das localidades</label>
          </div>
          <div className="church-map-layout">
            <div className={'church-map-atlas view-' + view}>
              <div className="map-atlas-top">
                <span><strong>PORTUGAL</strong><small>Limites por concelho</small></span>
                <div className="map-city-shortcuts">
                  <button type="button" disabled={!visibleIds.has('lisboa')} onClick={() => selectChurch('lisboa')}>Detalhar Lisboa</button>
                  <button type="button" disabled={!visibleIds.has('porto')} onClick={() => selectChurch('porto')}>Detalhar Porto</button>
                </div>
                <span className="map-north" aria-label="Norte"><svg viewBox="0 0 20 30" aria-hidden="true"><path d="m10 1 7 22-7-5-7 5Z" fill="currentColor" /></svg>N</span>
              </div>
              <div className="map-hover-caption" aria-hidden="true">
                <strong>{hovered?.name ?? 'Um território. A mesma esperança.'}</strong>
                <span>{hovered ? 'Zona com igreja no diretório' : 'Passe o rato sobre uma zona com igreja para a destacar.'}</span>
              </div>
              <MapPanel visibleIds={visibleIds} selectedId={selectedId} hoveredZone={hoveredZone}
                onHover={setHoveredZone} onSelect={selectChurch} showNames={showNames} focusRequest={focusRequest} />
              {view === 'all' && (
                <div className="map-island-panels">
                  <IslandOverview region="azores" /><IslandOverview region="madeira" />
                  <p className="map-island-note">Arquipélagos apresentados em escala própria.</p>
                </div>
              )}
              <div className="map-colour-key">
                <span><i className="key-church" />Área do concelho com igreja</span>
                <span><i className="key-hover" />Ao passar o rato</span>
                <span><Icon name="pin" />Igreja no diretório</span>
              </div>
            </div>
            <aside className="church-map-legend" aria-label="Legenda das igrejas no mapa">
              <div className="map-legend-heading">
                <span className="eyebrow">Legenda</span><h3>As nossas igrejas</h3>
                <p><strong>{list.length}</strong> {list.length === 1 ? 'igreja disponível' : 'igrejas disponíveis'}{visibleChurchIds !== undefined && ' nos filtros atuais'}</p>
              </div>
              {selected ? (
                <div className="map-selected-card" aria-live="polite">
                  <div className="map-selected-top"><span className="map-legend-number">{entries.indexOf(selected) + 1}</span><span>Igreja selecionada</span></div>
                  <h4>{selected.church.name}</h4><p>{selected.church.address}</p>
                  <a href={googleMaps(selected.church.address)} target="_blank" rel="noopener noreferrer">Abrir no Google Maps<Icon name="external" /><span className="sr-only"> (abre num novo separador)</span></a>
                </div>
              ) : (
                <p className="map-selection-hint">Selecione uma igreja no mapa ou na legenda para consultar a morada.</p>
              )}
              <ol className="map-legend-list">
                {list.map(entry => (
                  <li key={entry.church.id} className={selectedId === entry.church.id ? 'is-selected' : ''}>
                    <button type="button" className="map-legend-choice" aria-pressed={selectedId === entry.church.id} onClick={() => selectChurch(entry.church.id)}>
                      <span className="map-legend-number">{entries.indexOf(entry) + 1}</span>
                      <span><strong>{entry.church.name}</strong><small>{entry.location.locality} · {municipalities.find(item => item.id === entry.location.municipalityId)?.name}</small><span className="map-legend-address">{entry.church.address}</span></span>
                    </button>
                    <a className="map-legend-directions" href={googleMaps(entry.church.address)} target="_blank" rel="noopener noreferrer" aria-label={'Obter direções para ' + entry.church.name + ' no Google Maps (novo separador)'}><Icon name="external" /></a>
                  </li>
                ))}
              </ol>
              {!list.length && <p className="map-no-results">Não há igrejas com estes filtros. Limpe a pesquisa para voltar a ver todos os marcadores.</p>}
              <a className="map-to-list" href="#lista-igrejas">Consultar a lista e os horários<Icon name="arrow" /></a>
            </aside>
          </div>
          <div className="church-map-footnote">
            <p>Marcadores aproximados por rua ou localidade. A ponta de cada símbolo mantém a localização geográfica. Amplie para distinguir igrejas próximas. Para o percurso, utilize a morada no Google Maps.</p>
            <p>Cartografia: <a href="https://www.dgterritorio.gov.pt/atividades/cartografia/cartografia-tematica/caop" target="_blank" rel="noopener noreferrer">DGT / CAOP</a> · <a href="https://github.com/nmota/caop_GeoJSON" target="_blank" rel="noopener noreferrer">Regiões autónomas</a> · Localizações: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}
