import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API_KEY = 'AIzaSyAjCfoERXorGMNWB-Xk375XAU56rbocmj8';
const BACKEND_URL = 'http://127.0.0.1:5000';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const KNOWLEDGE = `
SISTEMA DE GESTIÓN DE ENTREGAS RÁPIDAS

FUNCIONALIDADES PRINCIPALES:

1. GESTIÓN DE CLIENTES:
   - Ver lista de todos los clientes en la sección "Usuarios"
   - Editar cualquier cliente haciendo clic en el botón de editar en su tarjeta
   - Editar tu propio perfil desde la sección de perfil
   - Los campos editables son: nombre y teléfono
   - El correo electrónico no se puede modificar

2. GESTIÓN DE PEDIDOS:
   - Crear pedidos desde la sección "Órdenes"
   - Al crear un pedido debes seleccionar:
     * Cliente: el usuario que realiza el pedido
     * Menú/Artículo: selecciona un artículo del menú disponible
     * Cantidad: número de unidades del artículo
     * Motocicleta: opcional, para asignar un vehículo
     * Estado: pending (pendiente), in_progress (en progreso), delivered (entregado), cancelled (cancelado)
   - El sistema calcula automáticamente el precio total basado en el precio del menú y la cantidad
   - Puedes editar y eliminar pedidos existentes
   - Puedes asignar una motocicleta a un pedido pendiente

3. GESTIÓN DE ARTÍCULOS Y MENÚS:
   - Los artículos se crean en la sección "Artículos"
   - Los menús se crean en la sección "Platos" y conectan un artículo con un restaurante
   - Cada menú tiene un precio que puede ser diferente al precio del artículo
   - Los pedidos se crean usando menús, no artículos directamente

4. GESTIÓN DE DIRECCIONES:
   - Las direcciones se gestionan en la sección "Ubicaciones"
   - Cada dirección debe estar asociada a un pedido
   - Campos: calle, ciudad, estado, código postal, información adicional

5. GESTIÓN DE RESTAURANTES:
   - Ver y gestionar restaurantes en la sección "Comercios"
   - Los restaurantes ofrecen menús que contienen artículos

6. GESTIÓN DE CONDUCTORES Y VEHÍCULOS:
   - Conductores: gestiona los repartidores en la sección "Conductores"
   - Motocicletas: gestiona los vehículos en la sección "Vehículos"
   - Turnos: gestiona las jornadas de trabajo en "Jornadas"
   - Puedes ver la ubicación de una motocicleta en el mapa desde los pedidos

7. OTRAS FUNCIONALIDADES:
   - Inconvenientes: reporta problemas relacionados con pedidos
   - Fotos: sube evidencias fotográficas
   - Estadísticas: visualiza gráficos y métricas del sistema
   - Notificaciones: el sistema notifica sobre nuevos pedidos asignados

ESTRUCTURA DEL SISTEMA:
- Un pedido (Order) contiene: cliente, menú (que incluye artículo y restaurante), cantidad, precio total, estado, motocicleta opcional
- Una dirección (Address) está asociada a un pedido
- Un menú (Menu) conecta un artículo (Product) con un restaurante (Restaurant) y tiene su propio precio
- Los artículos (Product) son los productos base que se pueden ofrecer

`;

// Función de limpieza de texto
function limpiarTextoRespuesta(texto: string): string {
  let textoLimpio = texto;

  // 1. Eliminar asteriscos de formato (Markdown para negritas, cursivas).
  textoLimpio = textoLimpio.replace(/\*\*(.*?)\*\*/g, '$1'); // Para negritas
  textoLimpio = textoLimpio.replace(/\*(.*?)\*/g, '$1');   // Para cursivas

  // 2. Eliminar saltos de línea y espacios múltiples, dejando solo un espacio.
  textoLimpio = textoLimpio.replace(/[\r\n]+/g, ' '); // Reemplaza uno o más saltos de línea por un espacio
  textoLimpio = textoLimpio.replace(/\s\s+/g, ' '); // Reemplaza múltiples espacios por uno solo

  // 3. Eliminar emojis (patrón Unicode).
  textoLimpio = textoLimpio.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{2328}\u{23EA}-\u{23EC}\u{2B05}\u{2B06}\u{2B07}\u{25AA}\u{25AB}\u{25FB}\u{25FC}\u{25FD}\u{25FE}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}]/gu, '');

  // 4. Limpiar espacios al inicio y al final.
  textoLimpio = textoLimpio.trim();

  return textoLimpio;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private backendData: string = '';

  constructor(private http: HttpClient) {
    this.loadBackendData();
  }

  private loadBackendData(): void {
    const endpoints = [
      'restaurants', 'products', 'menus', 'customers', 'orders',
      'addresses', 'motorcycles', 'drivers', 'shifts', 'issues', 'photos'
    ];

    const requests = endpoints.map(endpoint =>
      this.http.get(`${BACKEND_URL}/${endpoint}`).pipe(
        map((data: any) => ({ endpoint, data })),
        catchError(() => of({ endpoint, data: [] }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const summary = results.map(r => {
          const data = Array.isArray(r.data) ? r.data : [r.data];
          const count = data.length;
          const sample = count > 0 ? data.slice(0, 3) : [];
          return `${r.endpoint}: ${count} registros${count > 0 ? '. Ejemplos: ' + JSON.stringify(sample) : ''}`;
        }).join('\n');

        this.backendData = `Resumen del sistema:\n${summary}\n\nPara más detalles, el sistema tiene acceso a todos los datos completos.`;
      },
      error: (error) => {
        console.error('Error al obtener datos del backend:', error);
        this.backendData = 'No se pudieron cargar los datos del sistema en este momento.';
      }
    });
  }

  private async refreshBackendData(): Promise<void> {
    return new Promise((resolve) => {
      this.loadBackendData();
      // Dar tiempo para que se carguen los datos
      setTimeout(() => resolve(), 500);
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Recargar datos del backend antes de cada mensaje para tener información actualizada
      await this.refreshBackendData();

      const prompt = `
Eres un asistente inteligente y útil para la plataforma de gestión de entregas rápidas.
Tu objetivo es ayudar a los usuarios a entender cómo usar el sistema y realizar acciones.

INSTRUCCIONES IMPORTANTES:
1. Formato: Responde SOLO con texto plano, sin asteriscos, guiones, comillas ni formato Markdown.
2. No uses emojis en tus respuestas.
3. Sé claro, conciso y directo.
4. Si el usuario pregunta sobre datos específicos del sistema, puedes mencionar información relevante de los datos actuales.
5. Si no sabes algo, admítelo y ofrece ayuda con lo que sí conoces.

CONOCIMIENTO DEL SISTEMA:
${KNOWLEDGE}

INFORMACIÓN ACTUAL DEL SISTEMA (usa esta información para responder preguntas específicas):
${this.backendData}

Pregunta del usuario: ${message}

Responde de forma útil y clara:
`;

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      let botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude entender tu mensaje.';

      // Aplicar la función de limpieza
      botReply = limpiarTextoRespuesta(botReply);

      return botReply;
    } catch (error: any) {
      console.error('Error al comunicarse con Gemini:', error);
      return 'Ocurrió un error al responder. Intenta nuevamente.';
    }
  }
}


