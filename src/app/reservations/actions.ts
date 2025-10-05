// app/actions/reservations.ts
'use server';

import { prisma } from '@/shared/db/prisma';
import { TimeSlot } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createReservation(data: {
  name: string;
  phone: string;
  date: Date;
  timeSlot: TimeSlot;
}) {
  let shouldRedirect = { ok: false, id: '' };

  try {
    // Check if user already has a reservation for this slot
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        phone: data.phone,
        date: data.date,
        timeSlot: data.timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED'], // Only check active reservations
        },
      },
    });

    if (existingReservation) {
      return {
        success: false,
        error: 'You already have a reservation for this time slot',
      };
    }

    // Check inventory availability
    const inventory = await prisma.timeSlotInventory.findUnique({
      where: {
        date_timeSlot: {
          date: data.date,
          timeSlot: data.timeSlot,
        },
      },
    });

    if (!inventory) {
      return { success: false, error: 'Time slot does not exist' };
    }

    if (inventory.totalReserved >= inventory.totalCapacity) {
      return { success: false, error: 'Time slot is no longer available' };
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        date: data.date,
        timeSlot: data.timeSlot,
        inventoryId: inventory.id,
        status: 'PENDING',
      },
    });

    // Update inventory count
    await prisma.timeSlotInventory.update({
      where: { id: inventory.id },
      data: {
        totalReserved: { increment: 1 },
      },
    });

    revalidatePath('/reservations');

    shouldRedirect = { ok: true, id: reservation.id };
  } catch (error) {
    console.error('Failed to create reservation:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create reservation' };
  }

  if (shouldRedirect.ok) {
    return redirect(`/reservations/${shouldRedirect.id}/confirmation`);
  }
}
