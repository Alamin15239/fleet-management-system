'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Wrench, Plus, Edit, Eye, Search, Filter, Calendar as CalendarIcon, Truck, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, type CurrencySettings } from '@/lib/currency'
import { CurrencyInput } from '@/components/ui/currency-input'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { MaintenanceJobSelector } from '@/components/maintenance-job-selector'

interface MaintenanceJob {
  id: string
  name: string
  category: string
  parts?: string
  notes?: string
  isActive: boolean
}

interface Truck {
  id: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
}

interface MaintenanceRecord {
  id: string
  truckId: string
  serviceType: string
  description?: string
  datePerformed: string
  partsCost: number
  laborCost: number
  totalCost: number
  mechanicId?: string
  mechanic?: {
    id: string
    name: string
    email: string
  }
  nextServiceDue?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  isOilChange?: boolean
  oilChangeInterval?: number
  currentMileage?: number
  maintenanceJobId?: string
  maintenanceJob?: MaintenanceJob
  createdAt: string
  updatedAt: string
  truck: Truck
}

interface Mechanic {
  id: string
  name: string
  email: string
}

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [truckFilter, setTruckFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [viewingRecord, setViewingRecord] = useState<MaintenanceRecord | null>(null)
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null)
  
  const [formData, setFormData] = useState({
    truckId: '',
    serviceType: '',
    description: '',
    datePerformed: new Date().toISOString().split('T')[0],
    partsCost: 0,
    laborCost: 0,
    mechanicId: 'none',
    nextServiceDue: '',
    status: 'SCHEDULED' as const,
    notes: '',
    isOilChange: false,
    oilChangeInterval: 5000, // Default 5000 km
    currentMileage: 0,
    maintenanceJobId: ''
  })

  useEffect(() => {
    fetchMaintenanceRecords()
    fetchTrucks()
    fetchMechanics()
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

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await apiGet('/api/maintenance')
      if (response.ok) {
        const data = await response.json()
        setMaintenanceRecords(data)
      } else {
        toast.error('Failed to fetch maintenance records')
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error)
      toast.error('Failed to fetch maintenance records')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrucks = async () => {
    try {
      const response = await apiGet('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        setTrucks(data)
      } else {
        toast.error('Failed to fetch trucks')
      }
    } catch (error) {
      console.error('Error fetching trucks:', error)
      toast.error('Failed to fetch trucks')
    }
  }

  const fetchMechanics = async () => {
    try {
      const response = await apiGet('/api/mechanics')
      if (response.ok) {
        const data = await response.json()
        setMechanics(data)
      } else {
        // If no mechanics endpoint or no mechanics, set empty array
        setMechanics([])
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error)
      setMechanics([]) // Don't show error for mechanics as it's optional
    }
  }

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.truck.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesTruck = truckFilter === 'all' || record.truckId === truckFilter
    
    return matchesSearch && matchesStatus && matchesTruck
  })

  const formatCurrencyWithSettings = (amount: number): string => {
    if (!currencySettings) return amount.toString()
    return formatCurrency(amount, currencySettings)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Brakes': 'bg-red-100 text-red-800',
      'Electrical': 'bg-yellow-100 text-yellow-800',
      'Suspension': 'bg-blue-100 text-blue-800',
      'Engine': 'bg-green-100 text-green-800',
      'Drivetrain': 'bg-purple-100 text-purple-800',
      'Cooling': 'bg-cyan-100 text-cyan-800',
      'Fuel System': 'bg-orange-100 text-orange-800',
      'Exhaust': 'bg-gray-100 text-gray-800',
      'Tires': 'bg-indigo-100 text-indigo-800',
      'Welding': 'bg-pink-100 text-pink-800',
      'Body': 'bg-teal-100 text-teal-800',
      'Steering': 'bg-lime-100 text-lime-800',
      'Hydraulics': 'bg-amber-100 text-amber-800',
      'General': 'bg-slate-100 text-slate-800',
      'Tanker Trailer': 'bg-emerald-100 text-emerald-800',
      'Trailer Body': 'bg-violet-100 text-violet-800',
      'Trailer Coupling': 'bg-fuchsia-100 text-fuchsia-800',
      'Cooling/Heating': 'bg-sky-100 text-sky-800',
      'Recovery/Equipment': 'bg-rose-100 text-rose-800',
      'Preventive': 'bg-lavender-100 text-lavender-800',
      'Tires/Suspension': 'bg-mint-100 text-mint-800',
      'Welding/Coupling': 'bg-salmon-100 text-salmon-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const totalCost = (formData.partsCost || 0) + (formData.laborCost || 0)
      
      // Calculate next service due date for oil changes
      let nextServiceDue = formData.nextServiceDue
      if (formData.isOilChange && formData.currentMileage && formData.oilChangeInterval) {
        const nextOilChangeMileage = formData.currentMileage + formData.oilChangeInterval
        const nextOilChangeDate = new Date()
        nextOilChangeDate.setDate(nextOilChangeDate.getDate() + 90) // Estimate 90 days for oil change interval
        nextServiceDue = nextOilChangeDate.toISOString().split('T')[0]
      }
      
      const payload = {
        ...formData,
        mechanicId: formData.mechanicId === "none" ? null : formData.mechanicId,
        totalCost,
        nextServiceDue
      }
      
      const url = editingRecord ? `/api/maintenance/${editingRecord.id}` : '/api/maintenance'
      const method = editingRecord ? apiPut : apiPost
      
      const response = await method(url, payload)

      if (response.ok) {
        if (editingRecord) {
          toast.success('Maintenance record updated successfully')
        } else {
          toast.success('Maintenance record added successfully')
          if (formData.isOilChange) {
            toast.info('Next oil change date has been calculated and set')
          }
        }
        setIsDialogOpen(false)
        resetForm()
        fetchMaintenanceRecords() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save maintenance record')
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error)
      toast.error('Failed to save maintenance record')
    }
  }

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record)
    setSelectedJob(record.maintenanceJob || null)
    setFormData({
      truckId: record.truckId,
      serviceType: record.serviceType,
      description: record.description || '',
      datePerformed: record.datePerformed,
      partsCost: record.partsCost,
      laborCost: record.laborCost,
      mechanicId: record.mechanicId || 'none',
      nextServiceDue: record.nextServiceDue || '',
      status: record.status,
      notes: record.notes || '',
      isOilChange: record.isOilChange || false,
      oilChangeInterval: record.oilChangeInterval || 5000,
      currentMileage: record.currentMileage || 0,
      maintenanceJobId: record.maintenanceJobId || ''
    })
    setIsDialogOpen(true)
  }

  const handleJobSelect = (job: MaintenanceJob) => {
    setSelectedJob(job)
    setFormData({
      ...formData,
      serviceType: job.name,
      description: job.parts || '',
      maintenanceJobId: job.id
    })
  }

  const handleView = (record: MaintenanceRecord) => {
    setViewingRecord(record)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setEditingRecord(null)
    setViewingRecord(null)
    setSelectedJob(null)
    setFormData({
      truckId: '',
      serviceType: '',
      description: '',
      datePerformed: new Date().toISOString().split('T')[0],
      partsCost: 0,
      laborCost: 0,
      mechanicId: 'none',
      nextServiceDue: '',
      status: 'SCHEDULED',
      notes: '',
      isOilChange: false,
      oilChangeInterval: 5000,
      currentMileage: 0,
      maintenanceJobId: ''
    })
  }

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const response = await apiDelete(`/api/maintenance/${recordId}`)

        if (response.ok) {
          toast.success('Maintenance record deleted successfully')
          fetchMaintenanceRecords() // Refresh the list
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to delete maintenance record')
        }
      } catch (error) {
        console.error('Error deleting maintenance record:', error)
        toast.error('Failed to delete maintenance record')
      }
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
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Tracking</h1>
          <p className="text-muted-foreground">Track and manage vehicle maintenance records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update the maintenance record below.' : 'Enter the details for the new maintenance record.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="truckId" className="text-right">
                  Truck
                </Label>
                <Select value={formData.truckId} onValueChange={(value) => setFormData({...formData, truckId: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {trucks.map((truck) => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.year} {truck.make} {truck.model} - {truck.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Service Type
                </Label>
                <div className="col-span-3 space-y-2">
                  <MaintenanceJobSelector
                    onSelectJob={handleJobSelect}
                    selectedJob={selectedJob}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {selectedJob ? selectedJob.name : 'Select predefined job (optional)'}
                    </Button>
                  </MaintenanceJobSelector>
                  <Input
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    placeholder="Or enter custom service type"
                    className="w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isOilChange" className="text-right">
                  Oil Change Service
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <input
                    type="checkbox"
                    id="isOilChange"
                    checked={formData.isOilChange}
                    onChange={(e) => setFormData({...formData, isOilChange: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isOilChange">This is an oil change service</Label>
                </div>
              </div>
              
              {formData.isOilChange && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="oilChangeInterval" className="text-right">
                      Oil Change Interval (km)
                    </Label>
                    <Input
                      id="oilChangeInterval"
                      type="number"
                      value={formData.oilChangeInterval}
                      onChange={(e) => setFormData({...formData, oilChangeInterval: parseInt(e.target.value) || 5000})}
                      className="col-span-3"
                      step="1000"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currentMileage" className="text-right">
                      Current Mileage (km)
                    </Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      value={formData.currentMileage}
                      onChange={(e) => setFormData({...formData, currentMileage: parseInt(e.target.value) || 0})}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="datePerformed" className="text-right">
                  Date Performed
                </Label>
                <Input
                  id="datePerformed"
                  type="date"
                  value={formData.datePerformed}
                  onChange={(e) => setFormData({...formData, datePerformed: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mechanicId" className="text-right">
                  Mechanic
                </Label>
                <Select value={formData.mechanicId} onValueChange={(value) => setFormData({...formData, mechanicId: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select mechanic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Mechanic</SelectItem>
                    {mechanics.map((mechanic) => (
                      <SelectItem key={mechanic.id} value={mechanic.id}>
                        {mechanic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="partsCost" className="text-right">
                  Parts Cost
                </Label>
                <div className="col-span-3">
                  <CurrencyInput
                    id="partsCost"
                    value={formData.partsCost}
                    onChange={(value) => setFormData({...formData, partsCost: value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="laborCost" className="text-right">
                  Labor Cost
                </Label>
                <div className="col-span-3">
                  <CurrencyInput
                    id="laborCost"
                    value={formData.laborCost}
                    onChange={(value) => setFormData({...formData, laborCost: value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nextServiceDue" className="text-right">
                  Next Service Due
                </Label>
                <Input
                  id="nextServiceDue"
                  type="date"
                  value={formData.nextServiceDue}
                  onChange={(e) => setFormData({...formData, nextServiceDue: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Maintenance Record Details</DialogTitle>
            <DialogDescription>
              View the complete maintenance record information
            </DialogDescription>
          </DialogHeader>
          {viewingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Truck</Label>
                  <p className="text-lg font-semibold">
                    {viewingRecord.truck.year} {viewingRecord.truck.make} {viewingRecord.truck.model}
                  </p>
                  <p className="text-sm text-gray-600">{viewingRecord.truck.licensePlate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service Type</Label>
                  <p className="text-lg font-semibold">{viewingRecord.serviceType}</p>
                  {viewingRecord.isOilChange && (
                    <Badge variant="secondary" className="mt-1">
                      Oil Change
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date Performed</Label>
                  <p className="text-lg">{new Date(viewingRecord.datePerformed).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(viewingRecord.status)}>
                    {viewingRecord.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {viewingRecord.mechanic && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Mechanic</Label>
                  <p className="text-lg">{viewingRecord.mechanic.name}</p>
                  <p className="text-sm text-gray-600">{viewingRecord.mechanic.email}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Parts Cost</Label>
                  <p className="text-lg font-semibold">{formatCurrencyWithSettings(viewingRecord.partsCost)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Labor Cost</Label>
                  <p className="text-lg font-semibold">{formatCurrencyWithSettings(viewingRecord.laborCost)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Cost</Label>
                  <p className="text-lg font-semibold text-green-600">{formatCurrencyWithSettings(viewingRecord.totalCost)}</p>
                </div>
              </div>

              {viewingRecord.isOilChange && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Oil Change Interval</Label>
                    <p className="text-lg">{viewingRecord.oilChangeInterval || 5000} km</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Current Mileage</Label>
                    <p className="text-lg">{viewingRecord.currentMileage || 0} km</p>
                  </div>
                </div>
              )}

              {viewingRecord.nextServiceDue && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Next Service Due</Label>
                  <p className="text-lg">{new Date(viewingRecord.nextServiceDue).toLocaleDateString()}</p>
                </div>
              )}

              {viewingRecord.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-sm mt-1">{viewingRecord.description}</p>
                </div>
              )}

              {viewingRecord.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm mt-1">{viewingRecord.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label>Created</Label>
                  <p>{new Date(viewingRecord.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{new Date(viewingRecord.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by service type, truck make/model, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={truckFilter} onValueChange={setTruckFilter}>
              <SelectTrigger className="w-[200px]">
                <Truck className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by truck" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trucks</SelectItem>
                {trucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.id}>
                    {truck.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {maintenanceRecords.length} maintenance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{format(new Date(record.datePerformed), 'MMM dd, yyyy')}</div>
                        {record.nextServiceDue && (
                          <div className="text-sm text-muted-foreground">
                            Next: {format(new Date(record.nextServiceDue), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{record.serviceType}</span>
                        {record.isOilChange && (
                          <Badge variant="secondary" className="text-xs">
                            🛢️ Oil Change
                          </Badge>
                        )}
                      </div>
                      {record.description && (
                        <div className="text-sm text-muted-foreground">
                          {record.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.maintenanceJob && (
                        <Badge className={getCategoryColor(record.maintenanceJob.category)}>
                          {record.maintenanceJob.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.truck.year} {record.truck.make} {record.truck.model}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.truck.licensePlate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.mechanic ? (
                        <div>
                          <div className="font-medium">{record.mechanic.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.mechanic.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No Mechanic</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrencyWithSettings(record.totalCost)}</div>
                        <div className="text-sm text-muted-foreground">
                          Parts: {formatCurrencyWithSettings(record.partsCost)} • Labor: {formatCurrencyWithSettings(record.laborCost)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(record)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}