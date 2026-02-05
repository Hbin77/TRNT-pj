import { Sparkles } from 'lucide-react';

export const Logo = ({ className = '', size = "default" }: { className?: string, size?: "default" | "large" }) => {
    const iconSize = size === "large" ? "w-8 h-8" : "w-6 h-6";
    const textSize = size === "large" ? "text-2xl" : "text-xl";

    return (
        <div className={`flex items-center space-x-3 group ${className}`}>
            <div className={`p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all duration-300`}>
                <Sparkles className={`${iconSize} text-blue-400 fill-blue-500/20`} />
            </div>
            <span className={`${textSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 tracking-tight`}>
                TRNT
            </span>
        </div>
    );
};
