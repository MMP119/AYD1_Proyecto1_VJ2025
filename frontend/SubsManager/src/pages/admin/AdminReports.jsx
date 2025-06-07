import DashboardLayout from "../../components/DashboardLayout";
import { FiUser, FiLayers, FiDollarSign, FiDownload } from "react-icons/fi";
import { BsFillBarChartFill } from "react-icons/bs";

export default function AdminReports() {
  // Datos simulados
  //const subscriptions = [
  //{ user: "Ana", service: "Netflix", category: "Streaming", price: 10.99 },
  //{ user: "Luis", service: "Dropbox", category: "Almacenamiento", price: 99.99 },
  //{ user: "Ana", service: "Spotify", category: "Streaming", price: 5.99 },
  //{ user: "María", service: "Netflix", category: "Streaming", price: 10.99 },
  //{ user: "Luis", service: "HBO Max", category: "Streaming", price: 8.99 },
  //];

  // Función para descargar HTML
  const downloadHTML = (content, filename) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Estilos CSS para todos los reportes
  const getHTMLStyles = () => `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
      h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
      h2 { color: #2980b9; margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .total-box { background: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0; }
      .logo { text-align: center; margin-bottom: 20px; }
      .summary-card { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
  `;

  // ===== REPORTE 1: Suscripciones por usuario =====
  const generateUserReport = async () => {
  try {
    // Hacer la solicitud GET al endpoint de backend
    const response = await fetch("http://localhost:8000/admin/reportes/suscripciones-por-usuario");
    
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("No se pudo obtener el reporte desde el servidor.");
    }

    // Obtener los datos del reporte
    const data = await response.json();

    // Si no hay datos, mostrar un mensaje
    if (data.total_registros === 0) {
      alert("No hay registros disponibles para generar el reporte.");
      return;
    }

    // Agrupar las suscripciones por usuario
    const grouped = data.data.reduce((acc, sub) => {
      acc[sub.Usuario] = acc[sub.Usuario] ? [...acc[sub.Usuario], sub] : [sub];
      return acc;
    }, {});

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte por Usuario</title>
        ${getHTMLStyles()}
      </head>
      <body>
        <div class="logo">
          <h1>Reporte por Usuario</h1>
          <p>Generado el ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    // Iterar sobre los usuarios agrupados
    Object.entries(grouped).forEach(([user, subs]) => {
      const totalUser = subs.reduce((sum, sub) => sum + sub.price, 0);

      htmlContent += `
        <div class="summary-card">
          <h2>${user}</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Categoría</th>
              <th>Tipo De Plan</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Agregar las suscripciones a la tabla
      subs.forEach((sub) => {
        htmlContent += `
            <tr>
              <td>${sub.Servicio}</td>
              <td>${sub.Categoria}</td>
              <td>${sub.TipoPlan}</td> <!-- Asegúrate de mostrar el campo correcto -->
              <td>${sub.Estado}</td>
            </tr>
        `;
      });

      htmlContent += `</tbody></table>`;
    });

    htmlContent += `</body></html>`;
    downloadHTML(htmlContent, "reporte_usuarios");

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    alert("Hubo un error al generar el reporte.");
  }
};

  // ===== REPORTE 2: Suscripciones por categoría =====
const generateCategoryReport = async () => {
  try {
    // Hacer la solicitud GET al endpoint de backend
    const response = await fetch("http://localhost:8000/admin/reportes/suscripciones-por-categoria");

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("No se pudo obtener el reporte desde el servidor.");
    }

    // Obtener los datos del reporte
    const data = await response.json();

    // Si no hay datos, mostrar un mensaje
    if (data.total_registros === 0) {
      alert("No hay registros disponibles para generar el reporte.");
      return;
    }

    // Agrupar las suscripciones por categoría
    const grouped = data.data.reduce((acc, sub) => {
      acc[sub.Categoria] = acc[sub.Categoria] ? [...acc[sub.Categoria], sub] : [sub];
      return acc;
    }, {});

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte por Categoría</title>
        ${getHTMLStyles()}
      </head>
      <body>
        <div class="logo">
          <h1>Reporte por Categoría</h1>
          <p>Generado el ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    // Iterar sobre las categorías agrupadas
    Object.entries(grouped).forEach(([category, subs]) => {
      const totalCategory = subs.reduce((sum, sub) => sum + sub.IngresosPorServicio, 0);

      htmlContent += `
        <div class="summary-card">
          <h2>${category}</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Suscripciones Totales</th>
              <th>Activas</th>
              <th>Canceladas</th>
              <th>Expiradas</th>
              <th>Ingresos por Servicio</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Agregar los servicios de cada categoría
      subs.forEach((sub) => {
        htmlContent += `
            <tr>
              <td>${sub.Servicio}</td>
              <td>${sub.TotalSuscripciones}</td>
              <td>${sub.Activas}</td>
              <td>${sub.Canceladas}</td>
              <td>${sub.Expiradas}</td>
              <td>${sub.IngresosPorServicio.toFixed(2)}</td>
            </tr>
        `;
      });

      htmlContent += `</tbody></table>`;
    });

    htmlContent += `</body></html>`;
    downloadHTML(htmlContent, "reporte_categorias");

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    alert("Hubo un error al generar el reporte.");
  }
};


  // ===== REPORTE 3: Total de ingresos =====
const generateIncomeReport = async () => {
  try {
    // Hacer la solicitud GET al endpoint de backend
    const response = await fetch("http://localhost:8000/admin/reportes/total-ingresos");

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("No se pudo obtener el reporte desde el servidor.");
    }

    // Obtener los datos del reporte
    const data = await response.json();

    // Si no hay datos, mostrar un mensaje
    if (data.total_registros === 0) {
      alert("No hay registros disponibles para generar el reporte.");
      return;
    }

    // Calcular total de ingresos y promedio por usuario
    const total = data.estadisticas.ingresos_totales;
    const avgPerUser = total / new Set(data.data.map(sub => sub.Servicio)).size;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Ingresos</title>
        ${getHTMLStyles()}
      </head>
      <body>
        <div class="logo">
          <h1>Reporte de Ingresos</h1>
          <p>Generado el ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="total-box">
          <h2>Resumen Financiero</h2>
          <p><strong>Total ingresos:</strong> ${total.toFixed(2)}</p>
          <p><strong>Suscripciones activas:</strong> ${data.estadisticas.total_suscripciones}</p>
          <p><strong>Ingreso promedio por servicio:</strong> ${avgPerUser.toFixed(2)}</p>
        </div>
        
        <h2>Detalle por Servicio</h2>
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Categoría</th>
              <th>Total Suscripciones</th>
              <th>Ingresos Totales</th>
              <th>Promedio Ingreso</th>
            </tr>
          </thead>
          <tbody>
            ${data.data
              .map(
                (sub) => `
              <tr>
                <td>${sub.Servicio}</td>
                <td>${sub.Categoria}</td>
                <td>${sub.TotalSuscripciones}</td>
                <td>${sub.IngresosTotales.toFixed(2)}</td>
                <td>${sub.PromedioIngreso.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadHTML(htmlContent, "reporte_ingresos");

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    alert("Hubo un error al generar el reporte.");
  }
};

// ===== REPORTE 4: Resumen Estadistico =====
const generateSummaryReport = async () => {
  try {
    // Hacer la solicitud GET al endpoint de resumen
    const response = await fetch("http://localhost:8000/admin/reportes/resumen");

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("No se pudo obtener el resumen desde el servidor.");
    }

    // Obtener los datos del resumen
    const data = await response.json();

    // Si no hay datos, mostrar un mensaje
    if (!data.success || !data.data) {
      alert("No hay datos disponibles para generar el reporte.");
      return;
    }

    // Resumen general
    const { usuarios, servicios, suscripciones, ingresos, top_categorias } = data.data;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resumen de Reportes</title>
        ${getHTMLStyles()}
      </head>
      <body>
        <div class="logo">
          <h1>Resumen General de Reportes</h1>
          <p>Generado el ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary-box">
          <h2>Resumen General</h2>
          <p><strong>Total de usuarios:</strong> ${usuarios.total}</p>
          <p><strong>Total de servicios:</strong> ${servicios.total}</p>
          <p><strong>Total de suscripciones:</strong> ${suscripciones.total}</p>
          <p><strong>Suscripciones activas:</strong> ${suscripciones.activas}</p>
          <p><strong>Suscripciones inactivas:</strong> ${suscripciones.inactivas}</p>
          <p><strong>Ingresos totales:</strong> ${ingresos.total.toFixed(2)}</p>
          <p><strong>Ingreso promedio por suscripción:</strong> ${ingresos.promedio_por_suscripcion.toFixed(2)}</p>
        </div>
        
        <h2>Categorías Más Populares</h2>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Suscripciones</th>
            </tr>
          </thead>
          <tbody>
            ${top_categorias
              .map(
                (category) => `
              <tr>
                <td>${category.Category}</td>
                <td>${category.total}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Descargar el reporte en formato HTML
    downloadHTML(htmlContent, "reporte_resumen");

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    alert("Hubo un error al generar el reporte.");
  }
};

  // ===== INTERFAZ =====
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Generar Reportes</h1>
        <p className="text-gray-600">Descarga informes detallados en formato HTML.</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Reporte por Usuario */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Suscripciones por Usuario</h3>
                <p className="text-sm text-gray-500">Agrupado por cliente</p>
              </div>
            </div>
            <button
              onClick={generateUserReport}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload />
              <span>Descargar HTML</span>
            </button>
          </div>

          {/* Reporte por Categoría */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FiLayers className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Suscripciones por Categoría</h3>
                <p className="text-sm text-gray-500">Agrupado por tipo de servicio</p>
              </div>
            </div>
            <button
              onClick={generateCategoryReport}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload />
              <span>Descargar HTML</span>
            </button>
          </div>

          {/* Reporte de Ingresos */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Total de Ingresos</h3>
                <p className="text-sm text-gray-500">Resumen financiero</p>
              </div>
            </div>
            <button
              onClick={generateIncomeReport}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload />
              <span>Descargar HTML</span>
            </button>
          </div>
          
           {/* Resumen */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <BsFillBarChartFill  className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resumen</h3>
                <p className="text-sm text-gray-500">Resumen Estadistico</p>
              </div>
            </div>
            <button
              onClick={generateSummaryReport}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload />
              <span>Descargar HTML</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}