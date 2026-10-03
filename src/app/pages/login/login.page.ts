import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonNote,
  IonSpinner,
} from '@ionic/angular';
import { ConexionService } from '../../services/conexion.service';
import { EstadoConexionService } from '../../services/estado-conexion.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, IonNote, IonSpinner],
})
export class LoginPage implements OnInit {
  servidor = '';
  usuario = '';
  contrasena = '';
  conectando = false;
  mensaje = '';
  esError = false;
  readonly puertoApache = environment.apachePort;
  readonly puertoMysql = environment.mysqlPort;

  constructor(
    private readonly conexionService: ConexionService,
    private readonly estadoConexionService: EstadoConexionService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.servidor = await this.conexionService.obtenerServidor();
    this.cdr.markForCheck();
  }

  // Comprueba la dirección escrita, valida las credenciales y guarda la IP para las demás vistas.
  async conectar(): Promise<void> {
    if (this.conectando) return;

    if (!this.usuario.trim() || !this.contrasena) {
      this.esError = true;
      this.mensaje = 'Escribe el usuario y la contraseña.';
      this.cdr.markForCheck();
      return;
    }

    this.conectando = true;
    this.mensaje = 'Comprobando servidor y credenciales...';
    this.esError = false;
    this.cdr.markForCheck();

    try {
      const servidor = await this.conexionService.probarConexion(this.servidor);
      await this.conexionService.iniciarSesion(servidor, this.usuario.trim(), this.contrasena);
      this.servidor = await this.conexionService.guardarServidor(servidor);
      this.estadoConexionService.reportarApiDisponible();
      this.mensaje = 'Sesión iniciada correctamente.';
      this.cdr.markForCheck();

      setTimeout(() => {
        void this.router.navigateByUrl('/home', { replaceUrl: true });
      }, 450);
    } catch (error) {
      this.esError = true;
      this.mensaje = error instanceof Error ? error.message : 'No fue posible iniciar sesión.';
      this.cdr.markForCheck();
    } finally {
      this.conectando = false;
      this.cdr.markForCheck();
    }
  }
}
