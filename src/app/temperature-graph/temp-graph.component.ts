import { Component, OnInit } from '@angular/core';
import { ForecastService } from '../service/forecast.service';
import * as moment from 'moment';
import { AlertService } from '../service/alert.service';

@Component({
  selector: 'app-temp-graph',
  templateUrl: './temp-graph.component.html',
  styleUrls: ['./temp-graph.component.scss']
})
export class TempGraphComponent implements OnInit {


  tempChart: string;
  tempValues: any;
  tempOptions: any;

  tempValue = [];
  timeValue = [];

  constructor(
    private fs: ForecastService,
    private alertService: AlertService) { }

  ngOnInit() {
    if (sessionStorage.getItem('city') != null) {
      this.cityForecast();
    }
    else if ((sessionStorage.getItem('longitude') && sessionStorage.getItem('latitude') != null)) {
      this.localForecast();
    }
  }

  localForecast() {
    this.fs.localForecast(this.fs.lat, this.fs.lon)
      .subscribe(
        (data) => {

          //Chart
          this.tempValue.splice(0, this.tempValue.length);
          this.timeValue.splice(0, this.timeValue.length);


          //Get Chart/Graph Values
          for (let i = 0; i < data.list.length; i++) {
            if (i < 10) {
              const temp = data.list[i].main.temp;
              const time = moment(data.list[i].dt_txt).format('Do MMMM, h:mm a');

              this.tempValue.push(temp);
              this.timeValue.push(time);
            }
          }

          //Temperature Graph
          this.getTChart(this.timeValue, this.tempValue);
        },
        error => {

          if (error.status === 0) {

            console.log('service down ', error);

          } else {

            console.log('error in response ', error);
            this.alertService.error(error.statusText);

          }
          console.log('error', error);

        });
  }

  cityForecast() {
    this.fs.cityForecast(this.fs.city)
      .subscribe(
        (data) => {

          //Temp Graph
          this.tempValue.splice(0, this.tempValue.length);
          this.timeValue.splice(0, this.timeValue.length);

          //Get Chart/Graph Values
          const gLen = data.list.length - 30;
          for (let i = 0; i < gLen; i++) {

            const temp = data.list[i].main.temp;
            const time = moment(data.list[i].dt_txt).format('Do MMMM, h:mm a');

            this.tempValue.push(temp);
            this.timeValue.push(time);
          }

          //Temperature Graph
          this.getTChart(this.timeValue, this.tempValue);
        },
        error => {

          if (error.status === 0) {
            console.log('service down ', error);
          } else {

            console.log('error in response ', error);
            this.alertService.error(error.statusText);
          }
          console.log('error', error);
        }
      );
  }
  //Temp Graph 
  getTChart(time, value) {
    this.tempChart = 'horizontalBar';
    this.tempValues = {
      labels: time,
      datasets: [
        {
          label: 'Temperature',
          data: value,
          backgroundColor: 'rgb(255,153,51)',
          fill: false,
        }
      ]
    };
    this.tempOptions = {
      title: {
        display: true,
        text: 'TEMPERATURE GRAPH ( C )'
      },
      legend: {
        display: true
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };
  }

}

