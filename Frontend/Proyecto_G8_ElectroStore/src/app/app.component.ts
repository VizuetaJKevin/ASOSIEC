import { SpinnerService } from './components/misc/spinner/services/spinner.service';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Proyecto_G8_ElectroStore';
  private service=inject(SpinnerService);
  private cdRef=inject(ChangeDetectorRef);
  isLoading!:boolean;
  constructor(){
    this.service.activate.subscribe((reps:boolean)=>{
      this.isLoading=reps;
      this.cdRef.detectChanges();
    })
  }
}
