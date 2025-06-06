import React, { useState, useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import DashboardLayout from "../../components/DashboardLayout";

const datosQuemados = [
  { id: 1, categoria: "Streaming", monto: 10, fecha: "2025-06-01" },
  { id: 2, categoria: "Servicios", monto: 40, fecha: "2025-06-05" },
  { id: 3, categoria: "Comida", monto: 20, fecha: "2025-06-10" },
  { id: 4, categoria: "Transporte", monto: 15, fecha: "2025-05-20" },
  { id: 5, categoria: "Streaming", monto: 5, fecha: "2024-06-01" },
  { id: 6, categoria: "Servicios", monto: 30, fecha: "2024-07-01" },
];

export default function SeguimientoGastos() {
  const [periodo, setPeriodo] = useState({ anio: "2025", mes: "Todos" });

  const añosDisponibles = useMemo(() => {
    const años = datosQuemados.map(tx => new Date(tx.fecha).getFullYear());
    return Array.from(new Set(años)).sort((a, b) => b - a);
  }, []);

  // Filtrar datos por año y mes
  const gastosFiltrados = useMemo(() => {
    return datosQuemados.filter(tx => {
      const fecha = new Date(tx.fecha);
      const anio = fecha.getFullYear().toString();
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      if (anio !== periodo.anio) return false;
      if (periodo.mes !== "Todos" && mes !== periodo.mes) return false;
      return true;
    });
  }, [periodo]);

  // Agrupar por categoría para pie chart
  const gastosPorCategoria = useMemo(() => {
    return gastosFiltrados.reduce((acc, tx) => {
      acc[tx.categoria] = (acc[tx.categoria] || 0) + tx.monto;
      return acc;
    }, {});
  }, [gastosFiltrados]);

  // Preparar datos para gráfico de pastel
  const dataParaPie = useMemo(() => {
    return Object.entries(gastosPorCategoria).map(([categoria, monto]) => ({
      id: categoria,
      label: categoria,
      value: monto,
    }));
  }, [gastosPorCategoria]);

  // Para gráfico de línea: total gastado por mes en el año seleccionado
  const totalPorMes = useMemo(() => {
    const anio = periodo.anio;
    const meses = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

    const totales = meses.map(mes => {
      const totalMes = datosQuemados
        .filter(tx => {
          const fecha = new Date(tx.fecha);
          const a = fecha.getFullYear().toString();
          const m = (fecha.getMonth() + 1).toString().padStart(2, "0");
          return a === anio && m === mes;
        })
        .reduce((acc, tx) => acc + tx.monto, 0);
      return { 
        x: new Date(0, parseInt(mes) - 1).toLocaleString("es-ES", { month: "short" }), 
        y: totalMes 
      };
    });

    return [{
      id: "Gasto mensual",
      color: "hsl(205, 70%, 50%)",
      data: totales,
    }];
  }, [periodo.anio]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento de Gastos</h1>
          <p className="text-lg text-gray-600">Visualiza y analiza tus patrones de gasto</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="anio" className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <select
                id="anio"
                value={periodo.anio}
                onChange={e => setPeriodo({ ...periodo, anio: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-2 px-4"
              >
                {añosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select
                id="mes"
                value={periodo.mes}
                onChange={e => setPeriodo({ ...periodo, mes: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-2 px-4"
              >
                <option value="Todos">Todos los meses</option>
                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(0, parseInt(mes) - 1).toLocaleString("es-ES", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        {dataParaPie.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No hay datos disponibles para el periodo seleccionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gráfico de pastel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Distribución por Categoría</h3>
              <div className="h-[400px]">
                <ResponsivePie
                  data={dataParaPie}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: "nivo" }}
                  borderWidth={1}
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                  theme={{
                    tooltip: {
                      container: {
                        background: '#ffffff',
                        color: '#333333',
                        fontSize: '12px',
                        borderRadius: '4px',
                        boxShadow: '0 3px 9px rgba(0, 0, 0, 0.15)'
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Gráfico de líneas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Tendencia Mensual - {periodo.anio}</h3>
              <div className="h-[400px]">
                <ResponsiveLine
                  data={totalPorMes}
                  margin={{ top: 50, right: 60, bottom: 70, left: 60 }}
                  xScale={{ type: "point" }}
                  yScale={{ type: "linear", min: 0, max: "auto", stacked: false, reverse: false }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    orient: "bottom",
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Mes",
                    legendOffset: 50,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    orient: "left",
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Monto ($)",
                    legendOffset: -50,
                    legendPosition: "middle",
                  }}
                  colors={{ scheme: "nivo" }}
                  pointSize={8}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  enableArea={true}
                  areaOpacity={0.1}
                  theme={{
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 12
                        }
                      },
                      legend: {
                        text: {
                          fontSize: 14,
                          fontWeight: 'bold'
                        }
                      }
                    },
                    tooltip: {
                      container: {
                        background: '#ffffff',
                        color: '#333333',
                        fontSize: '12px',
                        borderRadius: '4px',
                        boxShadow: '0 3px 9px rgba(0, 0, 0, 0.15)'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumen de gastos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700">Total gastado</p>
              <p className="text-2xl font-bold text-blue-900">
                ${Object.values(gastosPorCategoria).reduce((a, b) => a + b, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-700">Categoría principal</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.keys(gastosPorCategoria).length > 0 
                  ? Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700">N° de transacciones</p>
              <p className="text-2xl font-bold text-purple-900">{gastosFiltrados.length}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}