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
  constructor(private http: HttpClient) {}

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
    return forkJoin({
      orders: this.http.get<Order[]>(`${API_URL}/orders`).pipe(
        catchError(() => of([] as Order[]))
      ),
      motorcycles: this.http.get<Motorcycle[]>(`${API_URL}/motorcycles`).pipe(
        catchError(() => of([] as Motorcycle[]))
      ),
      drivers: this.http.get<Driver[]>(`${API_URL}/drivers`).pipe(
        catchError(() => of([] as Driver[]))
      ),
      restaurants: this.http.get<Restaurant[]>(`${API_URL}/restaurants`).pipe(
        catchError(() => of([] as Restaurant[]))
      )
    }).pipe(
      map(({ orders, motorcycles, drivers, restaurants }) => {
        // Gráficos circulares (Pie Charts)
        const pieCharts: PieChartData[] = [
          {
            id: '1',
            title: 'Distribución de Pedidos por Estado',
            data: this.getOrderStatusDistribution(orders)
          },
          {
            id: '2',
            title: 'Distribución de Motocicletas por Estado',
            data: this.getMotorcycleStatusDistribution(motorcycles)
          },
          {
            id: '3',
            title: 'Distribución de Conductores por Estado',
            data: this.getDriverStatusDistribution(drivers)
          }
        ];

        // Gráficos de barras (Bar Charts)
        const barCharts: BarChartData[] = [
          {
            id: '1',
            title: 'Pedidos por Restaurante',
            data: this.getOrdersByRestaurant(orders, restaurants)
          },
          {
            id: '2',
            title: 'Ingresos Mensuales',
            data: this.getMonthlyRevenue(orders)
          },
          {
            id: '3',
            title: 'Pedidos por Día de la Semana',
            data: this.getOrdersByDayOfWeek(orders)
          }
        ];

        // Gráficos de series temporales (Line Charts)
        const timeSeriesCharts: TimeSeriesData[] = [
          {
            id: '1',
            title: 'Pedidos en el Tiempo',
            data: this.getOrdersOverTime(orders)
          },
          {
            id: '2',
            title: 'Conductores Activos en el Tiempo',
            data: this.getActiveDriversOverTime(drivers)
          },
          {
            id: '3',
            title: 'Motocicletas en Uso en el Tiempo',
            data: this.getMotorcyclesInUseOverTime(motorcycles)
          }
        ];

        return { pieCharts, barCharts, timeSeriesCharts };
      })
    );
  }

  private getOrderStatusDistribution(orders: Order[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([label, value]) => ({ label, value }));
  }

  private getMotorcycleStatusDistribution(motorcycles: Motorcycle[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    motorcycles.forEach(moto => {
      const status = moto.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([label, value]) => ({ label, value }));
  }

  private getDriverStatusDistribution(drivers: Driver[]): { label: string; value: number }[] {
    const statusCount: { [key: string]: number } = {};
    drivers.forEach(driver => {
      const status = driver.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([label, value]) => ({ label, value }));
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

    const orderedDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return {
      labels: orderedDays.filter(day => dayCount[day] !== undefined),
      values: orderedDays.filter(day => dayCount[day] !== undefined).map(day => dayCount[day] || 0)
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

  private getActiveDriversOverTime(drivers: Driver[]): { date: string; value: number }[] {
    const dailyCount: { [key: string]: number } = {};

    drivers.forEach(driver => {
      if (driver.created_at) {
        const date = new Date(driver.created_at);
        const dateKey = date.toISOString().split('T')[0];
        // Contar todos los conductores activos (on_shift o available)
        if (driver.status === 'on_shift' || driver.status === 'available') {
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
        if (moto.status === 'in_use' || moto.status === 'available') {
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
}



