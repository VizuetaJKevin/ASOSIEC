import { Pipe, PipeTransform } from '@angular/core';
import { Configuracion } from 'src/app/interfaces/configuracion.interface';

@Pipe({
  name: 'countTipo'
})
export class CountTipoPipe implements PipeTransform {
  transform(configuraciones: Configuracion[], tipo: string): number {
    if (!configuraciones || !Array.isArray(configuraciones)) return 0;
    return configuraciones.filter(c => c.tipo?.toUpperCase() === tipo?.toUpperCase()).length;
  }
}
