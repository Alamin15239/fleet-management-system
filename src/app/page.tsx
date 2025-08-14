'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Wrench, AlertTriangle, TrendingUp, Plus } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, type CurrencySettings } from '@/lib/currency'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'

interface DashboardStats {
  totalTrucks: number
  activeTrucks: number
  upcomingMaintenance: number
  overdueRepairs: number
  totalMaintenanceCost: number
}

interface Truck {
  id: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  currentMileage: number
  status: string
}

interface MaintenanceRecord {
  id: string
  truckId: string
  serviceType: string
  datePerformed: string
  totalCost: number
  status: string
  truck: Truck
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrucks: 0,
    activeTrucks: 0,
    upcomingMaintenance: 0,
    overdueRepairs: 0,
    totalMaintenanceCost: 0
  })
  
  const [recentTrucks, setRecentTrucks] = useState<Truck[]>([])
  const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceRecord[]>([])
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Add Truck Dialog State
  const [isAddTruckDialogOpen, setIsAddTruckDialogOpen] = useState(false)
  const [truckFormData, setTruckFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    currentMileage: 0,
    status: 'ACTIVE' as const
  })

  // Empty chart data for fresh start
  const monthlyCostData = [
    { month: 'Jan', cost: 0 },
    { month: 'Feb', cost: 0 },
    { month: 'Mar', cost: 0 },
    { month: 'Apr', cost: 0 },
    { month: 'May', cost: 0 },
    { month: 'Jun', cost: 0 },
  ]

  const maintenanceTypeData = [
    { type: 'Oil Change', count: 0 },
    { type: 'Tire Service', count: 0 },
    { type: 'Brake Repair', count: 0 },
    { type: 'Engine Service', count: 0 },
    { type: 'Other', count: 0 },
  ]

  useEffect(() => {
    fetchDashboardData()
    fetchCurrencySettings()
  }, [])

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/public')
      if (response.ok) {
        const data = await response.json()
        const settings: CurrencySettings = {
          currencySymbol: data.currencySymbol,
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          decimalPlaces: data.decimalPlaces,
          thousandsSeparator: data.thousandsSeparator,
          decimalSeparator: data.decimalSeparator,
          symbolPosition: data.symbolPosition
        }
        setCurrencySettings(settings)
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch trucks data
      const trucksResponse = await apiGet('/api/trucks')
      if (trucksResponse.ok) {
        const trucksData = await trucksResponse.json()
        setRecentTrucks(trucksData)
        
        // Calculate stats from trucks data
        const totalTrucks = trucksData.length
        const activeTrucks = trucksData.filter(truck => truck.status === 'ACTIVE').length
        const maintenanceTrucks = trucksData.filter(truck => truck.status === 'MAINTENANCE').length
        
        setStats(prev => ({
          ...prev,
          totalTrucks,
          activeTrucks,
          upcomingMaintenance: maintenanceTrucks
        }))
      }

      // Fetch maintenance records
      const maintenanceResponse = await apiGet('/api/maintenance')
      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json()
        setRecentMaintenance(maintenanceData)
        
        // Calculate total maintenance cost
        const totalCost = maintenanceData.reduce((sum, record) => sum + (record.totalCost || 0), 0)
        const overdueRepairs = maintenanceData.filter(record => record.status === 'OVERDUE').length
        
        setStats(prev => ({
          ...prev,
          totalMaintenanceCost: totalCost,
          overdueRepairs
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await apiPost('/api/trucks', truckFormData)

      if (response.ok) {
        toast.success('Truck added successfully')
        setIsAddTruckDialogOpen(false)
        resetTruckForm()
        fetchDashboardData() // Refresh dashboard data
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add truck')
      }
    } catch (error) {
      console.error('Error adding truck:', error)
      toast.error('Failed to add truck')
    }
  }

  const resetTruckForm = () => {
    setTruckFormData({
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      currentMileage: 0,
      status: 'ACTIVE'
    })
  }

  const formatCurrencyWithSettings = (amount: number): string => {
    if (!currencySettings) return amount.toString()
    return formatCurrency(amount, currencySettings)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Maintenance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your truck fleet maintenance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddTruckDialogOpen} onOpenChange={setIsAddTruckDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetTruckForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Truck
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Truck</DialogTitle>
                <DialogDescription>
                  Enter the details for the new truck.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTruck} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vin" className="text-right">
                    VIN
                  </Label>
                  <Input
                    id="vin"
                    value={truckFormData.vin}
                    onChange={(e) => setTruckFormData({...truckFormData, vin: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="make" className="text-right">
                    Make
                  </Label>
                  <Input
                    id="make"
                    value={truckFormData.make}
                    onChange={(e) => setTruckFormData({...truckFormData, make: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={truckFormData.model}
                    onChange={(e) => setTruckFormData({...truckFormData, model: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">
                    Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={truckFormData.year}
                    onChange={(e) => setTruckFormData({...truckFormData, year: parseInt(e.target.value)})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="licensePlate" className="text-right">
                    License Plate
                  </Label>
                  <Input
                    id="licensePlate"
                    value={truckFormData.licensePlate}
                    onChange={(e) => setTruckFormData({...truckFormData, licensePlate: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentMileage" className="text-right">
                    Mileage
                  </Label>
                  <Input
                    id="currentMileage"
                    type="number"
                    value={truckFormData.currentMileage}
                    onChange={(e) => setTruckFormData({...truckFormData, currentMileage: parseInt(e.target.value)})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select value={truckFormData.status} onValueChange={(value) => setTruckFormData({...truckFormData, status: value as any})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    Add Truck
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTrucks} active vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Due within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Repairs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueRepairs}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Maintenance Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyWithSettings(stats.totalMaintenanceCost / 6)}</div>
            <p className="text-xs text-muted-foreground">
              Average monthly cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost (6mo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyWithSettings(stats.totalMaintenanceCost)}</div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Maintenance Costs</CardTitle>
            <CardDescription>Cost trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Maintenance Types</CardTitle>
            <CardDescription>Distribution of service types</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="trucks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trucks">Recent Trucks</TabsTrigger>
          <TabsTrigger value="maintenance">Recent Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="trucks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Trucks</CardTitle>
              <CardDescription>Latest additions to your fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrucks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No trucks found</p>
                    <p>Add your first truck to get started with fleet management.</p>
                  </div>
                ) : (
                  recentTrucks.map((truck) => (
                    <div key={truck.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Truck className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{truck.year} {truck.make} {truck.model}</h3>
                          <p className="text-sm text-muted-foreground">
                            {truck.licensePlate} • {truck.currentMileage.toLocaleString()} miles
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(truck.status)}>
                        {truck.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Maintenance</CardTitle>
              <CardDescription>Latest maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMaintenance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No maintenance records found</p>
                    <p>Schedule your first maintenance to start tracking service history.</p>
                  </div>
                ) : (
                  recentMaintenance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Wrench className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{record.serviceType}</h3>
                          <p className="text-sm text-muted-foreground">
                            {record.truck.year} {record.truck.make} {record.truck.model} • {record.truck.licensePlate}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.datePerformed).toLocaleDateString()} • {formatCurrencyWithSettings(record.totalCost)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getMaintenanceStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}