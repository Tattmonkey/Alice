import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AvailabilitySchedule, TimeSlot } from '../../types/artist';
import { toast } from 'react-toastify';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';

interface ArtistAvailabilityProps {
  availability: AvailabilitySchedule;
  artistId: string;
  onUpdate: (availability: AvailabilitySchedule) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const ArtistAvailability: React.FC<ArtistAvailabilityProps> = ({
  availability,
  artistId,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<AvailabilitySchedule>(availability);

  const handleAddTimeSlot = (day: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: [
          ...(prev.weeklySchedule[day] || []),
          {
            start: '09:00',
            end: '17:00',
            isBooked: false
          }
        ]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    setEditedSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: prev.weeklySchedule[day].filter((_, i) => i !== index)
      }
    }));
  };

  const handleTimeChange = (day: string, index: number, field: keyof TimeSlot, value: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: prev.weeklySchedule[day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'artists', artistId), {
        availability: editedSchedule
      });
      onUpdate(editedSchedule);
      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Weekly Schedule</h2>
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {DAYS_OF_WEEK.map(day => (
          <Card key={day} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{day}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTimeSlot(day)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>

            <div className="space-y-4">
              {editedSchedule.weeklySchedule[day]?.map((slot, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveTimeSlot(day, index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!editedSchedule.weeklySchedule[day] || editedSchedule.weeklySchedule[day].length === 0) && (
                <p className="text-gray-500 text-sm">No time slots added for {day}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Special Dates Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Special Dates</h3>
        <p className="text-gray-500">
          Coming soon: Ability to set special hours for holidays and other occasions.
        </p>
      </Card>

      {/* Blocked Dates Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Blocked Dates</h3>
        <p className="text-gray-500">
          Coming soon: Ability to block out entire days for vacation or other commitments.
        </p>
      </Card>
    </div>
  );
};

export default ArtistAvailability;
