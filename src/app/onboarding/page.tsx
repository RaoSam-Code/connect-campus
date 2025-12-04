"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

const steps = [
    {
        id: "university",
        title: "Where do you study?",
        description: "Find your campus to connect with peers.",
    },
    {
        id: "academics",
        title: "What's your major?",
        description: "We'll show you relevant course channels.",
    },
    {
        id: "interests",
        title: "What are you into?",
        description: "Join communities that match your vibe.",
    },
];

const interestsList = [
    "Computer Science", "Art & Design", "Music", "Sports",
    "Gaming", "Photography", "Entrepreneurship", "Volunteering",
    "Reading", "Hiking", "Cooking", "Travel"
];


export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        university: "",
        major: "",
        year: "",
        interests: [] as string[],
    });

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user found");

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        university: formData.university,
                        major: formData.major,
                        year: formData.year,
                        interests: formData.interests,
                    })
                    .eq('id', user.id);

                if (error) throw error;

                router.push("/feed");
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        }
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            <div className="w-full max-w-2xl z-10">
                {/* Progress Bar */}
                <div className="mb-8 flex justify-center gap-2">
                    {steps.map((_, index) => (
                        <motion.div
                            key={index}
                            className={cn(
                                "h-2 rounded-full transition-colors duration-300",
                                index <= currentStep ? "bg-primary w-8" : "bg-white/30 w-2"
                            )}
                            layout
                        />
                    ))}
                </div>

                <GlassCard className="p-8 md:p-12 min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-primary mb-2">
                                    {steps[currentStep].title}
                                </h1>
                                <p className="text-text-secondary text-lg">
                                    {steps[currentStep].description}
                                </p>
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-6">
                                {currentStep === 0 && (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={formData.university}
                                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                            placeholder="Search for your university..."
                                            className="w-full px-6 py-4 text-lg rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            autoFocus
                                        />
                                        <div className="flex flex-wrap gap-2 justify-center text-sm text-text-secondary">
                                            <span>Popular:</span>
                                            <button className="hover:text-primary transition-colors">Harvard</button>
                                            <button className="hover:text-primary transition-colors">MIT</button>
                                            <button className="hover:text-primary transition-colors">Stanford</button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={formData.major}
                                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                            placeholder="Your Major (e.g. Computer Science)"
                                            className="w-full px-6 py-4 text-lg rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            autoFocus
                                        />
                                        <select
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full px-6 py-4 text-lg rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select your year</option>
                                            <option value="freshman">Freshman</option>
                                            <option value="sophomore">Sophomore</option>
                                            <option value="junior">Junior</option>
                                            <option value="senior">Senior</option>
                                            <option value="grad">Graduate Student</option>
                                        </select>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {interestsList.map((interest) => (
                                            <button
                                                key={interest}
                                                onClick={() => toggleInterest(interest)}
                                                className={cn(
                                                    "px-6 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105",
                                                    formData.interests.includes(interest)
                                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                        : "bg-white/50 text-text-secondary hover:bg-white hover:text-primary border border-transparent hover:border-primary/20"
                                                )}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
                        <button
                            onClick={handleBack}
                            className={cn(
                                "px-6 py-3 rounded-xl font-medium text-text-secondary hover:text-text-main transition-colors",
                                currentStep === 0 && "invisible"
                            )}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5"
                        >
                            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                        </button>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
