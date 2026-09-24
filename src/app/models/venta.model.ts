export interface Venta {
  id: number;
  clienteId: number;
  perfumeId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
}

export type VentaGuardar = Pick<Venta, 'clienteId' | 'perfumeId' | 'cantidad' | 'fecha'>;
