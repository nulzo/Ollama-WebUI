import React from 'react';
import {PulseLoader} from 'react-spinners';

interface LoadingSpinnerProps {
    loading: boolean;
    color?: string;
    size?: number;
    speedMultiplier?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                           loading,
                                                           color = '#4CAF50',
                                                           size = 8,
                                                           speedMultiplier = 0.75,
                                                       }: LoadingSpinnerProps) => {
    return (
        <div className="flex w-full ml-auto mr-auto text-center align-middle items-center content-center">
            {loading ? (
                <PulseLoader
                    color={color}
                    loading={loading}
                    size={size}
                    speedMultiplier={speedMultiplier}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            ) : null}
        </div>
    );
};

export default LoadingSpinner;