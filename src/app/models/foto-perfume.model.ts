export type OrigenFotoPerfume = 'camara' | 'galeria';

export interface MetadatosFotoPerfume {
  origen: OrigenFotoPerfume;
  formato: string;
  resolucion: string | null;
  fecha: string | null;
  dispositivo: string | null;
  tamanoBytes: number | null;
}

export interface FotoPerfumePersistida {
  perfumeId: number;
  archivo: string;
  formato: string;
  metadatos: MetadatosFotoPerfume;
  actualizadoEn: string;
}

export interface FotoPerfumeVista extends FotoPerfumePersistida {
  src: string;
}
