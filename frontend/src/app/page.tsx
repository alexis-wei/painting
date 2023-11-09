import Canvas from '@/components/canvas';
export default function Home() {
  return (
    <main className='flex h-screen w-screen grow flex-col'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-2'>
        <span>Hello</span>
        <button className='w-[400px] border border-black'>click me</button>
        <Canvas />
      </div>
    </main>
  );
}
