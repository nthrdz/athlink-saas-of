"use client"

import { useMemo } from "react"
import HeatMap from "@uiw/react-heat-map"
import Tooltip from "@uiw/react-tooltip"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Eye, MousePointer } from "lucide-react"

interface CalendarHeatmapProps {
  viewsByDate: Array<{ date: string; views: number; uniqueViews: number; clicks: number }>
  timeRange: string
  className?: string
}

export function CalendarHeatmap({ viewsByDate, timeRange, className }: CalendarHeatmapProps) {
  // Préparer les données pour la heatmap
  const heatmapData = useMemo(() => {
    return viewsByDate.map(day => ({
      date: day.date,
      count: day.views,
      content: `${day.views} vues | ${day.uniqueViews} visiteurs uniques | ${day.clicks ?? 0} clics`
    }))
  }, [viewsByDate])

  // Calculer les stats
  const stats = useMemo(() => {
    const totalViews = viewsByDate.reduce((sum, day) => sum + day.views, 0)
    const totalUniqueViews = viewsByDate.reduce((sum, day) => sum + day.uniqueViews, 0)
    const totalClicks = viewsByDate.reduce((sum, day) => sum + (day.clicks ?? 0), 0)
    const avgViewsPerDay = viewsByDate.length > 0 ? (totalViews / viewsByDate.length).toFixed(1) : "0"
    const maxViewsDay = viewsByDate.reduce((max, day) => day.views > max.views ? day : max, { date: "", views: 0, uniqueViews: 0, clicks: 0 })
    
    return {
      totalViews,
      totalUniqueViews,
      totalClicks,
      avgViewsPerDay,
      maxViewsDay,
      activeDays: viewsByDate.filter(day => day.views > 0).length
    }
  }, [viewsByDate])

  // Calculer la date de début
  const startDate = useMemo(() => {
    if (viewsByDate.length === 0) return new Date()
    const firstDate = new Date(viewsByDate[0].date)
    return firstDate
  }, [viewsByDate])

  // Calculer la date de fin
  const endDate = useMemo(() => {
    if (viewsByDate.length === 0) return new Date()
    const lastDate = new Date(viewsByDate[viewsByDate.length - 1].date)
    return lastDate
  }, [viewsByDate])

  return (
    <div className={className}>
      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de vues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString('fr-FR')}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Moyenne/jour</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgViewsPerDay}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jours actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeDays}/{viewsByDate.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Record du jour</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maxViewsDay.views}</p>
                  <p className="text-xs text-gray-500">{stats.maxViewsDay.date ? new Date(stats.maxViewsDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'N/A'}</p>
                </div>
                <MousePointer className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Heatmap calendrier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Activité quotidienne
            </CardTitle>
            <p className="text-sm text-gray-600">
              {timeRange === "24h" && "Dernières 24 heures"}
              {timeRange === "7d" && "7 derniers jours"}
              {timeRange === "30d" && "30 derniers jours"}
              {timeRange === "90d" && "90 derniers jours"}
              {timeRange === "1y" && "Dernière année"}
            </p>
          </CardHeader>
          <CardContent>
            {heatmapData.length > 0 ? (
              <div className="flex justify-center overflow-x-auto pb-4">
                <HeatMap
                  value={heatmapData}
                  startDate={startDate}
                  endDate={endDate}
                  width="100%"
                  rectSize={14}
                  space={3}
                  rectProps={{
                    rx: 3
                  }}
                  panelColors={{
                    0: '#ebedf0',
                    2: '#c6e48b',
                    4: '#7bc96f',
                    10: '#239a3b',
                    20: '#196127'
                  }}
                  rectRender={(props, data) => {
                    return (
                      <Tooltip key={props.key} placement="top" content={data.content || 'Aucune donnée'}>
                        <rect {...props} />
                      </Tooltip>
                    )
                  }}
                  legendCellSize={0}
                  monthLabels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  weekLabels={['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Aucune donnée disponible pour cette période</p>
                </div>
              </div>
            )}

            {/* Légende */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Moins actif</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ebedf0' }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#c6e48b' }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7bc96f' }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#239a3b' }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#196127' }} />
                </div>
                <span>Plus actif</span>
              </div>
            </div>

            {/* Insights */}
            {stats.activeDays > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 Insights</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Vous avez eu de l'activité sur {stats.activeDays} jours sur {viewsByDate.length}</p>
                  <p>• Votre meilleur jour était le {stats.maxViewsDay.date ? new Date(stats.maxViewsDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'N/A'} avec {stats.maxViewsDay.views} vues</p>
                  <p>• En moyenne, vous générez {stats.avgViewsPerDay} vues par jour</p>
                  {parseFloat(stats.avgViewsPerDay) > 10 && <p>• 🔥 Excellente performance ! Votre profil attire régulièrement du monde</p>}
                  {stats.totalClicks > 50 && <p>• 🎯 Vos visiteurs sont engagés avec {stats.totalClicks} clics au total</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
