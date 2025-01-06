import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: HubConnection;
  private messages = new BehaviorSubject<string[]>([]);
  private users = new BehaviorSubject<Record<string, string>>({});

  messages$ = this.messages.asObservable();
  users$ = this.users.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7024/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      const currentMessages = this.messages.value;
      this.messages.next([...currentMessages, `${user}: ${message}`]);
    });

    this.hubConnection.on('UserStatusUpdate', (users: Record<string, string>) => {
      this.users.next(users);
    });

    this.startConnection();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection established'))
      .catch((err) => console.error('Error establishing SignalR connection:', err));
  }

  sendMessage(user: string, message: string) {
    this.hubConnection.invoke('SendMessageToAll', user, message).catch((err) => console.error(err));
  }
}
