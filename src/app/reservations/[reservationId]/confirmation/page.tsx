// app/reservations/[id]/confirmation/page.tsx
import { Card, CardBody, CardHeader } from '@heroui/card';
import { prisma } from '@/shared/db/prisma';
import { notFound } from 'next/navigation';

const TIME_SLOT_DISPLAY: Record<string, string> = {
  SLOT_08_00: '8:00 AM',
  SLOT_10_00: '10:00 AM',
  SLOT_12_00: '12:00 PM',
  SLOT_14_00: '2:00 PM',
  SLOT_16_00: '4:00 PM',
  SLOT_18_00: '6:00 PM',
  SLOT_20_00: '8:00 PM',
};

async function getReservation(id: string) {
  console.log(id);
  if (!id) {
    console.log('no id');
    notFound();
  }
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      inventory: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  return reservation;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Fix: Properly type and await params
export default async function ReservationConfirmationPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  // Await params before using
  const resolvedParams = await params;
  const reservation = await getReservation(resolvedParams.reservationId);

  return (
    <main className='mx-auto flex min-h-screen w-10/12 max-w-7xl items-center justify-center xl:w-9/12 2xl:w-8/12'>
      <Card className='w-full max-w-md p-4 xl:max-w-lg 2xl:max-w-xl'>
        <CardHeader className='flex-col items-center gap-3 pb-6'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'></div>
          <div className='flex flex-col items-center gap-1'>
            <h4 className='text-xl font-semibold xl:text-2xl'>Reservation Created!</h4>
            <p className='text-sm font-light text-gray-600 uppercase'>Timisoara Dining</p>
          </div>
        </CardHeader>

        <CardBody className='space-y-6 pt-2 pb-10'>
          <div className='space-y-4 rounded-lg bg-gray-50 p-4'>
            <div className='flex items-start justify-between border-b border-gray-200 pb-3'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Guest Name</p>
                <p className='mt-1 text-base font-semibold'>{reservation.name}</p>
              </div>
              <div className='text-right'>
                <p className='text-sm font-medium text-gray-500'>Status</p>
                <span className='mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800'>
                  {reservation.status}
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Date</p>
                <p className='mt-1 text-base font-semibold'>{formatDate(reservation.date)}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-500'>Time</p>
                <p className='mt-1 text-base font-semibold'>
                  {TIME_SLOT_DISPLAY[reservation.timeSlot]}
                </p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-500'>Contact Number</p>
                <p className='mt-1 text-base font-semibold'>{reservation.phone}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-500'>Reservation ID</p>
                <p className='mt-1 font-mono text-sm text-gray-700'>{reservation.id}</p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <p className='text-sm text-blue-800'>
              📧 A confirmation email has been sent to your phone number. Please arrive 10 minutes
              before your reservation time.
            </p>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
