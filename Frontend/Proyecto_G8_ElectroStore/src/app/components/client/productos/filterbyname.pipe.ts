// filter-by-name.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {
  transform(items: any[], filtro: string): any[] {
    if (!items || !filtro) {
      return items;
    }

    return items.filter(item => item.nombre_producto.toLowerCase().includes(filtro.toLowerCase()));
  }
}
