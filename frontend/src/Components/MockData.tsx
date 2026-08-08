import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import prof1 from '../assets/picture-1.png'
import prof2 from '../assets/picture-2.png'
import prof3 from '../assets/picture-3.png'
import prof4 from '../assets/picture-4.png'

import case1 from '../assets/case1.png'
import case2 from '../assets/case2.png'
import case3 from '../assets/case3.png'

export const teamData = [
    {
        image: prof1,
        name: "Kevin Hard",
        position: "Project Manager",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
        ]
    },

    {
        image: prof2,
        name: "James Diamond",
        position: "Marketing",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof3,
        name: "Andrew Tate",
        position: "Engineering",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof4,
        name: "Sam Smith",
        position: "Product Design",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof2,
        name: "Tony Robins",
        position: "Sales",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },

]


export const investorData = [
    {
        name: "John Doe",
        position: "Investor",
    },

    {
        name: "Jane Smith",
        position: "CEO, Twitter",
    },

    {
        name: "Mike Johnson",
        position: "AfterPay CEO",
    },

    {
        name: "Sarah Williams",
        position: "CEO, Stripe",
    },

    {
        name: "David Brown",
        position: "CEO, Retool",
    },

    {
        name: "Tom Hardy",
        position: "Partner, Y Combinator",
    },  
]


export const frontendData = [
    {
        name: 'Next.js',
        description: 'React-based, excellent for server-side rendering',
    },
    {
        name: 'React.js',
        description: 'Component-based, highly flexible',
    },

    {
        name: 'Gatsby',
        description: 'React-based, focused on static sites',
    },

    {
        name: 'Angular',
        description: 'Full-featured framework by Google',
    },

    {
        name: 'Vue.js',
        description: 'Lightweight, approachable for smaller projects',
    },

    {
        name: 'Bootstrap',
        description: 'CSS framework for responsive designs',
    },

    {
        name: 'Flutter',
        description: 'Dart-based, cross-platform UI framework',
    },

    {
        name: 'Svelte',
        description: 'Compile-time framework for faster apps',
    },


    {
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework',
    },

]

export const benefitsData = [
    {
        id: 1,
        name: 'Simplified Regulatory Compliance',
        description: 'Meets all DGII requirements.',
    },
    {
        name: 'Agile and Mobile Billing',
        description: 'Modernize and streamline billing processes from any device and location, via the Web.',
    },

    {
        name: 'Effortless Accounting Integration',
        description: 'Synchronize the invoice with your accounting.',
    },

    {
        name: 'Precision in digitization',
        description: 'Reduce errors by digitizing DGII forms.',
    },

    {
        name: 'Efficiency in internal audits',
        description: 'Streamlines internal audits.',
    },

    {
        name: 'Improved Customer Experience',
        description: 'Improve customer service.',
    },

    {
        name: 'Ecological Commitment',
        description: 'Less environmental impact.',
    },

]


export const faqData = [
    {
        id: 1,
        question: 'What is the purpose of Codestra?',
        answer: 'Codestra is a software development agency focused on transforming ideas into reality. Our mission is to provide high-quality, cost-effective solutions for businesses of all sizes.',
    },
    {
        id: 2,
        question: 'How does Electronic Billing work?',
        answer: 'To hire a developer, simply fill out our hiring form and provide us with the necessary details about your project, budget, and timeline. We will then assess your skills, experience, and qualifications.',
    },

    {
        id: 3,
        question: 'How will the Testing part be handled?',
        answer: 'Working with Codestra can provide you with the following benefits: 1) Simplified Regulatory Compliance 2) Agile and Mobile Billing 3) Effortless Accounting Integration 4) Precision in digitization 5) Efficiency in internal audits 6) Improved Customer Experience 7) Ecological Commitment',
    },

    {
        id: 4,
        question: 'What is an Electronic Fiscal Receipt (e-CF)?',
        answer: 'Some of the most popular technologies used by developers include React.js, Next.js, Gatsby, Angular, Vue.js, Bootstrap, Flutter, Svelte, Tailwind CSS, and many more.',
    },

    {
        id: 5,
        question: 'For more information where can I access it?',
        answer: 'A software development agency is a business that specializes in providing software development services, while a software development company is a privately held corporation that develops and sells software products or services.',
    },
]

export const texts = [
    "Craftsmanship in Every Line of Code",
    "Turning Ideas into Reality",
    "Delivering Excellence",
];


export const caseStudies = [
    {
        id: 1,
        name: 'Tradx.io',
        bio: 'Tradx (tradx.io) is your gateway to a world of financial opportunities. Our user-friendly platform empowers you to trade over 100+ financial instruments, including stocks and cryptocurrencies, all from the convenience of your smartphone.',
        description: 'Tradx (tradx.io) is your gateway to a world of financial opportunities.',
        image: case1,
        information: [
            {
                name: `
                    Diverse Trading Options: Trade a wide range of assets exceeding 100, 
                    catering to your investment preferences.
                `
            },

            {
                name: `
                    Mobile-First Experience: Execute trades, 
                    access educational resources, and analyze 
                    markets seamlessly using our intuitive mobile app.
                `
            },

            {
                name: `
                    Advanced Market Analysis: Leverage real-time market data and 
                    insights from our AI-powered bot to make informed trading decisions.
                    Emphasizes the user benefits of Tradx.io, like convenience and 
                    diverse trading options.

                `
            },

            {

                name: `
                    Highlights the mobile-first experience: Mentions the AI-powered 
                    bot for market analysis but adds a disclaimer about investment risks. 
                    Briefly touches on educational resources and user experience. 
                    Uses a strong call to action to encourage users to join the platform.
                ` 
            }
        ],
    },

    {
        id: 2,
        name: 'The Contact Center',
        description: 'The Contact Center (thecontact.cente) is an Fully based Ai system create AI voice agents that engage in natural.',
        image: case3,
        bio: 'Is an Fully based Ai System ',
        information: [
            {
                name: `
                    Natural Language Processing (NLP): Uses advanced 
                    machine learning algorithms to interpret human 
                    language and respond to user queries in real-time.
                `
            },

            {
                name: `
                    Real-time Customer Support: Provides instant 
                    customer support, answering questions, and 
                    addressing issues promptly.
                `
            },
        ]
    },

    {
        id: 3,
        name: 'Nativo English',
        description: 'Nativo English (Nativo English.com) is an online English learning platform.',
        image: case2,
        bio: 'is an online English learning platform that offers a comprehensive range of resources to help you achieve English fluency.',
        information: [
            {
                name: `
                    Live Classes 24/7: Unlimited access to live 
                    online classes with experienced English teachers, 
                    available around the clock to fit your schedule.

                `
            },

            {
                name: `
                    Interactive Lessons: Engaging and interactive 
                    lessons that focus on practical language applications, 
                    making learning fun and effective.
                `
            },

            {
                name: `
                    Private Classes: Book private sessions 
                    with a dedicated English teacher for personalized 
                    instruction and rapid progress.
                `
            },

            {

                name: `
                    Exam Preparation: Free access to comprehensive 
                    preparation modules for major English proficiency 
                    exams like TOEFL, TOEIC, and IELTS.
                ` 
            },

            {

                name: `
                    Certificate of Achievement: Receive a certificate upon successful 
                    completion of each of our eight comprehensive course levels.
                ` 
            },
            {
                name: `
                    Extensive Video Library: Access thousands of hours 
                    of high-quality video content and interactive lessons 
                    for on-demand learning.
                `
            }
        ],

        programs: [
            {
                name : `
                    Adults: Choose from on-demand lessons, 
                    live group classes, and private sessions 
                    tailored to your learning style and goals.
                `
            },

            {
                name : `
                    Children: Nativo English Junior provides engaging 
                    and interactive learning experiences for children 
                    ages 8-14.
                `
            },

            {
                name: `
                    Businesses: Native English Business offers customized 
                    solutions to enhance the English communication skills 
                    of your employees.
                `
            }, 

            {
                name: `
                    Higher Education: Next U provides 
                    comprehensive English language training 
                    programs for higher education institutions.
                `
            },

            {
                name: `
                    Other Languages: Nativo English Mundo expands 
                    beyond English, offering classes in a variety 
                    of other languages.
                `
            }


        ]
    },

    {
        id: 4,
        name: 'Moneybee.loan',
        description: 'Moneybee loan (Moneybee.loan) Free Online Loan Marketplace for Small Businesses.',
        image: case3,
        bio: 'Is an Free Online Loan Marketplace for Small Businesses ',
        information: [
            {
                name: `
                    Connects Businesses with Lenders: Simplifies the 
                    loan search process by matching businesses with 
                    suitable lenders from their network of over 75.
                `
            },

            {
                name: `
                    Variety of Loan Options: Caters to diverse 
                    needs with options like business acquisition 
                    loans, startup loans, term loans, and equipment financing.
                `
            },

            {
                name: `
                    Free Guidance and Tools: Offers valuable 
                    resources to help business owners make informed 
                    financing decisions.
                `
            },


            {
                name: `
                    Startup Friendly: Provides loan options for 
                    businesses with limited credit history through 
                    startup loans.
                `
            }
        ]
    },
]


export const tabs = [
    {
        id: 1,
        name: 'All'
    },

    {
        id: 2,
        name: 'SasA'
    },

    {
        id: 3,
        name: 'AI'
    },

    {
        id: 4,
        name: 'Fintech'
    },

    {
        id: 5,
        name: 'IGaming'
    },

    {
        id: 6,
        name: 'Crypto'
    },

    {
        id: 7,
        name: 'Health'
    },

    {
        id: 8,
        name: 'Real Estate'
    },

    {
        id: 9,
        name: 'Edtech'
    },
]