import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
/*
En este archivo se maneja la persistencia local. Se utiliza Capacitor Preferences para guardar, consultar y eliminar información aunque la aplicación se cierre.
*/
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {
  // Este método lee un dato guardado en Preferences.
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

  // Este método guarda información de forma local.
  guardar(clave: string, valor: unknown): Promise<void> {
    return Preferences.set({ key: clave, value: JSON.stringify(valor) });
  }

  // Este método elimina un dato guardado.
  eliminar(clave: string): Promise<void> {
    return Preferences.remove({ key: clave });
  }
}
