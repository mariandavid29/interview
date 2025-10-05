/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/reservations/components/ReservationsTable.tsx
'use client';

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Select, SelectItem } from '@heroui/select';
import { Prisma, ReservationStatus } from '@prisma/client';
import { useState, useTransition } from 'react';
import { updateReservationStatus } from '../actions';

type ReservationWithInventory = Prisma.ReservationGetPayload<{
  include: { inventory: true };
}>;

interface ReservationsTableProps {
  reservations: ReservationWithInventory[];
  timeSlotDisplay: Record<string, string>;
}

const STATUS_COLOR_MAP = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
} as any;

// Status transition rules
const STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'CANCELLED'],
  CANCELLED: ['CANCELLED'],
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function ReservationsTable({ reservations, timeSlotDisplay }: ReservationsTableProps) {
  const [, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Guest Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'date', label: 'Date' },
    { key: 'timeSlot', label: 'Time' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Booked On' },
  ];

  const handleStatusChange = async (
    reservationId: string,
    newStatus: string,
    currentStatus: ReservationStatus,
  ) => {
    setUpdatingId(reservationId);

    startTransition(async () => {
      const result = await updateReservationStatus(
        reservationId,
        newStatus as ReservationStatus,
        currentStatus,
      );

      if (!result.success) {
        alert(result.error);
      }

      setUpdatingId(null);
    });
  };

  return (
    <Table aria-label='Reservations table'>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={reservations} emptyContent='No reservations found'>
        {(reservation) => {
          const allowedStatuses = STATUS_TRANSITIONS[reservation.status];
          const isUpdating = updatingId === reservation.id;
          const canEdit = allowedStatuses.length > 1;

          return (
            <TableRow key={reservation.id}>
              <TableCell>
                <span className='font-mono text-xs'>{reservation.id.slice(0, 8)}...</span>
              </TableCell>
              <TableCell>
                <span className='font-medium'>{reservation.name}</span>
              </TableCell>
              <TableCell>
                <a href={`tel:${reservation.phone}`} className='text-blue-600 hover:underline'>
                  {reservation.phone}
                </a>
              </TableCell>
              <TableCell>
                <span className='whitespace-nowrap'>{formatDate(reservation.date)}</span>
              </TableCell>
              <TableCell>
                <span className='font-semibold'>{timeSlotDisplay[reservation.timeSlot]}</span>
              </TableCell>
              <TableCell>
                {canEdit ?
                  <Select
                    size='sm'
                    selectedKeys={[reservation.status]}
                    className='w-36'
                    isDisabled={isUpdating}
                    onChange={(e) =>
                      handleStatusChange(reservation.id, e.target.value, reservation.status)
                    }>
                    {allowedStatuses.map((status) => (
                      <SelectItem key={status}>{status}</SelectItem>
                    ))}
                  </Select>
                : <Chip color={STATUS_COLOR_MAP[reservation.status]} variant='flat' size='sm'>
                    {reservation.status}
                  </Chip>
                }
              </TableCell>
              <TableCell>
                <span className='text-sm whitespace-nowrap text-gray-500'>
                  {formatDateTime(reservation.createdAt)}
                </span>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
