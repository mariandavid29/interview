// app/admin/reservations/page.tsx
import { Card, CardBody, CardHeader } from '@heroui/card';
import { prisma } from '@/shared/db/prisma';
import { ReservationsTable } from './components/ReservationsTable';
import { connection } from 'next/server';

const TIME_SLOT_DISPLAY: Record<string, string> = {
  SLOT_08_00: '8:00 AM',
  SLOT_10_00: '10:00 AM',
  SLOT_12_00: '12:00 PM',
  SLOT_14_00: '2:00 PM',
  SLOT_16_00: '4:00 PM',
  SLOT_18_00: '6:00 PM',
  SLOT_20_00: '8:00 PM',
};

async function getAllReservations() {
  const reservations = await prisma.reservation.findMany({
    include: {
      inventory: true,
    },
    orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }, { id: 'asc' }],
  });

  return reservations;
}

async function getReservationStats() {
  const total = await prisma.reservation.count();
  const confirmed = await prisma.reservation.count({
    where: { status: 'CONFIRMED' },
  });
  const pending = await prisma.reservation.count({
    where: { status: 'PENDING' },
  });

  return { total, confirmed, pending };
}

export default async function AdminReservationsPage() {
  await connection();

  const [reservations, stats] = await Promise.all([getAllReservations(), getReservationStats()]);

  return (
    <main className='mx-auto min-h-screen w-full max-w-7xl space-y-6 p-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
        <Card>
          <CardBody className='p-4'>
            <p className='text-sm text-gray-500'>Total</p>
            <p className='text-2xl font-bold'>{stats.total}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className='p-4'>
            <p className='text-sm text-gray-500'>Confirmed</p>
            <p className='text-2xl font-bold text-green-600'>{stats.confirmed}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className='p-4'>
            <p className='text-sm text-gray-500'>Pending</p>
            <p className='text-2xl font-bold text-yellow-600'>{stats.pending}</p>
          </CardBody>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card className='w-full'>
        <CardHeader className='flex flex-col gap-3 px-6 pt-6'>
          <div className='flex w-full items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold'>All Reservations</h1>
              <p className='text-sm text-gray-500'>Manage and view all reservations</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className='px-0'>
          <ReservationsTable reservations={reservations} timeSlotDisplay={TIME_SLOT_DISPLAY} />
        </CardBody>
      </Card>
    </main>
  );
}
