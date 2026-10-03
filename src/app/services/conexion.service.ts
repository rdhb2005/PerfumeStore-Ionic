import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConexionService {
  private readonly claveServidor = 'perfumestore_servidor_api';
  private readonly tiempoEsperaMs = 6000;
  private servidorMemoria: string | null = null;

  // Guarda la IP y el puerto que se utilizarán para consumir la API.
  async guardarServidor(valor: string): Promise<string> {
    const servidor = this.normalizarServidor(valor);
    await Preferences.set({ key: this.claveServidor, value: servidor });
    this.servidorMemoria = servidor;
    return servidor;
  }

  // Recupera la última dirección utilizada para conectarse al servidor.
  async obtenerServidor(): Promise<string> {
    if (this.servidorMemoria !== null) return this.servidorMemoria;

    const { value } = await Preferences.get({ key: this.claveServidor });
    const servidor = value ?? '';
    this.servidorMemoria = servidor;
    return servidor;
  }

  // Forma la URL completa donde se encuentran las API de PerfumeStore.
  async obtenerApiUrl(): Promise<string> {
    const servidor = await this.obtenerServidor();
    if (!servidor) {
      throw new Error('Primero se debe definir la IP del servidor desde la pantalla de conexión.');
    }

    return this.formarApiUrl(servidor);
  }

  // Comprueba que Apache responda antes de entrar a la aplicación.
  async probarConexion(valor: string): Promise<string> {
    const servidor = this.normalizarServidor(valor);
    const url = `${this.formarApiUrl(servidor)}/index.php`;

    let respuesta: Response;

    try {
      respuesta = await this.fetchConTimeout(url, { method: 'GET' });
    } catch (error) {
      if (this.esTimeout(error)) {
        throw new Error('El servidor tardó demasiado en responder. Verifica la IP y que Apache esté activo.');
      }

      throw new Error('No se pudo conectar con Apache. Verifica la IP, el puerto 80 y que ambos equipos estén en la misma red.');
    }

    let cuerpo: { success?: boolean; message?: string };

    try {
      cuerpo = (await respuesta.json()) as { success?: boolean; message?: string };
    } catch {
      throw new Error('Apache respondió, pero el endpoint de PerfumeStore no devolvió JSON válido.');
    }

    if (!respuesta.ok || cuerpo.success === false) {
      throw new Error(cuerpo.message || `El servidor respondió con el código ${respuesta.status}.`);
    }

    return servidor;
  }

  // Valida el usuario y la contraseña contra la API del servidor seleccionado.
  async iniciarSesion(servidor: string, usuario: string, contrasena: string): Promise<void> {
    const url = `${this.formarApiUrl(this.normalizarServidor(servidor))}/login.php`;
    let respuesta: Response;

    try {
      respuesta = await this.fetchConTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      });
    } catch (error) {
      if (this.esTimeout(error)) {
        throw new Error('El inicio de sesión agotó el tiempo de espera. Comprueba la conexión con el servidor.');
      }

      throw new Error('No se pudo contactar el servicio de inicio de sesión.');
    }

    let cuerpo: { success?: boolean; message?: string };

    try {
      cuerpo = (await respuesta.json()) as { success?: boolean; message?: string };
    } catch {
      throw new Error('El servidor respondió, pero el inicio de sesión no devolvió JSON válido.');
    }

    if (!respuesta.ok || cuerpo.success === false) {
      throw new Error(cuerpo.message || 'Usuario o contraseña incorrectos.');
    }
  }

  // Limpia protocolos, rutas y agrega el puerto 80 cuando no se escribe.
  normalizarServidor(valor: string): string {
    let servidor = valor.trim();

    servidor = servidor.replace(/^https?:\/\//i, '');
    servidor = servidor.replace(/\/perfumestore_api\/?$/i, '');
    servidor = servidor.replace(/\/+$/, '');

    if (!servidor) {
      throw new Error('Escribe una IP válida, por ejemplo 192.168.1.103:80.');
    }

    if (/\s/.test(servidor)) {
      throw new Error('La dirección del servidor no debe contener espacios.');
    }

    if (!/:\d+$/.test(servidor)) {
      servidor = `${servidor}:${environment.apachePort}`;
    }

    return servidor;
  }

  private formarApiUrl(servidor: string): string {
    return `http://${servidor}${environment.apiPath}`;
  }

  private async fetchConTimeout(url: string, opciones: RequestInit): Promise<Response> {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), this.tiempoEsperaMs);

    try {
      return await fetch(url, { ...opciones, signal: controlador.signal });
    } finally {
      clearTimeout(temporizador);
    }
  }

  private esTimeout(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }
}
