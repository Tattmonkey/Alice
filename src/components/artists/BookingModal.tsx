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

interface BookingModalProps {
  artistId: string;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'service' | 'datetime' | 'consultation' | 'attachments' | 'payment' | 'confirmation';

export default function BookingModal({ artistId, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { 
    artistServices, 
    getArtistAvailability,
    createBooking,
    loading 
  } = useBooking();

  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<ArtistService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch availability when month changes
  useEffect(() => {
    if (!artistId) return;

    const fetchAvailability = async () => {
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const availability = await getArtistAvailability(artistId, start, end);
        setSchedule(availability);
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };

    fetchAvailability();
  }, [artistId, currentMonth]);

  if (!user) return null;
  if (loading) return <LoadingScreen />;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('datetime');
        break;
      case 'datetime':
        if (selectedService?.requiresConsultation) {
          setCurrentStep('consultation');
        } else {
          setCurrentStep('attachments');
        }
        break;
      case 'consultation':
        setCurrentStep('attachments');
        break;
      case 'attachments':
        setCurrentStep('payment');
        break;
      case 'payment':
        handleBookingSubmit();
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'datetime':
        setCurrentStep('service');
        break;
      case 'consultation':
        setCurrentStep('datetime');
        break;
      case 'attachments':
        if (selectedService?.requiresConsultation) {
          setCurrentStep('consultation');
        } else {
          setCurrentStep('datetime');
        }
        break;
      case 'payment':
        setCurrentStep('attachments');
        break;
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setIsProcessing(true);
    try {
      const bookingId = await createBooking({
        artistId,
        userId: user.id,
        serviceId: selectedService.id,
        status: selectedService.requiresConsultation ? 'pending' : 'confirmed',
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: selectedService.duration,
        price: selectedService.price,
        deposit: selectedService.deposit,
        depositPaid: false,
        consultation: selectedService.requiresConsultation ? {
          required: true,
          completed: false,
          notes: consultationNotes
        } : undefined
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        // TODO: Implement attachment upload
      }

      setCurrentStep('confirmation');
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Select a Service
      </h3>
      <div className="grid gap-4">
        {artistServices.map(service => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className={`p-4 rounded-lg border ${
              selectedService?.id === service.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  ${service.price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {service.duration} min
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Select Date & Time
      </h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            {schedule.map((day, index) => (
              <button
                key={day.date}
                onClick={() => day.isAvailable && setSelectedDate(day.date)}
                disabled={!day.isAvailable}
                className={`aspect-square rounded-lg flex items-center justify-center ${
                  selectedDate === day.date
                    ? 'bg-purple-500 text-white'
                    : day.isAvailable
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {format(new Date(day.date), 'd')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-4">Available Times</h4>
          <div className="space-y-2">
            {selectedDate && schedule.find(d => d.date === selectedDate)?.slots.map(slot => (
              <button
                key={`${slot.startTime}-${slot.endTime}`}
                onClick={() => setSelectedSlot(slot)}
                disabled={!slot.available}
                className={`w-full p-2 rounded-lg ${
                  selectedSlot === slot
                    ? 'bg-purple-500 text-white'
                    : slot.available
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsultation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Consultation Details
      </h3>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This service requires a consultation before booking.
              Please provide any relevant details or questions below.
            </p>
          </div>
        </div>
      </div>
      <textarea
        value={consultationNotes}
        onChange={e => setConsultationNotes(e.target.value)}
        placeholder="Describe your tattoo idea, reference images, placement, size, etc..."
        rows={6}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );

  const renderAttachments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Add References
      </h3>
      <div className="space-y-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500 dark:hover:border-purple-400"
        >
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to upload images or documents
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded p-2"
              >
                <div className="flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Payment Details
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Service</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedService?.name}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Date</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Time</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedSlot?.startTime} - {selectedSlot?.endTime}
          </span>
        </div>
        <div className="border-t dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Deposit Required</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${selectedService?.deposit}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <p className="text-sm text-purple-800 dark:text-purple-200">
          A deposit of ${selectedService?.deposit} is required to secure your booking.
          The remaining balance of ${(selectedService?.price || 0) - (selectedService?.deposit || 0)} will be due at the appointment.
        </p>
      </div>
      {/* TODO: Implement payment form */}
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Booking Confirmed
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {selectedService?.requiresConsultation
          ? 'Your consultation request has been sent. The artist will review your request and contact you soon.'
          : 'Your appointment has been booked successfully. You will receive a confirmation email shortly.'}
      </p>
      <button
        onClick={onClose}
        className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Done
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {currentStep === 'service' && renderServiceSelection()}
              {currentStep === 'datetime' && renderDateTimeSelection()}
              {currentStep === 'consultation' && renderConsultation()}
              {currentStep === 'attachments' && renderAttachments()}
              {currentStep === 'payment' && renderPayment()}
              {currentStep === 'confirmation' && renderConfirmation()}
            </div>

            {currentStep !== 'confirmation' && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 'service'}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={
                    !selectedService ||
                    (currentStep === 'datetime' && (!selectedDate || !selectedSlot)) ||
                    (currentStep === 'consultation' && !consultationNotes.trim()) ||
                    isProcessing
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 'payment' ? 'Confirm & Pay' : 'Continue'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
