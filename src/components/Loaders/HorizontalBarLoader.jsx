import React from 'react';

const HorizontalBarLoader = ({
    width = 120,
    height = 30,
    trackColor = '#ffffffff',
    barColor = '#090708ff',
    duration = '1.5s',
    'aria-label': ariaLabel = 'Loading questions...',
}) => {
    // To keep the bar fully inside the track, the maximum x is width - height
    // (assuming the moving bar is a square / circle of size `height` x `height`)
    const maxX = width - Math.min(width, height);

    return (
        <div role="status" aria-label={ariaLabel} className="inline-flex items-center justify-center">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx={height / 2}
                    fill={trackColor}
                />
                <rect
                    x="0"
                    y="0"
                    width={height} // Bar is a square with rounded edges (a circle if width=height)
                    height={height}
                    rx={height / 2}
                    fill={barColor}
                >
                    <animate
                        attributeName="x"
                        values={`0;${maxX};0`}
                        keyTimes="0;0.5;1"
                        dur={duration}
                        repeatCount="indefinite"
                    />
                </rect>
            </svg>
        </div>
    );
};

export default HorizontalBarLoader;
