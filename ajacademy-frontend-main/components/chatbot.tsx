"use client"

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, BookOpen, Users, Briefcase, Code2, HelpCircle, ChevronRight, ChevronDown, ChevronUp, LogIn, UserPlus, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface MessageButton {
  text: string
  link: string
  variant?: 'primary' | 'secondary'
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  buttons?: MessageButton[]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [hasAskedInitialQuestions, setHasAskedInitialQuestions] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm AJAssistant, your friendly guide at AJ Academy. 😊",
      sender: 'bot',
      timestamp: new Date(),
      buttons: [
        { text: 'I\'m a Student', link: '', variant: 'primary' },
        { text: 'Looking for Job', link: '', variant: 'primary' },
        { text: 'Looking for Course', link: '', variant: 'primary' },
        { text: 'Looking for Mentorship', link: '', variant: 'primary' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  const sections = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Courses',
      description: 'Explore our courses',
      link: '/courses',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Mentorship',
      description: 'Connect with mentors',
      link: '/mentorship',
      color: 'from-indigo-600 to-indigo-700'
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: 'Jobs',
      description: 'Find opportunities',
      link: '/job-portal',
      color: 'from-purple-600 to-purple-700'
    },
    {
      icon: <Code2 className="h-5 w-5" />,
      title: 'Projects',
      description: 'Showcase your work',
      link: '/projects',
      color: 'from-pink-600 to-pink-700'
    }
  ]

  const quickHelpOptions = [
    'How do I enroll in a course?',
    'What is mentorship?',
    'How to showcase my project?',
    'Where can I find job opportunities?'
  ]

  const handleQuickAction = (action: string) => {
    const response = getBotResponse(action, false)
    addMessage(action, 'user')
    setTimeout(() => {
      addMessage(response.text, 'bot', response.buttons)
    }, 500)
  }

  const handleButtonClick = (button: MessageButton) => {
    if (button.link) {
      // If it's a mailto link or external link, open in new tab
      if (button.link.startsWith('mailto:') || button.link.startsWith('http')) {
        window.open(button.link, '_blank')
      } else {
        // Internal link - navigate in same window
        window.location.href = button.link
      }
    } else {
      // If it's a button action, treat it as a user message
      const userResponse = button.text
      addMessage(userResponse, 'user')
      
      setTimeout(() => {
        const response = getBotResponse(userResponse, true)
        addMessage(response.text, 'bot', response.buttons)
      }, 500)
    }
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getBotResponse = (userMessage: string, isButtonClick: boolean = false): { text: string; buttons?: MessageButton[] } => {
    const lowerMessage = userMessage.toLowerCase().trim()
    
    // Handle user type selection
    if (lowerMessage.includes('student') || lowerMessage.includes("i'm a student") || lowerMessage.includes('i am a student')) {
      setUserType('student')
      setHasAskedInitialQuestions(true)
      return {
        text: "Awesome! Welcome, student! 🎓\n\nAs a student at AJ Academy, you can:\n• Enroll in expert-led courses\n• Showcase your projects\n• Connect with mentors\n• Access exclusive job opportunities\n\nWhat would you like to explore?",
        buttons: [
          { text: 'Browse Courses', link: '/courses', variant: 'primary' },
          { text: 'Showcase Project', link: '/projects', variant: 'secondary' },
          { text: 'Find Mentor', link: '/mentorship', variant: 'secondary' }
        ]
      }
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('looking for job') || lowerMessage.includes('job seeker')) {
      setUserType('job_seeker')
      setHasAskedInitialQuestions(true)
      return {
        text: "Perfect! We have amazing opportunities for job seekers! 💼\n\nOur job portal features:\n• Exclusive listings from partner companies\n• Filter by skills and location\n• Direct application through platform\n• Resume and interview preparation\n\nReady to explore opportunities?",
        buttons: [
          { text: 'Browse Jobs', link: '/job-portal', variant: 'primary' },
          { text: 'Sign Up', link: '/auth/sign-up', variant: 'secondary' }
        ]
      }
    }
    
    if (lowerMessage.includes('course') || lowerMessage.includes('looking for course') || lowerMessage.includes('learn')) {
      setUserType('course_seeker')
      setHasAskedInitialQuestions(true)
      return {
        text: "Excellent choice! 🎓\n\nWe offer courses across various disciplines:\n• Web Development\n• Data Science\n• Design\n• And many more!\n\nAll courses are expert-led with hands-on projects. Want to see what's available?",
        buttons: [
          { text: 'View All Courses', link: '/courses', variant: 'primary' },
          { text: 'Sign Up to Enroll', link: '/auth/sign-up', variant: 'secondary' }
        ]
      }
    }
    
    if (lowerMessage.includes('mentor') || lowerMessage.includes('mentorship') || lowerMessage.includes('guidance')) {
      setUserType('mentorship_seeker')
      setHasAskedInitialQuestions(true)
      return {
        text: "Great! Mentorship is one of our key features! 🎯\n\nOur mentors provide:\n• Personalized 1-on-1 guidance\n• Career advice and learning paths\n• Industry insights\n• Regular feedback sessions\n\nTo connect with a mentor, please share your email address and we'll help you get started!",
        buttons: [
          { text: 'Browse Mentors', link: '/mentorship', variant: 'primary' },
          { text: 'Contact Support', link: 'mailto:support@ajacademy.com', variant: 'secondary' }
        ]
      }
    }
    
    // Signup/Login
    if (lowerMessage.includes('signup') || lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('create account')) {
      return {
        text: "Great! Let's get you started! 🚀\n\nSigning up is quick and easy. You'll get access to:\n• All courses\n• Mentorship opportunities\n• Job portal\n• Project showcase\n\nReady to join us?",
        buttons: [
          { text: 'Sign Up Now', link: '/auth/sign-up', variant: 'primary' }
        ]
      }
    }
    
    if (lowerMessage.includes('login') || lowerMessage.includes('log in') || lowerMessage.includes('sign in')) {
      return {
        text: "Welcome back! 👋\n\nLog in to access your dashboard, continue your courses, and connect with mentors.",
        buttons: [
          { text: 'Log In', link: '/auth/sign-in', variant: 'primary' }
        ]
      }
    }
    
    // Founder information
    if (lowerMessage.includes('founder') || lowerMessage.includes('who started') || lowerMessage.includes('jai') || lowerMessage.includes('jaishankar')) {
      return {
        text: "AJ Academy was founded by JaiShankar! 👨‍💼\n\nJaiShankar is passionate about education and helping students achieve their career goals. Under his leadership, AJ Academy has grown to serve thousands of students with expert-led courses, mentorship, and career opportunities.\n\nWould you like to know more about our platform?",
        buttons: [
          { text: 'Learn More', link: '/about', variant: 'primary' }
        ]
      }
    }
    
    // Courses available
    if (lowerMessage.includes('courses available') || lowerMessage.includes('what courses') || lowerMessage.includes('available courses') || lowerMessage.includes('list of courses')) {
      return {
        text: "We have a wide range of courses available! 📚\n\nOur courses cover:\n• Web Development (React, Node.js, etc.)\n• Data Science & Analytics\n• UI/UX Design\n• Mobile Development\n• And many more disciplines!\n\nAll courses include hands-on projects and are taught by industry experts. Want to explore?",
        buttons: [
          { text: 'View All Courses', link: '/courses', variant: 'primary' },
          { text: 'Sign Up', link: '/auth/sign-up', variant: 'secondary' }
        ]
      }
    }
    
    // Greetings and casual conversation
    if (lowerMessage.match(/^(hi|hello|hey|hai|hii|hiii|good morning|good afternoon|good evening)$/)) {
      if (!hasAskedInitialQuestions) {
        return {
          text: "Hello! 👋 Great to meet you! To help you better, could you tell me:\n\n• Are you a student?\n• Are you looking for a job?\n• Are you looking for a course?\n• Are you looking for mentorship?",
          buttons: [
            { text: 'I\'m a Student', link: '', variant: 'primary' },
            { text: 'Looking for Job', link: '', variant: 'primary' },
            { text: 'Looking for Course', link: '', variant: 'primary' },
            { text: 'Looking for Mentorship', link: '', variant: 'primary' }
          ]
        }
      }
      const greetings = [
        "Hello! 👋 Great to meet you! How can I help you today?",
        "Hi there! 😊 Welcome to AJ Academy! What would you like to know?",
        "Hey! Nice to see you! How can I assist you today?",
        "Hello! I'm excited to help you. What can I do for you?"
      ]
      return { text: greetings[Math.floor(Math.random() * greetings.length)] }
    }
    
    if (lowerMessage.match(/^(how are you|how r u|how are u|what's up|whats up|sup)$/)) {
      return { text: "I'm doing great, thank you for asking! 😊 I'm here and ready to help you with anything about AJ Academy. What would you like to know?" }
    }
    
    if (lowerMessage.match(/^(thanks|thank you|thank u|thx|ty|appreciate it)$/)) {
      return { text: "You're very welcome! 😊 Happy to help! Is there anything else you'd like to know?" }
    }
    
    if (lowerMessage.match(/^(bye|goodbye|see you|see ya|cya|tata)$/)) {
      return { text: "Goodbye! 👋 Feel free to come back anytime if you need help. Have a great day!" }
    }
    
    // Course-related queries
    if (lowerMessage.includes('enroll') || (lowerMessage.includes('course') && !lowerMessage.includes('available'))) {
      if (lowerMessage.includes('how') || lowerMessage.includes('enroll')) {
        return {
          text: "Great question! To enroll in a course, simply visit our Courses page and browse through our amazing selection. When you find a course you like, click on it to see all the details, and then hit the 'Enroll' button! It's that easy! 🎓",
          buttons: [
            { text: 'Browse Courses', link: '/courses', variant: 'primary' },
            { text: 'Sign Up First', link: '/auth/sign-up', variant: 'secondary' }
          ]
        }
      }
      return {
        text: "We have an amazing collection of courses covering various disciplines! You can explore them all on our Courses page. Each course is designed to give you practical, real-world skills. Would you like to see what's available?",
        buttons: [
          { text: 'View Courses', link: '/courses', variant: 'primary' }
        ]
      }
    }
    
    // Mentorship queries
    if (lowerMessage.includes('mentor') && !lowerMessage.includes('looking for')) {
      return {
        text: "Mentorship is one of our key features! 🎯 At AJ Academy, you can connect with experienced professionals who provide personalized guidance tailored to your goals. They'll help you with career advice, learning paths, and much more. Check out the Mentorship section!",
        buttons: [
          { text: 'Find Mentors', link: '/mentorship', variant: 'primary' },
          { text: 'Contact Support', link: 'mailto:support@ajacademy.com', variant: 'secondary' }
        ]
      }
    }
    
    // Project-related queries
    if (lowerMessage.includes('project') || lowerMessage.includes('showcase') || lowerMessage.includes('portfolio') || lowerMessage.includes('github')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('showcase')) {
        return {
          text: "Absolutely! Showcasing your projects is a great way to build your portfolio! 🚀 Just go to the Projects page and click 'Add Project'. You can share your GitHub links, describe what technologies you used, and add a description. This helps other students learn and potential employers see your work!",
          buttons: [
            { text: 'Showcase Project', link: '/projects', variant: 'primary' },
            { text: 'View Projects', link: '/projects', variant: 'secondary' }
          ]
        }
      }
      return {
        text: "Our Projects section is where students showcase their amazing work! You can browse projects from other students or add your own. It's a great way to build your portfolio and get inspired. Want to know how to add your project?",
        buttons: [
          { text: 'View Projects', link: '/projects', variant: 'primary' }
        ]
      }
    }
    
    // Job-related queries
    if (lowerMessage.includes('job') || lowerMessage.includes('opportunity') || lowerMessage.includes('career') || lowerMessage.includes('hire') || lowerMessage.includes('employment')) {
      return {
        text: "We have an exclusive job portal with opportunities from our partner companies! 💼 You can browse listings, filter by your skills, and apply directly through our platform. Make sure your profile is complete to increase your chances!",
        buttons: [
          { text: 'Browse Jobs', link: '/job-portal', variant: 'primary' },
          { text: 'Sign Up', link: '/auth/sign-up', variant: 'secondary' }
        ]
      }
    }
    
    // Help and support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('stuck') || lowerMessage.includes('confused')) {
      return {
        text: "I'm here to help! 😊 You can ask me about courses, mentorship, projects, jobs, or anything else about AJ Academy. You can also use the Quick Navigation section below to jump to different areas, or try the Quick Help options. What would you like to know more about?",
        buttons: [
          { text: 'Contact Support', link: 'mailto:support@ajacademy.com', variant: 'primary' }
        ]
      }
    }
    
    // About AJ Academy
    if (lowerMessage.includes('what is') || lowerMessage.includes('tell me about') || lowerMessage.includes('about aj academy') || lowerMessage.includes('what is aj academy')) {
      return {
        text: "AJ Academy is your one-stop platform for learning, mentorship, and career growth! 🎓 We offer expert-led courses, 1-on-1 mentorship with industry professionals, a project showcase platform, and exclusive job opportunities. Our goal is to help you succeed in your career journey!",
        buttons: [
          { text: 'Learn More', link: '/about', variant: 'primary' },
          { text: 'Sign Up', link: '/auth/sign-up', variant: 'secondary' }
        ]
      }
    }
    
    // Email for mentorship
    if (lowerMessage.includes('@') || lowerMessage.includes('email') || lowerMessage.includes('contact')) {
      return {
        text: "Perfect! For mentorship inquiries, please contact us at support@ajacademy.com or visit our Mentorship page. Our team will connect you with the right mentor based on your goals and interests! 📧",
        buttons: [
          { text: 'Contact Support', link: 'mailto:support@ajacademy.com', variant: 'primary' },
          { text: 'Mentorship Page', link: '/mentorship', variant: 'secondary' }
        ]
      }
    }
    
    // Default responses - more conversational
    const defaultResponses = [
      { text: `I see you're asking about "${userMessage}". That's interesting! Could you tell me a bit more? I can help you with courses, mentorship, projects, jobs, or anything else about AJ Academy. 😊` },
      { text: `Hmm, I want to make sure I understand correctly. Are you asking about courses, mentorship, projects, or jobs? Or feel free to ask me anything else about AJ Academy!` },
      { text: `I'd love to help you with that! Could you be more specific? For example, are you interested in enrolling in a course, finding a mentor, showcasing a project, or exploring job opportunities?` },
      { text: `That's a great question! To give you the best answer, could you tell me if this is related to courses, mentorship, projects, or jobs? Or I can help you with general information about AJ Academy!` }
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const addMessage = (text: string, sender: 'user' | 'bot', buttons?: MessageButton[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      buttons
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSend = async () => {
    const message = inputValue.trim()
    if (!message) return
    
    // Add user message immediately
    addMessage(message, 'user')
    setInputValue('')
    
    // Show typing indicator
    setIsTyping(true)
    
    // Simulate thinking time for more natural conversation
    const delay = Math.random() * 500 + 800 // 800-1300ms
    
    setTimeout(() => {
      setIsTyping(false)
      const response = getBotResponse(message, false)
      addMessage(response.text, 'bot', response.buttons)
    }, delay)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chatbot Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/50 flex items-center justify-center hover:shadow-xl hover:shadow-blue-600/60 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AJAssistant</h3>
                  <p className="text-xs text-blue-100">We're here to help</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                    {/* Message Buttons */}
                    {message.buttons && message.buttons.length > 0 && message.sender === 'bot' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.buttons.map((button, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleButtonClick(button)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                              button.variant === 'primary'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {button.text}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-gray-800 shadow-sm border border-gray-200 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Section Options */}
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Collapsible Quick Navigation */}
              <div className="mb-3">
                <button
                  onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 mb-2 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Quick Navigation
                  </div>
                  <motion.div
                    animate={{ rotate: isQuickNavOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isQuickNavOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {sections.map((section, index) => (
                          <Link
                            key={index}
                            href={section.link}
                            className="group p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform`}>
                              {section.icon}
                            </div>
                            <p className="text-xs font-semibold text-gray-800">{section.title}</p>
                            <p className="text-xs text-gray-500">{section.description}</p>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Help Options */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick Help</p>
                <div className="space-y-1">
                  {quickHelpOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(option)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between group"
                    >
                      <span>{option}</span>
                      <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

