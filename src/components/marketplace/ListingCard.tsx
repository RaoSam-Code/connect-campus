"use client";

import GlassCard from "@/components/ui/GlassCard";
import { Heart } from "lucide-react";

interface ListingProps {
    title: string;
    price: string;
    image: string;
    seller: {
        name: string;
        avatar: string;
    };
    condition: string;
}

export default function ListingCard({ listing }: { listing: ListingProps }) {
    return (
        <GlassCard className="p-0 group cursor-pointer mb-6 break-inside-avoid">
            <div className="relative">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full aspect-[4/5] object-cover rounded-t-2xl"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <Heart size={18} />
                </button>
                <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-md">
                        {listing.condition}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-text-main line-clamp-2 flex-1 mr-2">
                        {listing.title}
                    </h3>
                    <span className="font-bold text-primary text-lg">{listing.price}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        <img src={listing.seller.avatar} alt={listing.seller.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-text-secondary">{listing.seller.name}</span>
                </div>
            </div>
        </GlassCard>
    );
}
