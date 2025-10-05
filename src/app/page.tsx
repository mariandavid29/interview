import { Button } from '@heroui/button';
import { Link } from '@heroui/link';

export default function HomePage() {
  return (
    <main className='mx-auto min-h-screen w-10/12 max-w-7xl xl:w-9/12 2xl:w-8/12'>
      <div className='space-y-20 py-32 xl:py-48'>
        <div className='space-y-4'>
          <h1 className='text-center text-4xl font-bold xl:text-5xl 2xl:text-6xl'>
            TableManager🍴
          </h1>
          <p className='text-default-700 text-center xl:text-lg'>
            Mock resturant reservation experience
          </p>
        </div>
        <div className='flex w-full flex-col items-center justify-center gap-8 sm:flex-row'>
          <div className='shadow-default-400 flex flex-col items-center gap-4 rounded-2xl p-8 shadow'>
            <div className='bg-default-200 flex size-18 items-center justify-center rounded-full p-2 text-4xl'>
              📅
            </div>
            <h2 className='text-lg font-semibold xl:text-xl 2xl:text-2xl'>Guest</h2>
            <Button
              as={Link}
              size='lg'
              href='/reservations'
              variant='flat'
              color='primary'
              className='text-lg font-medium'>
              Make a Reservation
            </Button>
          </div>
          <div className='shadow-default-400 flex flex-col items-center gap-4 rounded-2xl p-8 shadow'>
            <div className='bg-default-200 flex size-18 items-center justify-center rounded-full p-2 text-4xl'>
              📋
            </div>
            <h2 className='text-lg font-semibold xl:text-xl 2xl:text-2xl'>Admin</h2>
            <Button
              as={Link}
              href='/admin'
              size='lg'
              variant='flat'
              color='primary'
              className='text-lg font-medium'>
              Manage Restaurant
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
