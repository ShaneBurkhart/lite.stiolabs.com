export const shapes = [
  { _class: 'CloudShape', key: 'cloud', display: 'cloud', icon: 'CloudIcon', group: 'basic' },
  { _class: 'ArrowShape', key: 'arrow', display: 'arrow', icon: 'ArrowIcon', group: 'basic' },
  { _class: 'RectangleShape', key: 'rectangle', display: 'rectangle', icon: 'RectangleIcon', group: 'basic' },
  { _class: 'CrossShape', key: 'cross', display: 'x', icon: 'CrossIcon', group: 'basic' },
  { _class: 'LineShape', key: 'line', display: 'line', icon: 'LineIcon', group: 'basic' },
  { _class: 'CircleShape', key: 'circle', display: 'ellipse', icon: 'CircleIcon', group: 'basic' },
  { _class: 'TextShape', key: 'text', display: 'text', icon: 'TextIcon', group: 'text', drawer: true },
  { _class: 'PenShape', key: 'pen', display: 'pen', icon: 'PenIcon', group: 'general' },
  { _class: 'HighlightShape', key: 'highlight', display: 'highlight', icon: 'HighlightIcon', group: 'general' },
  { _class: 'CloudLinkShape', key: 'cloud-link', display: 'cloud link', icon: 'CloudIcon', group: 'hyperlink' },
  { _class: 'CircleLinkShape', key: 'circle-link', display: 'ellipse link', icon: 'CircleIcon', group: 'hyperlink' },
  { _class: 'RectangleLinkShape', key: 'rectangle-link', display: 'rectangle link', icon: 'RectangleIcon', group: 'hyperlink' },
  { _class: 'CalibrationShape', key: 'calibration', display: 'caliper', icon: 'CalibrationIcon', group: 'measurement', drawer: true, title: 'calibration' },
  { _class: 'LineLengthShape', key: 'line-length', display: 'ruler', icon: 'RulerIcon', group: 'measurement' },
  { _class: 'RectangleAreaShape', key: 'rectangle-area', display: 'area rectangle', icon: 'RectangleAreaIcon', group: 'measurement' },
  { _class: 'SplineLengthShape', key: 'spline-length', display: 'free form ruler', icon: 'SplineIcon', group: 'measurement' },
  { _class: 'SplineAreaShape', key: 'spline-area', display: 'free form area', icon: 'SplineAreaIcon', group: 'measurement' },
  { _class: 'PolylineShape', key: 'polyline', display: 'polyline', icon: 'PolylineIcon', group: 'polyline' },
  { _class: 'CameraShape', key: 'camera', display: 'camera', icon: 'CameraIcon', group: 'photo', drawer: true, title: 'camera' },
  { _class: 'StampShape', key: 'stamp', display: 'task', icon: 'CheckListIcon', group: 'task', drawer: true, title: 'task' },
  // { _class: 'LassoShape', key: 'lasso', display: 'lasso', icon: 'LassoIcon', group: 'selection' },
]
shapes.forEach(s => {
  if (s.group === 'hyperlink') {
    s.drawer = true;
    s.title = 'link'
  } else {
    s.title = s.title || s.display
  }
})

export const shapeClasses = shapes.map(s => s._class);
export const shapeClassMap = Object.fromEntries(shapes.map(s => [s._class, s]));
export const shapeKeyMap = Object.fromEntries(shapes.map(s => [s.key, s]))

export const _groupedShapes = {};
shapes.forEach(s => {
  if (!_groupedShapes[s.group]) _groupedShapes[s.group] = [];
  _groupedShapes[s.group].push(s)
})

const drawerItems = shapes.filter(s => s.drawer);
export const drawerShapes = Object.fromEntries(drawerItems.map(s => [s._class, s]))
export const drawerKeys = Object.fromEntries(drawerItems.map(s => [s.key, s]));

export const groups = Object.keys(_groupedShapes);

