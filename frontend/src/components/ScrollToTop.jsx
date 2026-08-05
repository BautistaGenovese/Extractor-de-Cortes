import { ChevronsUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ScrollToTop({ bottomClass }) {
    const [scrollUp, setScrollUp] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.8) {
                setScrollUp(true);
            } else {
                setScrollUp(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed ${bottomClass ? bottomClass : 'bottom-6'} right-6 z-50 transition-all duration-300 ${!scrollUp ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
                }`}
        >
            <button
                className='flex justify-center items-center bg-stitch-surface/90 backdrop-blur-md text-stitch-primary shadow-lg shadow-stitch-primary/10 border border-stitch-primary/30 rounded-full h-10 w-10 hover:bg-stitch-primary/10 hover:-translate-y-1 transition-all active:scale-[0.95]'
                onClick={() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }}
            >
                <ChevronsUp className='w-6 h-6' />
            </button>
        </div>
    );
}
