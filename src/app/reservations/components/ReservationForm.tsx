'use client';

import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Calendar, DateValue } from '@heroui/calendar';
import { ReactNode, useMemo, useState } from 'react';
import z from 'zod';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { TimeSlot } from '@prisma/client';
import { createReservation } from '../actions';

const nameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters long')
  .max(50, 'Name must be less than 50 characters');

const initialContactInfo = {
  name: '',
  phone: '',
};

// Updated type to match Prisma schema
type FreeSlot = {
  date: { day: number; era: 'AD'; month: number; year: number };
  timeSlot: TimeSlot; // Prisma enum
  displayTime: string; // For UI display
};

export function ReservationForm({ freeSlots }: { freeSlots: FreeSlot[] }) {
  const [contactInfo, setContactInfo] = useState({ ...initialContactInfo });
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    freeSlots.forEach((slot) => {
      const dateKey = `${slot.date.year}-${slot.date.month}-${slot.date.day}`;
      dateSet.add(dateKey);
    });
    return dateSet;
  }, [freeSlots]);

  const isDateUnavailable = (date: DateValue) => {
    const dateKey = `${date.year}-${date.month}-${date.day}`;
    return !availableDates.has(dateKey);
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    return freeSlots.filter((slot) => {
      return (
        slot.date.year === selectedDate.year &&
        slot.date.month === selectedDate.month &&
        slot.date.day === selectedDate.day
      );
    });
  }, [selectedDate, freeSlots]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reservationDate = new Date(
        selectedDate.year,
        selectedDate.month - 1, // JavaScript months are 0-indexed
        selectedDate.day,
      );

      const result = await createReservation({
        name: contactInfo.name,
        phone: contactInfo.phone,
        date: reservationDate,
        timeSlot: selectedTimeSlot,
      });

      if (result?.success) {
        // Reset form on success
        setContactInfo({ ...initialContactInfo });
        setSelectedDate(null);
        setSelectedTimeSlot(null);
      } else {
        setError(result?.error || 'Failed to create reservation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form className='w-full space-y-8' onSubmit={handleSubmit}>
      <div className='w-full space-y-4'>
        <Input
          label='Name'
          labelPlacement='inside'
          name='name'
          type='text'
          value={contactInfo.name}
          isRequired
          validate={(value) => {
            try {
              nameSchema.parse(value);
              return null;
            } catch (error) {
              if (error instanceof z.ZodError) {
                return error.issues[0].message;
              }
              return 'Name is invalid';
            }
          }}
          onValueChange={(value) => setContactInfo({ ...contactInfo, name: value })}
        />
        <Input
          label='Phone Number'
          labelPlacement='inside'
          name='phone'
          type='text'
          value={contactInfo.phone}
          isRequired
          validate={(value) => {
            const phone = parsePhoneNumberFromString(value);
            return phone?.isValid() ?
                null
              : 'Phone number is invalid, it must contain country code';
          }}
          onValueChange={(value) => setContactInfo({ ...contactInfo, phone: value })}
        />
      </div>

      {error && <div className='rounded-md bg-red-50 p-4 text-sm text-red-800'>{error}</div>}

      <div className='flex w-full flex-col gap-4 md:flex-row'>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          isDateUnavailable={isDateUnavailable}
        />
        <div className='flex grow flex-col gap-2'>
          <p className='text-center font-semibold'>Available times</p>
          <ul className='mx-auto flex max-h-[248px] w-full grow flex-col items-center gap-2 overflow-y-auto px-4 py-4'>
            {availableTimeSlots.length > 0 ?
              availableTimeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot.timeSlot}
                  isSelected={selectedTimeSlot === slot.timeSlot}
                  onClick={() => setSelectedTimeSlot(slot.timeSlot)}>
                  {slot.displayTime}
                </TimeSlotButton>
              ))
            : <p className='text-sm text-gray-500'>
                {selectedDate ?
                  'No available slots for this date'
                : 'Select a date to see available times'}
              </p>
            }
          </ul>
        </div>
      </div>

      <Button
        type='submit'
        isLoading={isLoading}
        className='w-full'
        variant='faded'
        isDisabled={!selectedDate || !selectedTimeSlot}
        color='primary'>
        Save Reservation 💾
      </Button>
    </Form>
  );
}

function TimeSlotButton({
  children,
  isSelected,
  onClick,
}: {
  children: ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <li className='w-full'>
      <Button
        variant={isSelected ? 'solid' : 'bordered'}
        color={isSelected ? 'primary' : 'default'}
        className='w-full'
        size='sm'
        radius='lg'
        onPress={onClick}>
        {children}
      </Button>
    </li>
  );
}
