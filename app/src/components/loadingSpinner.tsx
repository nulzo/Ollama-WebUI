import React from 'react';
import {PulseLoader} from 'react-spinners';

interface LoadingSpinnerProps {
    color?: string;
    size?: number;
    speedMultiplier?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                           color = '#4CAF50',
                                                           size = 8,
                                                           speedMultiplier = 0.75,
                                                       }: LoadingSpinnerProps) => {
    return (
        <div className="flex w-full ml-auto mr-auto text-center align-middle items-center content-center">
            <PulseLoader
                className='text-primary stroke-primary bg-primary'
                loading={true}
                size={size}
                speedMultiplier={speedMultiplier}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
};

export default LoadingSpinner;