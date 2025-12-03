import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatbotService } from '../../services/chatbot.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Voice {
  name: string;
  lang: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  currentMessage = '';
  isLoading = false;
  voices: Voice[] = [];
  selectedVoice = '';

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.loadVoices();
    this.addBotMessage('¡Hola! ¿En qué puedo ayudarte hoy?');
  }

  ngOnDestroy(): void {
    this.stopSpeech();
  }

  loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoicesList = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      
      window.speechSynthesis.onvoiceschanged = loadVoicesList;
      loadVoicesList();
    }
  }

  addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage = this.currentMessage.trim();
    this.addUserMessage(userMessage);
    this.currentMessage = '';
    this.isLoading = true;

    try {
      const response = await this.chatbotService.sendMessage(userMessage);
      this.addBotMessage(response);
      this.speak(response);
    } catch (error) {
      this.addBotMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
      this.isLoading = false;
    }
  }

  speak(text: string): void {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      const voice = this.voices.find(v => v.name === this.selectedVoice);
      if (voice) {
        utterance.voice = voice as any;
      }
    }

    const mouth = document.getElementById('cat-mouth');
    if (mouth) mouth.classList.add('talking');

    utterance.onend = () => {
      if (mouth) mouth.classList.remove('talking');
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const mouth = document.getElementById('cat-mouth');
      if (mouth) mouth.classList.remove('talking');
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}

