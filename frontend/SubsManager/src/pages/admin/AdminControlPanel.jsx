import DashboardLayout from "../../components/DashboardLayout";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";

export default function AdminDashboard() {
  const userCount = 120;

  const subscriptionsByService = [
    { service: "Netflix", count: 45 },
    { service: "Spotify", count: 30 },
    { service: "Dropbox", count: 20 },
    { service: "HBO Max", count: 25 },
  ];

  const incomeByMonth = [
    { x: "Ene", y: 200 },
    { x: "Feb", y: 400 },
    { x: "Mar", y: 300 },
    { x: "Abr", y: 500 },
    { x: "May", y: 450 },
  ];

  const subscriptionStatus = [
    { id: "Activas", label: "Activas", value: 70 },
    { id: "Inactivas", label: "Inactivas", value: 30 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-10">
        <h1 className="text-2xl font-bold">Panel de Control del Administrador</h1>

        {/* Número de usuarios */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Usuarios Totales</h2>
          <div className="text-4xl font-bold text-blue-600">{userCount}</div>
        </div>

        {/* Servicios más suscritos */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Servicios más suscritos</h2>
          <div className="h-64">
            <ResponsiveBar
              data={subscriptionsByService}
              keys={["count"]}
              indexBy="service"
              margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
              padding={0.3}
              colors={{ scheme: "nivo" }}
              axisBottom={{ tickRotation: -20 }}
              animate={true}
            />
          </div>
        </div>

        {/* Ingresos por mes */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ingresos por mes ($)</h2>
          <div className="h-64">
            <ResponsiveLine
              data={[
                {
                  id: "Ingresos",
                  data: incomeByMonth,
                },
              ]}
              margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              axisBottom={{ legend: "Mes", legendPosition: "middle", legendOffset: 40 }}
              axisLeft={{ legend: "USD", legendPosition: "middle", legendOffset: -50 }}
              colors={{ scheme: "category10" }}
              pointSize={10}
              useMesh={true}
            />
          </div>
        </div>

        {/* Activas vs inactivas */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Suscripciones</h2>
          <div className="h-64">
            <ResponsivePie
              data={subscriptionStatus}
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: "paired" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
