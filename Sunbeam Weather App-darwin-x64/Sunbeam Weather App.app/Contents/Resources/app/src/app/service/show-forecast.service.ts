import { Injectable } from '@angular/core';

@Injectable()
export class ShowForecastService {

  showHourlyForecast: boolean = false;
  showFiveDaysForecast: boolean = false;
  
  constructor() { }

  showHourly(key: string) {
    this.showHourlyForecast = !this.showHourlyForecast;
    this.showFiveDaysForecast = false;
  }

  showFiveDay(key: string) {
    this.showFiveDaysForecast = !this.showFiveDaysForecast;
    this.showHourlyForecast = false;
  }

}
