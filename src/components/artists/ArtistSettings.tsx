import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  Settings,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArtistService, ArtistAvailability, ServiceCategory } from '../../types/booking';
import LoadingScreen from '../LoadingScreen';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'tattoo',
  'piercing',
  'consultation',
  'touchup',
  'custom'
];

export default function ArtistSettings() {
  const { user } = useAuth();
  const { 
    artistServices,
    availability,
    loading,
    createService,
    updateService,
    deleteService,
    updateAvailability
  } = useBooking();

  const [editingService, setEditingService] = useState<ArtistService | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<number | null>(null);

  if (loading) return <LoadingScreen />;
  if (!user || user.role?.type !== 'artist') {
    return (
      <div className="p-4 text-red-500">
        Must be logged in as an artist to view this page
      </div>
    );
  }

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const serviceData = {
      artistId: user.id, // Add artistId to the service data
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      duration: parseInt(formData.get('duration') as string),
      price: parseFloat(formData.get('price') as string),
      deposit: parseFloat(formData.get('deposit') as string),
      requiresConsultation: formData.get('requiresConsultation') === 'true',
      maxBookingsPerDay: parseInt(formData.get('maxBookingsPerDay') as string),
      category: formData.get('category') as ServiceCategory,
      active: true
    };

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await createService(serviceData);
      }
      setEditingService(null);
      setIsAddingService(false);
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteService(serviceId);
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleAvailabilitySubmit = async (dayOfWeek: number, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const availabilityData = {
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      breakStart: formData.get('breakStart') as string || undefined,
      breakEnd: formData.get('breakEnd') as string || undefined,
      maxBookings: parseInt(formData.get('maxBookings') as string),
      isAvailable: formData.get('isAvailable') === 'true'
    };

    try {
      const existingAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      if (existingAvailability) {
        await updateAvailability(existingAvailability.id, availabilityData);
      }
      setEditingAvailability(null);
    } catch (err) {
      console.error('Error saving availability:', err);
    }
  };

  const renderServiceForm = (service?: ArtistService) => (
    <form onSubmit={handleServiceSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Service Name
        </label>
        <input
          type="text"
          name="name"
          defaultValue={service?.name}
          required
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={service?.description}
          required
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            defaultValue={service?.duration}
            required
            min={30}
            step={30}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            name="category"
            defaultValue={service?.category}
            required
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {SERVICE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            defaultValue={service?.price}
            required
            min={0}
            step={0.01}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deposit ($)
          </label>
          <input
            type="number"
            name="deposit"
            defaultValue={service?.deposit}
            required
            min={0}
            step={0.01}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <input
            type="radio"
            name="requiresConsultation"
            value="true"
            defaultChecked={service?.requiresConsultation}
            className="w-4 h-4 text-purple-600"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Requires Consultation
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            name="requiresConsultation"
            value="false"
            defaultChecked={!service?.requiresConsultation}
            className="w-4 h-4 text-purple-600"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            No Consultation Required
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Bookings Per Day
        </label>
        <input
          type="number"
          name="maxBookingsPerDay"
          defaultValue={service?.maxBookingsPerDay || 1}
          required
          min={1}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setEditingService(null);
            setIsAddingService(false);
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {service ? 'Update Service' : 'Add Service'}
        </button>
      </div>
    </form>
  );

  const renderAvailabilityForm = (dayOfWeek: number) => {
    const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    
    return (
      <form onSubmit={e => handleAvailabilitySubmit(dayOfWeek, e)} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="radio"
              name="isAvailable"
              value="true"
              defaultChecked={dayAvailability?.isAvailable}
              className="w-4 h-4 text-purple-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Available
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="isAvailable"
              value="false"
              defaultChecked={!dayAvailability?.isAvailable}
              className="w-4 h-4 text-purple-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Not Available
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              defaultValue={dayAvailability?.startTime || '09:00'}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              defaultValue={dayAvailability?.endTime || '17:00'}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Break Start (optional)
            </label>
            <input
              type="time"
              name="breakStart"
              defaultValue={dayAvailability?.breakStart}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Break End (optional)
            </label>
            <input
              type="time"
              name="breakEnd"
              defaultValue={dayAvailability?.breakEnd}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Bookings
          </label>
          <input
            type="number"
            name="maxBookings"
            defaultValue={dayAvailability?.maxBookings || 1}
            required
            min={1}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditingAvailability(null)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Services Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Services
            </h2>
            <button
              onClick={() => setIsAddingService(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {artistServices.map(service => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                {editingService?.id === service.id ? (
                  renderServiceForm(service)
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingService(service)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${service.price}
                      </div>
                      {service.requiresConsultation && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          Consultation Required
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAddingService && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                {renderServiceForm()}
              </div>
            )}
          </div>
        </section>

        {/* Availability Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Availability
          </h2>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayAvailability = availability.find(a => a.dayOfWeek === index);
              
              return (
                <div
                  key={day}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  {editingAvailability === index ? (
                    renderAvailabilityForm(index)
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {day}
                        </h3>
                        {dayAvailability?.isAvailable ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dayAvailability.startTime} - {dayAvailability.endTime}
                            {dayAvailability.breakStart && (
                              <span className="ml-2">
                                (Break: {dayAvailability.breakStart} - {dayAvailability.breakEnd})
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Not Available
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingAvailability(index)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
