export const COLORS = [
  { name: 'black', num: 0x0A0A0A, string: '#0A0A0A', desaturated: 0xACACAC },
  { name: 'blue', num: 0x0A43C2, string: '#0A43C2' },
  { name: 'brown', num: 0xA17541, string: '#A17541', desaturated: 0xCEAD86 },
  { name: 'cyan', num: 0x5CEEEE, string: '#5CEEEE', desaturated: 0xA2D9E9 },
  { name: 'green', num: 0x00FF00, string: '#00FF00'},
  { name: 'gray', num: 0xDDDDDD, string: '#DDDDDD', desaturated: 0xFEFEFE },
  { name: 'olive', num: 0x9FB254, string: '#9FB254', desaturated: 0xC7D29A },
  { name: 'orange', num: 0xF38109, string: '#F38109', desaturated: 0xF6B26B },
  { name: 'pink', num: 0xF776C8, string: '#F776C8', desaturated: 0xEFB1D9 },
  { name: 'purple', num: 0xC33EE1, string: '#C33EE1', desaturated: 0xD9A9E9 },
  { name: 'red', num: 0xFF0000, string: '#FF0000' },
  { name: 'yellow', num: 0xFFFF00,string: '#FFFF00'},
];

COLORS.forEach(color => {
  if (!color.desaturated) color.desaturated = color.num | 0xaaaaaa;
 })

export const EXTENDED_COLORS = [
  ...COLORS,
  { name: 'aqua', num: 0x00FFFF, string: '#00FFFF', desaturated: 0x6EDCDC },
  { name: 'blue_1', num: 0x4C8BF5, string: '#4C8BF5' },
  { name: 'blue_2', num: 0x0000CC, string: '#0000CC' },
  { name: 'green_1', num: 0x7DFF81, string: '#7DFF81'},
  { name: 'indigo', num: 0x7D81FF, string: '#7D81FF'},
  { name: 'periwinkle', num: 0x6C8ED8, string: '#6c8ed8'},
  { name: 'red_1', num: 0xFF000A, string: '#FF000A' },
  { name: 'red_2', num: 0xFF7D81, string: '#FF7D81' },
  { name: 'white', num: 0xFFFFFF, string: '#FFFFFF' },
  { name: 'white_1', num: 0xFFF6F6, string: '#FFF6F6' },
]

EXTENDED_COLORS.forEach(color => {
  if (!color.desaturated) color.desaturated = color.num | 0xaaaaaa;
})

export const annotationHexNums = COLORS.map(h => h.num);

export const hexStrings = COLORS.map(h => h.string);

export const hexNameLookupTable = Object.fromEntries(EXTENDED_COLORS.map(h => [h.name, h]));

export const hexNumLookupTable = Object.fromEntries(EXTENDED_COLORS.map(h => [h.num, h]));

export  const hexNumsByName = Object.fromEntries(EXTENDED_COLORS.map(h => [h.name, h.num]));

export const hexStringLookupTable = Object.fromEntries(EXTENDED_COLORS.map(h => [h.string, h]));

export const getDesaturated = hexNum => {
  if (hexNumLookupTable[hexNum]) return hexNumLookupTable[hexNum].desaturated;
  return hexNum | 0xaaaaaa
}

export const getColorValue = name => {
  return hexNameLookupTable[name ||  'red'].string;
}