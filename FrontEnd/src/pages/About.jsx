import React from 'react';
import { FiUsers, FiGlobe, FiHeart, FiAward } from 'react-icons/fi';

const About = () => {
    return (
        <div className="space-y-20 pb-20 animate-fade-in">
            {/* Immersive Hero Section */}
            <section className="relative min-h-[70vh] py-20 flex items-center justify-center overflow-hidden rounded-b-[4rem] shadow-2xl">
                {/* Background with overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/static/Aboutus - heropage.jpg"
                        alt="Community Garden"
                        className="w-full h-full object-cover animate-zoom-slow"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-rustic-deep/30 via-rustic-green/20 to-rustic-deep/40"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6">

                    <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md text-sm tracking-widest uppercase mb-4 animate-slide-up">Since 2024</span>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-xl leading-tight animate-slide-up animation-delay-200">
                        Cultivating <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Community</span>, <br />
                        Harvesting <span className="italic font-light">Hope</span>.
                    </h1>
                    <p className="text-base md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up animation-delay-400 px-4">
                        We are more than a marketplace. We are a movement dedicated to sustainable living, empowering local growers, and bringing fresh, organic joy to your table.
                    </p>
                </div>
            </section>

            {/* Mission & Story Grid */}
            <section className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-block p-3 bg-rustic-clay/10 rounded-2xl">
                            <FiHeart className="w-8 h-8 text-rustic-clay" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige">
                            Our Mission
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p>
                                At <span className="font-bold text-rustic-green dark:text-rustic-clay">Urban Harvest</span>, our mission is simple: to bridge the gap between urban communities and local agriculture. We believe that everyone deserves access to fresh, nutritious food that is grown with care.
                            </p>
                            <p>
                                By supporting local farmers and artisans, we are building a resilient food system that nourishes both people and the planet. We're here to make sustainable living accessible, enjoyable, and communal.
                            </p>
                        </div>

                        <div className="flex gap-8 pt-4">
                            <div>
                                <h4 className="text-3xl font-bold text-rustic-green dark:text-rustic-clay">50+</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Local Growers</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-rustic-green dark:text-rustic-clay">1k+</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Happy Members</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-rustic-green dark:text-rustic-clay">100%</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Organic</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-64 mx-auto md:w-auto md:mx-0">
                        <div className="absolute -inset-4 bg-rustic-beige dark:bg-rustic-mud rounded-[2rem] md:rounded-[3rem] -rotate-3 z-0"></div>
                        <img
                            src="/assets/static/Aboutus.jpg"
                            alt="Farmers Market Joy"
                            className="relative z-10 w-64 h-64 md:w-full md:h-[600px] object-cover rounded-[2rem] md:rounded-[2.5rem] shadow-2xl md:rotate-2 hover:rotate-0 transition-transform duration-500"
                        />
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="bg-rustic-beige/30 dark:bg-white/5 py-24 my-20">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-rustic-clay font-bold tracking-widest uppercase text-sm">Our Ethos</span>
                        <h2 className="text-4xl font-serif font-bold text-rustic-green dark:text-rustic-beige mt-3 mb-6">
                            Why We Do What We Do
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Every product, event, and workshop is curated with these core principles in mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Locally Sourced",
                                desc: "We partner directly with local farmers to ensure the freshest produce with the lowest carbon footprint.",
                                icon: FiGlobe,
                                color: "text-blue-500",
                                bg: "bg-blue-50"
                            },
                            {
                                title: "Sustainable Practices",
                                desc: "We prioritize products that are grown using organic, regenerative, and eco-friendly farming methods.",
                                icon: FiHeart,
                                color: "text-green-500",
                                bg: "bg-green-50"
                            },
                            {
                                title: "Community Focused",
                                desc: "We host events and workshops to educate, inspire, and connect our neighbors around food and nature.",
                                icon: FiUsers,
                                color: "text-orange-500",
                                bg: "bg-orange-50"
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-white dark:bg-rustic-mud p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-white/50 dark:border-white/5 group relative overflow-hidden">
                                <div className={`w-16 h-16 ${value.bg} dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <value.icon className={`w-8 h-8 ${value.color} dark:text-white`} />
                                </div>
                                <h3 className="text-2xl font-bold text-rustic-charcoal dark:text-white mb-4">
                                    {value.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
