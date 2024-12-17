import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Image as ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Upload
} from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArtistService, DaySchedule, TimeSlot } from '../../types/booking';
import LoadingScreen from '../LoadingScreen';
import toast from 'react-hot-toast';

enum BookingStep {
  SERVICE = 'service',
  DATE = 'date',
  TIME = 'time',
  DETAILS = 'details',
  PAYMENT = 'payment',
  CONFIRMATION = 'confirmation'
}

interface BookingModalProps {
  artistId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ artistId, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { createBooking, checkTimeSlotAvailability } = useBooking();
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SERVICE);
  const [selectedService, setSelectedService] = useState<ArtistService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    notes: '',
    references: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate]);

  const resetForm = () => {
    setCurrentStep(BookingStep.SERVICE);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingDetails({ notes: '', references: [] });
    setError(null);
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      setLoading(true);
      // Here you would fetch available time slots from your backend
      // For now, let's use dummy data
      const slots = [
        '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'
      ];
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: ArtistService) => {
    setSelectedService(service);
    setCurrentStep(BookingStep.DATE);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep(BookingStep.TIME);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(BookingStep.DETAILS);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setBookingDetails(prev => ({
      ...prev,
      references: [...prev.references, ...files]
    }));
  };

  const handleSubmit = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if time slot is still available
      const timeSlot: TimeSlot = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      };

      const isAvailable = await checkTimeSlotAvailability(artistId, timeSlot);
      if (!isAvailable) {
        setError('This time slot is no longer available. Please select another time.');
        setCurrentStep(BookingStep.TIME);
        return;
      }

      // Create booking
      await createBooking({
        artistId,
        userId: user.id,
        service: selectedService,
        timeSlot,
        notes: bookingDetails.notes,
        references: bookingDetails.references
      });

      toast.success('Booking created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case BookingStep.DATE:
        setCurrentStep(BookingStep.SERVICE);
        break;
      case BookingStep.TIME:
        setCurrentStep(BookingStep.DATE);
        break;
      case BookingStep.DETAILS:
        setCurrentStep(BookingStep.TIME);
        break;
      case BookingStep.PAYMENT:
        setCurrentStep(BookingStep.DETAILS);
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal content */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Book Appointment</h2>
              <p className="mt-2 text-gray-600">
                {currentStep === BookingStep.SERVICE && 'Select a service'}
                {currentStep === BookingStep.DATE && 'Choose a date'}
                {currentStep === BookingStep.TIME && 'Pick a time'}
                {currentStep === BookingStep.DETAILS && 'Add booking details'}
                {currentStep === BookingStep.PAYMENT && 'Complete payment'}
              </p>
            </div>

            {loading ? (
              <LoadingScreen />
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      {error}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Step content */}
                  {currentStep === BookingStep.SERVICE && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Add your service options here */}
                    </div>
                  )}

                  {currentStep === BookingStep.DATE && (
                    <div>
                      {/* Add your date picker here */}
                    </div>
                  )}

                  {currentStep === BookingStep.TIME && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`flex items-center justify-center rounded-lg border p-4 ${
                            selectedTime === time
                              ? 'border-purple-600 bg-purple-50 text-purple-600'
                              : 'border-gray-200 hover:border-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          <Clock className="mr-2 h-5 w-5" />
                          {time}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentStep === BookingStep.DETAILS && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          value={bookingDetails.notes}
                          onChange={e => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          rows={4}
                          placeholder="Add any special requests or notes..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Reference Images
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                            <Upload className="mr-2 h-5 w-5 text-gray-400" />
                            <span>Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <span className="text-sm text-gray-500">
                            {bookingDetails.references.length} files selected
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  {currentStep !== BookingStep.SERVICE && (
                    <button
                      onClick={handleBack}
                      className="flex items-center rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </button>
                  )}

                  {currentStep === BookingStep.DETAILS ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="ml-auto flex items-center rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Upload className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Complete Booking
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        switch (currentStep) {
                          case BookingStep.SERVICE:
                            if (selectedService) setCurrentStep(BookingStep.DATE);
                            break;
                          case BookingStep.DATE:
                            if (selectedDate) setCurrentStep(BookingStep.TIME);
                            break;
                          case BookingStep.TIME:
                            if (selectedTime) setCurrentStep(BookingStep.DETAILS);
                            break;
                          default:
                            break;
                        }
                      }}
                      disabled={
                        (currentStep === BookingStep.SERVICE && !selectedService) ||
                        (currentStep === BookingStep.DATE && !selectedDate) ||
                        (currentStep === BookingStep.TIME && !selectedTime)
                      }
                      className="ml-auto flex items-center rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
