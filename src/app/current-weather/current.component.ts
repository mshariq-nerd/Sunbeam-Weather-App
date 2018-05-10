import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { NgProgress } from 'ngx-progressbar';
import { WeatherService } from '../service/weather.service';
import { ForecastService } from '../service/forecast.service';
import { AlertService } from '../service/alert.service';
import { CurrentWeather } from '../models/current-weather';

@Component({
  selector: 'app-current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss']
})

export class CurrentComponent implements OnInit {

  myWeather: CurrentWeather;

  Chart: string;
  Value: any;
  Option: any;

  tempChart: string;
  tempValues: any;
  tempOptions: any;

  windChart: string;
  windValues: any;
  windOptions: any;

  humidityChart: string;
  humidityValues: any;
  humidityOptions: any;

  pressureChart: string;
  pressureValues: any;
  pressureOptions: any;

  tempValue = [];
  timeValue = [];
  windValue = [];
  pressureValue = [];
  humidityValue = [];

  loading: boolean;

  constructor(
    private ws: WeatherService,
    private fs: ForecastService,
    public ngProgress: NgProgress,
    public alertService: AlertService,
    private http: Http,
  ) {
  }

  ngOnInit() {
    this.ngProgress.start();
    sessionStorage.clear();
    this.loading = true;
    this.localWeather();
    this.localForecast();
  }

  onSubmit(weatherForm: NgForm) {
    this.ngProgress.start();
    this.cityWeather(weatherForm.value.city);
    this.cityForecast(weatherForm.value.city);
  }

  localForecast() {
    this.http.get("http://ip-api.com/json")
      .map((response: Response) => response.json())
      .subscribe(
        (data) => {
          const lat = data.lat;
          const lon = data.lon;
          this.fs.localForecast(lat, lon)
            .subscribe(

              (data) => {
                this.loading = false;

                //Chart
                this.tempValue.splice(0, this.tempValue.length);
                this.timeValue.splice(0, this.timeValue.length);
                this.windValue.splice(0, this.timeValue.length);
                this.pressureValue.splice(0, this.pressureValue.length);
                this.humidityValue.splice(0, this.humidityValue.length);


                //Getting Graph Values
                const gLen = data.list.length - 30;
                for (let i = 0; i < gLen; i++) {

                  const temp = data.list[i].main.temp;
                  const time = moment(data.list[i].dt_txt).format('Do MMMM, h:mm a');
                  const wind = data.list[i].wind.speed;
                  const humidity = data.list[i].main.humidity;
                  const pressure = (data.list[i].main.pressure);

                  this.tempValue.push(temp);
                  this.timeValue.push(time);
                  this.windValue.push(wind);
                  this.pressureValue.push(pressure);
                  this.humidityValue.push(humidity);
                }

                //Wind Humidity Graph
                this.getWHChartData(this.timeValue, this.windValue, this.humidityValue);

                //Temperature Graph
                this.getTChart(this.timeValue, this.tempValue);

                //Pressure Graph
                this.getPChart(this.timeValue, this.pressureValue);
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
            )
        });
  }


  localWeather() {
    this.http.get("http://ip-api.com/json")
      .map((response: Response) => response.json())
      .subscribe(
        (data) => {
          const lat = data.lat;
          const lon = data.lon;
          this.ws.localWeather(lat, lon)
            .subscribe(
              (data) => {

                this.loading = false;

                const date = moment.unix(data.dt).format('LL');
                const sunrise = moment.unix(data.sys.sunrise).format('h:mm A');
                const sunset = moment.unix(data.sys.sunset).format('h:mm A');

                this.myWeather = new CurrentWeather(data.name,
                  data.sys.country,
                  data.main.temp,
                  data.main.humidity,
                  data.main.pressure,
                  data.weather[0].icon,
                  data.clouds.all,
                  data.weather[0].description,
                  data.dt = date,
                  data.main.temp_max,
                  data.main.temp_min,
                  data.sys.sunrise = sunrise,
                  data.sys.sunset = sunset,
                  data.coord,
                  data.wind.speed,
                  data.wind.deg
                );
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
        })
  }

  cityWeather(city) {
    this.ws.cityWeather(city)
      .subscribe(
        (data) => {

          const date = moment.unix(data.dt).format('LL');
          const sunrise = moment.unix(data.sys.sunrise).format('h:mm A');
          const sunset = moment.unix(data.sys.sunset).format('h:mm A');

          this.myWeather = new CurrentWeather(data.name,
            data.sys.country,
            data.main.temp,
            data.main.humidity,
            data.main.pressure,
            data.weather[0].icon,
            data.clouds.all,
            data.weather[0].description,
            data.dt = date,
            data.main.temp_max,
            data.main.temp_min,
            data.sys.sunrise = sunrise,
            data.sys.sunset = sunset,
            data.coord,
            data.wind.speed,
            data.wind.deg
          );
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

  cityForecast(city) {
    this.fs.cityForecast(city)
      .subscribe(
        (data) => {

          //Chart
          this.tempValue.splice(0, this.tempValue.length);
          this.timeValue.splice(0, this.timeValue.length);
          this.windValue.splice(0, this.timeValue.length);
          this.pressureValue.splice(0, this.pressureValue.length);
          this.humidityValue.splice(0, this.humidityValue.length);


          //Getting Graph Values
          const gLen = data.list.length - 30;
          for (let i = 0; i < gLen; i++) {

            const temp = data.list[i].main.temp;
            const time = moment(data.list[i].dt_txt).format('Do MMMM, h:mm a');
            const wind = data.list[i].wind.speed;
            const humidity = data.list[i].main.humidity;
            const pressure = (data.list[i].main.pressure);

            this.tempValue.push(temp);
            this.timeValue.push(time);
            this.windValue.push(wind);
            this.pressureValue.push(pressure);
            this.humidityValue.push(humidity);
          }

          //Wind Humidity Graph
          this.getWHChartData(this.timeValue, this.windValue, this.humidityValue);

          //Temperature Graph
          this.getTChart(this.timeValue, this.tempValue);

          //Pressure Graph
          this.getPChart(this.timeValue, this.pressureValue);
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
      )
  }

  //Time Wind Chart
  getWHChartData(labelTime, windValues, humidityValue) {
    this.Chart = 'line';
    this.Value = {
      labels: labelTime,
      datasets: [
        {
          label: 'Wind',
          data: windValues,
          backgroundColor: 'rgb(62,168,249)',
          fill: false,

        },
        {
          label: 'Humidity',
          data: humidityValue,
          backgroundColor: 'rgb(62,249,124)',
          fill: false,
        }
      ]
    };
    this.Option = {
      title: {
        display: true,
        text: 'WIND - PRESSURE GRAPH'
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

  //Pressure Graph
  getPChart(time, value) {
    this.pressureChart = 'horizontalBar';
    this.pressureValues = {
      labels: time,
      datasets: [
        {
          label: 'Pressure',
          data: value,
          backgroundColor: 'rgb(153,153,255)',
          fill: false,
        }
      ]
    };
    this.pressureOptions = {
      title: {
        display: true,
        text: 'PRESSURE GRAPH ( hpa )'
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

