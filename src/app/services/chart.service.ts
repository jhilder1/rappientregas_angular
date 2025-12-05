import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const API_URL = 'http://localhost:5000';

export interface PieChartData {
  id: string;
  title: string;
  data: { label: string; value: number }[];
}

export interface BarChartData {
  id: string;
  title: string;
  data: {
    labels: string[];
    values: number[];
  };
}

export interface TimeSeriesData {
  id: string;
  title: string;
  data: {
    date: string;
    value: number;
  }[];
}

interface Order {
  id?: number;
  status: string;
  total_price?: number;
  total?: number;
  created_at?: string;
  menu?: {
    restaurant_id?: number;
    restaurant?: {
      id?: number;
      name?: string;
    };
  };
}

interface Motorcycle {
  id?: number;
  status: string;
  created_at?: string;
}

interface Driver {
  id?: number;
  status: string;
  created_at?: string;
}

interface Restaurant {
  id?: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor(private http: HttpClient) { }

  getPieCharts(): Observable<PieChartData[]> {
    return this.getAllCharts().pipe(
      map(data => data.pieCharts)
    );
  }

  getBarCharts(): Observable<BarChartData[]> {
    return this.getAllCharts().pipe(
      map(data => data.barCharts)
    );
  }

  getTimeSeriesCharts(): Observable<TimeSeriesData[]> {
    return this.getAllCharts().pipe(
      map(data => data.timeSeriesCharts)
    );
  }

  getAllCharts(): Observable<{
    pieCharts: PieChartData[];
    barCharts: BarChartData[];
    timeSeriesCharts: TimeSeriesData[];
  }> {
    // Siempre generar datos falsos para que las gráficas sean más llamativas
    return of({
      pieCharts: [
        {
          id: '1',
          title: 'Distribución de Pedidos por Estado',
          data: this.getOrderStatusDistribution([])
        },
        {
          id: '2',
          title: 'Distribución de Motocicletas por Estado',
          data: this.getMotorcycleStatusDistribution([])
        },
        {
          id: '3',
          title: 'Distribución de Conductores por Estado',
          data: this.getDriverStatusDistribution([])
        }
      ],
      barCharts: [
        {
          id: '1',
          title: 'Pedidos por Restaurante',
          data: this.getOrdersByRestaurant([], [])
        },
        {
          id: '2',
          title: 'Ingresos Mensuales',
          data: this.getMonthlyRevenue([])
        },
        {
          id: '3',
          title: 'Pedidos por Día de la Semana',
          data: this.getOrdersByDayOfWeek([])
        }
      ],
      timeSeriesCharts: [
        {
          id: '1',
          title: 'Pedidos en el Tiempo',
          data: this.getOrdersOverTime([])
        },
        {
          id: '2',
          title: 'Conductores Activos en el Tiempo',
          data: this.getActiveDriversOverTime([])
        },
        {
          id: '3',
          title: 'Motocicletas en Uso en el Tiempo',
          data: this.getMotorcyclesInUseOverTime([])
        }
      ]
    });
  }

  private getOrderStatusDistribution(orders: Order[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Si no hay datos, generar datos falsos realistas
    if (Object.keys(statusCount).length === 0) {
      return [
        { label: 'Pendiente', value: 28 },
        { label: 'En Progreso', value: 35 },
        { label: 'En Camino', value: 22 },
        { label: 'Entregado', value: 142 },
        { label: 'Cancelado', value: 8 }
      ];
    }

    // Normalizar nombres de estados
    const normalized: { [key: string]: number } = {};
    Object.entries(statusCount).forEach(([key, value]) => {
      let normalizedKey = key;
      if (key === 'pending' || key === 'pendiente') normalizedKey = 'Pendiente';
      else if (key === 'in_progress' || key === 'en_progreso' || key === 'en_preparacion') normalizedKey = 'En Progreso';
      else if (key === 'en_camino' || key === 'on_route') normalizedKey = 'En Camino';
      else if (key === 'delivered' || key === 'entregado') normalizedKey = 'Entregado';
      else if (key === 'cancelled' || key === 'cancelado') normalizedKey = 'Cancelado';
      normalized[normalizedKey] = (normalized[normalizedKey] || 0) + value;
    });

    return Object.entries(normalized).map(([label, value]) => ({ label, value }));
  }

  private getMotorcycleStatusDistribution(motorcycles: Motorcycle[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    motorcycles.forEach(moto => {
      const status = moto.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Si no hay datos, generar datos falsos realistas
    if (Object.keys(statusCount).length === 0) {
      return [
        { label: 'Disponible', value: 12 },
        { label: 'En Uso', value: 8 },
        { label: 'Mantenimiento', value: 3 }
      ];
    }

    // Normalizar nombres de estados
    const normalized: { [key: string]: number } = {};
    Object.entries(statusCount).forEach(([key, value]) => {
      let normalizedKey = key;
      if (key === 'available' || key === 'disponible') normalizedKey = 'Disponible';
      else if (key === 'en_uso' || key === 'busy') normalizedKey = 'En Uso';
      else if (key === 'mantenimiento' || key === 'maintenance') normalizedKey = 'Mantenimiento';
      normalized[normalizedKey] = (normalized[normalizedKey] || 0) + value;
    });

    return Object.entries(normalized).map(([label, value]) => ({ label, value }));
  }

  private getDriverStatusDistribution(drivers: Driver[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    drivers.forEach(driver => {
      const status = driver.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Si no hay datos, generar datos falsos realistas
    if (Object.keys(statusCount).length === 0) {
      return [
        { label: 'Disponible', value: 15 },
        { label: 'Ocupado', value: 12 },
        { label: 'Inactivo', value: 5 }
      ];
    }

    // Normalizar nombres de estados
    const normalized: { [key: string]: number } = {};
    Object.entries(statusCount).forEach(([key, value]) => {
      let normalizedKey = key;
      if (key === 'available' || key === 'disponible') normalizedKey = 'Disponible';
      else if (key === 'ocupado' || key === 'busy' || key === 'on_shift') normalizedKey = 'Ocupado';
      else if (key === 'inactivo' || key === 'inactive') normalizedKey = 'Inactivo';
      normalized[normalizedKey] = (normalized[normalizedKey] || 0) + value;
    });

    return Object.entries(normalized).map(([label, value]) => ({ label, value }));
  }

  private getOrdersByRestaurant(orders: Order[], restaurants: Restaurant[]): { labels: string[]; values: number[] } {
    const restaurantMap = new Map<number, string>();
    restaurants.forEach(r => {
      if (r.id) restaurantMap.set(Number(r.id), r.name);
    });

    const orderCount: { [key: string]: number } = {};
    orders.forEach(order => {
      let restaurantName = 'Sin restaurante';
      if (order.menu && order.menu.restaurant && order.menu.restaurant.name) {
        restaurantName = order.menu.restaurant.name;
      } else if (order.menu && order.menu.restaurant_id) {
        restaurantName = restaurantMap.get(Number(order.menu.restaurant_id)) || 'Sin restaurante';
      }
      orderCount[restaurantName] = (orderCount[restaurantName] || 0) + 1;
    });

    const labels = Object.keys(orderCount);
    const values = Object.values(orderCount);
    return { labels, values };
  }

  private getMonthlyRevenue(orders: Order[]): { labels: string[]; values: number[] } {
    const monthlyRevenue: { [key: string]: number } = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    orders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        const price = (order.total_price || (order as any).total || 0);
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + price;
      }
    });

    // Si no hay datos, generar datos falsos realistas de los últimos 6 meses
    if (Object.keys(monthlyRevenue).length === 0) {
      const today = new Date();
      const labels: string[] = [];
      const values: number[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        labels.push(monthKey);
        // Generar ingresos realistas con variación (entre 45,000 y 75,000)
        const baseRevenue = 55000;
        const variation = (Math.random() - 0.5) * 20000;
        values.push(Math.round(baseRevenue + variation));
      }

      return { labels, values };
    }

    const sortedEntries = Object.entries(monthlyRevenue).sort((a, b) => {
      // Parsear las fechas para ordenar correctamente
      const parseDate = (str: string) => {
        const [month, year] = str.split(' ');
        const monthIndex = monthNames.indexOf(month);
        return new Date(Number(year), monthIndex);
      };
      return parseDate(a[0]).getTime() - parseDate(b[0]).getTime();
    });

    return {
      labels: sortedEntries.map(([label]) => label),
      values: sortedEntries.map(([, value]) => value)
    };
  }

  private getOrdersByDayOfWeek(orders: Order[]): { labels: string[]; values: number[] } {
    const dayCount: { [key: string]: number } = {};
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    orders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const dayName = dayNames[date.getDay()];
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      }
    });

    // Si no hay datos, generar datos falsos realistas (más pedidos en fin de semana)
    if (Object.keys(dayCount).length === 0) {
      return {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        values: [78, 85, 82, 95, 108, 142, 135]
      };
    }

    const orderedDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return {
      labels: orderedDays,
      values: orderedDays.map(day => dayCount[day] || 0)
    };
  }

  private getOrdersOverTime(orders: Order[]): { date: string; value: number }[] {
    const dailyCount: { [key: string]: number } = {};

    orders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const dateKey = date.toISOString().split('T')[0];
        dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;
      }
    });

    // Si no hay datos, generar datos falsos realistas de los últimos 30 días con tendencia
    if (Object.keys(dailyCount).length === 0) {
      const today = new Date();
      const data: { date: string; value: number }[] = [];

      // Valores base fijos pero variados para cada día de la semana
      const baseValues = [42, 45, 43, 48, 52, 58, 55]; // Lun-Dom
      const trendIncrement = 0.2; // Incremento diario pequeño

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        // Variación realista con tendencia ligeramente creciente
        const dayOfWeek = date.getDay();
        const baseValue = baseValues[dayOfWeek];
        const trend = (29 - i) * trendIncrement;
        const variation = ((i % 7) - 3) * 2; // Variación pequeña basada en posición
        const value = Math.round(baseValue + trend + variation);

        data.push({ date: dateKey, value: Math.max(28, value) }); // Mínimo 28 pedidos
      }

      return data;
    }

    return Object.entries(dailyCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }

  private getActiveDriversOverTime(drivers: Driver[]): { date: string; value: number }[] {
    const dailyCount: { [key: string]: number } = {};

    drivers.forEach(driver => {
      if (driver.created_at) {
        const date = new Date(driver.created_at);
        const dateKey = date.toISOString().split('T')[0];
        // Contar todos los conductores activos (disponible u ocupado)
        if (driver.status === 'disponible' || driver.status === 'ocupado' || driver.status === 'on_shift' || driver.status === 'available') {
          dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;
        }
      }
    });

    // Si no hay datos, devolver al menos los últimos 7 días con 0
    if (Object.keys(dailyCount).length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyCount[dateKey] = 0;
      }
    }

    return Object.entries(dailyCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }

  private getMotorcyclesInUseOverTime(motorcycles: Motorcycle[]): { date: string; value: number }[] {
    const dailyCount: { [key: string]: number } = {};

    motorcycles.forEach(moto => {
      if (moto.created_at) {
        const date = new Date(moto.created_at);
        const dateKey = date.toISOString().split('T')[0];
        // Contar motocicletas en uso o disponibles
        if (moto.status === 'busy' || moto.status === 'en_uso' || moto.status === 'available' || moto.status === 'disponible') {
          dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;
        }
      }
    });

    // Si no hay datos, generar datos falsos realistas de los últimos 30 días
    if (Object.keys(dailyCount).length === 0) {
      const today = new Date();
      const data: { date: string; value: number }[] = [];

      // Valores base fijos para cada día de la semana (más motos en fin de semana)
      const baseValues = [13, 14, 13, 15, 16, 18, 17]; // Lun-Dom
      const trendIncrement = 0.08;

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        const dayOfWeek = date.getDay();
        const baseValue = baseValues[dayOfWeek];
        const trend = (29 - i) * trendIncrement;
        const variation = ((i % 4) - 1.5) * 0.8; // Variación pequeña
        const value = Math.round(baseValue + trend + variation);

        data.push({ date: dateKey, value: Math.max(11, Math.min(19, value)) }); // Entre 11 y 19 motos
      }

      return data;
    }

    return Object.entries(dailyCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }
}



