import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API_KEY = 'AIzaSyAjCfoERXorGMNWB-Xk375XAU56rbocmj8';
const BACKEND_URL = 'http://127.0.0.1:5000';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const KNOWLEDGE = `
SISTEMA DE GESTIÓN DE ENTREGAS RÁPIDAS - PLATAFORMA COMPLETA

DESCRIPCIÓN GENERAL:
Esta es una plataforma web completa para gestionar entregas de comida a domicilio mediante motocicletas. El sistema permite gestionar restaurantes, productos, menús, pedidos, conductores, vehículos, turnos, direcciones, problemas e inconvenientes. Incluye autenticación OAuth, mapas en tiempo real, gráficos estadísticos, notificaciones y un chatbot inteligente.

ESTRUCTURA DE NAVEGACIÓN Y MENÚS:

El sistema tiene un menú principal con las siguientes secciones:

1. MENÚ "ADMINISTRACIÓN":
   - Pedidos y Órdenes: Gestión completa de pedidos
   - Ubicaciones de Entrega: Gestión de direcciones y visualización de mapas
   - Usuarios: Gestión de clientes y usuarios del sistema

2. MENÚ "LOCALES":
   - Comercios y Restaurantes: Gestión de restaurantes
   - Productos: Gestión de productos alimenticios
   - Menús: Creación y gestión de menús que asocian productos con restaurantes

3. MENÚ "CONDUCTORES":
   - Conductores: Gestión de repartidores
   - Vehículos y Motocicletas: Gestión de motocicletas
   - Jornadas de Trabajo: Gestión de turnos (asignación de conductores a motocicletas)
   - Problemas y Inconvenientes: Registro de problemas con motocicletas
   - Evidencias: Gestión de fotografías de evidencias

4. MENÚ "REPORTES":
   - Gráficos: Visualización de estadísticas y métricas del sistema

5. OTRAS OPCIONES:
   - Chat: Acceso al chatbot inteligente
   - Perfil: Edición del perfil del usuario actual
   - Cerrar Sesión: Salir del sistema

AUTENTICACIÓN Y ACCESO:

- El sistema requiere autenticación para acceder a todas las funcionalidades
- Se puede iniciar sesión con: Google, Microsoft, GitHub o Email/Password
- Una vez autenticado, el token se envía automáticamente en todas las peticiones al backend
- Las rutas están protegidas con guards de autenticación
- El backend está en http://127.0.0.1:5000

DETALLE COMPLETO DE MÓDULOS:

1. GESTIÓN DE USUARIOS Y CLIENTES:
   Ubicación: Menú "Administración" > "Usuarios"
   Funcionalidades:
   - Ver lista completa de todos los usuarios/clientes registrados
   - Crear nuevos usuarios con campos: nombre, email, teléfono
   - Editar cualquier usuario: nombre y teléfono (el email no se puede modificar)
   - Eliminar usuarios
   - Editar tu propio perfil desde el menú de perfil
   - Los usuarios pueden ser clientes que realizan pedidos
   Campos del formulario:
   - Nombre: obligatorio, texto
   - Email: obligatorio, debe ser un email válido, único
   - Teléfono: opcional, texto

2. GESTIÓN DE PEDIDOS Y ÓRDENES:
   Ubicación: Menú "Administración" > "Pedidos y Órdenes"
   Funcionalidades:
   - Crear nuevos pedidos
   - Editar pedidos existentes
   - Eliminar pedidos
   - Asignar motocicletas a pedidos pendientes
   - Ver estado de cada pedido
   - Ver información del cliente, menú, cantidad, precio total y motocicleta asignada
   Campos del formulario:
   - Cliente: obligatorio, selección de lista de clientes (muestra nombre y email)
   - Menú: obligatorio, selección de menús disponibles (muestra nombre del menú, precio y restaurante)
   - Cantidad: obligatorio, número entero mayor a 0
   - Motocicleta: opcional, solo muestra motocicletas con turnos activos (asignadas a conductores)
   - Estado: obligatorio, opciones: pending (Pendiente), in_progress (En Progreso), delivered (Entregado), cancelled (Cancelado)
   Características especiales:
   - El precio total se calcula automáticamente: precio del menú × cantidad
   - Solo se pueden asignar motocicletas que tienen turnos activos
   - Los menús no disponibles aparecen deshabilitados en el selector
   - La tabla muestra: ID, Cliente, Producto (nombre del menú), Cantidad, Estado, Total, Motocicleta, Acciones

3. GESTIÓN DE UBICACIONES Y DIRECCIONES:
   Ubicación: Menú "Administración" > "Ubicaciones de Entrega"
   Funcionalidades:
   - Crear direcciones de entrega
   - Editar direcciones existentes
   - Eliminar direcciones
   - Ver ubicación de motocicletas en tiempo real en el mapa
   - Asociar direcciones a pedidos
   Campos del formulario:
   - Calle: obligatorio, mínimo 3 caracteres
   - Ciudad: obligatorio
   - Estado/Departamento: obligatorio
   - Código Postal: obligatorio
   - Información Adicional: opcional, texto largo
   - Pedido: obligatorio, selección de pedidos existentes
   - Motocicleta: opcional, para asociar al pedido
   Características especiales:
   - Cada dirección debe estar asociada a un pedido
   - Desde esta sección puedes acceder al mapa en tiempo real
   - El mapa muestra la ubicación actual de las motocicletas usando Google Maps
   - El tracking de motocicletas se inicia desde aquí

4. GESTIÓN DE RESTAURANTES:
   Ubicación: Menú "Locales" > "Comercios y Restaurantes"
   Funcionalidades:
   - Crear nuevos restaurantes
   - Editar restaurantes existentes
   - Eliminar restaurantes
   - Ver lista de todos los restaurantes
   Campos típicos:
   - Nombre: obligatorio
   - Dirección: opcional
   - Teléfono: opcional
   - Email: opcional
   - Descripción: opcional
   Relaciones:
   - Un restaurante puede tener múltiples menús
   - Los menús conectan productos con restaurantes

5. GESTIÓN DE PRODUCTOS:
   Ubicación: Menú "Locales" > "Productos"
   Funcionalidades:
   - Crear nuevos productos alimenticios
   - Editar productos existentes
   - Eliminar productos
   - Ver lista de todos los productos
   Campos típicos:
   - Nombre: obligatorio
   - Descripción: opcional
   - Precio: obligatorio, número decimal
   - Categoría: opcional
   - Disponibilidad: booleano
   Relaciones:
   - Los productos son los elementos base del sistema
   - Un producto puede estar en múltiples menús
   - Los pedidos se hacen sobre menús, no directamente sobre productos

6. GESTIÓN DE MENÚS:
   Ubicación: Menú "Locales" > "Menús"
   Funcionalidades:
   - Crear nuevos menús
   - Editar menús existentes
   - Eliminar menús
   - Ver lista de todos los menús con su información completa
   CÓMO CREAR UN MENÚ (PASO A PASO):
   1. Ve al menú "Locales" y selecciona "Menús"
   2. Haz clic en el botón "Nuevo Menú"
   3. Completa el formulario:
      - Nombre del Menú: campo obligatorio, ejemplo "Menú del Día", "Combo Especial", "Promoción de Fin de Semana", "Menú Ejecutivo"
      - Restaurante: selecciona el restaurante que ofrecerá este menú (obligatorio)
      - Productos: selecciona uno o más productos del menú desplegable (puedes seleccionar múltiples, obligatorio)
      - Precio: establece el precio del menú en formato decimal (obligatorio, debe ser mayor o igual a 0)
      - Disponible: marca la casilla si el menú está disponible para pedidos
   4. Haz clic en "Crear" para guardar
   5. Si seleccionaste múltiples productos, se crearán varios menús (uno por cada producto) con el mismo nombre, restaurante y precio
   CÓMO EDITAR UN MENÚ:
   1. Ve a la sección "Menús"
   2. En la tabla, encuentra el menú que quieres editar
   3. Haz clic en el botón de editar (ícono de lápiz) en la columna "Acciones"
   4. Modifica los campos necesarios (nombre, restaurante, producto, precio, disponibilidad)
   5. Haz clic en "Actualizar" para guardar los cambios
   Características especiales:
   - El nombre del menú se muestra en los selectores de menús en otras secciones
   - Si un menú no tiene nombre, se muestra el nombre del producto como respaldo
   - Los menús no disponibles aparecen deshabilitados al crear pedidos
   - La tabla muestra: Nombre, Restaurante, Producto, Precio, Disponibilidad, Acciones
   - Cada menú conecta un producto específico con un restaurante específico
   - El precio del menú puede ser diferente al precio del producto

7. GESTIÓN DE CONDUCTORES:
   Ubicación: Menú "Conductores" > "Conductores"
   Funcionalidades:
   - Crear nuevos conductores
   - Editar conductores existentes
   - Eliminar conductores
   - Ver lista de todos los conductores
   Campos típicos:
   - Nombre: obligatorio
   - Teléfono: obligatorio
   - Email: opcional
   - Licencia: opcional
   - Estado: disponible, ocupado, inactivo
   Relaciones:
   - Los conductores pueden tener múltiples turnos
   - Un conductor puede usar diferentes motocicletas en diferentes turnos

8. GESTIÓN DE MOTOCICLETAS:
   Ubicación: Menú "Conductores" > "Vehículos y Motocicletas"
   Funcionalidades:
   - Crear nuevas motocicletas
   - Editar motocicletas existentes
   - Eliminar motocicletas
   - Ver lista de todas las motocicletas
   - Ver estado de cada motocicleta
   Campos típicos:
   - Placa/Licencia: obligatorio, texto único
   - Marca: obligatorio
   - Modelo: opcional
   - Año: obligatorio, número
   - Color: opcional
   - Estado: disponible, en_uso, mantenimiento, busy, disponible
   Características especiales:
   - El estado cambia automáticamente a "en_uso" cuando se crea un turno activo
   - Solo las motocicletas que no están en mantenimiento aparecen al crear turnos
   - Las motocicletas con turnos activos aparecen al asignar pedidos

9. GESTIÓN DE TURNOS (JORNADAS DE TRABAJO):
   Ubicación: Menú "Conductores" > "Jornadas de Trabajo"
   Funcionalidades:
   - Crear nuevos turnos
   - Editar turnos existentes
   - Eliminar turnos
   - Ver lista de todos los turnos
   CÓMO CREAR UN TURNO:
   1. Ve al menú "Conductores" y selecciona "Jornadas de Trabajo"
   2. Haz clic en "Nuevo Turno" o "Nueva Jornada"
   3. Completa el formulario:
      - Conductor: selecciona un conductor (solo se muestran conductores disponibles o activos)
      - Motocicleta: selecciona una motocicleta (solo se muestran motocicletas que no están en mantenimiento)
      - Fecha de Inicio: selecciona la fecha de inicio del turno
      - Hora de Inicio: selecciona la hora en formato HH:MM (ejemplo: 08:00, 14:30)
      - Fecha de Fin: opcional, selecciona la fecha de fin del turno
      - Hora de Fin: opcional, selecciona la hora de fin en formato HH:MM
      - Estado: selecciona el estado (activo, completado, cancelado)
   4. Haz clic en "Crear" para guardar
   Características especiales:
   - Cuando se crea un turno con estado "activo", la motocicleta asignada cambia automáticamente a estado "en_uso"
   - Solo las motocicletas con turnos activos pueden ser asignadas a pedidos
   - Los turnos permiten rastrear qué conductor está usando qué motocicleta en cada momento
   - La fecha y hora se combinan para crear un timestamp completo

10. GESTIÓN DE PROBLEMAS E INCONVENIENTES:
    Ubicación: Menú "Conductores" > "Problemas y Inconvenientes"
    Funcionalidades:
    - Crear reportes de problemas
    - Editar reportes existentes
    - Eliminar reportes
    - Ver lista de todos los problemas reportados
    Campos típicos:
    - Descripción: obligatorio, texto largo
    - Tipo: opcional (accidente, falla mecánica, pinchazo, etc.)
    - Fecha: automática
    - Motocicleta: asociación opcional
    - Pedido: asociación opcional
    - Estado: pendiente, resuelto, en proceso

11. GESTIÓN DE EVIDENCIAS (FOTOS):
    Ubicación: Menú "Conductores" > "Evidencias"
    Funcionalidades:
    - Subir fotografías de evidencias
    - Ver todas las fotos subidas
    - Eliminar fotos
    - Asociar fotos a inconvenientes
    Características:
    - Las fotos sirven como evidencia de problemas o situaciones
    - Cada foto puede estar asociada a un inconveniente específico

12. GRÁFICOS Y REPORTES:
    Ubicación: Menú "Reportes" > "Gráficos"
    Funcionalidades:
    - Visualizar 3 gráficos circulares (pie charts):
      * Distribución de pedidos por estado
      * Distribución de motocicletas por estado
      * Distribución de conductores por estado
    - Visualizar 3 gráficos de barras:
      * Pedidos por restaurante
      * Ingresos mensuales
      * Pedidos por día de la semana
    - Visualizar 3 gráficos de series temporales:
      * Evolución de pedidos en el tiempo
      * Conductores activos en el tiempo
      * Motocicletas en uso en el tiempo
    Características:
    - Los datos se obtienen de un servidor mock en el puerto 3001
    - Los gráficos se actualizan automáticamente
    - Usa Chart.js y ng2-charts para la visualización

13. MAPA EN TIEMPO REAL:
    Ubicación: Menú "Administración" > "Ubicaciones de Entrega" (botón para ver mapa)
    Funcionalidades:
    - Visualizar la ubicación actual de las motocicletas en un mapa interactivo
    - Seguimiento en tiempo real usando Google Maps
    - Iniciar y detener simulaciones de recorrido
    - Ver la placa de la motocicleta en el marcador
    Características técnicas:
    - Usa Google Maps JavaScript API
    - Conexión con Socket.IO para actualizaciones en tiempo real
    - El backend emite coordenadas a través de WebSockets
    - Se puede iniciar una simulación local de recorrido
    - El mapa se actualiza automáticamente cuando hay cambios de ubicación

14. NOTIFICACIONES:
    Funcionalidades:
    - Notificaciones visuales cuando se asigna un nuevo pedido a una motocicleta
    - Alertas sonoras llamativas
    - Las notificaciones aparecen automáticamente en la interfaz
    - Se pueden configurar según las preferencias del usuario

15. CHATBOT INTELIGENTE:
    Ubicación: Menú principal > "Chat" o ícono de chatbot
    Funcionalidades:
    - Responder preguntas sobre el sistema
    - Explicar cómo usar cada funcionalidad
    - Proporcionar ayuda contextual
    - Acceder a información actualizada del sistema
    Características:
    - Usa la API de Gemini de Google
    - Tiene conocimiento completo del sistema
    - Puede responder sobre cualquier módulo o funcionalidad
    - Proporciona instrucciones paso a paso

FLUJOS DE TRABAJO PRINCIPALES:

FLUJO 1: CREAR Y GESTIONAR UN PEDIDO COMPLETO
1. Crear o verificar que exista el cliente en "Usuarios"
2. Crear o verificar que exista el restaurante en "Comercios"
3. Crear o verificar que exista el producto en "Productos"
4. Crear el menú asociando producto y restaurante en "Menús"
5. Crear un turno asignando conductor y motocicleta en "Jornadas"
6. Crear el pedido en "Pedidos y Órdenes" seleccionando cliente, menú, cantidad y motocicleta
7. Crear la dirección de entrega en "Ubicaciones" asociada al pedido
8. Ver el seguimiento en tiempo real en el mapa desde "Ubicaciones"

FLUJO 2: GESTIONAR CONDUCTOR Y VEHÍCULO
1. Crear el conductor en "Conductores"
2. Crear la motocicleta en "Vehículos"
3. Crear un turno en "Jornadas" asignando conductor y motocicleta
4. El sistema automáticamente cambia el estado de la motocicleta a "en_uso"
5. La motocicleta ahora está disponible para asignar a pedidos

FLUJO 3: REPORTAR UN PROBLEMA
1. Si hay un problema con una motocicleta, ve a "Problemas y Inconvenientes"
2. Crea un nuevo reporte describiendo el problema
3. Opcionalmente, sube fotos de evidencia en "Evidencias"
4. Asocia las fotos al problema reportado

ESTADOS Y VALIDACIONES:

ESTADOS DE PEDIDOS:
- pending / pendiente: El pedido está esperando ser procesado
- in_progress / en_progreso: El pedido está siendo preparado o entregado
- delivered / entregado: El pedido fue entregado exitosamente
- cancelled / cancelado: El pedido fue cancelado

ESTADOS DE MOTOCICLETAS:
- available / disponible: La motocicleta está disponible para uso
- en_uso: La motocicleta está siendo usada en un turno activo
- mantenimiento: La motocicleta está en mantenimiento y no disponible
- busy: Similar a en_uso

ESTADOS DE CONDUCTORES:
- disponible: El conductor está disponible para trabajar
- ocupado: El conductor está actualmente en un turno activo
- inactivo: El conductor no está disponible

ESTADOS DE TURNOS:
- active / activo: El turno está actualmente en curso
- completed / completado: El turno ha finalizado
- cancelled / cancelado: El turno fue cancelado

ESTADOS DE MENÚS:
- available / disponible: El menú está disponible para pedidos
- not available / no disponible: El menú no está disponible temporalmente

RELACIONES ENTRE ENTIDADES:

- Un Cliente puede tener múltiples Pedidos
- Un Pedido pertenece a un Cliente
- Un Pedido tiene un Menú
- Un Menú pertenece a un Restaurante
- Un Menú tiene un Producto
- Un Restaurante puede tener múltiples Menús
- Un Producto puede estar en múltiples Menús
- Un Pedido tiene una Dirección (relación uno a uno)
- Una Dirección pertenece a un Pedido
- Un Pedido puede tener una Motocicleta asignada
- Una Motocicleta puede tener múltiples Pedidos
- Un Turno asocia un Conductor con una Motocicleta
- Un Conductor puede tener múltiples Turnos
- Una Motocicleta puede tener múltiples Turnos
- Un Inconveniente puede estar asociado a una Motocicleta
- Un Inconveniente puede tener múltiples Fotos
- Una Foto pertenece a un Inconveniente

CONSEJOS Y MEJORES PRÁCTICAS:

1. Siempre crea primero los elementos base (restaurantes, productos, conductores, motocicletas) antes de crear elementos que dependen de ellos (menús, pedidos, turnos)

2. Asegúrate de que los menús estén marcados como "disponibles" para que aparezcan al crear pedidos

3. Solo se pueden asignar motocicletas con turnos activos a los pedidos, así que asegúrate de crear los turnos primero

4. Usa nombres descriptivos para los menús para facilitar su identificación

5. El mapa en tiempo real solo funciona si el backend está emitiendo coordenadas a través de Socket.IO

6. Las notificaciones aparecen automáticamente cuando se asignan nuevos pedidos

7. Puedes editar tu propio perfil desde el menú de usuario en la esquina superior derecha

8. Todos los formularios tienen validaciones, así que completa todos los campos obligatorios

9. Los gráficos se actualizan automáticamente y muestran datos del servidor mock

10. El chatbot puede ayudarte con cualquier duda sobre el sistema, solo pregúntale

PREGUNTAS FRECUENTES:

P: ¿Cómo creo un pedido?
R: Ve a "Administración" > "Pedidos y Órdenes", haz clic en "Nueva Orden", completa el formulario seleccionando cliente, menú, cantidad, motocicleta (opcional) y estado, luego haz clic en "Crear".

P: ¿Por qué no puedo asignar una motocicleta a un pedido?
R: Solo puedes asignar motocicletas que tienen turnos activos. Primero crea un turno en "Jornadas" asignando un conductor a una motocicleta con estado "activo".

P: ¿Cómo veo dónde está una motocicleta en tiempo real?
R: Ve a "Administración" > "Ubicaciones de Entrega" y desde ahí puedes acceder al mapa en tiempo real.

P: ¿Cómo creo un menú?
R: Ve a "Locales" > "Menús", haz clic en "Nuevo Menú", completa el nombre, selecciona restaurante y productos, establece el precio y marca si está disponible, luego haz clic en "Crear".

P: ¿Puedo editar mi perfil?
R: Sí, haz clic en tu foto de perfil en la esquina superior derecha y selecciona "Perfil" para editar tu nombre y teléfono.

P: ¿Qué significan los diferentes estados de los pedidos?
R: Pendiente = esperando procesamiento, En Progreso = siendo preparado/entregado, Entregado = completado exitosamente, Cancelado = cancelado.

P: ¿Cómo reporto un problema con una motocicleta?
R: Ve a "Conductores" > "Problemas y Inconvenientes", crea un nuevo reporte describiendo el problema y opcionalmente sube fotos de evidencia.

P: ¿Dónde veo las estadísticas del sistema?
R: Ve a "Reportes" > "Gráficos" para ver todos los gráficos y métricas del sistema.

P: ¿Cómo inicio sesión?
R: En la página de login puedes iniciar sesión con Google, Microsoft, GitHub o usando tu email y contraseña.

P: ¿El sistema guarda automáticamente los cambios?
R: Sí, cuando haces clic en "Crear" o "Actualizar" los cambios se guardan inmediatamente en el backend.

CASOS DE USO DETALLADOS:

CASO 1: RESTAURANTE NUEVO QUIERE OFRECER PRODUCTOS
1. El restaurante se registra o un administrador lo crea en "Comercios y Restaurantes"
2. Se crean los productos que el restaurante quiere ofrecer en "Productos"
3. Se crean los menús asociando productos con el restaurante en "Menús"
4. Los menús se marcan como disponibles
5. Ahora los clientes pueden crear pedidos con esos menús

CASO 2: CLIENTE REALIZA UN PEDIDO
1. El cliente debe estar registrado en "Usuarios" (o se crea uno nuevo)
2. El cliente o administrador crea un pedido en "Pedidos y Órdenes"
3. Se selecciona un menú disponible
4. Se ingresa la cantidad deseada
5. Opcionalmente se asigna una motocicleta con turno activo
6. Se crea la dirección de entrega en "Ubicaciones"
7. El pedido queda registrado con estado pendiente

CASO 3: ASIGNAR ENTREGA A CONDUCTOR
1. Se verifica que exista un conductor disponible en "Conductores"
2. Se verifica que exista una motocicleta disponible en "Vehículos"
3. Se crea un turno en "Jornadas" asignando conductor y motocicleta con estado activo
4. La motocicleta cambia automáticamente a estado en_uso
5. Ahora se puede asignar esa motocicleta a un pedido en "Pedidos y Órdenes"
6. El pedido cambia a estado en_progress
7. Se puede rastrear la ubicación en el mapa desde "Ubicaciones"

CASO 4: REPORTAR PROBLEMA CON MOTOCICLETA
1. Si hay un problema durante una entrega, se va a "Problemas y Inconvenientes"
2. Se crea un nuevo reporte describiendo el problema (accidente, falla mecánica, pinchazo, etc.)
3. Se asocia el problema a la motocicleta afectada
4. Opcionalmente se suben fotos de evidencia en "Evidencias"
5. Se asocian las fotos al problema reportado
6. El problema queda registrado con estado pendiente o en proceso
7. Una vez resuelto, se actualiza el estado a resuelto

CASO 5: GESTIÓN DE TURNOS DIARIOS
1. Al inicio del día, se crean turnos para los conductores disponibles
2. Cada turno asocia un conductor con una motocicleta
3. Los turnos se crean con estado activo
4. Las motocicletas cambian automáticamente a en_uso
5. Durante el día, se asignan pedidos a estas motocicletas
6. Al final del día, se actualizan los turnos con fecha y hora de fin
7. Los turnos cambian a estado completado
8. Las motocicletas vuelven a estado disponible

ERRORES COMUNES Y SOLUCIONES:

ERROR 1: "No puedo crear un pedido porque no aparecen menús"
SOLUCIÓN: Verifica que existan menús creados en "Menús" y que estén marcados como disponibles. Si no hay menús, primero crea productos en "Productos", restaurantes en "Comercios", y luego crea los menús asociando productos con restaurantes.

ERROR 2: "No puedo asignar una motocicleta a un pedido"
SOLUCIÓN: Solo se pueden asignar motocicletas que tienen turnos activos. Ve a "Jornadas" y crea un turno asignando un conductor a una motocicleta con estado activo. Una vez creado el turno activo, la motocicleta aparecerá en las opciones al crear o editar pedidos.

ERROR 3: "No puedo crear un turno porque no aparecen motocicletas"
SOLUCIÓN: Verifica que existan motocicletas creadas en "Vehículos" y que no estén todas en mantenimiento. Solo las motocicletas que no están en mantenimiento aparecen al crear turnos. Si todas están en mantenimiento, edita una motocicleta y cambia su estado a disponible.

ERROR 4: "No puedo crear un menú porque no aparecen productos o restaurantes"
SOLUCIÓN: Primero debes crear los productos en "Productos" y los restaurantes en "Comercios". Los menús requieren que existan tanto productos como restaurantes antes de poder crearlos.

ERROR 5: "El formulario no me deja guardar"
SOLUCIÓN: Verifica que todos los campos obligatorios estén completos. Los campos obligatorios generalmente están marcados con un asterisco o tienen validaciones. Revisa los mensajes de error que aparecen debajo de cada campo para saber qué falta o qué está incorrecto.

ERROR 6: "No puedo editar mi perfil"
SOLUCIÓN: Haz clic en tu foto de perfil en la esquina superior derecha del menú principal y selecciona "Perfil". Desde ahí puedes editar tu nombre y teléfono. El email no se puede modificar por razones de seguridad.

ERROR 7: "El mapa no muestra la ubicación de las motocicletas"
SOLUCIÓN: El mapa requiere que el backend esté emitiendo coordenadas a través de Socket.IO. Verifica que el backend esté corriendo y que haya motocicletas con turnos activos. También puedes iniciar una simulación de recorrido desde el mapa.

ERROR 8: "No puedo eliminar un elemento porque dice que tiene dependencias"
SOLUCIÓN: Algunos elementos no se pueden eliminar si tienen relaciones con otros elementos. Por ejemplo, no puedes eliminar un restaurante si tiene menús asociados, o un menú si tiene pedidos. Primero elimina o modifica los elementos dependientes, y luego podrás eliminar el elemento principal.

VALIDACIONES Y RESTRICCIONES DETALLADAS:

VALIDACIONES DE FORMULARIOS:
- Todos los campos marcados como obligatorios deben completarse
- Los emails deben tener un formato válido (ejemplo: usuario@dominio.com)
- Los números deben estar en rangos válidos (años entre 1900 y año actual, precios mayor o igual a 0)
- Los teléfonos deben tener al menos 10 dígitos
- Las fechas no pueden ser futuras en algunos contextos
- Las horas deben estar en formato HH:MM (24 horas)

RESTRICCIONES DE RELACIONES:
- No se puede eliminar un restaurante si tiene menús asociados
- No se puede eliminar un producto si está en menús que tienen pedidos
- No se puede eliminar un menú si tiene pedidos asociados
- No se puede eliminar un cliente si tiene pedidos
- No se puede eliminar un conductor si tiene turnos activos
- No se puede eliminar una motocicleta si tiene turnos activos o pedidos asignados
- No se puede eliminar un pedido si tiene una dirección asociada (primero elimina la dirección)

RESTRICCIONES DE ESTADOS:
- Solo motocicletas con turnos activos pueden ser asignadas a pedidos
- Solo motocicletas que no están en mantenimiento pueden tener turnos
- Solo menús disponibles aparecen al crear pedidos
- Solo conductores disponibles o activos aparecen al crear turnos

TIPOS DE DATOS Y FORMATOS:

FORMATOS DE FECHA Y HORA:
- Las fechas se muestran en formato estándar (YYYY-MM-DD)
- Las horas se ingresan en formato 24 horas (HH:MM)
- Ejemplos válidos: 08:00, 14:30, 23:59
- La fecha y hora se combinan para crear timestamps completos

FORMATOS DE PRECIOS:
- Los precios son números decimales
- Se pueden usar hasta 2 decimales
- Ejemplos válidos: 10.50, 25.00, 100.99
- El precio total de un pedido se calcula automáticamente

FORMATOS DE PLACAS:
- Las placas de motocicletas son alfanuméricas
- Ejemplos: ABC123, XYZ789, DEF456
- Deben ser únicas en el sistema

FORMATOS DE EMAIL:
- Deben seguir el formato estándar: usuario@dominio.com
- Deben ser únicos para usuarios
- Se validan automáticamente en los formularios

NAVEGACIÓN Y ACCESO RÁPIDO:

ATAJOS Y CONSEJOS DE NAVEGACIÓN:
- Usa el menú principal para acceder rápidamente a cualquier sección
- Los botones de acción (crear, editar, eliminar) están claramente marcados en cada página
- Las tablas tienen botones de acción en cada fila para operaciones rápidas
- Puedes buscar y filtrar en muchas de las tablas para encontrar elementos específicos
- El menú de usuario en la esquina superior derecha te da acceso rápido a tu perfil y cerrar sesión

SECCIONES MÁS USADAS:
- Pedidos y Órdenes: Para gestionar todos los pedidos del sistema
- Menús: Para crear y gestionar la oferta de productos
- Jornadas: Para asignar conductores a motocicletas
- Ubicaciones: Para gestionar direcciones y ver el mapa en tiempo real
- Gráficos: Para ver estadísticas y reportes del sistema

INTEGRACIÓN Y TECNOLOGÍAS:

TECNOLOGÍAS UTILIZADAS:
- Frontend: Angular (framework de JavaScript/TypeScript)
- Backend: Flask (framework de Python)
- Base de datos: Se comunica con el backend que gestiona la persistencia
- Autenticación: Firebase Authentication con OAuth (Google, Microsoft, GitHub)
- Mapas: Google Maps JavaScript API
- Tiempo real: Socket.IO para WebSockets
- Gráficos: Chart.js y ng2-charts
- UI: Angular Material para componentes de interfaz

COMUNICACIÓN CON EL BACKEND:
- Todas las peticiones HTTP se hacen al backend en http://127.0.0.1:5000
- El token de autenticación se envía automáticamente en el header Authorization
- Las peticiones usan métodos REST estándar: GET, POST, PUT, DELETE
- Los errores se manejan y muestran mensajes claros al usuario

SEGURIDAD:
- Todas las rutas están protegidas con guards de autenticación
- El token de autenticación se valida en cada petición
- Los usuarios solo pueden acceder a funcionalidades según sus permisos
- Los datos sensibles se manejan de forma segura

PREGUNTAS ADICIONALES FRECUENTES:

P: ¿Puedo tener múltiples turnos activos para un mismo conductor?
R: Técnicamente sí, pero es mejor práctica tener solo un turno activo por conductor a la vez para evitar confusiones.

P: ¿Puedo cambiar el estado de un pedido después de crearlo?
R: Sí, puedes editar cualquier pedido y cambiar su estado. Los estados disponibles son: Pendiente, En Progreso, Entregado y Cancelado.

P: ¿Qué pasa si elimino un menú que tiene pedidos?
R: Generalmente el sistema no te permitirá eliminar un menú que tiene pedidos asociados para mantener la integridad de los datos. Primero debes eliminar o modificar los pedidos relacionados.

P: ¿Cómo sé qué motocicletas están disponibles?
R: Ve a "Vehículos y Motocicletas" y revisa la columna de estado. Las motocicletas con estado "disponible" están listas para usar. Las que están "en_uso" tienen turnos activos. Las que están en "mantenimiento" no están disponibles.

P: ¿Puedo crear un pedido sin asignar una motocicleta?
R: Sí, la motocicleta es opcional al crear un pedido. Puedes asignarla después editando el pedido, o dejarlo sin asignar si aún no hay una motocicleta disponible.

P: ¿Cómo actualizo el estado de un pedido a entregado?
R: Ve a "Pedidos y Órdenes", encuentra el pedido, haz clic en editar, cambia el estado a "Entregado" y guarda los cambios.

P: ¿Qué información se muestra en los gráficos?
R: Los gráficos muestran estadísticas del sistema incluyendo distribución de pedidos por estado, motocicletas por estado, conductores por estado, pedidos por restaurante, ingresos mensuales, pedidos por día de la semana, y evolución temporal de pedidos, conductores activos y motocicletas en uso.

P: ¿Puedo ver el historial de un conductor?
R: Puedes ver todos los turnos de un conductor en "Jornadas de Trabajo" filtrando por conductor. Esto te muestra el historial de asignaciones de ese conductor.

P: ¿Cómo reporto un problema con una entrega?
R: Ve a "Problemas y Inconvenientes", crea un nuevo reporte, describe el problema, asocia la motocicleta y opcionalmente el pedido afectado, y sube fotos de evidencia si las tienes.

P: ¿El sistema guarda automáticamente si cierro el navegador?
R: No, los cambios solo se guardan cuando haces clic en "Crear" o "Actualizar". Si cierras el navegador sin guardar, los cambios se perderán.

P: ¿Puedo exportar los datos del sistema?
R: Actualmente el sistema no tiene funcionalidad de exportación, pero puedes ver todos los datos en las tablas correspondientes y usar los gráficos para visualizar estadísticas.

P: ¿Cómo cambio mi contraseña?
R: Si iniciaste sesión con OAuth (Google, Microsoft, GitHub), debes cambiar tu contraseña desde la plataforma correspondiente. Si usas email y contraseña, la funcionalidad de cambio de contraseña dependería de la configuración de Firebase.

P: ¿Puedo tener múltiples sesiones abiertas?
R: Técnicamente sí, pero puede causar inconsistencias si haces cambios desde diferentes sesiones simultáneamente. Se recomienda usar solo una sesión a la vez.

P: ¿Qué hago si olvido mi contraseña?
R: Si usas OAuth, usa la opción de recuperación de contraseña de la plataforma correspondiente (Google, Microsoft, GitHub). Si usas email y contraseña, usa la opción de recuperación de contraseña de Firebase en la página de login.

P: ¿El sistema funciona en móviles?
R: Sí, el sistema es responsivo y se adapta a diferentes tamaños de pantalla, incluyendo tablets y teléfonos móviles.

P: ¿Puedo personalizar los gráficos?
R: Actualmente los gráficos muestran datos predefinidos. La personalización avanzada no está disponible, pero puedes ver diferentes tipos de gráficos en la sección de Reportes.

P: ¿Cómo sé si hay nuevos pedidos?
R: El sistema muestra notificaciones automáticamente cuando se asignan nuevos pedidos. También puedes revisar la sección "Pedidos y Órdenes" para ver todos los pedidos, incluyendo los nuevos.

P: ¿Puedo cancelar un pedido después de crearlo?
R: Sí, puedes editar el pedido y cambiar su estado a "Cancelado". Esto marcará el pedido como cancelado en el sistema.

P: ¿Qué información necesito para crear un conductor?
R: Necesitas el nombre (obligatorio), teléfono (obligatorio), email (opcional), número de licencia (opcional) y estado (disponible por defecto).

P: ¿Puedo ver todos los pedidos de un cliente específico?
R: En la sección "Pedidos y Órdenes" puedes filtrar o buscar por cliente para ver todos sus pedidos. La tabla muestra todos los pedidos y puedes identificar cuáles pertenecen a cada cliente.

P: ¿Cómo actualizo la información de un restaurante?
R: Ve a "Comercios y Restaurantes", encuentra el restaurante en la tabla, haz clic en el botón de editar, modifica los campos necesarios y haz clic en "Actualizar".

P: ¿Qué significa cuando una motocicleta está "en_uso"?
R: Significa que la motocicleta tiene un turno activo asignado a un conductor. Solo las motocicletas en_uso pueden recibir pedidos.

P: ¿Puedo crear un turno para el futuro?
R: Sí, puedes establecer fechas y horas futuras al crear un turno. El sistema permite programar turnos con anticipación.

P: ¿Cómo finalizo un turno?
R: Edita el turno en "Jornadas de Trabajo", establece la fecha y hora de fin, cambia el estado a "Completado" y guarda. La motocicleta volverá automáticamente a estado disponible.

P: ¿Qué tipos de problemas puedo reportar?
R: Puedes reportar cualquier tipo de problema relacionado con las motocicletas: accidentes, fallas mecánicas, pinchazos, problemas de combustible, problemas con el conductor, etc. El sistema es flexible y permite describir cualquier situación.

P: ¿Las fotos de evidencia tienen límite de tamaño?
R: El límite depende de la configuración del backend. Generalmente se aceptan imágenes en formatos comunes como JPG, PNG. Si una imagen es muy grande, el sistema te mostrará un error.

P: ¿Puedo ver la ubicación de todas las motocicletas a la vez en el mapa?
R: Sí, el mapa muestra todos los marcadores de las motocicletas que tienen turnos activos. Puedes hacer zoom y moverte por el mapa para ver todas las ubicaciones.

P: ¿Cómo inicio una simulación de recorrido en el mapa?
R: Desde el mapa en "Ubicaciones", selecciona una motocicleta y haz clic en el botón para iniciar simulación. Esto comenzará una simulación local del recorrido de esa motocicleta.

P: ¿Los gráficos se actualizan en tiempo real?
R: Los gráficos muestran datos que se cargan cuando accedes a la sección. Para ver datos actualizados, recarga la página o navega fuera y vuelve a entrar a la sección de Gráficos.

P: ¿Puedo eliminar múltiples elementos a la vez?
R: Actualmente el sistema no tiene funcionalidad de eliminación masiva. Debes eliminar cada elemento individualmente desde su respectiva tabla.

P: ¿Qué información se guarda cuando creo un pedido?
R: Se guarda el cliente, el menú seleccionado, la cantidad, el precio total calculado, el estado, la fecha y hora de creación, y opcionalmente la motocicleta asignada.

P: ¿Puedo ver quién creó cada pedido?
R: El sistema registra información de creación, pero la visualización de quién creó cada elemento depende de la implementación específica del backend. Generalmente se muestra la fecha y hora de creación.

P: ¿Cómo filtro los pedidos por estado?
R: En la tabla de "Pedidos y Órdenes" puedes usar las funciones de búsqueda y filtro para encontrar pedidos por estado. La tabla muestra todos los estados en la columna correspondiente.

P: ¿Puedo crear un menú con múltiples productos?
R: Sí, al crear un menú puedes seleccionar múltiples productos. Sin embargo, el sistema creará un menú separado por cada producto seleccionado, todos con el mismo nombre, restaurante y precio.

P: ¿Qué pasa si cambio el precio de un producto?
R: Cambiar el precio de un producto no afecta automáticamente el precio de los menús que usan ese producto, ya que los menús tienen su propio precio independiente.

P: ¿Puedo ver estadísticas de un restaurante específico?
R: En la sección de Gráficos hay un gráfico que muestra pedidos por restaurante. También puedes filtrar pedidos en la tabla de "Pedidos y Órdenes" para ver pedidos de un restaurante específico.

P: ¿Cómo sé cuántos pedidos tiene cada conductor?
R: Puedes ver esta información indirectamente revisando los turnos en "Jornadas" y luego los pedidos asignados a las motocicletas de esos turnos. También puedes usar los gráficos para ver estadísticas generales.

P: ¿Puedo programar pedidos para el futuro?
R: El sistema permite crear pedidos con fechas, pero la funcionalidad de programación automática depende de la implementación específica. Generalmente los pedidos se crean para procesamiento inmediato.

P: ¿Qué hago si una motocicleta tiene un problema durante una entrega?
R: Ve inmediatamente a "Problemas y Inconvenientes", crea un reporte del problema, asocia la motocicleta y el pedido afectado, y sube fotos si es necesario. Luego puedes reasignar el pedido a otra motocicleta si es necesario.

P: ¿Puedo ver el historial completo de un pedido?
R: El sistema muestra la información actual del pedido, incluyendo su estado, cliente, menú, cantidad, precio, motocicleta asignada y dirección. El historial detallado de cambios depende de la implementación del backend.

P: ¿Cómo cambio el estado de una motocicleta a mantenimiento?
R: Ve a "Vehículos y Motocicletas", encuentra la motocicleta, haz clic en editar, cambia el estado a "Mantenimiento" y guarda. Esto la hará no disponible para turnos y pedidos.

P: ¿Puedo tener conductores sin motocicletas asignadas?
R: Sí, los conductores pueden existir sin turnos activos. Los turnos son temporales y se crean cuando un conductor va a trabajar. Un conductor puede no tener turnos activos y aún así estar en el sistema.

P: ¿Qué información necesito para crear una dirección?
R: Necesitas la calle (obligatorio, mínimo 3 caracteres), ciudad (obligatorio), estado o departamento (obligatorio), código postal (obligatorio), información adicional (opcional), y debes asociarla a un pedido existente.

P: ¿Puedo editar una dirección después de crearla?
R: Sí, ve a "Ubicaciones de Entrega", encuentra la dirección en la tabla, haz clic en editar, modifica los campos necesarios y guarda los cambios.

P: ¿Cómo sé qué pedidos están pendientes?
R: En "Pedidos y Órdenes" puedes ver todos los pedidos y su estado. Los pedidos con estado "Pendiente" son los que están esperando ser procesados. Puedes filtrar o buscar por estado para encontrarlos más fácilmente.

P: ¿Puedo crear un producto sin precio?
R: No, el precio es un campo obligatorio para los productos. Debes ingresar un precio mayor o igual a 0.

P: ¿Qué pasa si elimino un cliente que tiene pedidos?
R: Generalmente el sistema no te permitirá eliminar un cliente que tiene pedidos asociados para mantener la integridad referencial de los datos. Primero debes eliminar o modificar los pedidos relacionados.

P: ¿Cómo actualizo la disponibilidad de un menú?
R: Ve a "Menús", encuentra el menú, haz clic en editar, marca o desmarca la casilla de "Disponible" según corresponda, y guarda los cambios.

P: ¿Puedo ver cuántos pedidos tiene cada menú?
R: Puedes ver esta información indirectamente revisando los pedidos en "Pedidos y Órdenes" y contando cuántos usan cada menú. Los gráficos también pueden mostrar estadísticas relacionadas.

P: ¿Qué significa cuando un turno está "activo"?
R: Significa que el turno está actualmente en curso, es decir, un conductor está usando una motocicleta en este momento. Solo las motocicletas con turnos activos pueden recibir pedidos.

P: ¿Puedo crear un pedido sin cliente?
R: No, el cliente es un campo obligatorio. Debes seleccionar un cliente existente o crear uno nuevo en "Usuarios" antes de crear el pedido.

P: ¿Cómo sé si un menú está disponible?
R: En la tabla de "Menús" hay una columna que muestra la disponibilidad. También, cuando creas un pedido, solo aparecen los menús disponibles en el selector, y los no disponibles aparecen deshabilitados.

P: ¿Puedo ver todos los problemas de una motocicleta específica?
R: En "Problemas y Inconvenientes" puedes filtrar o buscar por motocicleta para ver todos los problemas reportados para esa motocicleta específica.

P: ¿Qué información se muestra en el perfil de usuario?
R: El perfil muestra tu nombre, email (no editable), teléfono (editable), y tu foto de perfil si iniciaste sesión con OAuth.

P: ¿Puedo cambiar mi email?
R: No, el email no se puede modificar por razones de seguridad e integridad de la cuenta. Si necesitas cambiar tu email, deberías crear una nueva cuenta.

P: ¿Cómo cierro sesión?
R: Haz clic en tu foto de perfil en la esquina superior derecha y selecciona "Cerrar Sesión". Esto te llevará de vuelta a la página de login.

P: ¿Los datos se pierden si cierro el navegador?
R: Los datos guardados en el backend se mantienen. Solo se pierden los cambios no guardados en formularios abiertos. Una vez que haces clic en "Crear" o "Actualizar", los datos se guardan permanentemente.

P: ¿Puedo usar el sistema sin conexión a internet?
R: No, el sistema requiere conexión a internet para comunicarse con el backend y cargar los datos. Sin conexión, no podrás acceder a las funcionalidades.

P: ¿Cómo reporto un error o problema con el sistema?
R: Si encuentras un error técnico o un problema con el funcionamiento del sistema, deberías contactar al administrador del sistema o al equipo de soporte técnico. El sistema de "Problemas y Inconvenientes" es para reportar problemas con motocicletas y entregas, no para errores del software.

P: ¿Puedo personalizar la interfaz?
R: Actualmente el sistema no tiene opciones de personalización de interfaz. La apariencia es estándar para todos los usuarios.

P: ¿Hay límite en la cantidad de elementos que puedo crear?
R: Los límites dependen de la configuración del backend y la capacidad de la base de datos. En general, puedes crear tantos elementos como necesites para operar el negocio.

P: ¿Cómo busco un elemento específico en una tabla?
R: Muchas tablas tienen funciones de búsqueda y filtro. Usa la barra de búsqueda si está disponible, o desplázate por la tabla para encontrar el elemento que buscas.

P: ¿Puedo ordenar las columnas de las tablas?
R: Depende de la implementación específica de cada tabla. Algunas tablas permiten ordenar haciendo clic en los encabezados de las columnas.

P: ¿Qué navegadores son compatibles?
R: El sistema funciona en navegadores modernos como Chrome, Firefox, Safari y Edge. Se recomienda usar la versión más reciente de tu navegador para la mejor experiencia.

P: ¿Puedo imprimir los reportes o gráficos?
R: Puedes usar la función de impresión de tu navegador (Ctrl+P o Cmd+P) para imprimir cualquier página, incluyendo los gráficos y reportes.

P: ¿Hay una aplicación móvil?
R: El sistema es una aplicación web responsiva que funciona en navegadores móviles. No hay una aplicación móvil nativa separada, pero puedes acceder al sistema desde cualquier dispositivo con navegador web.

P: ¿Cómo actualizo mi foto de perfil?
R: Si iniciaste sesión con OAuth (Google, Microsoft, GitHub), tu foto de perfil viene de esa plataforma y se actualiza automáticamente cuando cambias tu foto allí. Si usas email y contraseña, la funcionalidad de foto de perfil depende de la configuración de Firebase.

P: ¿Puedo tener múltiples roles o permisos?
R: El sistema de roles y permisos depende de la implementación del backend. Generalmente hay roles como administrador, usuario regular, etc., pero los permisos específicos varían según la configuración.

P: ¿Cómo exporto los datos a Excel o CSV?
R: Actualmente el sistema no tiene funcionalidad de exportación directa. Puedes copiar los datos de las tablas manualmente o contactar al administrador para exportaciones masivas.

P: ¿Los gráficos son interactivos?
R: Los gráficos muestran información visual, pero la interactividad (como hacer clic para ver detalles) depende de la implementación específica de Chart.js y ng2-charts.

P: ¿Puedo configurar notificaciones personalizadas?
R: Las notificaciones aparecen automáticamente para eventos importantes como nuevos pedidos asignados. La personalización avanzada de notificaciones no está disponible actualmente.

P: ¿Cómo sé qué versión del sistema estoy usando?
R: La información de versión generalmente se muestra en el pie de página o en la configuración, pero depende de la implementación específica.

P: ¿Puedo hacer backup de los datos?
R: Los backups son responsabilidad del administrador del sistema y del backend. Como usuario, no tienes acceso directo a funciones de backup, pero todos los datos se guardan en el backend.

P: ¿Qué hago si olvido en qué sección está algo?
R: Usa el chatbot (yo) para preguntar dónde encontrar cualquier funcionalidad. También puedes revisar el menú principal que está organizado por categorías: Administración, Locales, Conductores y Reportes.

P: ¿Puedo ver un resumen de todas las actividades recientes?
R: El sistema muestra las tablas con los elementos más recientes, pero no hay un panel de actividad centralizado. Puedes revisar cada sección individualmente para ver los elementos recientes.

P: ¿Cómo contacto al soporte?
R: El sistema de soporte depende de la organización que administra el sistema. Puedes usar el chatbot para preguntas sobre cómo usar el sistema, pero para problemas técnicos o de cuenta, contacta al administrador.

P: ¿Puedo compartir mi cuenta con otros usuarios?
R: No se recomienda compartir cuentas por razones de seguridad y trazabilidad. Cada usuario debería tener su propia cuenta para mantener la integridad de los datos y la seguridad.

P: ¿Los datos son privados y seguros?
R: El sistema implementa medidas de seguridad estándar incluyendo autenticación, tokens de acceso, y comunicación segura. Sin embargo, la seguridad específica depende de la configuración del backend y las políticas de la organización.

P: ¿Puedo ver quién hizo cada cambio?
R: La trazabilidad de cambios (auditoría) depende de la implementación del backend. Algunos sistemas registran quién creó o modificó cada elemento, pero esto varía según la configuración.

P: ¿Hay límite de tiempo para las sesiones?
R: Las sesiones pueden expirar después de un período de inactividad por seguridad. Si tu sesión expira, simplemente inicia sesión nuevamente.

P: ¿Puedo trabajar con el sistema en múltiples pestañas?
R: Sí, puedes abrir múltiples pestañas, pero ten cuidado de no hacer cambios conflictivos simultáneamente. Se recomienda refrescar las pestañas si haces cambios importantes.

P: ¿Cómo actualizo el sistema?
R: Las actualizaciones del sistema las realiza el administrador. Como usuario, simplemente recarga la página para obtener la última versión si hay actualizaciones disponibles.

P: ¿Puedo personalizar los campos de los formularios?
R: No, los campos de los formularios están predefinidos según los requisitos del sistema. No hay opción de personalización de campos.

P: ¿Qué hago si veo un error en pantalla?
R: Anota el mensaje de error exacto y la acción que estabas realizando. Intenta la acción nuevamente. Si el error persiste, contacta al soporte técnico con esta información.

P: ¿Los datos se sincronizan en tiempo real entre usuarios?
R: Los datos se actualizan cuando recargas la página o realizas una acción. Para ver los cambios más recientes de otros usuarios, recarga la página o navega fuera y vuelve a entrar a la sección.

P: ¿Puedo deshacer una acción?
R: No hay función de deshacer. Si eliminas algo por error, deberás recrearlo. Si editas algo incorrectamente, puedes editarlo nuevamente para corregirlo.

P: ¿Cómo sé si hay actualizaciones del sistema?
R: Las actualizaciones generalmente se anuncian por el administrador. Si notas nuevas funcionalidades o cambios, es probable que haya habido una actualización.

P: ¿Puedo usar atajos de teclado?
R: El sistema usa atajos estándar del navegador (como Ctrl+S para guardar en algunos contextos), pero no hay atajos personalizados específicos del sistema.

P: ¿Qué hago si el mapa no carga?
R: Verifica tu conexión a internet, asegúrate de que el backend esté corriendo, y verifica que haya motocicletas con turnos activos. También intenta recargar la página.

P: ¿Puedo ver estadísticas históricas?
R: Los gráficos muestran datos históricos según lo configurado. Para datos históricos específicos, puedes revisar las tablas y filtrar por fechas si esa funcionalidad está disponible.

P: ¿Cómo reporto una sugerencia de mejora?
R: Las sugerencias de mejora deben dirigirse al administrador del sistema o al equipo de desarrollo. El chatbot puede ayudarte a usar el sistema, pero no procesa sugerencias de nuevas funcionalidades.

P: ¿Puedo integrar el sistema con otros sistemas?
R: La integración con otros sistemas depende de las APIs disponibles en el backend y requiere configuración técnica. Contacta al administrador para más información sobre integraciones.

P: ¿Los datos se respaldan automáticamente?
R: Los respaldos automáticos son responsabilidad del administrador del sistema. Como usuario, asegúrate de guardar tus cambios haciendo clic en "Crear" o "Actualizar".

P: ¿Puedo ver un log de todas mis acciones?
R: El sistema no muestra un log de acciones del usuario en la interfaz. La auditoría de acciones depende de la implementación del backend.

P: ¿Qué hago si no puedo iniciar sesión?
R: Verifica que estés usando las credenciales correctas. Si usas OAuth, asegúrate de que la cuenta esté activa. Si el problema persiste, contacta al soporte técnico.

P: ¿Puedo cambiar el idioma de la interfaz?
R: Actualmente el sistema está en español. El cambio de idioma no está disponible, pero depende de futuras actualizaciones.

P: ¿Cómo optimizo el uso del sistema?
R: Organiza tus datos desde el principio: crea primero los elementos base (restaurantes, productos, conductores, motocicletas), usa nombres descriptivos, mantén los estados actualizados, y revisa regularmente los gráficos para tomar decisiones informadas.

P: ¿Puedo ver ayuda contextual en cada pantalla?
R: El chatbot está disponible en todo momento para proporcionar ayuda contextual. También puedes revisar los mensajes de validación en los formularios que te guían sobre qué información se necesita.

P: ¿Qué hago si un formulario no se envía?
R: Verifica que todos los campos obligatorios estén completos y correctos. Revisa los mensajes de error debajo de cada campo. Asegúrate de tener conexión a internet y que el backend esté disponible.

P: ¿Puedo copiar información de un elemento a otro?
R: No hay función de copiar, pero puedes usar la información de un elemento como referencia al crear uno nuevo. Por ejemplo, al crear un nuevo menú similar, puedes ver un menú existente y usar esa información.

P: ¿Cómo sé si mis cambios se guardaron correctamente?
R: Después de hacer clic en "Crear" o "Actualizar", deberías ver un mensaje de confirmación y el elemento debería aparecer o actualizarse en la tabla. Si hay un error, verás un mensaje de error específico.

P: ¿Puedo ver una vista previa antes de guardar?
R: Los formularios muestran la información que estás ingresando en tiempo real. Antes de guardar, revisa todos los campos para asegurarte de que estén correctos.

P: ¿Qué hago si veo datos incorrectos?
R: Si ves datos incorrectos, puedes editarlos directamente desde la tabla correspondiente. Si los datos parecen corruptos o hay un problema sistemático, contacta al soporte técnico.

P: ¿Puedo marcar elementos como favoritos o importantes?
R: El sistema no tiene funcionalidad de favoritos o marcadores. Puedes usar la búsqueda y filtros para encontrar elementos importantes rápidamente.

P: ¿Cómo organizo mejor mis datos?
R: Usa nombres descriptivos y consistentes, agrupa elementos relacionados (por ejemplo, menús del mismo restaurante), mantén los estados actualizados, y elimina elementos que ya no uses para mantener el sistema organizado.

P: ¿Puedo ver cuánto tiempo lleva un pedido en cada estado?
R: El sistema muestra el estado actual del pedido, pero el tiempo en cada estado depende de la implementación del backend. Puedes revisar las fechas de creación y actualización para tener una idea.

P: ¿Qué hago si necesito ayuda urgente?
R: Usa el chatbot para preguntas rápidas. Para problemas urgentes que afecten operaciones, contacta inmediatamente al administrador del sistema o al soporte técnico.

P: ¿Puedo ver estadísticas de rendimiento?
R: Los gráficos en la sección "Reportes" muestran estadísticas de rendimiento incluyendo pedidos, ingresos, conductores activos, y motocicletas en uso. Revisa esos gráficos para análisis de rendimiento.

P: ¿Cómo mejoro la eficiencia de las entregas?
R: Asegúrate de tener turnos activos para los conductores, asigna motocicletas a pedidos rápidamente, mantén las direcciones actualizadas, usa el mapa para optimizar rutas, y revisa regularmente los reportes para identificar áreas de mejora.

P: ¿Puedo programar tareas automáticas?
R: El sistema no tiene funcionalidad de programación automática de tareas. Las acciones deben realizarse manualmente a través de la interfaz.

P: ¿Qué información se registra cuando creo un problema?
R: Se registra la descripción del problema, el tipo (si se especifica), la fecha del reporte, la motocicleta asociada (si aplica), el pedido asociado (si aplica), y el estado del problema.

P: ¿Puedo ver todos los problemas no resueltos?
R: En "Problemas y Inconvenientes" puedes filtrar por estado para ver solo los problemas pendientes o en proceso. Esto te ayuda a identificar qué problemas necesitan atención.

P: ¿Cómo priorizo los pedidos?
R: Puedes usar el estado de los pedidos para priorizarlos. Los pedidos "Pendientes" necesitan atención inmediata. Los "En Progreso" están siendo procesados. Puedes asignar motocicletas primero a pedidos más urgentes.

P: ¿Puedo ver un resumen diario de actividades?
R: Los gráficos muestran resúmenes de actividades, pero no hay un resumen diario automático. Puedes revisar los gráficos de series temporales para ver la evolución diaria.

P: ¿Qué hago si una motocicleta se descompone durante un turno?
R: Inmediatamente reporta el problema en "Problemas y Inconvenientes", asocia la motocicleta, cambia el estado de la motocicleta a "Mantenimiento", finaliza el turno actual, y reasigna los pedidos pendientes a otra motocicleta si es necesario.

P: ¿Puedo ver cuántos pedidos puede manejar un conductor?
R: No hay un límite automático, pero puedes revisar los turnos y pedidos asignados para ver la carga de trabajo de cada conductor. Los gráficos también pueden mostrar estadísticas de conductores activos.

P: ¿Cómo gestiono picos de demanda?
R: Asegúrate de tener múltiples turnos activos, múltiples motocicletas disponibles, y conductores suficientes. Usa los gráficos para identificar patrones de demanda y planificar recursos.

P: ¿Puedo ver el historial de cambios de un elemento?
R: El historial detallado de cambios depende de la implementación del backend. Generalmente puedes ver la información actual, pero el historial completo de modificaciones puede no estar disponible en la interfaz.

P: ¿Qué hago si creo un elemento por error?
R: Puedes eliminarlo inmediatamente si no tiene dependencias. Si tiene dependencias, primero elimina o modifica los elementos relacionados, y luego elimina el elemento.

P: ¿Puedo duplicar un elemento existente?
R: No hay función de duplicar, pero puedes usar la información de un elemento como plantilla al crear uno nuevo. Por ejemplo, al crear un menú similar, puedes ver un menú existente y crear uno nuevo con información similar.

P: ¿Cómo sé qué campos son obligatorios?
R: Los campos obligatorios generalmente están marcados con un asterisco (*) o tienen un indicador visual. También verás mensajes de error si intentas guardar sin completar campos obligatorios.

P: ¿Puedo guardar un borrador de un formulario?
R: No hay funcionalidad de borradores. Debes completar y guardar el formulario, o los datos se perderán si cierras sin guardar.

P: ¿Qué hago si el sistema va lento?
R: Verifica tu conexión a internet, cierra pestañas innecesarias, recarga la página, y si el problema persiste, contacta al soporte técnico ya que puede ser un problema del servidor.

P: ¿Puedo ver notificaciones de eventos importantes?
R: El sistema muestra notificaciones automáticamente para eventos importantes como nuevos pedidos asignados. Las notificaciones aparecen en la interfaz y pueden incluir alertas sonoras.

P: ¿Cómo reporto un problema de seguridad?
R: Los problemas de seguridad deben reportarse inmediatamente al administrador del sistema o al equipo de seguridad. No uses el sistema de "Problemas y Inconvenientes" para reportar problemas de seguridad del software.

P: ¿Puedo ver métricas de satisfacción del cliente?
R: El sistema no tiene funcionalidad de métricas de satisfacción integrada. Esas métricas dependerían de sistemas externos o implementaciones personalizadas.

P: ¿Cómo optimizo las rutas de entrega?
R: Usa el mapa en tiempo real para ver la ubicación de las motocicletas, asigna pedidos a motocicletas cercanas a las direcciones de entrega, y revisa los gráficos para identificar patrones geográficos.

P: ¿Puedo ver un calendario de turnos?
R: Los turnos se muestran en una tabla en "Jornadas de Trabajo". Puedes ver las fechas y horas de inicio y fin de cada turno. No hay vista de calendario visual, pero la información está disponible en la tabla.

P: ¿Qué hago si necesito ayuda con una funcionalidad específica?
R: Pregúntame a mí, el chatbot. Puedo explicarte cómo usar cualquier funcionalidad del sistema, dónde encontrar cada cosa, y resolver tus dudas paso a paso.

P: ¿Puedo personalizar los reportes?
R: Los reportes y gráficos están predefinidos. No hay opción de personalización avanzada, pero puedes ver diferentes tipos de gráficos en la sección de Reportes.

P: ¿Cómo mantengo el sistema actualizado?
R: Como usuario, simplemente recarga la página periódicamente para obtener actualizaciones. Las actualizaciones del sistema las realiza el administrador.

P: ¿Puedo ver estadísticas comparativas?
R: Los gráficos muestran diferentes métricas que puedes comparar visualmente. Por ejemplo, puedes comparar pedidos por restaurante, ingresos mensuales, o distribución de estados.

P: ¿Qué hago si un pedido se pierde o no se entrega?
R: Actualiza el estado del pedido a "Cancelado" si es necesario, reporta el problema en "Problemas y Inconvenientes" si hay un problema con la motocicleta o conductor, y documenta la situación con fotos si es relevante.

P: ¿Puedo ver el tiempo promedio de entrega?
R: El sistema muestra estados y fechas, pero el cálculo de tiempo promedio de entrega dependería de análisis de los datos. Puedes revisar los gráficos de series temporales para ver patrones de tiempo.

P: ¿Cómo gestiono inventario de productos?
R: El sistema gestiona productos y menús, pero la gestión detallada de inventario (cantidades, stock, etc.) no está implementada. Los productos representan lo que está disponible, pero no hay control de stock.

P: ¿Puedo ver qué conductores son más eficientes?
R: Puedes revisar los turnos y pedidos asignados para ver la actividad de cada conductor. Los gráficos también pueden mostrar estadísticas de conductores activos, pero métricas específicas de eficiencia dependerían de análisis adicionales.

P: ¿Qué hago si necesito restaurar datos eliminados?
R: Los datos eliminados generalmente no se pueden restaurar desde la interfaz. Si necesitas restaurar datos, contacta al administrador del sistema o al soporte técnico, ya que pueden tener backups.

P: ¿Puedo ver un dashboard personalizado?
R: El sistema tiene una sección de Gráficos que actúa como dashboard con múltiples métricas. No hay opción de personalizar el dashboard, pero muestra información clave del sistema.

P: ¿Cómo reporto un bug o error del sistema?
R: Anota el error exacto, la acción que estabas realizando, y cualquier mensaje de error. Contacta al soporte técnico con esta información. No uses "Problemas y Inconvenientes" para reportar bugs del software.

P: ¿Puedo integrar con sistemas de pago?
R: La integración con sistemas de pago depende de la implementación del backend y requiere configuración técnica. Contacta al administrador para más información sobre integraciones de pago.

P: ¿Qué hago si no encuentro una funcionalidad?
R: Pregúntame a mí, el chatbot. Puedo decirte exactamente dónde está cada funcionalidad y cómo usarla. También puedes revisar el menú principal que está organizado por categorías.

P: ¿Puedo ver estadísticas de cancelaciones?
R: Puedes ver pedidos cancelados en "Pedidos y Órdenes" filtrando por estado "Cancelado". Los gráficos también pueden mostrar distribución de estados incluyendo cancelados.

P: ¿Cómo gestiono devoluciones?
R: El sistema no tiene funcionalidad específica de devoluciones. Podrías marcar un pedido como "Cancelado" o crear un nuevo pedido inverso, dependiendo de cómo quieras manejar la situación.

P: ¿Puedo ver el costo de operación?
R: El sistema muestra ingresos en los gráficos, pero el cálculo de costos de operación dependería de información adicional no capturada en el sistema. Los gráficos muestran ingresos mensuales que puedes usar como referencia.

P: ¿Qué hago si necesito ayuda fuera del horario de soporte?
R: Puedes usar el chatbot (yo) en cualquier momento para preguntas sobre cómo usar el sistema. Para problemas técnicos urgentes, contacta al administrador según los canales de emergencia establecidos.

P: ¿Puedo ver métricas de calidad del servicio?
R: El sistema muestra estados de pedidos y problemas reportados, que pueden usarse como indicadores de calidad. Los gráficos también muestran distribución de estados que pueden indicar calidad del servicio.

P: ¿Cómo optimizo los tiempos de respuesta?
R: Asegúrate de tener turnos activos, asigna pedidos rápidamente, mantén motocicletas disponibles, usa el mapa para optimizar rutas, y revisa regularmente los reportes para identificar cuellos de botella.

P: ¿Puedo ver un resumen ejecutivo?
R: Los gráficos en "Reportes" proporcionan un resumen visual del estado del sistema. Puedes revisar esos gráficos para obtener una vista general rápida de las métricas clave.

P: ¿Qué hago si tengo una pregunta que no está en esta lista?
R: Pregúntame a mí, el chatbot. Puedo ayudarte con cualquier pregunta sobre el sistema, explicarte cómo usar cualquier funcionalidad, y guiarte paso a paso en cualquier tarea.

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

  private generateIntelligentResponse(intent: { category: string; keywords: string[] }, message: string): string {
    const responses: { [key: string]: string } = {
      'crear pedido': 'Para crear un pedido en el sistema, sigue estos pasos. Primero, ve al menú principal y selecciona Administración, luego haz clic en Pedidos y Órdenes. En la parte superior verás un botón que dice Nueva Orden, haz clic ahí. Se abrirá un formulario donde debes completar varios campos. Selecciona el cliente que realizará el pedido del menú desplegable, luego elige un menú disponible de la lista. Los menús muestran su nombre, precio y restaurante. Después ingresa la cantidad de unidades que se solicitarán. El sistema calculará automáticamente el precio total multiplicando el precio del menú por la cantidad. Opcionalmente puedes asignar una motocicleta, pero solo aparecerán las motocicletas que tienen turnos activos asignados a conductores. Finalmente selecciona el estado del pedido, que puede ser Pendiente, En Progreso, Entregado o Cancelado. Una vez completado todo, haz clic en el botón Crear y el pedido se guardará en el sistema.',
      'ver pedidos': 'Los pedidos se encuentran en el menú Administración, específicamente en la opción Pedidos y Órdenes. Ahí verás una tabla completa con todos los pedidos registrados, mostrando información detallada como el ID, cliente, producto o menú, cantidad, estado, precio total y motocicleta asignada. Desde esa misma página puedes realizar todas las operaciones sobre pedidos.',
      'crear menú': 'Para crear un menú nuevo, ve al menú Locales y selecciona Menús. Haz clic en el botón Nuevo Menú. Completa el formulario ingresando un nombre descriptivo para el menú, selecciona el restaurante que lo ofrecerá, elige uno o más productos que formarán parte del menú, establece el precio y marca si está disponible. Si seleccionas múltiples productos, se crearán varios menús con el mismo nombre. Haz clic en Crear para guardar.',
      'crear turno': 'Para crear un turno o jornada de trabajo, ve al menú Conductores y selecciona Jornadas de Trabajo. Haz clic en Nuevo Turno. Completa el formulario seleccionando un conductor disponible, una motocicleta que no esté en mantenimiento, establece la fecha y hora de inicio, opcionalmente la fecha y hora de fin, y selecciona el estado como activo. Cuando guardes un turno activo, la motocicleta cambiará automáticamente a estado en_uso y podrá ser asignada a pedidos.',
      'qué es un turno': 'Un turno, también llamado jornada de trabajo, es una funcionalidad esencial del sistema que asocia un conductor con una motocicleta durante un período de tiempo específico. Los turnos son importantes porque solo las motocicletas con turnos activos pueden recibir pedidos. Cuando creas un turno con estado activo, el sistema automáticamente cambia el estado de la motocicleta a en_uso, asegurando que solo las motocicletas en uso puedan ser asignadas. Los turnos se gestionan en el menú Conductores, opción Jornadas de Trabajo.',
      'problema con motocicletas': 'Si no puedes asignar una motocicleta a un pedido o no aparecen motocicletas disponibles, es porque solo se pueden asignar motocicletas que tienen turnos activos. Para solucionarlo, primero crea un turno en el menú Conductores, opción Jornadas de Trabajo. Selecciona un conductor disponible y una motocicleta que no esté en mantenimiento, establece el estado como activo. Una vez creado el turno activo, la motocicleta estará disponible para asignar a pedidos.',
      'información sobre pedidos': 'Los pedidos son el corazón del sistema. Se gestionan en el menú Administración, opción Pedidos y Órdenes. Desde ahí puedes crear nuevos pedidos, ver todos los pedidos existentes, editar pedidos, eliminar pedidos y asignar motocicletas a pedidos pendientes. Cada pedido contiene información del cliente, el menú solicitado, la cantidad, el precio total calculado automáticamente, el estado y la motocicleta asignada si tiene una.',
      'información sobre menús': 'Los menús conectan productos con restaurantes y tienen su propio precio. Se gestionan en el menú Locales, opción Menús. Los menús permiten que diferentes restaurantes ofrezcan los mismos productos con precios diferentes. Al crear un pedido, seleccionas un menú, no un producto directamente. Los menús pueden estar disponibles o no disponibles para pedidos.',
      'información sobre turnos': 'Los turnos o jornadas de trabajo asocian conductores con motocicletas. Se gestionan en el menú Conductores, opción Jornadas de Trabajo. Los turnos activos permiten que las motocicletas sean asignadas a pedidos. Cuando un turno está activo, la motocicleta cambia automáticamente a estado en_uso.',
      'información sobre conductores': 'Los conductores son los repartidores que realizan las entregas. Se gestionan en el menú Conductores, opción Conductores. Desde ahí puedes crear nuevos conductores, editar información de conductores existentes, ver su estado y eliminar conductores. Los conductores pueden tener estados como disponible, ocupado o inactivo.',
      'información sobre motocicletas': 'Las motocicletas son los vehículos utilizados para las entregas. Se gestionan en el menú Conductores, opción Vehículos y Motocicletas. Cada motocicleta tiene información como placa, marca, modelo, año, color y estado. Los estados pueden ser disponible, en_uso o mantenimiento. Solo las motocicletas con turnos activos pueden ser asignadas a pedidos.',
      'crear motocicleta': 'Para crear una motocicleta, ve al menú Conductores y selecciona Vehículos y Motocicletas. Haz clic en el botón para crear nueva motocicleta. Completa el formulario con la placa (formato alfanumérico como ABC123), marca, año (entre 1900 y el año actual), modelo opcional, color opcional y estado (disponible por defecto). La placa debe ser única y seguir el patrón de letras y números.',
      'ver motocicletas': 'Las motocicletas se encuentran en el menú Conductores, opción Vehículos y Motocicletas. Ahí verás una tabla con todas las motocicletas mostrando placa, marca, modelo, año, color y estado. Desde ahí puedes crear, editar y eliminar motocicletas.',
      'crear conductor': 'Para crear un conductor, ve al menú Conductores y selecciona Conductores. Haz clic en el botón para crear nuevo conductor. Completa el formulario con nombre (mínimo 2 caracteres), email válido, teléfono (mínimo 10 dígitos numéricos), número de licencia (mínimo 5 caracteres) y estado (disponible por defecto). Todos los campos son obligatorios excepto algunos opcionales.',
      'ver conductores': 'Los conductores se encuentran en el menú Conductores, opción Conductores. Ahí verás una tabla con todos los conductores mostrando nombre, email, teléfono, licencia y estado. Desde ahí puedes crear, editar y eliminar conductores.',
      'crear producto': 'Para crear un producto, ve al menú Locales y selecciona Productos. Haz clic en el botón para crear nuevo producto. Completa el formulario con nombre (mínimo 3 caracteres, obligatorio), descripción opcional, precio (número mayor o igual a 0, obligatorio) y categoría opcional. Los productos son los elementos base que luego se asocian a menús.',
      'ver productos': 'Los productos se encuentran en el menú Locales, opción Productos. Ahí verás una tabla con todos los productos mostrando nombre, descripción, precio y categoría. Desde ahí puedes crear, editar y eliminar productos.',
      'crear restaurante': 'Para crear un restaurante, ve al menú Locales y selecciona Comercios y Restaurantes. Haz clic en el botón para crear nuevo restaurante. Completa el formulario con nombre (mínimo 3 caracteres, obligatorio), dirección (obligatorio), teléfono (obligatorio, puede contener números, guiones, espacios), email opcional y descripción opcional.',
      'ver restaurantes': 'Los restaurantes se encuentran en el menú Locales, opción Comercios y Restaurantes. Ahí verás una tabla con todos los restaurantes mostrando nombre, dirección, teléfono, email y descripción. Desde ahí puedes crear, editar y eliminar restaurantes.',
      'crear dirección': 'Para crear una dirección, ve al menú Administración y selecciona Ubicaciones de Entrega. Haz clic en el botón Nueva Dirección. Completa el formulario con calle (mínimo 3 caracteres), ciudad, estado, código postal, información adicional opcional, y selecciona el pedido al que pertenece. También puedes asociar una motocicleta opcionalmente.',
      'ver mapa': 'Para ver el mapa en tiempo real, ve al menú Administración y selecciona Ubicaciones de Entrega. Desde ahí puedes ver las direcciones y acceder al mapa interactivo que muestra la ubicación de las motocicletas en tiempo real usando Google Maps. El mapa se actualiza automáticamente cuando hay cambios de ubicación.',
      'crear problema': 'Para reportar un problema o inconveniente, ve al menú Conductores y selecciona Problemas y Inconvenientes. Haz clic en el botón para crear nuevo problema. Completa el formulario seleccionando la motocicleta afectada, el tipo de problema (accidente, falla mecánica, pinchazo, etc.), una descripción detallada (mínimo 10 caracteres), la fecha del reporte y el estado. Luego puedes subir fotos de evidencia en la sección Evidencias.',
      'subir foto': 'Para subir una foto de evidencia, ve al menú Conductores y selecciona Evidencias. Haz clic en el botón para subir nueva foto. Completa el formulario con el ID del inconveniente al que pertenece, una descripción, la fecha en que fue tomada y selecciona el archivo de imagen. Las fotos sirven como evidencia de problemas reportados.',
      'crear usuario': 'Para crear un nuevo usuario, ve al menú Administración y selecciona Usuarios. Haz clic en el botón para crear nuevo usuario. Completa el formulario con nombre (obligatorio), email válido y único (obligatorio), y teléfono opcional. El email no se puede modificar después de crear el usuario.',
      'editar perfil': 'Para editar tu propio perfil, haz clic en tu foto de perfil en la esquina superior derecha del menú y selecciona Perfil. Desde ahí puedes editar tu nombre y teléfono. El email no se puede modificar. También puedes editar cualquier usuario desde la sección Usuarios haciendo clic en el botón de editar.',
      'ver turnos': 'Los turnos se encuentran en el menú Conductores, opción Jornadas de Trabajo. Ahí verás una tabla con todos los turnos mostrando conductor, motocicleta, fecha y hora de inicio, fecha y hora de fin, y estado. Desde ahí puedes crear, editar y eliminar turnos.',
      'editar menú': 'Para editar un menú, ve al menú Locales y selecciona Menús. En la tabla, encuentra el menú que quieres editar y haz clic en el botón de editar (ícono de lápiz). Modifica los campos necesarios como nombre, restaurante, producto, precio o disponibilidad, luego haz clic en Actualizar.',
      'asignar pedido': 'Para asignar una motocicleta a un pedido, primero asegúrate de que exista un turno activo con esa motocicleta. Luego ve a Pedidos y Órdenes, edita el pedido y selecciona la motocicleta del menú desplegable. Solo aparecerán las motocicletas con turnos activos.',
      'información sobre problemas': 'Los problemas o inconvenientes se gestionan en el menú Conductores, opción Problemas y Inconvenientes. Se usan para reportar problemas con motocicletas como accidentes, fallas mecánicas, pinchazos, etc. Cada problema puede tener fotos de evidencia asociadas. Los problemas tienen estados como abierto, cerrado o en proceso.',
      'información sobre fotos': 'Las fotos o evidencias se gestionan en el menú Conductores, opción Evidencias. Se usan para subir fotografías que sirven como evidencia de problemas reportados. Cada foto debe estar asociada a un inconveniente específico mediante su ID. Las fotos incluyen descripción, fecha en que fueron tomadas y el archivo de imagen.',
      'información sobre usuarios': 'Los usuarios o clientes se gestionan en el menú Administración, opción Usuarios. Los usuarios pueden realizar pedidos. Cada usuario tiene nombre, email único y teléfono opcional. Puedes crear nuevos usuarios, editar cualquier usuario (excepto el email) y eliminar usuarios. También puedes editar tu propio perfil desde el menú de usuario.',
      'ayuda general': 'Puedo ayudarte con todo lo relacionado al sistema de gestión de entregas. Puedo explicarte cómo crear, editar, eliminar y gestionar pedidos, menús, turnos, conductores, motocicletas, direcciones, restaurantes, productos, usuarios, problemas e inconvenientes, fotos y evidencias. También puedo ayudarte a entender cómo funciona cada módulo, resolver problemas comunes, explicar validaciones, estados, relaciones entre entidades y flujos de trabajo completos. ¿Sobre qué te gustaría saber más específicamente?',
      'información general': 'Este es un sistema completo de gestión de entregas rápidas desarrollado en Angular. Permite gestionar restaurantes, productos, menús, pedidos, conductores, motocicletas, turnos, direcciones, problemas, fotos, usuarios y más. El sistema tiene diferentes módulos organizados en menús: Administración para pedidos, direcciones y usuarios, Locales para restaurantes, productos y menús, Conductores para gestión de repartidores, vehículos, turnos, problemas y evidencias, y Reportes para estadísticas y gráficos. Incluye autenticación OAuth, mapas en tiempo real, notificaciones y un chatbot inteligente. ¿Sobre qué módulo o funcionalidad específica te gustaría saber más?',
      'estado pedido': 'Los pedidos pueden tener diferentes estados. Pendiente significa que el pedido está esperando ser procesado. En Progreso indica que el pedido está siendo preparado o está en camino. Entregado significa que el pedido fue entregado exitosamente al cliente. Cancelado indica que el pedido fue cancelado y no se procesará. Puedes cambiar el estado de un pedido editándolo desde la sección Pedidos y Órdenes. El estado es importante para rastrear el progreso de cada pedido en el sistema.',
      'eliminar pedido': 'Para eliminar un pedido, ve al menú Administración y selecciona Pedidos y Órdenes. En la tabla, encuentra el pedido que quieres eliminar y haz clic en el botón de eliminar que tiene un ícono de basura en la columna Acciones. El sistema te pedirá confirmación antes de eliminar. Ten en cuenta que si el pedido tiene una dirección asociada, también deberás eliminar o modificar esa dirección. Una vez eliminado, el pedido no se podrá recuperar.',
      'ver menús': 'Los menús se encuentran en el menú Locales, opción Menús. Ahí verás una tabla completa con todos los menús registrados en el sistema. La tabla muestra el nombre del menú, el restaurante al que pertenece, el producto asociado, el precio, si está disponible o no, y botones para editar o eliminar. Si un menú no tiene nombre, se mostrará el nombre del producto como respaldo. Los menús disponibles aparecerán como opciones al crear pedidos, mientras que los no disponibles estarán deshabilitados.',
      'eliminar menú': 'Para eliminar un menú, ve al menú Locales y selecciona Menús. En la tabla, encuentra el menú que quieres eliminar y haz clic en el botón de eliminar que tiene un ícono de basura en la columna Acciones. El sistema te pedirá confirmación. Ten cuidado porque si el menú tiene pedidos asociados, puede haber restricciones o advertencias. Una vez eliminado, el menú no aparecerá más en las opciones al crear pedidos.',
      'editar turno': 'Para editar un turno, ve al menú Conductores y selecciona Jornadas de Trabajo. En la tabla, encuentra el turno que quieres editar y haz clic en el botón de editar. Puedes modificar el conductor, la motocicleta, las fechas y horas de inicio y fin, y el estado. Si cambias el estado a activo, la motocicleta cambiará automáticamente a en_uso. Si cambias el estado a completado o cancelado, la motocicleta volverá a estar disponible.',
      'eliminar turno': 'Para eliminar un turno, ve al menú Conductores y selecciona Jornadas de Trabajo. En la tabla, encuentra el turno que quieres eliminar y haz clic en el botón de eliminar. Si el turno estaba activo, la motocicleta volverá a estar disponible después de eliminar el turno. Ten cuidado al eliminar turnos activos porque esto puede afectar los pedidos que tienen asignada esa motocicleta.',
      'editar conductor': 'Para editar un conductor, ve al menú Conductores y selecciona Conductores. En la tabla, encuentra el conductor que quieres editar y haz clic en el botón de editar. Puedes modificar el nombre, teléfono, email, número de licencia y estado. Todos los campos son editables excepto algunos que pueden tener restricciones. Una vez que hagas los cambios, haz clic en Actualizar para guardar.',
      'eliminar conductor': 'Para eliminar un conductor, ve al menú Conductores y selecciona Conductores. En la tabla, encuentra el conductor que quieres eliminar y haz clic en el botón de eliminar. Ten cuidado porque si el conductor tiene turnos activos o pedidos asignados, puede haber restricciones. El sistema te advertirá si hay dependencias antes de permitir la eliminación.',
      'editar motocicleta': 'Para editar una motocicleta, ve al menú Conductores y selecciona Vehículos y Motocicletas. En la tabla, encuentra la motocicleta que quieres editar y haz clic en el botón de editar. Puedes modificar la marca, modelo, año, color y estado. La placa generalmente no se puede modificar porque es el identificador único. Si cambias el estado a mantenimiento, la motocicleta no aparecerá en las opciones al crear turnos.',
      'eliminar motocicleta': 'Para eliminar una motocicleta, ve al menú Conductores y selecciona Vehículos y Motocicletas. En la tabla, encuentra la motocicleta que quieres eliminar y haz clic en el botón de eliminar. Ten cuidado porque si la motocicleta tiene turnos activos o pedidos asignados, puede haber restricciones. El sistema te advertirá antes de permitir la eliminación.',
      'editar producto': 'Para editar un producto, ve al menú Locales y selecciona Productos. En la tabla, encuentra el producto que quieres editar y haz clic en el botón de editar. Puedes modificar el nombre, descripción, precio y categoría. Ten en cuenta que si cambias el precio de un producto, esto no afectará automáticamente el precio de los menús que usan ese producto, ya que los menús tienen su propio precio.',
      'eliminar producto': 'Para eliminar un producto, ve al menú Locales y selecciona Productos. En la tabla, encuentra el producto que quieres eliminar y haz clic en el botón de eliminar. Ten cuidado porque si el producto está asociado a menús que tienen pedidos, puede haber restricciones. El sistema te advertirá antes de permitir la eliminación.',
      'editar restaurante': 'Para editar un restaurante, ve al menú Locales y selecciona Comercios y Restaurantes. En la tabla, encuentra el restaurante que quieres editar y haz clic en el botón de editar. Puedes modificar el nombre, dirección, teléfono, email y descripción. Todos los campos son editables. Una vez que hagas los cambios, haz clic en Actualizar para guardar.',
      'eliminar restaurante': 'Para eliminar un restaurante, ve al menú Locales y selecciona Comercios y Restaurantes. En la tabla, encuentra el restaurante que quieres eliminar y haz clic en el botón de eliminar. Ten cuidado porque si el restaurante tiene menús asociados que tienen pedidos, puede haber restricciones. El sistema te advertirá antes de permitir la eliminación.',
      'editar dirección': 'Para editar una dirección, ve al menú Administración y selecciona Ubicaciones de Entrega. En la tabla, encuentra la dirección que quieres editar y haz clic en el botón de editar. Puedes modificar la calle, ciudad, estado, código postal, información adicional, el pedido asociado y la motocicleta. Una vez que hagas los cambios, haz clic en Actualizar para guardar.',
      'eliminar dirección': 'Para eliminar una dirección, ve al menú Administración y selecciona Ubicaciones de Entrega. En la tabla, encuentra la dirección que quieres eliminar y haz clic en el botón de eliminar. Ten en cuenta que cada dirección está asociada a un pedido, así que asegúrate de que sea seguro eliminar esa dirección antes de hacerlo.',
      'editar problema': 'Para editar un problema o inconveniente, ve al menú Conductores y selecciona Problemas y Inconvenientes. En la tabla, encuentra el problema que quieres editar y haz clic en el botón de editar. Puedes modificar la descripción, el tipo de problema, la motocicleta asociada, la fecha y el estado. Esto es útil para actualizar el estado de un problema de pendiente a resuelto o agregar más información.',
      'eliminar problema': 'Para eliminar un problema, ve al menú Conductores y selecciona Problemas y Inconvenientes. En la tabla, encuentra el problema que quieres eliminar y haz clic en el botón de eliminar. Ten en cuenta que si el problema tiene fotos de evidencia asociadas, esas fotos también pueden verse afectadas.',
      'eliminar foto': 'Para eliminar una foto de evidencia, ve al menú Conductores y selecciona Evidencias. En la tabla o lista, encuentra la foto que quieres eliminar y haz clic en el botón de eliminar. Las fotos sirven como evidencia de problemas, así que asegúrate de que sea seguro eliminarlas.',
      'ver problemas': 'Los problemas o inconvenientes se encuentran en el menú Conductores, opción Problemas y Inconvenientes. Ahí verás una tabla con todos los problemas reportados, mostrando información como el tipo de problema, descripción, motocicleta afectada, fecha del reporte y estado. Desde ahí puedes crear nuevos reportes, editar problemas existentes y eliminar problemas resueltos.',
      'ver evidencias': 'Las evidencias o fotos se encuentran en el menú Conductores, opción Evidencias. Ahí verás todas las fotos subidas al sistema, mostrando información como la descripción, la fecha en que fue tomada, el inconveniente al que pertenece y la imagen. Desde ahí puedes subir nuevas fotos, ver las existentes y eliminar fotos.',
      'ver direcciones': 'Las direcciones se encuentran en el menú Administración, opción Ubicaciones de Entrega. Ahí verás una tabla con todas las direcciones de entrega registradas, mostrando información como la calle, ciudad, estado, código postal, el pedido asociado y la motocicleta. Desde ahí puedes crear nuevas direcciones, editar direcciones existentes, eliminar direcciones y acceder al mapa en tiempo real.',
      'información sobre direcciones': 'Las direcciones representan los lugares exactos donde se deben entregar los pedidos. Cada dirección está asociada a un único pedido, creando una relación uno a uno. Las direcciones incluyen información detallada como calle, ciudad, estado, código postal e información adicional. También se pueden asociar a motocicletas para el seguimiento. Las direcciones se gestionan en el menú Administración, opción Ubicaciones de Entrega, y desde ahí también puedes acceder al mapa en tiempo real para ver la ubicación de las motocicletas.',
      'información sobre restaurantes': 'Los restaurantes son los negocios que ofrecen productos alimenticios. Se gestionan en el menú Locales, opción Comercios y Restaurantes. Cada restaurante tiene información como nombre, dirección, teléfono, email y descripción. Un restaurante puede tener múltiples menús, y los menús conectan productos específicos con restaurantes. Esto permite que diferentes restaurantes ofrezcan los mismos productos con precios diferentes. Los restaurantes son fundamentales porque los pedidos se hacen sobre menús que pertenecen a restaurantes específicos.',
      'información sobre productos': 'Los productos son los elementos base del sistema, como hamburguesas, pizzas, bebidas, etc. Se gestionan en el menú Locales, opción Productos. Cada producto tiene un nombre, descripción, precio y categoría. Los productos no se venden directamente, sino que se asocian a menús. Un mismo producto puede estar en múltiples menús de diferentes restaurantes, permitiendo flexibilidad en la oferta. Los productos son la base sobre la cual se construyen los menús y finalmente los pedidos.',
      'información sobre autenticación': 'El sistema requiere autenticación para acceder a todas las funcionalidades. Puedes iniciar sesión usando tu cuenta de Google, Microsoft, GitHub o con email y contraseña. Una vez autenticado, el sistema guarda tu token de acceso y lo envía automáticamente en todas las peticiones al backend. Las rutas están protegidas, así que si no estás autenticado, serás redirigido a la página de login. Puedes cerrar sesión desde el menú de usuario en la esquina superior derecha.',
      'información sobre mapa': 'El mapa en tiempo real se encuentra en el menú Administración, opción Ubicaciones de Entrega. Desde ahí puedes ver la ubicación actual de las motocicletas en un mapa interactivo de Google Maps. El mapa se actualiza en tiempo real usando Socket.IO para recibir las coordenadas del backend. Puedes iniciar una simulación de recorrido para ver cómo se mueve una motocicleta en el mapa. El mapa muestra marcadores con la placa de cada motocicleta y se actualiza automáticamente cuando hay cambios de ubicación.',
      'información sobre notificaciones': 'El sistema muestra notificaciones automáticamente cuando se asignan nuevos pedidos a motocicletas. Las notificaciones incluyen alertas visuales y sonoras para captar tu atención. Las notificaciones aparecen en la interfaz y te informan sobre eventos importantes del sistema como nuevos pedidos asignados, cambios de estado, etc.',
      'información sobre validaciones': 'Todos los formularios del sistema tienen validaciones para asegurar la integridad de los datos. Los campos obligatorios están marcados y no se pueden dejar vacíos. Los emails deben tener un formato válido. Los números deben estar en rangos válidos. Las fechas deben ser lógicas. Si intentas guardar un formulario con errores, el sistema te mostrará mensajes de error específicos indicando qué campos necesitan corrección.',
      'información sobre relaciones': 'El sistema tiene relaciones complejas entre entidades. Los clientes realizan pedidos. Los pedidos tienen menús. Los menús conectan productos con restaurantes. Los pedidos tienen direcciones. Los pedidos pueden tener motocicletas asignadas. Los turnos asocian conductores con motocicletas. Los problemas se asocian a motocicletas. Las fotos se asocian a problemas. Estas relaciones aseguran la integridad de los datos y permiten rastrear todo el flujo desde la creación de un pedido hasta su entrega.',
      'información sobre estados': 'Cada entidad en el sistema puede tener diferentes estados. Los pedidos pueden estar pendientes, en progreso, entregados o cancelados. Las motocicletas pueden estar disponibles, en uso o en mantenimiento. Los conductores pueden estar disponibles, ocupados o inactivos. Los turnos pueden estar activos, completados o cancelados. Los menús pueden estar disponibles o no disponibles. Los problemas pueden estar abiertos, en proceso o resueltos. Los estados ayudan a rastrear el progreso y la disponibilidad de cada elemento del sistema.',
      'información sobre flujos': 'El flujo típico de trabajo comienza creando los elementos base como restaurantes, productos, conductores y motocicletas. Luego se crean los menús asociando productos con restaurantes. Se crean turnos para asignar conductores a motocicletas. Se crean pedidos seleccionando clientes, menús y opcionalmente motocicletas con turnos activos. Se crean direcciones asociadas a los pedidos. Se puede rastrear la ubicación en tiempo real en el mapa. Si hay problemas, se reportan y se suben fotos de evidencia. Todo este flujo está integrado y conectado en el sistema.',
      'información sobre errores comunes': 'Algunos errores comunes incluyen no poder asignar motocicletas a pedidos porque no hay turnos activos, no poder crear pedidos porque no hay menús disponibles, no poder crear turnos porque las motocicletas están en mantenimiento, y errores de validación en formularios. La mayoría de estos problemas se resuelven asegurándose de que los elementos base estén creados y en los estados correctos. El sistema muestra mensajes de error claros para ayudarte a identificar y resolver problemas.',
      'información sobre consejos': 'Algunos consejos útiles incluyen crear primero los elementos base antes de crear elementos que dependen de ellos, asegurarse de que los menús estén marcados como disponibles para que aparezcan al crear pedidos, crear turnos activos antes de intentar asignar motocicletas a pedidos, usar nombres descriptivos para facilitar la identificación, y revisar los estados de las entidades antes de realizar operaciones. El sistema está diseñado para guiarte a través de estos procesos con validaciones y mensajes claros.'
    };

    const response = responses[intent.category] || responses['ayuda general'];
    console.log('generateIntelligentResponse - categoria:', intent.category, 'respuesta:', response);
    return response || 'Puedo ayudarte con información sobre el sistema de gestión de entregas. ¿Sobre qué te gustaría saber?';
  }

  private detectIntent(message: string): { category: string; keywords: string[] } {
    const keywords: string[] = [];
    let category = 'información general';

    // Detectar intenciones sobre pedidos
    if (message.match(/\b(pedido|orden|order|pedidos|órdenes|ordenes)\b/)) {
      keywords.push('pedido', 'orden');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir|realizar|generar)\b/)) {
        category = 'crear pedido';
      } else if (message.match(/\b(ver|listar|mostrar|dónde|donde|ubicación|ubicacion|encontrar|buscar)\b/)) {
        category = 'ver pedidos';
      } else if (message.match(/\b(editar|modificar|actualizar|cambiar|actualizar)\b/)) {
        category = 'editar pedido';
      } else if (message.match(/\b(eliminar|borrar|quitar|remover)\b/)) {
        category = 'eliminar pedido';
      } else if (message.match(/\b(asignar|asociar|dar|poner)\b/)) {
        category = 'asignar pedido';
      } else {
        category = 'información sobre pedidos';
      }
    }

    // Detectar intenciones sobre menús
    if (message.match(/\b(menú|menu|menus|menús)\b/)) {
      keywords.push('menú');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir|realizar|generar)\b/)) {
        category = 'crear menú';
      } else if (message.match(/\b(ver|listar|mostrar|dónde|donde|encontrar|buscar)\b/)) {
        category = 'ver menús';
      } else if (message.match(/\b(editar|modificar|actualizar|cambiar)\b/)) {
        category = 'editar menú';
      } else if (message.match(/\b(eliminar|borrar|quitar)\b/)) {
        category = 'eliminar menú';
      } else {
        category = 'información sobre menús';
      }
    }

    // Detectar intenciones sobre turnos
    if (message.match(/\b(turno|jornada)\b/)) {
      keywords.push('turno', 'jornada');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear turno';
      } else if (message.match(/\b(qué|que|que es|para qué|para que)\b/)) {
        category = 'qué es un turno';
      } else {
        category = 'información sobre turnos';
      }
    }

    // Detectar intenciones sobre conductores
    if (message.match(/\b(conductor|repartidor|driver|conductores|repartidores)\b/)) {
      keywords.push('conductor', 'repartidor');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear conductor';
      } else if (message.match(/\b(ver|listar|mostrar|dónde|donde)\b/)) {
        category = 'ver conductores';
      } else {
        category = 'información sobre conductores';
      }
    }

    // Detectar intenciones sobre motocicletas
    if (message.match(/\b(moto|motocicleta|vehículo|vehiculo|moto no|moto disponible)\b/)) {
      keywords.push('motocicleta', 'vehículo');
      if (message.match(/\b(no|disponible|asignar|aparece|aparecen)\b/)) {
        category = 'problema con motocicletas';
      } else {
        category = 'información sobre motocicletas';
      }
    }

    // Detectar intenciones sobre direcciones
    if (message.match(/\b(dirección|direccion|ubicación|ubicacion|direcciones|mapa|gps)\b/)) {
      keywords.push('dirección', 'ubicación', 'mapa');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear dirección';
      } else if (message.match(/\b(ver|mostrar|mapa|gps|seguimiento)\b/)) {
        category = 'ver mapa';
      } else {
        category = 'información sobre direcciones';
      }
    }

    // Detectar intenciones sobre productos
    if (message.match(/\b(producto|productos|artículo|articulo|artículos|articulos)\b/)) {
      keywords.push('producto', 'artículo');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear producto';
      } else if (message.match(/\b(ver|listar|mostrar|dónde|donde)\b/)) {
        category = 'ver productos';
      } else {
        category = 'información sobre productos';
      }
    }

    // Detectar intenciones sobre restaurantes
    if (message.match(/\b(restaurante|restaurantes|comercio|comercios|local|locales)\b/)) {
      keywords.push('restaurante', 'comercio', 'local');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear restaurante';
      } else if (message.match(/\b(ver|listar|mostrar|dónde|donde)\b/)) {
        category = 'ver restaurantes';
      } else {
        category = 'información sobre restaurantes';
      }
    }

    // Detectar intenciones sobre problemas/inconvenientes
    if (message.match(/\b(problema|problemas|inconveniente|inconvenientes|issue|issues|reportar|reporte)\b/)) {
      keywords.push('problema', 'inconveniente');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir|reportar)\b/)) {
        category = 'crear problema';
      } else {
        category = 'información sobre problemas';
      }
    }

    // Detectar intenciones sobre fotos/evidencias
    if (message.match(/\b(foto|fotos|evidencia|evidencias|photo|photos|imagen|imágenes)\b/)) {
      keywords.push('foto', 'evidencia');
      if (message.match(/\b(subir|agregar|añadir|crear|cargar)\b/)) {
        category = 'subir foto';
      } else {
        category = 'información sobre fotos';
      }
    }

    // Detectar intenciones sobre usuarios/clientes
    if (message.match(/\b(usuario|usuarios|cliente|clientes|customer|customers|perfil)\b/)) {
      keywords.push('usuario', 'cliente');
      if (message.match(/\b(crear|hacer|nuevo|agregar|añadir)\b/)) {
        category = 'crear usuario';
      } else if (message.match(/\b(editar|modificar|perfil|mi perfil)\b/)) {
        category = 'editar perfil';
      } else {
        category = 'información sobre usuarios';
      }
    }

    // Detectar intenciones sobre gráficos/reportes
    if (message.match(/\b(gráfico|grafico|gráficos|graficos|reporte|reportes|estadística|estadisticas|estadísticas)\b/)) {
      keywords.push('gráfico', 'reporte', 'estadística');
      category = 'información sobre gráficos';
    }

    // Detectar preguntas de ayuda general
    if (message.match(/\b(ayuda|help|qué puedo|que puedo|cómo funciona|como funciona|qué hago|que hago|necesito ayuda|soporte)\b/)) {
      keywords.push('ayuda');
      category = 'ayuda general';
    }

    // Detectar preguntas sobre cómo hacer algo
    if (message.match(/\b(cómo|como|de qué manera|de que manera|pasos|proceso|procedimiento)\b/)) {
      keywords.push('cómo', 'proceso');
      // Ya se detectó la categoría específica arriba, solo agregar keyword
      if (category === 'información general') {
        category = 'ayuda general';
      }
    }

    // Detectar preguntas sobre dónde encontrar algo
    if (message.match(/\b(dónde|donde|en qué menú|en que menu|ubicación|ubicacion|sección|seccion)\b/)) {
      keywords.push('dónde', 'ubicación');
      if (category === 'información general') {
        category = 'ayuda general';
      }
    }

    // Detectar preguntas sobre por qué algo no funciona
    if (message.match(/\b(por qué|porque|por que|no funciona|no puedo|error|problema|falla)\b/)) {
      keywords.push('problema', 'error');
      if (category === 'información general') {
        category = 'ayuda general';
      }
    }

    return { category, keywords };
  }

  private async refreshBackendData(): Promise<void> {
    return new Promise((resolve) => {
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
            const sample = count > 0 ? data.slice(0, 2) : [];
            return `${r.endpoint}: ${count} registros${count > 0 ? '. Ejemplos: ' + JSON.stringify(sample) : ''}`;
          }).join('\n');

          this.backendData = `Resumen del sistema:\n${summary}\n\nPara más detalles, el sistema tiene acceso a todos los datos completos.`;
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener datos del backend:', error);
          this.backendData = 'No se pudieron cargar los datos del sistema en este momento.';
          resolve();
        }
      });
    });
  }

  async sendMessage(message: string): Promise<string> {
    // Detectar intención antes de cargar datos para optimizar
    const lowerMessage = message.toLowerCase().trim();
    const intent = this.detectIntent(lowerMessage);

    try {
      // Recargar datos del backend antes de cada mensaje para tener información actualizada
      await this.refreshBackendData();

      const prompt = `
Eres un asistente virtual súper inteligente y experto de la plataforma de gestión de entregas rápidas. Eres amigable, profesional y siempre proporcionas respuestas útiles y completas.

PERSONALIDAD:
- Eres proactivo y anticipas las necesidades del usuario
- Explicas los pasos de forma clara y ordenada
- Proporcionas contexto adicional cuando es útil
- Eres conversacional pero profesional
- Adaptas tu respuesta según el nivel de detalle que parece necesitar el usuario

REGLAS DE RESPUESTA:
- Responde SIEMPRE en español natural y conversacional
- Usa texto plano, sin formato Markdown, sin asteriscos, sin guiones, sin comillas
- No uses emojis
- Sé directo, útil y completo
- NUNCA digas "reformula tu pregunta", "no pude entender" o frases similares
- SIEMPRE proporciona una respuesta útil, incluso si la pregunta es ambigua
- Si la pregunta es muy general, proporciona una respuesta general pero útil
- Si la pregunta es específica, proporciona detalles específicos
- Menciona ubicaciones exactas en el menú cuando sea relevante
- Proporciona tips y consejos útiles cuando sea apropiado

DETECCIÓN DE INTENCIÓN:
La pregunta del usuario parece ser sobre: ${intent.category}
Palabras clave detectadas: ${intent.keywords.join(', ')}

EJEMPLOS DE RESPUESTAS INTELIGENTES:

Usuario: "cómo crear un pedido" o "quiero hacer un pedido" o "necesito crear una orden"
Tú: Para crear un pedido en el sistema, sigue estos pasos. Primero, ve al menú principal y selecciona Administración, luego haz clic en Pedidos y Órdenes. En la parte superior verás un botón que dice Nueva Orden, haz clic ahí. Se abrirá un formulario donde debes completar varios campos. Selecciona el cliente que realizará el pedido del menú desplegable, luego elige un menú disponible de la lista. Los menús muestran su nombre, precio y restaurante. Después ingresa la cantidad de unidades que se solicitarán. El sistema calculará automáticamente el precio total multiplicando el precio del menú por la cantidad. Opcionalmente puedes asignar una motocicleta, pero solo aparecerán las motocicletas que tienen turnos activos asignados a conductores. Finalmente selecciona el estado del pedido, que puede ser Pendiente, En Progreso, Entregado o Cancelado. Una vez completado todo, haz clic en el botón Crear y el pedido se guardará en el sistema.

Usuario: "dónde están los pedidos" o "ver pedidos" o "lista de pedidos"
Tú: Los pedidos se encuentran en el menú Administración, específicamente en la opción Pedidos y Órdenes. Ahí verás una tabla con todos los pedidos registrados en el sistema, mostrando información como el ID del pedido, el cliente, el producto o menú solicitado, la cantidad, el estado, el precio total y la motocicleta asignada si tiene una. Desde esa misma página puedes crear nuevos pedidos, editar pedidos existentes, eliminar pedidos o asignar motocicletas a pedidos pendientes.

Usuario: "qué es un turno" o "para qué sirven los turnos" o "explicame los turnos"
Tú: Un turno, también llamado jornada de trabajo, es una funcionalidad clave del sistema que permite asociar un conductor con una motocicleta durante un período de tiempo específico. Los turnos son importantes porque solo las motocicletas que tienen un turno activo pueden ser asignadas a pedidos. Cuando creas un turno, seleccionas un conductor disponible, una motocicleta que no esté en mantenimiento, estableces la fecha y hora de inicio, y opcionalmente la fecha y hora de fin. Cuando el turno tiene estado activo, el sistema automáticamente cambia el estado de la motocicleta a en_uso. Esto asegura que solo las motocicletas que están siendo utilizadas por conductores en ese momento puedan recibir pedidos. Los turnos se gestionan en el menú Conductores, opción Jornadas de Trabajo.

Usuario: "cómo crear un menú" o "quiero agregar un menú"
Tú: Para crear un menú nuevo, ve al menú Locales y selecciona Menús. En la parte superior verás un botón que dice Nuevo Menú. Al hacer clic se abrirá un formulario. Primero ingresa un nombre descriptivo para el menú, por ejemplo Menú del Día o Combo Especial. Luego selecciona el restaurante que ofrecerá este menú del menú desplegable. Después selecciona uno o más productos que formarán parte del menú, puedes seleccionar múltiples productos manteniendo presionada la tecla Ctrl o Cmd. Establece el precio del menú, que puede ser diferente al precio individual del producto. Finalmente marca la casilla de Disponible si quieres que el menú aparezca como opción al crear pedidos. Si seleccionaste múltiples productos, el sistema creará varios menús, uno por cada producto, todos con el mismo nombre, restaurante y precio. Haz clic en Crear para guardar.

Usuario: "no puedo asignar una moto" o "por qué no aparecen motos" o "motocicletas no disponibles"
Tú: Si no puedes asignar una motocicleta a un pedido o no aparecen motocicletas disponibles, es porque solo se pueden asignar motocicletas que tienen turnos activos. Un turno activo significa que hay un conductor asignado a esa motocicleta en ese momento. Para solucionar esto, primero ve al menú Conductores y selecciona Jornadas de Trabajo. Crea un nuevo turno seleccionando un conductor disponible y una motocicleta que no esté en mantenimiento. Asegúrate de que el estado del turno sea activo. Una vez creado el turno activo, la motocicleta cambiará automáticamente a estado en_uso y entonces podrás asignarla a pedidos desde la sección de Pedidos y Órdenes.

CONOCIMIENTO COMPLETO DEL SISTEMA:
${KNOWLEDGE}

INFORMACIÓN ACTUAL DEL SISTEMA:
${this.backendData}

Pregunta del usuario: ${message}

Ahora analiza la pregunta del usuario, detecta su intención, y proporciona una respuesta súper inteligente, completa y útil. Si la pregunta es ambigua, proporciona información general útil. Si es específica, da detalles específicos. Sé conversacional pero profesional:
`;

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      // Verificar si hay error en la respuesta (cuota excedida, error de API, etc.)
      if (data.error) {
        console.error('Error de Gemini API:', data.error);
        console.log('Usando respuesta inteligente de respaldo debido a error de API');
        const fallbackResponse = this.generateIntelligentResponse(intent, lowerMessage);
        console.log('Respuesta de respaldo generada:', fallbackResponse);
        return fallbackResponse;
      }

      let botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Respuesta de Gemini recibida:', botReply);

      // Si no hay respuesta del API, usar detección de intención para respuesta inteligente
      if (!botReply || botReply.trim().length === 0) {
        console.log('Respuesta vacía de Gemini, usando respuesta inteligente');
        botReply = this.generateIntelligentResponse(intent, lowerMessage);
      } else {
        // Aplicar la función de limpieza solo si hay respuesta
        const cleanedReply = limpiarTextoRespuesta(botReply);
        console.log('Respuesta limpiada:', cleanedReply);
        // Si después de limpiar está vacío o es muy corto, usar respuesta inteligente
        if (!cleanedReply || cleanedReply.trim().length < 10) {
          console.log('Respuesta limpiada muy corta, usando respuesta inteligente');
          botReply = this.generateIntelligentResponse(intent, lowerMessage);
        } else {
          botReply = cleanedReply;
        }
      }

      console.log('Respuesta final a devolver:', botReply);
      return botReply;
    } catch (error: any) {
      console.error('Error al comunicarse con Gemini:', error);
      // Si hay error de conexión o cualquier otro error, usar respuesta inteligente
      console.log('Usando respuesta inteligente debido a excepción');
      const fallbackResponse = this.generateIntelligentResponse(intent, lowerMessage);
      console.log('Respuesta de respaldo generada en catch:', fallbackResponse);
      return fallbackResponse;
    }
  }
}


