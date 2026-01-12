'use client';
import React from "react";
import Head from 'next/head';
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from 'framer-motion';

const locations = [
  {
    title: 'Head Office',
    address: 'AJAcademy, 14D, Nehru St, near Arabindo school, Srinivasa Nagar, Friends Nagar, Mangadu, Chennai, Tamil Nadu 600122.',
    phone: '+91 93614 89738',
    email: 'businessmanager@ajacademy.co.in',
    map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.0607780362634!2d80.09884749999999!3d13.031801600000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5261ef37a716c9%3A0xb3731f6542bd0232!2sAJ%20Academy!5e0!3m2!1sen!2sin!4v1750985746318!5m2!1sen!2sin" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  },
  {
    title: 'Branch Office',
    address: 'AJ Academy, PLOT NO.27/1, Burma Colony, DEVAKI NAGAR, Madhavaram, Chennai, Tamil Nadu 600060',
    phone: '+91 93614 89738',
    email: 'businessmanager@ajacademy.co.in',
    map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.3870790210613!2d80.23605309999999!3d13.137966599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265bdbffd4a5d%3A0x46aa4d3752d7a60!2sAJ%20Academy!5e0!3m2!1sen!2sin!4v1750985789557!5m2!1sen!2sin" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  },
  {
    title: 'Partnered Office: ECS IELTS Coaching',
    address: 'No 2/7, 11th cross, 9th Main Rd, Dhadeswaram Nagar, Velachery, Chennai, Tamil Nadu 600042',
    phone: '',
    email: '',
    map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8815080958802!2d80.2233861!3d12.979429800000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52673937e9cbe7%3A0xae8639409c8901f0!2sECS%20IELTS%20Coaching%20in%20Chennai%20-%20PTE%20-%20GERMAN%20-%20OET-%20Study%20Abroad%20Chennai%20-%20Spoken%20English%20Classes%20in%20Velachery!5e0!3m2!1sen!2sin!4v1750985868603!5m2!1sen!2sin" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  },
  {
    title: 'Partnered Office: The Roots Academy',
    address: 'Shine Roots Academy, Anna Nagar 3rd Main Rd, Ramnagar, Balamurugan Nagar, Sarathy Nagar, Velachery, Chennai, Tamil Nadu 600042',
    phone: '',
    email: '',
    map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9613249964295!2d80.224825!3d12.974325499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d8415e1674f%3A0x4aa6fcfd8f604a74!2sThe%20Roots%20Academy%20-%20CA%2C%20CMA%2C%20CS%20Coaching%20centre%3B%20Tuitions%20for%20Class%206-12th!5e0!3m2!1sen!2sin!4v1750985911223!5m2!1sen!2sin" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, type: 'spring', stiffness: 80 } })
};

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | AJ Academy</title>
        <meta name="description" content="Contact AJ Academy for any queries, support, or partnership opportunities." />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-white py-12 px-4">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-extrabold mb-4 text-blue-900 text-center tracking-tight drop-shadow">Contact Us</h1>
          <p className="text-center text-blue-700 mb-10 text-lg">For business and general queries, email us at <a href="mailto:businessmanager@ajacademy.co.in" className="text-blue-800 underline font-semibold">businessmanager@ajacademy.co.in</a></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.title}
                className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:shadow-blue-200 transition-shadow relative"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
              >
                <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center"><MapPin className="mr-2 h-6 w-6 text-blue-500" />{loc.title}</h2>
                <ul className="space-y-2 text-blue-700 mb-4">
                  <li className="flex items-start"><MapPin className="mr-2 h-5 w-5 text-blue-400 mt-1" /><span>{loc.address}</span></li>
                  {loc.phone && <li className="flex items-center"><Phone className="mr-2 h-5 w-5 text-blue-400" /><span>{loc.phone}</span></li>}
                  {loc.email && <li className="flex items-center"><Mail className="mr-2 h-5 w-5 text-blue-400" /><span>{loc.email}</span></li>}
                </ul>
                <div className="w-full rounded-lg overflow-hidden border border-blue-300 bg-blue-50 flex items-center justify-center" style={{height: '250px'}}>
                  <span className="w-full h-full" dangerouslySetInnerHTML={{ __html: loc.map }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 