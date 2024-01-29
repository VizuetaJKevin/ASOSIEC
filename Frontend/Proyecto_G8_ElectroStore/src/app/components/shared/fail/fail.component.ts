import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fail',
  templateUrl: './fail.component.html',
  styleUrls: ['./fail.component.css']
})
export class FailComponent implements OnInit {


  public nombre:string="ElectroStore";
  public dark:string="/assets/Images/home/logo.png";

  ngOnInit(): void {}

}
