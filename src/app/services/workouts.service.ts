import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {

  _currentKey = 0;

  constructor() { }

  get currentKey() {
    const key = this._currentKey.toString();
    this._currentKey++;
    return key;
  }
}
