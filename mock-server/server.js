const http = require('http');
const url = require('url');

const PORT = 3001;

// Datos mock para gráficos
const mockData = {
  pieCharts: [
    {
      id: 'pie1',
      title: 'Distribución de Pedidos por Estado',
      data: [
        { label: 'Pendiente', value: 25 },
        { label: 'En Preparación', value: 30 },
        { label: 'En Camino', value: 20 },
        { label: 'Entregado', value: 20 },
        { label: 'Cancelado', value: 5 }
      ]
    },
    {
      id: 'pie2',
      title: 'Distribución de Motos por Estado',
      data: [
        { label: 'Disponible', value: 40 },
        { label: 'En Uso', value: 35 },
        { label: 'Mantenimiento', value: 25 }
      ]
    },
    {
      id: 'pie3',
      title: 'Distribución de Conductores por Estado',
      data: [
        { label: 'Disponible', value: 45 },
        { label: 'Ocupado', value: 40 },
        { label: 'Inactivo', value: 15 }
      ]
    }
  ],
  barCharts: [
    {
      id: 'bar1',
      title: 'Pedidos por Restaurante',
      data: {
        labels: ['Restaurante A', 'Restaurante B', 'Restaurante C', 'Restaurante D', 'Restaurante E'],
        values: [120, 95, 150, 80, 110]
      }
    },
    {
      id: 'bar2',
      title: 'Ingresos Mensuales',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        values: [45000, 52000, 48000, 61000, 55000, 67000]
      }
    },
    {
      id: 'bar3',
      title: 'Pedidos por Día de la Semana',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        values: [85, 92, 78, 105, 120, 145, 130]
      }
    }
  ],
  timeSeriesCharts: [
    {
      id: 'time1',
      title: 'Pedidos en el Tiempo (Últimos 30 días)',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50
      }))
    },
    {
      id: 'time2',
      title: 'Conductores Activos en el Tiempo',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 20) + 30
      }))
    },
    {
      id: 'time3',
      title: 'Motos en Uso en el Tiempo',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 15) + 25
      }))
    }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (path === '/api/charts/pie') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.pieCharts));
  } else if (path === '/api/charts/bar') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.barCharts));
  } else if (path === '/api/charts/timeseries') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.timeSeriesCharts));
  } else if (path === '/api/charts/all') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});



