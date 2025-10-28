"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";

interface Ambassador {
  id: string;
  name: string;
  email: string;
  status: string;
  commissionRate: number;
  totalReferrals: number;
  totalRevenue: number;
  totalCommission: number;
  promoCodes: any[];
  createdAt: string;
}

export default function AmbassadorsAdminPage() {
  const router = useRouter();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAmbassador, setNewAmbassador] = useState({
    name: "",
    email: "",
    phone: "",
    commissionRate: 20,
    notes: "",
  });

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const response = await fetch("/api/admin/ambassadors");
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Accès non autorisé");
          router.push("/dashboard");
          return;
        }
        throw new Error("Erreur lors du chargement");
      }

      const data = await response.json();
      setAmbassadors(data);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Erreur lors du chargement des ambassadeurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmbassador = async () => {
    if (!newAmbassador.name || !newAmbassador.email) {
      toast.error("Nom et email requis");
      return;
    }

    try {
      const response = await fetch("/api/admin/ambassadors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAmbassador),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      toast.success("Ambassadeur créé avec succès");
      setShowCreateModal(false);
      setNewAmbassador({
        name: "",
        email: "",
        phone: "",
        commissionRate: 20,
        notes: "",
      });
      fetchAmbassadors();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAmbassador = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ambassadeur ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ambassadors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      toast.success("Ambassadeur supprimé");
      fetchAmbassadors();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredAmbassadors = ambassadors.filter(
    (amb) =>
      amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amb.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = ambassadors.reduce(
    (acc, amb) => ({
      referrals: acc.referrals + amb.totalReferrals,
      revenue: acc.revenue + amb.totalRevenue,
      commission: acc.commission + amb.totalCommission,
    }),
    { referrals: 0, revenue: 0, commission: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Ambassadeurs
          </h1>
          <p className="text-gray-600">
            Suivez et gérez vos ambassadeurs et leurs performances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ambassadeurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ambassadors.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.referrals}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.revenue.toFixed(2)}€
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.commission.toFixed(2)}€
                </p>
              </div>
              <Tag className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un ambassadeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Nouvel Ambassadeur
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambassadeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAmbassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ambassador.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ambassador.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ambassador.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ambassador.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ambassador.commissionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ambassador.promoCodes.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ambassador.totalReferrals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ambassador.totalRevenue.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/ambassadors/${ambassador.id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAmbassador(ambassador.id)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Nouvel Ambassadeur</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newAmbassador.name}
                    onChange={(e) =>
                      setNewAmbassador({ ...newAmbassador, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newAmbassador.email}
                    onChange={(e) =>
                      setNewAmbassador({ ...newAmbassador, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={newAmbassador.phone}
                    onChange={(e) =>
                      setNewAmbassador({ ...newAmbassador, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux de commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newAmbassador.commissionRate}
                    onChange={(e) =>
                      setNewAmbassador({
                        ...newAmbassador,
                        commissionRate: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newAmbassador.notes}
                    onChange={(e) =>
                      setNewAmbassador({ ...newAmbassador, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateAmbassador}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
