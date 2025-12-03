import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MotorcycleService } from '../../services/motorcycle.service';
import { interval, Subscription } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-moto-map',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './moto-map.component.html',
  styleUrls: ['./moto-map.component.css']
})
export class MotoMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  plate = '';
  map: any;
  marker: any;
  private updateSubscription?: Subscription;
  private mapInitialized = false;

  constructor(
    private route: ActivatedRoute,
    private motorcycleService: MotorcycleService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.plate = params['plate'] || '';
      if (this.plate && !this.mapInitialized) {
        this.loadGoogleMaps();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  loadGoogleMaps(): void {
    if (typeof google === 'undefined' || !google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;
      (window as any).initMap = () => this.initMap();
      document.head.appendChild(script);
    } else {
      this.initMap();
    }
  }

  initMap(): void {
    if (!this.mapContainer) return;

    // Coordenadas por defecto (Bogotá, Colombia)
    const defaultLat = 4.7110;
    const defaultLng = -74.0721;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
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
    this.loadMotorcycleLocation();
    this.startLocationUpdates();
  }

  loadMotorcycleLocation(): void {
    if (!this.plate) return;

    this.motorcycleService.getByPlate(this.plate).subscribe({
      next: (motorcycle) => {
        if (motorcycle.current_latitude && motorcycle.current_longitude) {
          this.updateMarker(motorcycle.current_latitude, motorcycle.current_longitude);
        } else if (motorcycle.plate) {
          // Si no hay ubicación, usar geocodificación para obtener coordenadas
          this.geocodeAddress(motorcycle.plate);
        }
      },
      error: (error) => {
        console.error('Error loading motorcycle:', error);
      }
    });
  }

  updateMarker(lat: number, lng: number): void {
    if (!this.map) return;

    const position = { lat, lng };

    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      this.marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: `Moto ${this.plate}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/motorcycling.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });
    }

    this.map.setCenter(position);
  }

  geocodeAddress(plate: string): void {
    // Geocodificación simple - en producción usarías la dirección real
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: 'Bogotá, Colombia' }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        this.updateMarker(location.lat(), location.lng());
      }
    });
  }

  startLocationUpdates(): void {
    // Actualizar ubicación cada 5 segundos
    this.updateSubscription = interval(5000).subscribe(() => {
      this.loadMotorcycleLocation();
    });
  }
}

