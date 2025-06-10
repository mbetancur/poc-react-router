interface ObjectWithCoords {
  coords: any;
  iconx: number;
  icony: number;
  [key: string]: any; // Allow for other properties
}

export function extractCoordsAndIcons(array: ObjectWithCoords[]): Pick<ObjectWithCoords, 'coords' | 'iconx' | 'icony'>[] {
  return array.map(item => ({
    coords: item.coords,
    iconx: item.iconx,
    icony: item.icony
  }));
} 