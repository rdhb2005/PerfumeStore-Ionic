import { Injectable } from '@angular/core';
import { Camera, MediaResult } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import * as exifr from 'exifr';

import {
  FotoPerfumePersistida,
  FotoPerfumeVista,
  MetadatosFotoPerfume,
  OrigenFotoPerfume,
} from '../models/foto-perfume.model';
import { AlmacenamientoService } from './almacenamiento.service';

type RegistroFotos = Record<string, FotoPerfumePersistida>;

/**
 * Maneja la funcionalidad multimedia de PerfumeStore.
 *
 * - Toma fotografías con la cámara o permite elegirlas de la galería.
 * - Guarda una copia propia en Directory.Data para que la imagen permanezca
 *   disponible aunque se cierre la aplicación.
 * - Guarda únicamente la referencia y metadatos ligeros en Preferences.
 * - Lee EXIF con exifr como apoyo y nunca muestra coordenadas GPS.
 */
@Injectable({ providedIn: 'root' })
export class MultimediaService {
  private readonly claveRegistro = 'perfumestore_fotos_perfumes_v1';
  private readonly carpeta = 'perfumes';

  constructor(private readonly almacenamiento: AlmacenamientoService) {}

  async capturar(perfumeId: number): Promise<FotoPerfumeVista | null> {
    try {
      const resultado = await Camera.takePhoto({
        quality: 82,
        targetWidth: 1280,
        targetHeight: 1280,
        correctOrientation: true,
        saveToGallery: false,
        editable: 'no',
        includeMetadata: true,
        webUseInput: true,
      });

      return this.persistirResultado(perfumeId, resultado, 'camara');
    } catch (error) {
      if (this.esCancelacion(error)) return null;
      throw new Error(this.mensajeErrorMultimedia(error, 'No fue posible abrir la cámara.'));
    }
  }

  async elegirDeGaleria(perfumeId: number): Promise<FotoPerfumeVista | null> {
    try {
      const seleccion = await Camera.chooseFromGallery({
        allowMultipleSelection: false,
        limit: 1,
        quality: 82,
        targetWidth: 1280,
        targetHeight: 1280,
        correctOrientation: true,
        includeMetadata: true,
        webUseInput: true,
      });

      const resultado = seleccion.results[0];
      if (!resultado) return null;

      return this.persistirResultado(perfumeId, resultado, 'galeria');
    } catch (error) {
      if (this.esCancelacion(error)) return null;
      throw new Error(this.mensajeErrorMultimedia(error, 'No fue posible abrir la galería.'));
    }
  }

  async obtenerFoto(perfumeId: number): Promise<FotoPerfumeVista | null> {
    const registro = await this.leerRegistro();
    const guardada = registro[String(perfumeId)];
    if (!guardada) return null;

    try {
      const { data } = await Filesystem.readFile({
        path: guardada.archivo,
        directory: Directory.Data,
      });

      const base64 = await this.normalizarDatoBase64(data);
      return {
        ...guardada,
        src: `data:image/${guardada.formato};base64,${base64}`,
      };
    } catch {
      // Si el archivo ya no existe, quitamos la referencia rota de Preferences.
      delete registro[String(perfumeId)];
      await this.guardarRegistro(registro);
      return null;
    }
  }

  async obtenerFotos(perfumeIds: number[]): Promise<Record<string, FotoPerfumeVista>> {
    const pares = await Promise.all(
      perfumeIds.map(async (id) => [String(id), await this.obtenerFoto(id)] as const),
    );

    const resultado: Record<string, FotoPerfumeVista> = {};
    for (const [id, foto] of pares) {
      if (foto) resultado[id] = foto;
    }
    return resultado;
  }

  async eliminarFoto(perfumeId: number): Promise<void> {
    const registro = await this.leerRegistro();
    const guardada = registro[String(perfumeId)];
    if (!guardada) return;

    try {
      await Filesystem.deleteFile({
        path: guardada.archivo,
        directory: Directory.Data,
      });
    } catch {
      // El objetivo principal es limpiar la referencia local aunque el archivo ya no exista.
    }

    delete registro[String(perfumeId)];
    await this.guardarRegistro(registro);
  }

  private async persistirResultado(
    perfumeId: number,
    resultado: MediaResult,
    origen: OrigenFotoPerfume,
  ): Promise<FotoPerfumeVista> {
    const base64 = await this.obtenerBase64Completo(resultado);
    const formato = this.normalizarFormato(resultado.metadata?.format);
    const extension = formato === 'jpeg' ? 'jpg' : formato;
    const archivo = `${this.carpeta}/perfume-${perfumeId}-${Date.now()}.${extension}`;

    await Filesystem.writeFile({
      path: archivo,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    const metadatos = await this.construirMetadatos(base64, resultado, origen, formato);
    const registro = await this.leerRegistro();
    const anterior = registro[String(perfumeId)];

    if (anterior?.archivo && anterior.archivo !== archivo) {
      try {
        await Filesystem.deleteFile({
          path: anterior.archivo,
          directory: Directory.Data,
        });
      } catch {
        // No se impide guardar la nueva fotografía si la anterior ya no existe.
      }
    }

    const persistida: FotoPerfumePersistida = {
      perfumeId,
      archivo,
      formato,
      metadatos,
      actualizadoEn: new Date().toISOString(),
    };

    registro[String(perfumeId)] = persistida;
    await this.guardarRegistro(registro);

    return {
      ...persistida,
      src: `data:image/${formato};base64,${base64}`,
    };
  }

  private async obtenerBase64Completo(resultado: MediaResult): Promise<string> {
    // En Web, thumbnail contiene la imagen completa en la API 8.1+.
    if (Capacitor.getPlatform() === 'web' && resultado.thumbnail) {
      return resultado.thumbnail;
    }

    if (resultado.uri) {
      try {
        const { data } = await Filesystem.readFile({ path: resultado.uri });
        return this.normalizarDatoBase64(data);
      } catch {
        // Continuamos con los respaldos siguientes.
      }
    }

    if (resultado.webPath) {
      const respuesta = await fetch(resultado.webPath);
      if (!respuesta.ok) throw new Error('No se pudo leer la fotografía seleccionada.');
      const blob = await respuesta.blob();
      return this.blobABase64(blob);
    }

    if (resultado.thumbnail) return resultado.thumbnail;

    throw new Error('La cámara no devolvió una imagen que pudiera guardarse.');
  }

  private async construirMetadatos(
    base64: string,
    resultado: MediaResult,
    origen: OrigenFotoPerfume,
    formato: string,
  ): Promise<MetadatosFotoPerfume> {
    let datosExif: Record<string, unknown> = {};

    try {
      const buffer = this.base64AArrayBuffer(base64);
      datosExif = (await exifr.parse(buffer, [
        'Make',
        'Model',
        'DateTimeOriginal',
        'CreateDate',
        'ModifyDate',
        'ImageWidth',
        'ImageHeight',
      ])) ?? {};
    } catch {
      // Algunas imágenes eliminan EXIF al exportarse; la app sigue funcionando sin él.
    }

    const exifPlugin = this.normalizarExifPlugin(resultado.metadata?.exif);
    const marca = this.primerTexto(datosExif['Make'], exifPlugin['Make']);
    const modelo = this.primerTexto(datosExif['Model'], exifPlugin['Model']);
    const dispositivo = [marca, modelo]
      .filter((valor, indice, arreglo) => Boolean(valor) && arreglo.indexOf(valor) === indice)
      .join(' ')
      .trim() || null;

    const fechaExif = this.primeraFecha(
      datosExif['DateTimeOriginal'],
      datosExif['CreateDate'],
      datosExif['ModifyDate'],
      resultado.metadata?.creationDate,
    );

    let resolucion = resultado.metadata?.resolution ?? null;
    if (!resolucion) {
      const ancho = Number(datosExif['ImageWidth']);
      const alto = Number(datosExif['ImageHeight']);
      if (Number.isFinite(ancho) && Number.isFinite(alto) && ancho > 0 && alto > 0) {
        resolucion = `${ancho}x${alto}`;
      }
    }

    return {
      origen,
      formato,
      resolucion,
      fecha: fechaExif,
      dispositivo,
      tamanoBytes: resultado.metadata?.size ?? null,
    };
  }

  private normalizarExifPlugin(valor: unknown): Record<string, unknown> {
    if (!valor) return {};
    if (typeof valor === 'object') return valor as Record<string, unknown>;

    if (typeof valor === 'string') {
      try {
        const convertido = JSON.parse(valor) as unknown;
        if (convertido && typeof convertido === 'object') {
          return convertido as Record<string, unknown>;
        }
      } catch {
        return {};
      }
    }

    return {};
  }

  private primeraFecha(...valores: unknown[]): string | null {
    for (const valor of valores) {
      if (!valor) continue;
      const fecha = valor instanceof Date ? valor : new Date(String(valor));
      if (!Number.isNaN(fecha.getTime())) return fecha.toISOString();
    }
    return null;
  }

  private primerTexto(...valores: unknown[]): string | null {
    for (const valor of valores) {
      if (typeof valor === 'string' && valor.trim()) return valor.trim();
    }
    return null;
  }

  private normalizarFormato(formato?: string): string {
    const valor = (formato || 'jpeg').toLowerCase().replace('jpg', 'jpeg');
    return ['jpeg', 'png', 'webp', 'gif'].includes(valor) ? valor : 'jpeg';
  }

  private base64AArrayBuffer(base64: string): ArrayBuffer {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
    return bytes.buffer;
  }

  private async normalizarDatoBase64(data: string | Blob): Promise<string> {
    return typeof data === 'string' ? data : this.blobABase64(data);
  }

  private blobABase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const valor = String(reader.result ?? '');
        resolve(valor.includes(',') ? valor.split(',')[1] : valor);
      };
      reader.onerror = () => reject(new Error('No se pudo convertir la imagen.'));
      reader.readAsDataURL(blob);
    });
  }

  private async leerRegistro(): Promise<RegistroFotos> {
    return this.almacenamiento.leer<RegistroFotos>(this.claveRegistro, {});
  }

  private guardarRegistro(registro: RegistroFotos): Promise<void> {
    return this.almacenamiento.guardar(this.claveRegistro, registro);
  }

  private esCancelacion(error: unknown): boolean {
    const valor = error as { code?: string; message?: string } | null;
    const texto = `${valor?.code ?? ''} ${valor?.message ?? ''}`.toLowerCase();
    return texto.includes('cancel') || texto.includes('cancelled') || texto.includes('canceled');
  }

  private mensajeErrorMultimedia(error: unknown, respaldo: string): string {
    const valor = error as { message?: string } | null;
    return valor?.message?.trim() || respaldo;
  }
}
