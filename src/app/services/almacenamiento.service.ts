import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Persistencia clave-valor local con Capacitor Preferences.
 * En ionic serve usa el almacenamiento web de Capacitor; en una app nativa
 * utiliza el almacenamiento persistente propio de Android/iOS.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {
  async leer<T>(clave: string, predeterminado: T): Promise<T> {
    const { value } = await Preferences.get({ key: clave });

    if (value === null) {
      return predeterminado;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return predeterminado;
    }
  }

  guardar(clave: string, valor: unknown): Promise<void> {
    return Preferences.set({ key: clave, value: JSON.stringify(valor) });
  }

  eliminar(clave: string): Promise<void> {
    return Preferences.remove({ key: clave });
  }
}
