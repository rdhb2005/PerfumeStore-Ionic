export interface BorradorVenta {
  id: string;
  clienteId: number;
  perfumeId: number;
  cantidad: number;
  fecha: string;
  notas: string;
  creado: string;
  actualizado: string;
}

export type BorradorVentaGuardar = Pick<
  BorradorVenta,
  'clienteId' | 'perfumeId' | 'cantidad' | 'fecha' | 'notas'
>;
