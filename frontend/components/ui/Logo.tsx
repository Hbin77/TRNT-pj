import Image from 'next/image';

export const Logo = ({ className = '', size = "default" }: { className?: string, size?: "default" | "large" }) => {
    const iconSize = size === "large" ? 32 : 24;
    const containerSize = size === "large" ? "w-10 h-10" : "w-8 h-8";
    const textSize = size === "large" ? "text-2xl" : "text-xl";

    return (
        <div className={`flex items-center space-x-3 group ${className}`}>
            <div className={`${containerSize} rounded-xl overflow-hidden flex items-center justify-center`}>
                <Image
                    src="/logo.png"
                    alt="TRNT"
                    width={iconSize}
                    height={iconSize}
                    className="object-contain"
                />
            </div>
            <span className={`${textSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 tracking-tight`}>
                TRNT
            </span>
        </div>
    );
};
