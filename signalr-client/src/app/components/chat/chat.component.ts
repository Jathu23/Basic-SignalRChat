import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../service/chat.service';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentUserId: string = '';
  users: { [key: string]: string } = {};
  typingUsers: string[] = [];

  // Broadcast messages
  broadcastMessage = '';
  broadcastMessages: string[] = [];

  // Private messages
  privateMessageRecipient = '';
  privateMessage = '';
  privateMessages: string[] = [];

  // Group chat
  groups: { name: string; messages: string[]; message: string }[] = [];

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    // Subscribe to users and typing notifications
    this.chatService.users$.subscribe((users) => {
      this.users = users;
    });

    this.chatService.typingNotifications$.subscribe((typingUsers) => {
      this.typingUsers = typingUsers;
    });

    this.chatService.messages$.subscribe((messages) => {
      this.broadcastMessages = messages; // Broadcast messages received from service
    });

    this.chatService.hubConnection.on('ReceiveCurrentUserId', (connectionId: string) => {
      this.currentUserId = connectionId;
    });
  }

  // Broadcast Message
  sendBroadcastMessage() {
    if (this.broadcastMessage.trim()) {
      this.chatService.sendMessage(this.chatService.currentUserId, this.broadcastMessage);
      this.broadcastMessages.push(`You: ${this.broadcastMessage}`);
      this.broadcastMessage = '';
    }
  }

  // Private Messaging
  selectPrivateRecipient(user: string) {
    this.privateMessageRecipient = user;
    this.privateMessages = []; // Clear private messages when switching users
  }

  sendPrivateMessage() {
    if (this.privateMessage.trim() && this.privateMessageRecipient) {
      this.chatService.sendPrivateMessage(
        this.privateMessageRecipient,
        this.chatService.currentUserId,
        this.privateMessage
      );
      this.privateMessages.push(`You: ${this.privateMessage}`);
      this.privateMessage = '';
    }
  }

  // Group Chat
  createGroup() {
    const groupName = prompt('Enter group name:');
    if (groupName) {
      this.groups.push({ name: groupName, messages: [], message: '' });
      this.chatService.joinGroup(groupName);
    }
  }

  sendGroupMessage(groupName: string, message: string) {
    if (message.trim()) {
      const group = this.groups.find((g) => g.name === groupName);
      if (group) {
        this.chatService.sendMessage(groupName, message);
        group.messages.push(`You: ${message}`);
        group.message = '';
      }
    }
  }

  leaveGroup(groupName: string) {
    this.groups = this.groups.filter((g) => g.name !== groupName);
    this.chatService.leaveGroup(groupName);
  }

  // Typing Notification
  onTyping(recipient: string) {
    if (recipient) {
      this.chatService.sendTypingNotification(recipient);
    }
  }

  // Utility to check if a user is typing
  isTyping(user: string): boolean {
    return this.typingUsers.includes(user);
  }
}