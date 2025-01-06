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
export class ChatComponent  {
  message = '';
  user = 'Anonymous';
  messages: string[] = [];
  users: Record<string, string> = {};

  constructor(private chatService: ChatService) {
    this.chatService.messages$.subscribe((msgs) => (this.messages = msgs));
    this.chatService.users$.subscribe((users) => (this.users = users));
  }

  sendMessage() {
    if (this.message.trim()) {
      this.chatService.sendMessage(this.user, this.message);
      this.message = '';
    }
  }
}
