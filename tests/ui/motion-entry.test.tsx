import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useMotionEntry } from '@/components/ui/useMotionEntry';
function Fixture() { const {ref,entered}=useMotionEntry<HTMLDivElement>(); return <div ref={ref}>{entered ? 'Terlihat' : 'Menunggu'}</div>; }
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.useRealTimers();});
it('memulai saat terlihat dan memutus observer sesudahnya',()=>{
 let notify: IntersectionObserverCallback = ()=>{};
 const disconnect=vi.fn();
 vi.stubGlobal('IntersectionObserver',class {constructor(callback:IntersectionObserverCallback){notify=callback;} observe=vi.fn();disconnect=disconnect;});
 render(<Fixture/>);expect(screen.getByText('Menunggu')).toBeTruthy();
 act(()=>notify([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
 expect(screen.getByText('Terlihat')).toBeTruthy();expect(disconnect).toHaveBeenCalled();
});
it('tanpa observer menampilkan hasil dan membatalkan fallback saat dilepas',()=>{
 vi.useFakeTimers();vi.stubGlobal('IntersectionObserver',undefined);
 const fixture=render(<Fixture/>);act(()=>vi.runAllTimers());expect(screen.getByText('Terlihat')).toBeTruthy();
 fixture.unmount();expect(vi.getTimerCount()).toBe(0);
});
