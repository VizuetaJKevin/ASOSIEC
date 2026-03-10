
export interface userCredential {
  email: string;
  password: string;
}

export interface userCredentialResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolid: number;
  statusok: boolean;

  // ✅ NUEVOS CAMPOS
  mensaje?: string;
  codigoError?: string;
}

export interface LoginResponse {
    statusok: boolean;
    usuario: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        rolid: number;
    };
    token: string;
    mensaje: string;
    codigoError?: string;
}
