import { ShieldCheck } from "lucide-react"; 
import DashboardLayout from "../../components/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-200 via-green-100 to-white p-6 shadow-lg border border-green-300">
        <div className="flex items-center space-x-4">
          <div className="bg-green-600 text-white p-3 rounded-full shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-800">
              ¡Bienvenid@ al dashboard de usuarios!
            </h1>
            <p className="text-green-700 text-sm mt-1">
              Aquí puedes administrar tus suscripciones a distintos servicios de manera eficiente, segura y centralizada. 
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
