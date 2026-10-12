(function (root) {
  'use strict';
  const STATUS_ORDER = { VERIFIED: 0, PARTIAL: 1, PENDING: 2, MISSING: 3 };
  const finite = (value) => Number.isFinite(Number(value));

  function sourceStatus(point) {
    const explicit = String(point.sourceStatus || '').toUpperCase();
    if (/AUTOCAD_TRUTH|VERIFIED|APPROVED/.test(explicit)) return 'VERIFIED';
    if (/REVIEW|PARTIAL|PRELIM/.test(explicit)) return 'PARTIAL';
    if (point.dwg && point.rev) return 'PARTIAL';
    return 'PENDING';
  }

  function worstStatus(statuses) {
    return statuses.reduce((worst, status) => STATUS_ORDER[status] > STATUS_ORDER[worst] ? status : worst, 'VERIFIED');
  }

  function evaluate(points) {
    const rows = Array.isArray(points) ? points : [];
    const pointIdCounts = new Map();
    const coordinateOwners = new Map();
    rows.forEach((point) => {
      const id = String(point.pt || '').trim();
      if (id) pointIdCounts.set(id, (pointIdCounts.get(id) || 0) + 1);
      if (finite(point.e) && finite(point.n)) {
        const key = `${Number(point.e).toFixed(4)}|${Number(point.n).toFixed(4)}|${finite(point.z) ? Number(point.z).toFixed(4) : 'NO_Z'}`;
        if (!coordinateOwners.has(key)) coordinateOwners.set(key, new Set());
        coordinateOwners.get(key).add(id || '(unnamed)');
      }
    });

    const groups = new Map();
    rows.forEach((point, index) => {
      const element = String(point.element || '').trim() || `(unnamed element ${index + 1})`;
      if (!groups.has(element)) groups.set(element, []);
      groups.get(element).push(point);
    });

    const elements = [...groups.entries()].map(([element, elementPoints]) => {
      const issues = new Set();
      const first = elementPoints[0] || {};
      let coordinateCount = 0, elevationCount = 0, duplicatePointIds = 0, sharedCoordinateCount = 0;
      elementPoints.forEach((point) => {
        const id = String(point.pt || '').trim();
        if (finite(point.e) && finite(point.n)) coordinateCount += 1;
        else issues.add('Missing Easting/Northing');
        if (finite(point.z)) elevationCount += 1;
        else issues.add('Missing elevation');
        if (!id) issues.add('Missing point ID');
        if (id && pointIdCounts.get(id) > 1) duplicatePointIds += 1;
        if (finite(point.e) && finite(point.n)) {
          const key = `${Number(point.e).toFixed(4)}|${Number(point.n).toFixed(4)}|${finite(point.z) ? Number(point.z).toFixed(4) : 'NO_Z'}`;
          if ((coordinateOwners.get(key)?.size || 0) > 1) sharedCoordinateCount += 1;
        }
      });
      if (duplicatePointIds) issues.add(`Duplicate point ID (${duplicatePointIds})`);
      if (sharedCoordinateCount) issues.add(`Shared coordinates (${sharedCoordinateCount})`);
      if (!elementPoints.some((point) => point.dwg)) issues.add('Drawing reference not recorded');
      if (!elementPoints.some((point) => point.rev)) issues.add('Revision not recorded');

      let status = worstStatus(elementPoints.map(sourceStatus));
      if (coordinateCount < elementPoints.length) status = 'MISSING';
      else if (elevationCount < elementPoints.length && status !== 'MISSING') status = 'PARTIAL';
      return {
        element, group: first.group || 'Unassigned', type: first.type || '—', grid: first.grid || '—',
        pointCount: elementPoints.length, coordinateCount, elevationCount,
        drawing: elementPoints.find((point) => point.dwg)?.dwg || '—',
        revision: elementPoints.find((point) => point.rev)?.rev || '—',
        source: elementPoints.find((point) => point.source)?.source || elementPoints.find((point) => point.sourceStatus)?.sourceStatus || 'Not recorded',
        status, issues: [...issues],
      };
    }).sort((a, b) => a.group.localeCompare(b.group) || a.element.localeCompare(b.element));

    const statusCounts = { VERIFIED: 0, PARTIAL: 0, PENDING: 0, MISSING: 0 };
    elements.forEach((element) => { statusCounts[element.status] += 1; });
    return {
      generatedAt: new Date().toISOString(), pointCount: rows.length, elementCount: elements.length,
      coordinateComplete: rows.filter((point) => finite(point.e) && finite(point.n)).length,
      elevationComplete: rows.filter((point) => finite(point.z)).length,
      statusCounts, elements,
    };
  }
  root.ClarkDataQuality = { evaluate, sourceStatus, worstStatus };
}(typeof window !== 'undefined' ? window : globalThis));
