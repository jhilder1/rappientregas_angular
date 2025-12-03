import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API_KEY = 'AIzaSyAjCfoERXorGMNWB-Xk375XAU56rbocmj8';
const BACKEND_URL = 'http://127.0.0.1:5000';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const KNOWLEDGE = `
🟢 Clientes:
¡Claro! Para crear o editar un cliente en Flash Food, solo sigue estos pasos:
1. Ve al panel de clientes desde el menú principal.
2. Haz clic en el botón "Agregar cliente" o selecciona uno existente para editar.
3. Ingresa: 🪪 Nombre, 📧 Correo, 📞 Teléfono, 📍 Dirección.
4. Revisa que todo esté bien escrito y haz clic en Guardar.

🟢 Pedidos:
1. Ve a la sección de pedidos y haz clic en "Agregar pedido".
2. Selecciona un cliente, productos o menús, conductor y dirección.
3. Revisa y guarda.

🟢 Restaurantes:
1. Ve a la sección de restaurantes.
2. Haz clic en "Agregar restaurante".
3. Llena nombre, dirección y teléfono.

🟢 Conductores:
1. Entra a conductores.
2. Haz clic en "Agregar conductor".
3. Ingresa nombre, teléfono, licencia y moto asignada.

🟢 Motos:
1. Accede al panel de motos.
2. Haz clic en "Agregar moto".
3. Llena modelo, placa y año.

🟢 Turnos:
1. Entra a turnos.
2. Haz clic en "Agregar turno".
3. Selecciona día, hora y conductor.

🟡 Inconvenientes:
1. Ve a la sección de "Inconvenientes" en el panel lateral.
2. Haz clic en "Agregar inconveniente".
3. Selecciona el pedido relacionado y describe el problema.
4. Guarda los cambios. El sistema notificará automáticamente al administrador.

🟡 Fotos:
1. Ve a la sección "Fotos".
2. Haz clic en "Subir foto".
3. Selecciona el pedido o entidad relacionada (como producto o conductor).
4. Elige la imagen desde tu dispositivo y confirma.

🟡 Ver ubicación de moto:
1. Entra a la sección "Pedidos".
2. Busca el pedido deseado y haz clic en el ícono 🗺️ de mapa.
3. Se abrirá una vista del mapa mostrando la ubicación actual de la moto asignada.

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
        this.backendData = results.map(r =>
          `Datos de ${r.endpoint}:\n${JSON.stringify(r.data, null, 2)}`
        ).join('\n\n');
      },
      error: (error) => {
        console.error('Error al obtener datos del backend:', error);
      }
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const prompt = `
Eres un asistente inteligente para la plataforma Flash Food.
Tu objetivo es guiar al usuario sobre cómo realizar acciones en la plataforma, como crear o editar elementos, o cómo usar ciertas funcionalidades.

**Instrucciones clave para tus respuestas:**
1.  **Formato:** Responde EXCLUSIVAMENTE con **texto plano**.
    * NO utilices asteriscos (*), guiones (-), comillas ("), ni ningún otro caracter de formato Markdown.
    * NO uses emojis. Si los emojis aparecen en la "Base de Conocimiento", ignóralos o descríbelos en texto si es absolutamente necesario (por ejemplo, "el ícono de mapa").
2.  **Contenido:**
    * No debes mostrar el contenido literal de la "Información actual del sistema" o "Conocimiento base". Utiliza esta información INTERNAMENTE para formular tu respuesta.
    * Tu respuesta debe ser una explicación clara y concisa sobre CÓMO hacer algo.
    * Si la pregunta del usuario es sobre "cómo crear un cliente", tu respuesta debe explicar los pasos para crear un cliente, sin enumerar todos los clientes existentes en el sistema.

**Conocimiento base sobre las funcionalidades de Flash Food:**
${KNOWLEDGE}

**Información actual del sistema (solo para tu contexto, NO la uses en tu respuesta):**
${this.backendData}

---
Pregunta del usuario: ${message}
Respuesta del asistente (solo texto plano, siguiendo las instrucciones de formato y contenido):
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


