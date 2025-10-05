// app/actions/reservations.ts
'use server';

import { prisma } from '@/shared/db/prisma';
import { TimeSlot, ReservationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createReservation(data: {
  name: string;
  phone: string;
  date: Date;
  timeSlot: TimeSlot;
}) {
  try {
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

    await prisma.timeSlotInventory.update({
      where: { id: inventory.id },
      data: {
        totalReserved: { increment: 1 },
      },
    });

    revalidatePath('/reservations');
    redirect(`/reservations/${reservation.id}/confirmation`);
  } catch (error) {
    console.error('Failed to create reservation:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create reservation' };
  }
}

export async function updateReservationStatus(
  reservationId: string,
  newStatus: ReservationStatus,
  currentStatus: ReservationStatus,
) {
  try {
    // Status transition rules:
    // PENDING -> CONFIRMED or CANCELLED
    // CONFIRMED -> CANCELLED only
    // CANCELLED -> (terminal, no changes)

    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CANCELLED'],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return {
        success: false,
        error: `Cannot change status from ${currentStatus} to ${newStatus}`,
      };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
    });

    revalidatePath('/admin/reservations');

    return { success: true };
  } catch (error) {
    console.error('Failed to update reservation status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
