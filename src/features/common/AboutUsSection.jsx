import React from 'react';
import { Info, UserCircle, ShieldCheck, Sparkles, Gauge, Users, Target, Eye, Building2 } from 'lucide-react';

const AboutUsSection = () => {
    const crestItems = [
        { letter: "C", word: "Customer-Centricity", desc: "Our customers are at the heart of every decision and action we take, ensuring their needs are met with utmost priority and care.", icon: UserCircle },
        { letter: "R", word: "Responsibility", desc: "We hold ourselves accountable for our impact on the communities we serve and the environment, operating with integrity and a commitment to social good.", icon: ShieldCheck },
        { letter: "E", word: "Excellence", desc: "We relentlessly pursue the highest standards in all aspects of our service, operations, and innovation, striving for continuous improvement.", icon: Sparkles },
        { letter: "S", word: "Sustainability", desc: "We are dedicated to the long-term health and viability of our precious water resources and the planet, implementing eco-friendly practices.", icon: Gauge },
        { letter: "T", word: "Teamwork & Integrity", desc: "We foster a collaborative environment built on mutual respect, honesty, and transparency, working together to achieve our common goals.", icon: Users }
    ];

    const missionPoints = [
        { title: "Deliver Quality", description: "Consistently provide safe, reliable, and affordable water and wastewater services that exceed customer expectations and meet stringent regulatory standards." },
        { title: "Innovate & Adapt", description: "Embrace technological advancements and innovative practices to enhance operational efficiency, service delivery, and resource management in an ever-changing world." },
        { title: "Customer First", description: "Cultivate a culture of exceptional customer care through responsive, transparent, fair, and easily accessible service channels, including this advanced digital portal." },
        { title: "Protect Resources", description: "Champion water conservation, actively work to reduce non-revenue water, and promote environmental protection through sustainable practices and robust community engagement." },
        { title: "Empower People", description: "Invest in the growth, professional development, and overall well-being of our employees, fostering a skilled, motivated, diverse, and safety-conscious workforce." },
        { title: "Community Partnership", description: "Actively contribute to the socio-economic development, health, and resilience of the communities we serve through targeted corporate social responsibility programs and collaborative partnerships." }
    ];


    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn leading-relaxed text-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <Info size={30} className="mr-3 text-blue-600" />
                    About AGWA Water Services, Inc.
                </h2>
            </div>

            <section className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-2 flex items-center">
                    <Building2 size={22} className="mr-2.5 text-blue-600/80" /> Our Genesis & Enduring Commitment
                </h3>
                <p>
                    AGWA Water Services, Inc. was established in 2005 with a singular, profound vision: to ensure every Filipino has access to clean, safe, and sustainable water. Recognizing water as the cornerstone of life, health, and economic progress, AGWA embarked on a mission to become a leading force in the Philippine water utility sector. From humble beginnings, we have grown through unwavering dedication, strategic investments in infrastructure and technology, and a deep-rooted commitment to the communities we are privileged to serve. Our journey has been one of continuous learning, adaptation, and an ever-stronger resolve to meet the evolving water needs of a dynamic nation.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-2 flex items-center">
                     <Sparkles size={22} className="mr-2.5 text-blue-600/80" /> Operational Excellence & Innovation
                </h3>
                <p>
                    At the heart of AGWA lies a relentless pursuit of excellence. We employ state-of-the-art water sourcing techniques, advanced multi-stage treatment processes, and smart distribution networks, all managed by a team of highly skilled engineers, certified technicians, and dedicated customer service professionals. Our operations strictly adhere to, and often exceed, national and international quality standards (PNSDW, WHO guidelines), ensuring that the water reaching your taps is not just potable but of the highest purity and reliability. We continuously invest in research and development to innovate and improve our services, from leak detection technologies and pressure management systems to digital customer interfaces and data-driven resource planning.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-2 flex items-center">
                    <Gauge size={22} className="mr-2.5 text-blue-600/80" /> Sustainability and Environmental Stewardship: Our Pledge
                </h3>
                <p>
                    AGWA is profoundly aware of its responsibility as a steward of one of Earth's most precious resources. Sustainability is not just a buzzword for us; it's integrated into every facet of our operations. This includes responsible water abstraction from diverse sources, active participation in watershed protection and reforestation programs, and the implementation of advanced wastewater treatment and water recycling initiatives to minimize our environmental footprint. We actively promote water conservation education among our consumers and invest in projects that enhance climate resilience and mitigate environmental impact, ensuring that future generations can also enjoy the gift of clean water.
                </p>
            </section>

            <div className="my-10 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl text-center">
                <Eye size={36} className="mx-auto mb-3 text-blue-200" />
                <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                <p className="italic text-lg text-blue-100 leading-relaxed max-w-3xl mx-auto">
                    "To be the Philippines' most trusted and innovative water solutions provider, empowering communities with sustainable access to life-enhancing water services and championing environmental stewardship for a resilient future."
                </p>
            </div>

            <div className="my-10">
                <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center">
                    <Target size={28} className="mr-3 text-blue-600" /> Our Mission
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {missionPoints.map((point, index) => (
                        <div key={index} className="bg-blue-50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                            <strong className="text-blue-700 block text-md mb-1.5">{point.title}</strong>
                            <p className="text-sm text-gray-600 leading-normal flex-grow">{point.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="my-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">Our Core Values: The AGWA C.R.E.S.T.</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {crestItems.map(value => {
                        const ValueIcon = value.icon;
                        return (
                            <div key={value.letter} className="p-5 border border-blue-100 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center h-full hover:border-blue-300 transform hover:-translate-y-1">
                                <div className={`p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-3 shadow-md`}>
                                    <ValueIcon className="" size={32} />
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mb-1">{value.letter}</p>
                                <strong className="text-blue-700 block text-md mb-1.5">{value.word}</strong>
                                <p className="text-xs text-gray-600 mt-1 leading-snug flex-grow">{value.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="pt-8 mt-8 text-gray-800 font-medium text-center text-lg border-t border-gray-200">
                AGWA Water Services, Inc. – Ensuring Clarity, Sustaining Life.
            </p>
        </div>
    );
};

export default AboutUsSection;
