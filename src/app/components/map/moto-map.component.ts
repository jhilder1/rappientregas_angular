import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MotorcycleService } from '../../services/motorcycle.service';
import { interval, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';

declare var google: any;

@Component({
  selector: 'app-moto-map',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './moto-map.component.html',
  styleUrls: ['./moto-map.component.css']
})
export class MotoMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  plate = '';
  map: any;
  marker: any;
  private updateSubscription?: Subscription;
  private mapInitialized = false;
  private socket?: Socket;
  private polyline?: any;
  private pathCoordinates: any[] = [];
  private simulationSubscription?: Subscription;
  private simulatedCoordinates: any[] = [];
  private currentSimulationIndex = 0;
  private isSimulationRunning = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private motorcycleService: MotorcycleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Cargar coordenadas de simulación
    this.loadSimulationCoordinates();

    this.route.params.subscribe(params => {
      const newPlate = params['plate'] || '';

      if (newPlate !== this.plate && this.socket) {
        this.socket.disconnect();
        this.socket = undefined;
      }

      this.plate = newPlate;

      if (this.plate && this.mapInitialized && !this.socket) {
        this.connectWebSocket();
      }
    });
  }

  private loadSimulationCoordinates(): void {
    // Coordenadas de simulación (primeras coordenadas del archivo JSON)
    this.simulatedCoordinates = [
      { lat: 5.055377480410004, lng: -75.49060106277467 },
      { lat: 5.055302670699839, lng: -75.49037575721742 },
      { lat: 5.055559161098708, lng: -75.49026846885683 },
      { lat: 5.0556446578757575, lng: -75.49004316329957 },
      { lat: 5.055703436903443, lng: -75.4897964000702 },
      { lat: 5.055730154641535, lng: -75.48951208591463 },
      { lat: 5.055708780451153, lng: -75.48927068710329 },
      { lat: 5.055692749807895, lng: -75.4889863729477 },
      { lat: 5.055633970779243, lng: -75.48873424530031 },
      { lat: 5.055564504647614, lng: -75.48849284648895 },
      { lat: 5.055452290111532, lng: -75.48820316791536 },
      { lat: 5.055350762657371, lng: -75.4878866672516 },
      { lat: 5.055361449758554, lng: -75.48753798007967 },
      { lat: 5.055527099804407, lng: -75.48724830150606 },
      { lat: 5.055650001423964, lng: -75.4869532585144 },
      { lat: 5.055772903020174, lng: -75.48658847808838 },
      { lat: 5.055927865869123, lng: -75.48626661300659 },
      { lat: 5.0560828286809985, lng: -75.48606276512147 },
      { lat: 5.056328631685844, lng: -75.48618614673616 },
      { lat: 5.056633213540658, lng: -75.48636317253114 }
    ];
  }

  ngAfterViewInit(): void {
    // Asegurar que la vista esté completamente inicializada
    this.cdr.detectChanges();

    if (this.plate && !this.mapInitialized) {
      // Cargar el mapa primero
      setTimeout(() => {
        this.loadGoogleMaps();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    // Desconectar SocketIO
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    // Detener tracking al salir
    if (this.plate) {
      this.motorcycleService.stopTracking(this.plate).subscribe({
        next: () => console.log('Tracking detenido para:', this.plate),
        error: (error) => console.error('Error deteniendo tracking:', error)
      });
    }
  }

  loadGoogleMaps(): void {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      setTimeout(() => this.loadGoogleMaps(), 200);
      return;
    }

    if (typeof google === 'undefined' || !google.maps) {
      const apiKey = '';
      const script = document.createElement('script');
      if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      } else {
        script.src = `https://maps.googleapis.com/maps/api/js?callback=initMap`;
      }

      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.snackBar.open('Error cargando Google Maps. Verifica tu conexión a internet.', 'Cerrar', { duration: 5000 });
      };

      if ((window as any).initMap) {
        delete (window as any).initMap;
      }

      (window as any).initMap = () => {
        setTimeout(() => {
          if (this.mapContainer && this.mapContainer.nativeElement) {
            this.initMap();
          }
        }, 300);
      };

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        if (typeof google !== 'undefined' && google.maps) {
          setTimeout(() => this.initMap(), 300);
        }
      }
    } else {
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          this.initMap();
        }
      }, 300);
    }
  }

  initMap(): void {
    // Verificar que el contenedor esté disponible y sea un elemento válido
    if (!this.mapContainer) {
      console.error('Map container no está disponible (ViewChild no inicializado)');
      setTimeout(() => {
        if (this.mapContainer) {
          this.initMap();
        }
      }, 200);
      return;
    }

    const mapElement = this.mapContainer.nativeElement;

    if (!mapElement) {
      console.error('Map container nativeElement no está disponible');
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          this.initMap();
        }
      }, 200);
      return;
    }

    // Verificar que sea un elemento HTML válido
    if (!(mapElement instanceof HTMLElement)) {
      console.error('Map container no es un elemento HTML válido:', mapElement);
      return;
    }

    // Verificar que el elemento esté en el DOM
    if (!document.body.contains(mapElement)) {
      console.error('Map container no está en el DOM');
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement && document.body.contains(this.mapContainer.nativeElement)) {
          this.initMap();
        }
      }, 200);
      return;
    }

    // Verificar que Google Maps esté cargado
    if (typeof google === 'undefined' || !google.maps || !google.maps.Map) {
      console.error('Google Maps API no está cargada correctamente');
      // Reintentar después de un delay
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          this.initMap();
        }
      }, 500);
      return;
    }

    // Coordenadas por defecto (Bogotá, Colombia)
    const defaultLat = 4.7110;
    const defaultLng = -74.0721;

    try {
      this.map = new google.maps.Map(mapElement, {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: 13,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
          }
        ]
      });

      this.mapInitialized = true;
      // Establecer posición inicial inmediatamente para que se vea el marcador
      const initialLat = 5.055377480410004; // Primera coordenada del archivo JSON del backend
      const initialLng = -75.49060106277467;
      this.updateMarker(initialLat, initialLng);
      this.pathCoordinates.push({ lat: initialLat, lng: initialLng });

      // Conectar SocketIO para recibir coordenadas en tiempo real del backend
      this.connectWebSocket();
    } catch (error) {
      console.error('Error inicializando el mapa:', error);
      // Reintentar después de un delay
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          this.initMap();
        }
      }, 500);
    }
  }

  connectWebSocket(): void {
    if (!this.plate) {
      return;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }

    try {
      this.socket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      const handleCoordinateData = (data: any) => {
        const { lat, lng } = data;

        if (lat !== undefined && lng !== undefined) {
          const latNum = typeof lat === 'number' ? lat : parseFloat(String(lat));
          const lngNum = typeof lng === 'number' ? lng : parseFloat(String(lng));

          if (!isNaN(latNum) && !isNaN(lngNum)) {
            this.updateMarker(latNum, lngNum);
            this.pathCoordinates.push({ lat: latNum, lng: lngNum });
            this.updatePolyline();
          }
        }
      };

      this.socket.on(this.plate, handleCoordinateData);
      this.socket.on(this.plate.toUpperCase(), handleCoordinateData);
      this.socket.on(this.plate.toLowerCase(), handleCoordinateData);

      this.socket.onAny((eventName: string, ...args: any[]) => {
        if (eventName === this.plate || eventName?.toLowerCase() === this.plate?.toLowerCase()) {
          if (args.length > 0) {
            handleCoordinateData(args[0]);
          }
        }
      });

      this.socket.on('connect_error', () => {
        this.snackBar.open('Error de conexión con el servidor', 'Cerrar', { duration: 5000 });
      });

    } catch (error) {
      this.socket = undefined;
      this.snackBar.open('Error al conectar con el servidor', 'Cerrar', { duration: 5000 });
    }
  }

  loadMotorcycleLocation(): void {
    if (!this.plate) return;

    // Buscar la motocicleta por placa desde la lista completa
    this.motorcycleService.getAll().subscribe({
      next: (motorcycles) => {
        const motorcycle = motorcycles.find(m =>
          (m.plate && m.plate.toLowerCase() === this.plate.toLowerCase()) ||
          (m.license_plate && m.license_plate.toLowerCase() === this.plate.toLowerCase())
        );

        if (motorcycle) {
          if (motorcycle.current_latitude && motorcycle.current_longitude) {
            this.updateMarker(motorcycle.current_latitude, motorcycle.current_longitude);
          } else {
            // Si no hay ubicación, usar coordenadas por defecto o geocodificación
            this.geocodeAddress(this.plate);
          }
        } else {
          console.warn('Motocicleta no encontrada con placa:', this.plate);
          // Usar coordenadas por defecto
          this.geocodeAddress(this.plate);
        }
      },
      error: (error) => {
        console.error('Error loading motorcycles:', error);
        // En caso de error, usar coordenadas por defecto
        this.geocodeAddress(this.plate);
      }
    });
  }

  updateMarker(lat: number, lng: number): void {
    if (!this.map) {
      return;
    }

    const position = { lat, lng };

    if (this.marker) {
      this.marker.setPosition(position);
      this.map.panTo(position);
    } else {
      this.marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: `Moto ${this.plate}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/motorcycling.png',
          scaledSize: new google.maps.Size(40, 40)
        },
        animation: google.maps.Animation.DROP,
        draggable: false
      });

      this.map.setCenter(position);
      this.map.setZoom(15);
    }
  }

  updatePolyline(): void {
    if (!this.map || this.pathCoordinates.length < 2) return;

    if (this.polyline) {
      this.polyline.setPath(this.pathCoordinates);
    } else {
      this.polyline = new google.maps.Polyline({
        path: this.pathCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: this.map
      });
    }
  }

  geocodeAddress(plate: string): void {
    // Usar coordenadas por defecto (Bogotá, Colombia) si no hay ubicación
    const defaultLat = 4.7110;
    const defaultLng = -74.0721;
    this.updateMarker(defaultLat, defaultLng);

    // Opcional: Intentar geocodificación si hay Google Maps disponible
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: 'Bogotá, Colombia' }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          this.updateMarker(location.lat(), location.lng());
        }
      });
    }
  }

  startLocationUpdates(): void {
    // No usar polling HTTP - las coordenadas solo vienen por SocketIO
    // El backend no guarda coordenadas en la base de datos
    // Todas las actualizaciones vienen en tiempo real por SocketIO
  }

  private startSimulation(): void {
    if (this.isSimulationRunning || this.simulatedCoordinates.length === 0) {
      return;
    }

    this.isSimulationRunning = true;
    this.currentSimulationIndex = 0;
    this.pathCoordinates = [];

    this.simulationSubscription = interval(5000).subscribe(() => {
      if (this.currentSimulationIndex >= this.simulatedCoordinates.length) {
        this.currentSimulationIndex = 0;
      }

      const coord = this.simulatedCoordinates[this.currentSimulationIndex];
      this.updateMarker(coord.lat, coord.lng);
      this.pathCoordinates.push({ lat: coord.lat, lng: coord.lng });
      this.updatePolyline();

      this.currentSimulationIndex++;
    });
  }

  private stopSimulation(): void {
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = undefined;
    }
    this.isSimulationRunning = false;
  }

  iniciarTracking(): void {
    if (!this.plate) {
      this.snackBar.open('No hay placa seleccionada', 'Cerrar', { duration: 3000 });
      return;
    }

    // Iniciar simulación local
    this.startSimulation();

    // También llamar al backend (mantener llamados)
    if (!this.socket || !this.socket.connected) {
      this.connectWebSocket();
      if (this.socket) {
        this.socket.once('connect', () => {
          this.iniciarTrackingRequest();
        });
      }
    } else {
      this.iniciarTrackingRequest();
    }
  }

  private iniciarTrackingRequest(): void {
    this.motorcycleService.startTracking(this.plate).subscribe({
      next: () => {
        this.snackBar.open('Tracking iniciado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error al iniciar tracking: ' + (error.error?.message || error.message), 'Cerrar', { duration: 5000 });
      }
    });
  }

  detenerTracking(): void {
    if (!this.plate) {
      this.snackBar.open('No hay placa seleccionada', 'Cerrar', { duration: 3000 });
      return;
    }

    // Detener simulación local
    this.stopSimulation();

    // También llamar al backend (mantener llamados)
    this.motorcycleService.stopTracking(this.plate).subscribe({
      next: () => {
        this.snackBar.open('Tracking detenido correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al detener tracking', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

