import { Notable, Odor_Mean_Chey } from 'next/font/google'
import { Button } from './components/button';

const notable = Notable({
  weight: '400'
})

const odor = Odor_Mean_Chey({
  weight: '400'
})

export default function Home() {
  return (
    <>
      <div className='w-1/2 flex flex-col gap-3'>
        <h1 className={`${notable.className} text-4xl`}>Make every Meal taste like a <span className='text-dark'>gourmet dish</span></h1>
        <p className='text-xl'>Ready to cook 5 star meals at the comfort of your own home, with ingredients you already have?</p>
        <div className='flex gap-3 pt-4'>
          <Button additionalStyling={`bg-dark text-white ${odor.className}`}>Start Cooking!</Button>
          <Button additionalStyling='bg-light'>Learn More</Button>
        </div>
      </div>
      <div className='ml-auto relative'>
        <img src="./wooden-plate.png" alt="Wooden Plate" />
        <div className="rounded-full shadow-xl shadow-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5"></div>
        <div className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 shadow-[0_0_50px_rgba(255,255,255,0.6)] shadow-medium"></div>
      </div>
    </>
  );
}
