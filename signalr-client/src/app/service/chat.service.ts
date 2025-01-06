import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public hubConnection: HubConnection;

  private messages = new BehaviorSubject<string[]>([]);
  private users = new BehaviorSubject<Record<string, string>>({});
  private typingNotifications = new BehaviorSubject<string[]>([]);

  messages$ = this.messages.asObservable();
  users$ = this.users.asObservable();
  typingNotifications$ = this.typingNotifications.asObservable();

  currentUserId: string = '';

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7024/chatHub')
      .withAutomaticReconnect()
      .build();

    this.setupHubListeners();
    this.startConnection();
  }

  private setupHubListeners() {
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      const currentMessages = this.messages.value;
      this.messages.next([...currentMessages, `${user}: ${message}`]);
    });

    this.hubConnection.on('UserStatusUpdate', (users: Record<string, string>) => {
      this.users.next(users);
    });

    this.hubConnection.on('ReceiveTypingNotification', (fromUser: string) => {
      const currentNotifications = this.typingNotifications.value;
      if (!currentNotifications.includes(fromUser)) {
        this.typingNotifications.next([...currentNotifications, fromUser]);
        setTimeout(() => {
          const updatedNotifications = this.typingNotifications.value.filter(
            (user) => user !== fromUser
          );
          this.typingNotifications.next(updatedNotifications);
        }, 3000);
      }
    });

    this.hubConnection.on('ReceiveCurrentUserId', (userId: string) => {
      this.currentUserId = userId;
    });

    this.hubConnection.on('ReceivePrivateMessage', (fromUser: string, message: string) => {
      const currentMessages = this.messages.value;
      this.messages.next([...currentMessages, `Private from ${fromUser}: ${message}`]);
    });
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

  sendPrivateMessage(connectionId: string, user: string, message: string) {
    this.hubConnection
      .invoke('SendMessageToClient', connectionId, user, message)
      .catch((err) => console.error(err));
  }

  joinGroup(groupName: string) {
    this.hubConnection.invoke('JoinGroup', groupName).catch((err) => console.error(err));
  }

  leaveGroup(groupName: string) {
    this.hubConnection.invoke('LeaveGroup', groupName).catch((err) => console.error(err));
  }

  sendTypingNotification(connectionId: string) {
    this.hubConnection
      .invoke('TypingNotification', connectionId)
      .catch((err) => console.error(err));
  }
}
