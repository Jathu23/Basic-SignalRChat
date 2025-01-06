import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  public messages: { user: string; message: string }[] = [];
  public users: { id: string; name: string }[] = [];
  public typingUser: string | null = null;

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7024/chatHub')
      .build();

    this.startConnection();
    this.registerClientMethods();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.error('Error starting connection:', err));
  }

  private registerClientMethods() {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.messages.push({ user, message });
    });

    this.hubConnection.on('UserConnected', (connectionId, name) => {
      this.users.push({ id: connectionId, name });
    });

    this.hubConnection.on('UserDisconnected', connectionId => {
      this.users = this.users.filter(user => user.id !== connectionId);
    });

    this.hubConnection.on('Typing', userName => {
      this.typingUser = userName;
      setTimeout(() => (this.typingUser = null), 2000); // Clear typing after 2 seconds
    });
  }

  public sendMessage(user: string, message: string) {
    this.hubConnection.invoke('SendMessage', user, message).catch(err => console.error(err));
  }

  public notifyTyping(user: string) {
    this.hubConnection.invoke('Typing', user).catch(err => console.error(err));
  }
}
