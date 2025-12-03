import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MotorcycleService, Motorcycle } from '../../services/motorcycle.service';
import { MotorcycleFormComponent } from '../../components/motorcycle/motorcycle-form.component';
import { MotorcycleListComponent } from '../../components/motorcycle/motorcycle-list.component';
import { ZonesModalComponent } from '../../components/motorcycle/zones-modal.component';

@Component({
  selector: 'app-motorcycle-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MotorcycleFormComponent,
    MotorcycleListComponent,
    ZonesModalComponent
  ],
  templateUrl: './motorcycle-page.component.html',
  styleUrls: ['./motorcycle-page.component.css']
})
export class MotorcyclePageComponent implements OnInit {
  motorcycles: Motorcycle[] = [];
  selectedMoto: Motorcycle | null = null;
  zonesModalOpen = false;
  selectedMotoForZone: Motorcycle | null = null;

  constructor(private motorcycleService: MotorcycleService) {}

  ngOnInit(): void {
    this.loadMotorcycles();
  }

  loadMotorcycles(): void {
    this.motorcycleService.getAll().subscribe({
      next: (data) => {
        this.motorcycles = data;
      },
      error: (error) => {
        console.error('Error loading motorcycles:', error);
      }
    });
  }

  handleEdit(moto: Motorcycle): void {
    this.selectedMoto = moto;
  }

  handleClear(): void {
    this.selectedMoto = null;
  }

  handleAssignZone(moto: Motorcycle): void {
    this.selectedMotoForZone = moto;
    this.zonesModalOpen = true;
  }

  handleZoneSave(): void {
    this.loadMotorcycles();
  }

  handleZoneClose(): void {
    this.zonesModalOpen = false;
    this.selectedMotoForZone = null;
  }
}
