import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UploadResponse {
  success: boolean;
  mensaje: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private baseUrl: string = environment.api.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Subir imagen de producto
   */
  uploadProductImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      `${this.baseUrl}Upload/producto`,
      formData
    );
  }

  /**
 * ✅ NUEVO: Subir foto de perfil
 */
  uploadProfileImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(
      `${this.baseUrl}Upload/perfil`,
      formData
    );
  }

  /**
   * Subir comprobante de pago
   */
  uploadComprobante(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      `${this.baseUrl}Upload/comprobante`,
      formData
    );
  }

  /**
   * Eliminar imagen (opcional)
   */
  deleteImage(publicId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}Upload?publicId=${publicId}`
    );
  }

  /**
   * Validar archivo de imagen
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato no permitido. Use JPG, PNG, WEBP o GIF'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'La imagen no debe superar 5MB'
      };
    }

    return { valid: true };
  }
}
