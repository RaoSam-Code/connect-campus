import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassCard from "@/components/ui/GlassCard";
import { ChatIcon, CommunityIcon, HomeIcon, MarketplaceIcon } from "@/components/icons";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 relative">
            <AnimatedBackground />

            <div className="z-10 text-center mb-12">
                <h1 className="text-6xl font-bold text-primary mb-4 tracking-tight">
                    Campus Connect
                </h1>
                <p className="text-2xl text-text-secondary font-light">
                    The Super App for University Life
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
                <GlassCard className="p-8 flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                        <CommunityIcon size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-text-main">Communities</h2>
                    <p className="text-text-secondary">Find your tribe. Join clubs, societies, and interest groups.</p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center">
                    <div className="bg-secondary/10 p-4 rounded-full mb-4 text-secondary">
                        <MarketplaceIcon size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-text-main">Marketplace</h2>
                    <p className="text-text-secondary">Buy, sell, and trade textbooks and dorm essentials safely.</p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center">
                    <div className="bg-purple-100 p-4 rounded-full mb-4 text-purple-600">
                        <ChatIcon size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-text-main">Chat</h2>
                    <p className="text-text-secondary">Real-time collaboration for courses and projects.</p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center">
                    <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
                        <HomeIcon size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-text-main">Campus Life</h2>
                    <p className="text-text-secondary">Events, dining menus, and laundry updates in one place.</p>
                </GlassCard>
            </div>
        </main>
    );
}
