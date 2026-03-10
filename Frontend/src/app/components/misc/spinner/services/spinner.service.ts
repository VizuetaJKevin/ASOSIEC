import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class SpinnerService {
    public activate = new EventEmitter<boolean>();
}
