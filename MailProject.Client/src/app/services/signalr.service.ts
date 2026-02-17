import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;
  private hubUrl = environment.apiUrl.replace('/api', '') + '/notificationHub'; // Assuming Hub is at root/notificationHub or similar

  constructor() { }

  public startConnection = () => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addTransferChartDataListener = (callback: (data: any) => void) => {
    this.hubConnection.on('ReceiveMessage', (data) => {
      callback(data);
    });
  }
}
