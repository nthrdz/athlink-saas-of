"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Tag,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Plus,
} from "lucide-react";

interface AmbassadorDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  commissionRate: number;
  commissionType: string;
  totalReferrals: number;
  totalRevenue: number;
  totalCommission: number;
  notes: string | null;
  createdAt: string;
  promoCodes: any[];
  usages: any[];
  commissions: any[];
}

export default function AmbassadorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ambassadorId = params.id as string;

  const [ambassador, setAmbassador] = useState<AmbassadorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 20,
    applicablePlans: [] as string[],
    maxUses: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (ambassadorId) {
      fetchAmbassadorDetails();
    }
  }, [ambassadorId]);

  const fetchAmbassadorDetails = async () => {
    try {
      const response = await fetch(`/api/admin/ambassadors/${ambassadorId}`);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Accès non autorisé");
          router.push("/dashboard");
          return;
        }
        throw new Error("Erreur lors du chargement");
      }

      const data = await response.json();
      setAmbassador(data);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async () => {
    if (!newPromoCode.code) {
      toast.error("Le code est requis");
      return;
    }

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambassadorId,
          code: newPromoCode.code.toUpperCase(),
          description: newPromoCode.description,
          discountType: newPromoCode.discountType,
          discountValue: newPromoCode.discountValue,
          applicablePlans: newPromoCode.applicablePlans,
          maxUses: newPromoCode.maxUses ? parseInt(newPromoCode.maxUses) : null,
          expiresAt: newPromoCode.expiresAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      toast.success("Code promo créé avec succès");
      setShowCreateCodeModal(false);
      setNewPromoCode({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 20,
        applicablePlans: [],
        maxUses: "",
        expiresAt: "",
      });
      fetchAmbassadorDetails();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePlan = (plan: string) => {
    setNewPromoCode((prev) => ({
      ...prev,
      applicablePlans: prev.applicablePlans.includes(plan)
        ? prev.applicablePlans.filter((p) => p !== plan)
        : [...prev.applicablePlans, plan],
    }));
  };

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

  if (!ambassador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ambassadeur non trouvé</p>
          <button
            onClick={() => router.push("/admin/ambassadors")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <button
          onClick={() => router.push("/admin/ambassadors")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux ambassadeurs
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {ambassador.name}
              </h1>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {ambassador.email}
                </div>
                {ambassador.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {ambassador.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Membre depuis{" "}
                  {new Date(ambassador.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  ambassador.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {ambassador.status}
              </span>
              <span className="text-sm text-gray-600">
                Commission: {ambassador.commissionRate}% ({ambassador.commissionType})
              </span>
            </div>
          </div>

          {ambassador.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">{ambassador.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Conversions</p>
              <p className="text-3xl font-bold text-gray-900">
                {ambassador.totalReferrals}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Revenu Généré</p>
              <p className="text-3xl font-bold text-gray-900">
                {ambassador.totalRevenue.toFixed(2)}€
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Commissions</p>
              <p className="text-3xl font-bold text-gray-900">
                {ambassador.totalCommission.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Codes Promo</h2>
              <button
                onClick={() => setShowCreateCodeModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Nouveau Code
              </button>
            </div>
            <div className="space-y-3">
              {ambassador.promoCodes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun code promo créé
                </p>
              ) : (
                ambassador.promoCodes.map((code) => (
                  <div
                    key={code.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono font-bold text-lg text-gray-900">
                          {code.code}
                        </p>
                        {code.description && (
                          <p className="text-sm text-gray-600">{code.description}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          code.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {code.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span>
                        Réduction:{" "}
                        {code.discountType === "percentage"
                          ? `${code.discountValue}%`
                          : `${code.discountValue}€`}
                      </span>
                      <span>•</span>
                      <span>
                        Utilisations: {code.currentUses}
                        {code.maxUses && ` / ${code.maxUses}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Conversions Récentes
            </h2>
            <div className="space-y-3">
              {ambassador.usages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune conversion
                </p>
              ) : (
                ambassador.usages.slice(0, 10).map((usage) => (
                  <div
                    key={usage.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {usage.user.name || usage.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {usage.promoCode.code}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {usage.finalAmount.toFixed(2)}€
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span>{usage.planType}</span>
                      <span>•</span>
                      <span>{usage.billingCycle}</span>
                      <span>•</span>
                      <span>
                        {new Date(usage.usedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showCreateCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Nouveau Code Promo</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newPromoCode.code}
                    onChange={(e) =>
                      setNewPromoCode({
                        ...newPromoCode,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ATHLETE20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newPromoCode.description}
                    onChange={(e) =>
                      setNewPromoCode({
                        ...newPromoCode,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de réduction
                  </label>
                  <select
                    value={newPromoCode.discountType}
                    onChange={(e) =>
                      setNewPromoCode({
                        ...newPromoCode,
                        discountType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed_amount">Montant fixe (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur de la réduction *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPromoCode.discountValue}
                    onChange={(e) =>
                      setNewPromoCode({
                        ...newPromoCode,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plans applicables (laisser vide = tous)
                  </label>
                  <div className="space-y-2">
                    {["PRO", "ELITE"].map((plan) => (
                      <label key={plan} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newPromoCode.applicablePlans.includes(plan)}
                          onChange={() => togglePlan(plan)}
                          className="mr-2"
                        />
                        {plan}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max d'utilisations
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPromoCode.maxUses}
                    onChange={(e) =>
                      setNewPromoCode({ ...newPromoCode, maxUses: e.target.value })
                    }
                    placeholder="Illimité"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="datetime-local"
                    value={newPromoCode.expiresAt}
                    onChange={(e) =>
                      setNewPromoCode({
                        ...newPromoCode,
                        expiresAt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateCodeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreatePromoCode}
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
