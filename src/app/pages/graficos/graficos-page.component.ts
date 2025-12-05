import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ChartService, PieChartData, BarChartData, TimeSeriesData } from '../../services/chart.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-graficos-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './graficos-page.component.html',
  styleUrls: ['./graficos-page.component.css']
})
export class GraficosPageComponent implements OnInit {
  pieCharts: PieChartData[] = [];
  barCharts: BarChartData[] = [];
  timeSeriesCharts: TimeSeriesData[] = [];

  // Configuraciones para gráficos circulares
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff'
        }
      }
    }
  };
  pieChartType: ChartType = 'pie';

  // Configuraciones para gráficos de barras
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };
  barChartType: ChartType = 'bar';

  // Configuraciones para series temporales
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };
  lineChartType: ChartType = 'line';

  constructor(private chartService: ChartService) { }

  ngOnInit(): void {
    this.loadCharts();
  }

  loadCharts(): void {
    this.chartService.getAllCharts().subscribe({
      next: (data) => {
        this.pieCharts = data.pieCharts;
        this.barCharts = data.barCharts;
        this.timeSeriesCharts = data.timeSeriesCharts;
      },
      error: () => {
        // Si hay error, inicializar con arrays vacíos para evitar errores
        this.pieCharts = [];
        this.barCharts = [];
        this.timeSeriesCharts = [];
      }
    });
  }

  getPieChartData(chart: PieChartData): ChartData<'pie'> {
    return {
      labels: chart.data.map(d => d.label),
      datasets: [{
        data: chart.data.map(d => d.value),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };
  }

  getBarChartData(chart: BarChartData): ChartData<'bar'> {
    return {
      labels: chart.data.labels,
      datasets: [{
        label: chart.title,
        data: chart.data.values,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1
      }]
    };
  }

  getLineChartData(chart: TimeSeriesData): ChartData<'line'> {
    return {
      labels: chart.data.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        label: chart.title,
        data: chart.data.map(d => d.value),
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  }
}

