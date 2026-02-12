import Image from 'next/image';

export const Logo = ({ className = '', size = "default" }: { className?: string, size?: "default" | "large" }) => {
    const iconSize = size === "large" ? 40 : 32;
    const textSize = size === "large" ? "text-2xl" : "text-xl";

    return (
        <div className={`flex items-center space-x-2.5 group ${className}`}>
            <Image
                src="/logo_nb.webp"
                alt="TRNT"
                width={iconSize}
                height={iconSize}
                className="object-contain"
            />
            <span className={`${textSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 tracking-tight`}>
                TRNT
            </span>
        </div>
    );
};
