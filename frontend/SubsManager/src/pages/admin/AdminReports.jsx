import DashboardLayout from "../../components/DashboardLayout";
import { FiUser, FiLayers, FiDollarSign, FiDownload } from "react-icons/fi";

export default function AdminReports() {
  // Datos simulados
  const subscriptions = [
    { user: "Ana", service: "Netflix", category: "Streaming", price: 10.99 },
    { user: "Luis", service: "Dropbox", category: "Almacenamiento", price: 99.99 },
    { user: "Ana", service: "Spotify", category: "Streaming", price: 5.99 },
    { user: "María", service: "Netflix", category: "Streaming", price: 10.99 },
    { user: "Luis", service: "HBO Max", category: "Streaming", price: 8.99 },
  ];

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
  const generateUserReport = () => {
    const grouped = subscriptions.reduce((acc, sub) => {
      acc[sub.user] = acc[sub.user] ? [...acc[sub.user], sub] : [sub];
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

    Object.entries(grouped).forEach(([user, subs]) => {
      const totalUser = subs.reduce((sum, sub) => sum + sub.price, 0);

      htmlContent += `
        <div class="summary-card">
          <h2>${user}</h2>
          <p><strong>Total gastado:</strong> $${totalUser.toFixed(2)}</p>
          <p><strong>Suscripciones:</strong> ${subs.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Categoría</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
      `;

      subs.forEach((sub) => {
        htmlContent += `
            <tr>
              <td>${sub.service}</td>
              <td>${sub.category}</td>
              <td>$${sub.price.toFixed(2)}</td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    });

    htmlContent += `</body></html>`;
    downloadHTML(htmlContent, "reporte_usuarios");
  };

  // ===== REPORTE 2: Suscripciones por categoría =====
  const generateCategoryReport = () => {
    const grouped = subscriptions.reduce((acc, sub) => {
      acc[sub.category] = acc[sub.category] ? [...acc[sub.category], sub] : [sub];
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

    Object.entries(grouped).forEach(([category, subs]) => {
      const totalCategory = subs.reduce((sum, sub) => sum + sub.price, 0);

      htmlContent += `
        <div class="summary-card">
          <h2>${category}</h2>
          <p><strong>Total ingresos:</strong> $${totalCategory.toFixed(2)}</p>
          <p><strong>Suscripciones:</strong> ${subs.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Servicio</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
      `;

      subs.forEach((sub) => {
        htmlContent += `
            <tr>
              <td>${sub.user}</td>
              <td>${sub.service}</td>
              <td>$${sub.price.toFixed(2)}</td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    });

    htmlContent += `</body></html>`;
    downloadHTML(htmlContent, "reporte_categorias");
  };

  // ===== REPORTE 3: Total de ingresos =====
  const generateIncomeReport = () => {
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const avgPerUser = total / new Set(subscriptions.map(sub => sub.user)).size;

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
          <p><strong>Total ingresos:</strong> $${total.toFixed(2)}</p>
          <p><strong>Suscripciones activas:</strong> ${subscriptions.length}</p>
          <p><strong>Ingreso promedio por usuario:</strong> $${avgPerUser.toFixed(2)}</p>
        </div>
        
        <h2>Detalle por Servicio</h2>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Servicio</th>
              <th>Categoría</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${subscriptions
              .map(
                (sub) => `
              <tr>
                <td>${sub.user}</td>
                <td>${sub.service}</td>
                <td>${sub.category}</td>
                <td>$${sub.price.toFixed(2)}</td>
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
        </div>
      </div>
    </DashboardLayout>
  );
}