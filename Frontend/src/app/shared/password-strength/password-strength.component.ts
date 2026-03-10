import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { calculatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from 'src/app/validators/password-strength.validator';

@Component({
  selector: 'app-password-strength',
  template: `
    <div class="password-strength-indicator mt-2" *ngIf="password">
      <div class="progress" style="height: 5px;">
        <div
          class="progress-bar bg-{{ color }}"
          role="progressbar"
          [style.width.%]="strength">
        </div>
      </div>
      <small class="text-{{ color }} mt-1 d-block">
        Fortaleza: {{ label }} ({{ strength }}%)
      </small>

      <div class="requirements mt-2" *ngIf="showRequirements">
        <small class="d-block text-muted mb-1">La contraseña debe contener:</small>
        <small class="d-block" [class.text-success]="hasMinLength" [class.text-danger]="!hasMinLength">
          <i class="material-icons" style="font-size: 14px; vertical-align: middle;">
            {{ hasMinLength ? 'check_circle' : 'cancel' }}
          </i>
          Al menos 8 caracteres
        </small>
        <small class="d-block" [class.text-success]="hasUpperCase" [class.text-danger]="!hasUpperCase">
          <i class="material-icons" style="font-size: 14px; vertical-align: middle;">
            {{ hasUpperCase ? 'check_circle' : 'cancel' }}
          </i>
          Una letra mayúscula
        </small>
        <small class="d-block" [class.text-success]="hasLowerCase" [class.text-danger]="!hasLowerCase">
          <i class="material-icons" style="font-size: 14px; vertical-align: middle;">
            {{ hasLowerCase ? 'check_circle' : 'cancel' }}
          </i>
          Una letra minúscula
        </small>
        <small class="d-block" [class.text-success]="hasNumber" [class.text-danger]="!hasNumber">
          <i class="material-icons" style="font-size: 14px; vertical-align: middle;">
            {{ hasNumber ? 'check_circle' : 'cancel' }}
          </i>
          Un número
        </small>
        <small class="d-block" [class.text-success]="hasSpecial" [class.text-danger]="!hasSpecial">
          <i class="material-icons" style="font-size: 14px; vertical-align: middle;">
            {{ hasSpecial ? 'check_circle' : 'cancel' }}
          </i>
          Un carácter especial (!&#64;#$%...)
        </small>
      </div>
    </div>
  `,
  styles: [`
    .password-strength-indicator {
      margin-top: 0.5rem;
    }
    .requirements small {
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    .progress {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `],
  standalone: false
})
export class PasswordStrengthComponent implements OnInit, OnChanges {
  @Input() password: string = '';
  @Input() showRequirements: boolean = true;

  strength: number = 0;
  label: string = '';
  color: string = '';

  hasMinLength: boolean = false;
  hasUpperCase: boolean = false;
  hasLowerCase: boolean = false;
  hasNumber: boolean = false;
  hasSpecial: boolean = false;

  ngOnInit() {
    this.updateStrength();
  }

  ngOnChanges() {
    this.updateStrength();
  }

  private updateStrength() {
    if (!this.password) {
      this.strength = 0;
      this.label = '';
      this.color = '';
      this.resetRequirements();
      return;
    }

    this.strength = calculatePasswordStrength(this.password);
    this.label = getPasswordStrengthLabel(this.strength);
    this.color = getPasswordStrengthColor(this.strength);

    // Verificar requisitos
    this.hasMinLength = this.password.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(this.password);
    this.hasLowerCase = /[a-z]/.test(this.password);
    this.hasNumber = /[0-9]/.test(this.password);
    this.hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }

  private resetRequirements() {
    this.hasMinLength = false;
    this.hasUpperCase = false;
    this.hasLowerCase = false;
    this.hasNumber = false;
    this.hasSpecial = false;
  }
}
