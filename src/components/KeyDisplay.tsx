
interface KeyDisplayProps {
    value: string;
    color?: string;
}

const KeyDisplay = ({ value, color = 'info' }: KeyDisplayProps): string => {
    return `\\htmlId{key-${value}}{\\htmlClass{badge rounded-pill text-bg-${color}}{${value}}}`;
};

export default KeyDisplay; 