// src/app/pipes/short-name.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'shortName'
})
export class ShortNamePipe implements PipeTransform {

    transform(value: string): string {
        if (!value) return '';

        const partes = value.trim().split(' ');
        if (partes.length === 1) return partes[0]; // Se houver apenas um nome

        const primeiroNome = partes[0];
        const sobrenomeInicial = partes[partes.length - 1].charAt(0).toUpperCase();

        return `${primeiroNome} ${sobrenomeInicial}.`;
    }

}
