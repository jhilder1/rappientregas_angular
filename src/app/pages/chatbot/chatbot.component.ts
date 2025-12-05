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

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    this.loadVoices();
    const welcomeMessage = '¡Hola! ¿En qué puedo ayudarte hoy?';
    // Solo mostrar el mensaje de bienvenida visualmente, sin hablar
    this.addBotMessage(welcomeMessage);
  }


  ngOnDestroy(): void {
    this.stopSpeech();
  }

  loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoicesList = () => {
        const voices = window.speechSynthesis.getVoices();
        this.voices = voices;
        console.log('🔊 Voces cargadas:', voices.length);
        if (voices.length > 0) {
          console.log('🔊 Primera voz:', voices[0].name, voices[0].lang);
        }
      };

      // Cargar voces inmediatamente
      loadVoicesList();

      // También escuchar cuando cambien
      window.speechSynthesis.onvoiceschanged = loadVoicesList;

      // Forzar carga después de un momento
      setTimeout(loadVoicesList, 1000);
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
    if (!this.currentMessage.trim() || this.isLoading) {
      console.log('Mensaje vacío o ya está cargando');
      return;
    }

    const userMessage = this.currentMessage.trim();
    console.log('Enviando mensaje:', userMessage);
    this.addUserMessage(userMessage);
    this.currentMessage = '';
    this.isLoading = true;

    try {
      console.log('Llamando a chatbotService.sendMessage...');
      const response = await this.chatbotService.sendMessage(userMessage);
      console.log('Respuesta recibida:', response);

      if (response && response.trim().length > 0) {
        console.log('Agregando mensaje del bot:', response);
        this.addBotMessage(response);

        // Asegurar que las voces estén cargadas antes de hablar
        await this.ensureVoicesLoaded();

        // Esperar un poco más para asegurar que el DOM esté actualizado
        setTimeout(() => {
          console.log('🔊 Intentando hablar la respuesta...');
          this.speak(response);
        }, 300);
      } else {
        console.log('Respuesta vacía, agregando mensaje de error');
        const errorMessage = 'Lo siento, no pude generar una respuesta. Por favor, intenta reformular tu pregunta.';
        this.addBotMessage(errorMessage);
        await this.ensureVoicesLoaded();
        setTimeout(() => {
          this.speak(errorMessage);
        }, 300);
      }
    } catch (error) {
      console.error('Error en sendMessage:', error);
      const errorMessage = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      this.addBotMessage(errorMessage);
      await this.ensureVoicesLoaded();
      setTimeout(() => {
        this.speak(errorMessage);
      }, 300);
    } finally {
      this.isLoading = false;
      console.log('isLoading establecido en false');
    }
  }

  private ensureVoicesLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('⚠️ speechSynthesis no disponible');
        resolve();
        return;
      }

      // Forzar carga de voces
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        console.log('✅ Voces ya cargadas:', voices.length);
        resolve();
        return;
      }

      console.log('⏳ Esperando a que se carguen las voces...');

      // Esperar a que las voces se carguen
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos máximo

      const checkVoices = () => {
        attempts++;
        const loadedVoices = window.speechSynthesis.getVoices();
        if (loadedVoices.length > 0) {
          this.voices = loadedVoices;
          console.log('✅ Voces cargadas después de', attempts * 100, 'ms:', loadedVoices.length);
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(checkVoices, 100);
        } else {
          console.warn('⚠️ No se pudieron cargar voces después de', maxAttempts * 100, 'ms');
          resolve(); // Resolver de todos modos para no bloquear
        }
      };

      // Escuchar evento de cambio de voces
      window.speechSynthesis.onvoiceschanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        if (loadedVoices.length > 0) {
          this.voices = loadedVoices;
          console.log('✅ Voces cargadas por evento onvoiceschanged:', loadedVoices.length);
          resolve();
        }
      };

      // Iniciar verificación
      checkVoices();
    });
  }

  speak(text: string): void {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log('No se puede hablar - texto vacío o speechSynthesis no disponible');
      return;
    }

    // No verificar userInteracted - permitir hablar siempre
    try {
      // Cancelar cualquier habla anterior y esperar
      window.speechSynthesis.cancel();

      // Esperar más tiempo para asegurar que se canceló completamente
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Buscar una voz en español
        const allVoices = window.speechSynthesis.getVoices();
        const spanishVoices = allVoices.filter((v: any) =>
          v.lang.startsWith('es') || v.name.toLowerCase().includes('spanish') || v.name.toLowerCase().includes('español')
        );

        console.log('🔊 Voces disponibles:', allVoices.length);
        console.log('🔊 Voces en español:', spanishVoices.length);

        if (this.selectedVoice) {
          const voice = allVoices.find((v: any) => v.name === this.selectedVoice);
          if (voice) {
            utterance.voice = voice;
            console.log('🔊 Usando voz seleccionada:', voice.name);
          }
        } else if (spanishVoices.length > 0) {
          // Usar la primera voz en español disponible
          utterance.voice = spanishVoices[0];
          console.log('🔊 Usando voz en español:', spanishVoices[0].name);
        } else if (allVoices.length > 0) {
          // Usar cualquier voz disponible
          utterance.voice = allVoices[0];
          console.log('🔊 Usando primera voz disponible:', allVoices[0].name);
        }

        const mouth = document.getElementById('cat-mouth');
        if (mouth) mouth.classList.add('talking');

        let started = false;

        utterance.onstart = () => {
          started = true;
          console.log('✅ Habla iniciada correctamente');
        };

        utterance.onend = () => {
          console.log('✅ Habla terminada');
          if (mouth) mouth.classList.remove('talking');
        };

        utterance.onerror = (error: any) => {
          console.error('❌ Error al hablar:', error);
          console.error('Tipo de error:', error.error);
          console.error('Código de error:', error.charIndex);
          if (mouth) mouth.classList.remove('talking');
        };

        console.log('🔊 Iniciando habla con texto:', text.substring(0, 50) + '...');
        console.log('🔊 Voz seleccionada:', utterance.voice ? (utterance.voice as any).name : 'predeterminada');
        console.log('🔊 Idioma:', utterance.lang);
        console.log('🔊 Estado antes de speak:', {
          speaking: window.speechSynthesis.speaking,
          pending: window.speechSynthesis.pending,
          paused: window.speechSynthesis.paused
        });

        // Intentar hablar
        try {
          // Verificar que haya voces disponibles
          if (allVoices.length === 0) {
            console.error('❌ No hay voces disponibles. La síntesis de voz no funcionará.');
            if (mouth) mouth.classList.remove('talking');
            return;
          }

          // Si no hay voz asignada, usar la primera disponible
          if (!utterance.voice && allVoices.length > 0) {
            utterance.voice = allVoices[0];
            console.log('🔊 Asignando primera voz disponible:', allVoices[0].name);
          }

          window.speechSynthesis.speak(utterance);

          // Verificar si realmente se inició después de un momento
          setTimeout(() => {
            const isActive = window.speechSynthesis.speaking || window.speechSynthesis.pending;
            console.log('🔊 Estado después de speak:', {
              started: started,
              speaking: window.speechSynthesis.speaking,
              pending: window.speechSynthesis.pending,
              isActive: isActive
            });

            if (!started && !isActive) {
              console.warn('⚠️ La síntesis de voz no se inició. Puede requerir interacción del usuario.');
              console.warn('⚠️ Intenta hacer clic en el botón "Probar Voz" primero.');
              if (mouth) mouth.classList.remove('talking');
            } else if (isActive) {
              console.log('✅ Síntesis de voz activa correctamente');
            }
          }, 500);
        } catch (speakError) {
          console.error('❌ Error al llamar speak():', speakError);
          if (mouth) mouth.classList.remove('talking');
        }
      }, 200);
    } catch (error) {
      console.error('❌ Error en speak:', error);
    }
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

  testVoice(): void {
    const testMessage = 'Hola, esta es una prueba de voz. Si puedes escucharme, la síntesis de voz está funcionando correctamente.';
    console.log('🔊 Probando voz con mensaje:', testMessage);
    this.ensureVoicesLoaded().then(() => {
      // Esperar un momento para asegurar que la interacción se registró
      setTimeout(() => {
        this.speak(testMessage);
      }, 100);
    });
  }
}

