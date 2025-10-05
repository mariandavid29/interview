import { Card, CardBody, CardHeader } from '@heroui/card';
import { ReservationForm } from './components/ReservationForm';
import { prisma } from '@/shared/db/prisma';

const TIME_SLOT_DISPLAY: Record<string, string> = {
  SLOT_08_00: '8:00 AM',
  SLOT_10_00: '10:00 AM',
  SLOT_12_00: '12:00 PM',
  SLOT_14_00: '2:00 PM',
  SLOT_16_00: '4:00 PM',
  SLOT_18_00: '6:00 PM',
  SLOT_20_00: '8:00 PM',
};

// Define the desired order for time slots
const TIME_SLOT_ORDER: Record<string, number> = {
  SLOT_08_00: 0,
  SLOT_10_00: 1,
  SLOT_12_00: 2,
  SLOT_14_00: 3,
  SLOT_16_00: 4,
  SLOT_18_00: 5,
  SLOT_20_00: 6,
};

async function getAvailableSlots() {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 60);

  const availableInventory = await prisma.timeSlotInventory.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return availableInventory
    .filter((inv) => inv.totalReserved < inv.totalCapacity)
    .map((inv) => ({
      date: {
        year: inv.date.getFullYear(),
        month: inv.date.getMonth() + 1,
        day: inv.date.getDate(),
        era: 'AD' as const,
      },
      timeSlot: inv.timeSlot,
      displayTime: TIME_SLOT_DISPLAY[inv.timeSlot],
      sortOrder: TIME_SLOT_ORDER[inv.timeSlot],
    }))
    .sort((a, b) => {
      // First sort by date
      if (a.date.year !== b.date.year) return a.date.year - b.date.year;
      if (a.date.month !== b.date.month) return a.date.month - b.date.month;
      if (a.date.day !== b.date.day) return a.date.day - b.date.day;
      // Then sort by time slot order
      return a.sortOrder - b.sortOrder;
    });
}

export default async function ReservationPage() {
  const freeSlots = await getAvailableSlots();

  console.log(freeSlots);
  return (
    <main className="2xl:w-8/12' mx-auto flex min-h-screen w-10/12 max-w-7xl items-center justify-center xl:w-9/12">
      <Card className='w-full max-w-md p-4 xl:max-w-lg 2xl:max-w-xl'>
        <CardHeader className='flex-col items-start gap-1'>
          <h4 className='text-lg font-semibold xl:text-xl 2xl:text-2xl'>Make a Reservation</h4>
          <p className='text-sm font-light uppercase'>Timisoara Dining</p>
          <small>⭐⭐⭐</small>
        </CardHeader>
        <CardBody className='pt-5 pb-10'>
          <ReservationForm freeSlots={freeSlots} />
        </CardBody>
      </Card>
    </main>
  );
}
