'use client'
import { useState, useEffect, useRef } from 'react'
import { 
  Heart, Brain, Leaf, Sparkles, ArrowRight, 
  MessageCircle, BookOpen, LogOut, Menu, X, 
  Compass, Dumbbell, Send, Trash2, 
  Check, ChevronDown, ChevronRight, Calendar,
  Clock, Plus, Shield, RefreshCw, BarChart2
} from 'lucide-react'
import FloatingParticles from '@/components/floating-particles'
import StarField from '@/components/star-field'
import AnimatedOrb from '@/components/animated-orb'
import FeatureCard from '@/components/feature-card'
import GlassmorphicCard from '@/components/glassmorphic-card'
import Header from '@/components/header'
import MessageBubble from '@/components/message-bubble'
import VLogo from '@/components/v-logo'
import BrandLogo from '@/components/brand-logo'

// Define interfaces
interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
}

interface MoodEntry {
  date: string // YYYY-MM-DD
  mood: string // emoji
}

interface JournalEntry {
  id: string
  date: string
  timestamp: string
  text: string
  analysis?: string
}

interface RoadmapStage {
  stage: number
  title: string
  duration: string
  actions: string[]
  milestone: string
}

interface PathfinderRoadmap {
  goal: string
  timeline: string
  stages: RoadmapStage[]
  firstStep: string
}

export default function Home() {
  // ── mounted guard — prevents any SSR/CSR mismatch ──────────────────────────

  // ── All useState defaults are STATIC (no Date, no localStorage, no window) ─
  const [activeSection, setActiveSection] = useState<string>('landing')
  const [username, setUsername] = useState<string>('')
  const [showNameModal, setShowNameModal] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  // Greeting starts with a safe static string; updated client-side in useEffect
  const [greetingText, setGreetingText] = useState<string>('Good Evening, friend 👋')

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [chatInputValue, setChatInputValue] = useState<string>('')
  const [chatLoading, setChatLoading] = useState<boolean>(false)

  // Mood state
  const [moodLog, setMoodLog] = useState<MoodEntry[]>([])
  const [selectedMoodToday, setSelectedMoodToday] = useState<string>('')

  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [journalText, setJournalText] = useState<string>('')
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null)
  const [journalLoading, setJournalLoading] = useState<boolean>(false)

  // Daily Reflection
  const [dailyReflection, setDailyReflection] = useState<string>('')
  const [loadingReflection, setLoadingReflection] = useState<boolean>(false)

  // PathFinder state
  const [pathfinderGoal, setPathfinderGoal] = useState<string>('')
  const [pathfinderRoadmap, setPathfinderRoadmap] = useState<PathfinderRoadmap | null>(null)
  const [pathfinderLoading, setPathfinderLoading] = useState<boolean>(false)
  const [pathfinderError, setPathfinderError] = useState<string | null>(null)

  // Mental Gym state
  const [activeGymTab, setActiveGymTab] = useState<'gratitude' | 'reframe' | 'breathing'>('gratitude')
  const [gratitude1, setGratitude1] = useState<string>('')
  const [gratitude2, setGratitude2] = useState<string>('')
  const [gratitude3, setGratitude3] = useState<string>('')
  const [gratitudeLogs, setGratitudeLogs] = useState<{ date: string; items: string[] }[]>([])
  const [showGratitudeSuccess, setShowGratitudeSuccess] = useState<boolean>(false)
  const [negativeThought, setNegativeThought] = useState<string>('')
  const [reframedThought, setReframedThought] = useState<string>('')
  const [reframeLoading, setReframeLoading] = useState<boolean>(false)
  const [breathingActive, setBreathingActive] = useState<boolean>(false)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale')
  const [breathingTimer, setBreathingTimer] = useState<number>(4)
  const [breathingCount, setBreathingCount] = useState<number>(0)

  // Name prompt modal input
  const [nameModalInput, setNameModalInput] = useState<string>('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const featureCardsRef = useRef<HTMLElement>(null)

  const [mounted, setMounted] = useState<boolean>(false)
  useEffect(() => { setMounted(true) }, [])

  // ── SINGLE mount useEffect — ALL dynamic/browser-only logic lives here ──────
  useEffect(() => {

    // 1. Time-aware greeting (client-only — never runs on server)
    const hours = new Date().getHours()
    let phrase = 'Good Evening'
    if (hours >= 5 && hours < 12) phrase = 'Good Morning'
    else if (hours >= 12 && hours < 17) phrase = 'Good Afternoon'
    const storedNameEarly = localStorage.getItem('vyoma_username') || ''
    setGreetingText(`${phrase}, ${storedNameEarly || 'friend'} 👋`)

    // 2. URL section param
    const params = new URLSearchParams(window.location.search)
    const sectionParam = params.get('section')
    if (sectionParam) setActiveSection(sectionParam)

    // 3. Load persisted username
    setUsername(storedNameEarly)
    if (!storedNameEarly) setShowNameModal(true)

    // 4. Load chat history
    const storedHistory = localStorage.getItem('vyoma_history')
    let sessions: ChatSession[] = []
    if (storedHistory) {
      try { sessions = JSON.parse(storedHistory) } catch {}
    }
    if (sessions.length > 0) {
      setChatSessions(sessions)
      setCurrentSessionId(sessions[0].id)
    } else {
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [{
          id: 'welcome',
          text: "Hello! I'm Vyoma, your AI wellness companion. How are you feeling today?",
          isUser: false,
          timestamp: new Date().toISOString()
        }]
      }
      setChatSessions([defaultSession])
      setCurrentSessionId(defaultSession.id)
      localStorage.setItem('vyoma_history', JSON.stringify([defaultSession]))
    }

    // 5. Load mood log + check today's entry
    const storedMood = localStorage.getItem('vyoma_mood_log')
    if (storedMood) {
      try {
        const moods = JSON.parse(storedMood) as MoodEntry[]
        setMoodLog(moods)
        const todayStr = new Date().toISOString().split('T')[0]
        const todayMood = moods.find(m => m.date === todayStr)
        if (todayMood) setSelectedMoodToday(todayMood.mood)
      } catch {}
    }

    // 6. Load journal
    const storedJournal = localStorage.getItem('vyoma_journal')
    if (storedJournal) {
      try { setJournalEntries(JSON.parse(storedJournal)) } catch {}
    }

    // 7. Load daily reflection (cached per day)
    const storedReflection = localStorage.getItem('vyoma_reflection')
    if (storedReflection) {
      try {
        const cached = JSON.parse(storedReflection)
        if (cached.date === new Date().toDateString()) {
          setDailyReflection(cached.text)
        }
      } catch {}
    }

    // 8. Load pathfinder roadmap
    const storedRoadmap = localStorage.getItem('vyoma_pathfinder_roadmap')
    if (storedRoadmap) {
      try { setPathfinderRoadmap(JSON.parse(storedRoadmap)) } catch {}
    }

    // 9. Load gratitude logs
    const storedGratitude = localStorage.getItem('vyoma_gratitude_log')
    if (storedGratitude) {
      try { setGratitudeLogs(JSON.parse(storedGratitude)) } catch {}
    }
  }, []) // empty dep array — runs once on client mount only

  // Derived state for hooks
  const currentSession = chatSessions.find(s => s.id === currentSessionId)
  const currentMessages = currentSession ? currentSession.messages : []

  // Additional useEffects
  useEffect(() => {
    if (activeSection === 'chat') {
      scrollToBottom()
    }
  }, [currentMessages, activeSection])
  useEffect(() => {
    if (username && !dailyReflection && activeSection === 'dashboard') {
      fetchDailyReflection(username)
    }
  }, [activeSection, username, dailyReflection])
  useEffect(() => {
    if (!breathingActive) return
    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          // Transition phase
          setBreathingPhase((phase) => {
            if (phase === 'Inhale') return 'Hold (Full)'
            if (phase === 'Hold (Full)') return 'Exhale'
            if (phase === 'Exhale') return 'Hold (Empty)'
            // Completed 1 cycle
            setBreathingCount((c) => c + 1)
            return 'Inhale'
          })
          return 4
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [breathingActive])

  // 4. mounted guard - ONLY early return allowed, must be AFTER all hooks
  if (!mounted) return null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll inside chat



  // Save chat sessions helper
  const saveChatSessions = (updated: ChatSession[]) => {
    setChatSessions(updated)
    localStorage.setItem('vyoma_history', JSON.stringify(updated))
  }

  // Handle name submission
  const handleSaveNameModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameModalInput.trim()) return
    const finalName = nameModalInput.trim()
    setUsername(finalName)
    localStorage.setItem('vyoma_username', finalName)
    setShowNameModal(false)

    // Trigger daily reflection call immediately after name is set
    fetchDailyReflection(finalName)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `The user's name is ${finalName}. Greet them warmly as Vyoma for the very first time. One short paragraph, end with one gentle question.`
            }
          ]
        })
      })
      if (res.ok) {
        const data = await res.json()
        const reply = data.reply
        if (reply) {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: reply.trim(),
            isUser: false,
            timestamp: new Date().toISOString()
          }
          const defaultSession: ChatSession = {
            id: Date.now().toString(),
            title: 'New Conversation',
            messages: [welcomeMessage]
          }
          setChatSessions([defaultSession])
          setCurrentSessionId(defaultSession.id)
          localStorage.setItem('vyoma_history', JSON.stringify([defaultSession]))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Mood Log trigger
  const handleMoodSelect = (mood: string) => {
    const todayStr = new Date().toISOString().split('T')[0]
    // Check if already logged today
    if (moodLog.some(m => m.date === todayStr)) return

    const newLogEntry: MoodEntry = { date: todayStr, mood }
    const updatedLog = [newLogEntry, ...moodLog]
    setMoodLog(updatedLog)
    setSelectedMoodToday(mood)
    localStorage.setItem('vyoma_mood_log', JSON.stringify(updatedLog))
  }

  // Reset/Clear Data
  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This will erase your username, mood logs, journal, and chat history. This action cannot be undone.')) {
      localStorage.clear()
      setUsername('')
      setChatSessions([])
      setCurrentSessionId('')
      setMoodLog([])
      setSelectedMoodToday('')
      setJournalEntries([])
      setDailyReflection('')
      setPathfinderRoadmap(null)
      setGratitudeLogs([])
      setReframedThought('')
      
      // Auto create new conversation for chat
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [
          {
            id: 'welcome',
            text: "Hello! I'm Vyoma, your AI wellness companion. How are you feeling today?",
            isUser: false,
            timestamp: new Date().toISOString()
          }
        ]
      }
      setChatSessions([defaultSession])
      setCurrentSessionId(defaultSession.id)

      setActiveSection('landing')
      setShowNameModal(true)
    }
  }

  // Fetch Daily Reflection from API
  const fetchDailyReflection = async (name: string) => {
    setLoadingReflection(true)
    try {
      const cached = JSON.parse(localStorage.getItem("vyoma_reflection") || "null")
      const today = new Date().toDateString()
      if (cached?.date === today) {
        setDailyReflection(cached.text)
      } else {
        const res = await fetch('/api/reflect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        })
        if (res.ok) {
          const data = await res.json()
          if (data.reflection) {
            const text = data.reflection.trim()
            setDailyReflection(text)
            localStorage.setItem("vyoma_reflection", JSON.stringify({ date: today, text }))
          } else {
            setDailyReflection('Take a deep breath and connect with your inner calm today. Vyoma is here for you.')
          }
        } else {
          setDailyReflection('Take a deep breath and connect with your inner calm today. Vyoma is here for you.')
        }
      }
    } catch (error) {
      console.error("Vyoma API error:", error)
      setDailyReflection('Take a deep breath and connect with your inner calm today. Vyoma is here for you.')
    } finally {
      setLoadingReflection(false)
    }
  }

  // Auto-fetch reflection on dashboard if not yet cached for today

  // Section Change Helper (clears mobile nav menu)
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
  }

  // Explore features scroll helper
  const handleExploreFeatures = () => {
    featureCardsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // GLM Chat Completion
  const handleSendMessage = async () => {
    if (!chatInputValue.trim() || !currentSessionId) return

    const textToSend = chatInputValue.trim()
    setChatInputValue('')

    // 1. Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        const newMessages = [...session.messages, userMessage]
        // Set title if it was the default title
        let newTitle = session.title
        if (session.title === 'New Conversation' || session.title === 'New Chat') {
          newTitle = textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '')
        }
        return {
          ...session,
          title: newTitle,
          messages: newMessages
        }
      }
      return session
    })
    saveChatSessions(updatedSessions)
    setChatLoading(true)

    // Get current session messages to send (limit to last 10)
    const sessionToUse = updatedSessions.find(s => s.id === currentSessionId)
    const recentMessages = sessionToUse ? sessionToUse.messages : []
    const apiMessages = recentMessages.slice(-10).map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.text
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      if (!res.ok) {
        throw new Error(`Groq call failed: ${res.status}`)
      }

      const data = await res.json()
      const reply = data.reply
      if (!reply) throw new Error("Empty chat response")

      const aiResponseText = reply

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date().toISOString()
      }

      const finalSessions = updatedSessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, aiMessage]
          }
        }
        return session
      })
      saveChatSessions(finalSessions)
    } catch (error) {
      console.error("Vyoma API error:", error)
      // Append failure response to chat
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Vyoma couldn't respond right now. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      }
      const finalSessions = updatedSessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, errorMsg]
          }
        }
        return session
      })
      saveChatSessions(finalSessions)
    } finally {
      setChatLoading(false)
    }
  }

  // Create New Chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          id: 'welcome',
          text: "Hello! I'm Vyoma. Let's begin a fresh page. What is on your mind today?",
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]
    }
    const updated = [newSession, ...chatSessions]
    saveChatSessions(updated)
    setCurrentSessionId(newSession.id)
  }

  // Delete Chat Session
  const handleDeleteChatSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const filtered = chatSessions.filter(s => s.id !== id)
    
    if (filtered.length === 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [
          {
            id: 'welcome',
            text: "Hello! I'm Vyoma. What is on your mind today?",
            isUser: false,
            timestamp: new Date().toISOString()
          }
        ]
      }
      saveChatSessions([newSession])
      setCurrentSessionId(newSession.id)
    } else {
      saveChatSessions(filtered)
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id)
      }
    }
  }

  // Save Journal Entry
  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!journalText.trim() || journalLoading) return

    const textToSave = journalText.trim()
    setJournalText('')
    setJournalLoading(true)

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryText: textToSave })
      })

      let analysis: string | undefined = undefined
      if (res.ok) {
        const data = await res.json()
        if (data.analysis) {
          analysis = data.analysis
        }
      }

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        text: textToSave,
        analysis
      }

      const updated = [newEntry, ...journalEntries]
      setJournalEntries(updated)
      localStorage.setItem('vyoma_journal', JSON.stringify(updated))
    } catch (err) {
      console.error("Journal analysis error:", err)
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        text: textToSave
      }
      const updated = [newEntry, ...journalEntries]
      setJournalEntries(updated)
      localStorage.setItem('vyoma_journal', JSON.stringify(updated))
    } finally {
      setJournalLoading(false)
    }
  }

  // PathFinder Roadmap Generation
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pathfinderGoal.trim()) return

    setPathfinderLoading(true)
    setPathfinderError(null)
    const goalText = pathfinderGoal.trim()
    try {
      const res = await fetch('/api/pathfinder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalText })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Pathfinder error: ${res.status}`)
      }

      const data = await res.json()
      if (data.roadmap && Array.isArray(data.roadmap.stages)) {
        setPathfinderRoadmap(data.roadmap)
        localStorage.setItem('vyoma_pathfinder_roadmap', JSON.stringify(data.roadmap))
      } else {
        throw new Error('Invalid roadmap data structure')
      }
    } catch (error) {
      console.error("Roadmap generation failed:", error)
      setPathfinderError("Vyoma couldn't chart your path right now. Please try again.")
    } finally {
      setPathfinderLoading(false)
    }
  }

  // Cognitive Reframer
  const handleReframeThought = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!negativeThought.trim()) return
    setReframeLoading(true)
    const thought = negativeThought.trim()
    try {
      const res = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.reframedThought) {
          setReframedThought(data.reframedThought.trim())
        } else {
          setReframedThought("Vyoma couldn't respond right now. Please try again.")
        }
      } else {
        setReframedThought("Vyoma couldn't respond right now. Please try again.")
      }
    } catch (error) {
      console.error("Reframe failed", error)
      setReframedThought("Vyoma couldn't respond right now. Please try again.")
    } finally {
      setReframeLoading(false)
    }
  }

  // Gratitude Submit
  const handleSaveGratitude = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) return

    const items = [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()].filter(i => i !== '')
    const logItem = {
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      items
    }
    const updated = [logItem, ...gratitudeLogs]
    setGratitudeLogs(updated)
    localStorage.setItem('vyoma_gratitude_log', JSON.stringify(updated))

    setGratitude1('')
    setGratitude2('')
    setGratitude3('')
    setShowGratitudeSuccess(true)
    setTimeout(() => setShowGratitudeSuccess(false), 3000)
  }

  // Box Breathing Guide Timer Loop

  const getBreathingInstruction = () => {
    if (breathingPhase === 'Inhale') return 'Breathe In slowly...'
    if (breathingPhase === 'Hold (Full)') return 'Hold your breath...'
    if (breathingPhase === 'Exhale') return 'Release slowly...'
    return 'Hold empty...'
  }

  const getCircleStyle = () => {
    if (!breathingActive) return {}
    switch (breathingPhase) {
      case 'Inhale':
        return {
          transform: 'scale(1.6)',
          transition: 'transform 4s linear',
          boxShadow: '0 0 40px rgba(124, 92, 255, 0.8)',
        }
      case 'Hold (Full)':
        return {
          transform: 'scale(1.6)',
          transition: 'none',
          boxShadow: '0 0 50px rgba(0, 229, 255, 0.8)',
        }
      case 'Exhale':
        return {
          transform: 'scale(1.0)',
          transition: 'transform 4s linear',
          boxShadow: '0 0 20px rgba(124, 92, 255, 0.3)',
        }
      case 'Hold (Empty)':
        return {
          transform: 'scale(1.0)',
          transition: 'none',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
        }
    }
  }

  // Prevent server/client HTML mismatch — render nothing until client hydrates

  return (
    <main className="relative min-h-screen overflow-hidden text-text">
      <StarField />
      <FloatingParticles />

      {/* -------------------- 1. FIRST VISIT USERNAME MODAL -------------------- */}
      {showNameModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <GlassmorphicCard variant="lg" glow="primary" className="max-w-md w-full p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full glass-dark flex items-center justify-center border border-primary/40 shadow-lg glow-primary">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome to Vyoma</h2>
              <p className="text-text-muted text-sm leading-relaxed">
                I am your personal guide and companion. What should I call you as we walk this path together?
              </p>
            </div>
            <form onSubmit={handleSaveNameModal} className="space-y-4">
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Enter your name..."
                value={nameModalInput}
                onChange={(e) => setNameModalInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-center text-text placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent-light text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
              >
                Begin Journey
              </button>
            </form>
          </GlassmorphicCard>
        </div>
      )}

      {/* -------------------- 2. LANDING PAGE VIEW -------------------- */}
      {activeSection === 'landing' && (
        <>
          <Header activeSection={activeSection} onNavigate={handleSectionChange} />

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8 pt-24 md:pt-0">
            <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 order-2 md:order-1">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
                    Your Personal AI Wellness Companion
                  </h1>
                  <p className="text-lg text-text-muted leading-relaxed">
                    Find balance and clarity with Vyoma, your 24/7 AI companion designed to support your emotional wellbeing and help you navigate life&apos;s challenges.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleSectionChange('chat')}
                    className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent-light text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 inline-flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Start Talking
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={handleExploreFeatures}
                    className="cursor-pointer"
                  >
                    <GlassmorphicCard variant="dark" className="px-8 py-3.5 text-center cursor-pointer hover:border-accent-cyan/50 transition-colors">
                      <span className="text-text font-semibold">Explore Features</span>
                    </GlassmorphicCard>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-cyan">24/7</p>
                    <p className="text-sm text-text-muted">Available Anytime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-sm text-text-muted">Confidential</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-light">∞</p>
                    <p className="text-sm text-text-muted">Supportive</p>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="order-1 md:order-2 flex justify-center">
                <AnimatedOrb />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section ref={featureCardsRef} className="relative min-h-screen flex items-center py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-text mb-4">
                  Experience Wellness Your Way
                </h2>
                <p className="text-lg text-text-muted max-w-2xl mx-auto">
                  Vyoma offers a range of features designed to support your mental health journey
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard
                  icon={<Heart className="w-6 h-6" />}
                  title="Emotional Support"
                  description="Chat with an AI companion who listens without judgment and provides thoughtful guidance for your emotional challenges."
                  onClick={() => handleSectionChange('chat')}
                />
                <FeatureCard
                  icon={<Brain className="w-6 h-6" />}
                  title="Mindful Coaching"
                  description="Receive personalized mindfulness exercises and techniques tailored to your emotional state and goals."
                  onClick={() => handleSectionChange('gym')}
                />
                <FeatureCard
                  icon={<Leaf className="w-6 h-6" />}
                  title="Wellness Tracking"
                  description="Monitor your mood patterns and emotional progress over time with insightful reflections and analytics."
                  onClick={() => handleSectionChange('dashboard')}
                />
                <FeatureCard
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Personalized Insights"
                  description="Discover patterns in your thoughts and behaviors with AI-driven insights that help you grow and heal."
                  onClick={() => handleSectionChange('pathfinder')}
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <GlassmorphicCard variant="lg" glow="primary" className="p-12 text-center space-y-6">
                <h3 className="text-3xl font-bold text-text">
                  Ready to Start Your Wellness Journey?
                </h3>
                <p className="text-lg text-text-muted">
                  Join thousands who are already finding clarity and support with Vyoma
                </p>
                <button
                  onClick={() => handleSectionChange('dashboard')}
                  className="inline-block px-8 py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent-light text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 cursor-pointer"
                >
                  Get Started Now
                </button>
              </GlassmorphicCard>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto text-center text-text-muted text-sm">
              <p>© 2025 Vyoma. Your wellness companion, powered by AI.</p>
            </div>
          </footer>
        </>
      )}

      {/* -------------------- 3. APPLICATION WRAPPER & SIDEBAR -------------------- */}
      {activeSection !== 'landing' && (
        <div className="min-h-screen">
          {/* Main Sidebar (Desktop) */}
          <aside className="fixed left-0 top-0 h-screen w-64 glass-dark p-6 border-r border-white/10 z-40 hidden md:flex flex-col">
            <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => handleSectionChange('dashboard')}>
              <BrandLogo />
              <span className="text-lg font-bold text-text">Vyoma</span>
            </div>

            <nav className="flex-1 space-y-2">
              <button
                onClick={() => handleSectionChange('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  activeSection === 'dashboard'
                    ? 'bg-primary/20 border border-primary/50 text-text'
                    : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                }`}
              >
                <BarChart2 className="w-5 h-5 text-primary" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleSectionChange('chat')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  activeSection === 'chat'
                    ? 'bg-primary/20 border border-primary/50 text-text'
                    : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                }`}
              >
                <MessageCircle className="w-5 h-5 text-accent-cyan" />
                <span>Talk to Vyoma</span>
              </button>

              <button
                onClick={() => handleSectionChange('journal')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  activeSection === 'journal'
                    ? 'bg-primary/20 border border-primary/50 text-text'
                    : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                }`}
              >
                <BookOpen className="w-5 h-5 text-accent-light" />
                <span>Reflective Journal</span>
              </button>

              <button
                onClick={() => handleSectionChange('pathfinder')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  activeSection === 'pathfinder'
                    ? 'bg-primary/20 border border-primary/50 text-text'
                    : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                }`}
              >
                <Compass className="w-5 h-5 text-accent-cyan" />
                <span>PathFinder</span>
              </button>

              <button
                onClick={() => handleSectionChange('gym')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  activeSection === 'gym'
                    ? 'bg-primary/20 border border-primary/50 text-text'
                    : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                }`}
              >
                <Brain className="w-5 h-5 text-primary" />
                <span>Mental Gym</span>
              </button>

            </nav>

            <button
              onClick={() => handleSectionChange('landing')}
              className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-text transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer border border-white/5"
            >
              <LogOut className="w-5 h-5" />
              Back to Home
            </button>
          </aside>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-lg bg-surface/80 backdrop-blur border border-white/10 text-text cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-64 glass-dark p-6 border-r border-white/10 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pt-6">
                    <BrandLogo />
                    <span className="text-lg font-bold text-text">Vyoma</span>
                  </div>
                  <nav className="space-y-2">
                    <button
                      onClick={() => handleSectionChange('dashboard')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium ${
                        activeSection === 'dashboard' ? 'bg-primary/20 border border-primary/50 text-text' : 'text-text-muted'
                      }`}
                    >
                      <BarChart2 className="w-5 h-5 text-primary" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleSectionChange('chat')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium ${
                        activeSection === 'chat' ? 'bg-primary/20 border border-primary/50 text-text' : 'text-text-muted'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 text-accent-cyan" />
                      <span>Talk to Vyoma</span>
                    </button>
                    <button
                      onClick={() => handleSectionChange('journal')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium ${
                        activeSection === 'journal' ? 'bg-primary/20 border border-primary/50 text-text' : 'text-text-muted'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 text-accent-light" />
                      <span>Reflective Journal</span>
                    </button>
                    <button
                      onClick={() => handleSectionChange('pathfinder')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium ${
                        activeSection === 'pathfinder' ? 'bg-primary/20 border border-primary/50 text-text' : 'text-text-muted'
                      }`}
                    >
                      <Compass className="w-5 h-5 text-accent-cyan" />
                      <span>PathFinder</span>
                    </button>
                    <button
                      onClick={() => handleSectionChange('gym')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium ${
                        activeSection === 'gym' ? 'bg-primary/20 border border-primary/50 text-text' : 'text-text-muted'
                      }`}
                    >
                      <Brain className="w-5 h-5 text-primary" />
                      <span>Mental Gym</span>
                    </button>
                  </nav>
                </div>
                <button
                  onClick={() => handleSectionChange('landing')}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 text-text-muted flex items-center gap-3 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Core SPA Workspace Area */}
          <div className="md:ml-64 relative z-10 min-h-screen flex flex-col">
            
            {/* -------------------- 3.1 DASHBOARD VIEW -------------------- */}
            {activeSection === 'dashboard' && (
              <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full pt-16 md:pt-8 flex-1">
                {/* Header Greeting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                      {greetingText}
                    </h1>
                    <p className="text-text-muted text-sm">
                      Welcome back. You have logged into your safe wellness space.
                    </p>
                  </div>
                </div>

                {/* Grid layout for Dashboard Elements */}
                <div className="grid md:grid-cols-12 gap-6">
                  {/* Left Main (8 cols) */}
                  <div className="md:col-span-8 space-y-6">
                    
                    {/* Dynamic VLogo Display */}
                    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden glass-lg shadow-xl shadow-primary/5">
                      <VLogo />
                    </div>

                    {/* Mood Check-In Card */}
                    <GlassmorphicCard variant="dark" glow="primary" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                          <Leaf className="w-5 h-5 text-accent-cyan" />
                          <h2 className="text-lg font-semibold">Mood Check-in</h2>
                        </div>

                        {selectedMoodToday ? (
                          <div className="py-4 px-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                            <p className="text-sm font-medium text-text">
                              You checked in today. Your mood is logged as:
                            </p>
                            <span className="text-3xl filter drop-shadow">{selectedMoodToday}</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-text-muted">How are you feeling right now? Tap an emoji to check in:</p>
                            <div className="flex justify-between items-center gap-2 max-w-md bg-white/5 p-3 rounded-lg border border-white/5">
                              {['😔', '😐', '🙂', '😊', '🤩'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleMoodSelect(emoji)}
                                  className="w-12 h-12 text-2xl rounded-full hover:bg-white/10 transition-transform active:scale-95 duration-100 flex items-center justify-center cursor-pointer hover:shadow"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </GlassmorphicCard>

                    {/* Daily Reflection Card */}
                    <GlassmorphicCard variant="dark" glow="cyan" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-5 h-5 text-accent-light" />
                            <h2 className="text-lg font-semibold">Daily Reflection</h2>
                          </div>
                          <button
                            onClick={() => fetchDailyReflection(username)}
                            disabled={loadingReflection}
                            className="text-text-muted hover:text-text cursor-pointer transition-colors p-1.5 rounded-full hover:bg-white/5"
                          >
                            <RefreshCw className={`w-4 h-4 ${loadingReflection ? 'animate-spin' : ''}`} />
                          </button>
                        </div>

                        {loadingReflection ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-full"></div>
                            <div className="h-4 bg-white/10 rounded w-5/6"></div>
                          </div>
                        ) : (
                          <div className="space-y-2 leading-relaxed">
                            <p className="text-base text-text italic">
                              &ldquo;{dailyReflection || 'Let your thoughts settle today. Take everything one step at a time.'}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </GlassmorphicCard>
                  </div>

                  {/* Right Side (4 cols) */}
                  <div className="md:col-span-4 space-y-6">
                    {/* Navigation Cards */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted px-1">Navigation</h3>
                      <button
                        onClick={() => handleSectionChange('chat')}
                        className="w-full text-left group"
                      >
                        <GlassmorphicCard variant="dark" hover className="p-4 flex items-center justify-between border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Talk to Vyoma</h4>
                              <p className="text-text-muted text-xs">Empathetic chat guidance</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </GlassmorphicCard>
                      </button>

                      <button
                        onClick={() => handleSectionChange('journal')}
                        className="w-full text-left group"
                      >
                        <GlassmorphicCard variant="dark" hover className="p-4 flex items-center justify-between border-accent-light/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent-light/10 flex items-center justify-center text-accent-light group-hover:scale-110 transition-transform">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Reflective Journal</h4>
                              <p className="text-text-muted text-xs">Write and store logs</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </GlassmorphicCard>
                      </button>

                      <button
                        onClick={() => handleSectionChange('pathfinder')}
                        className="w-full text-left group"
                      >
                        <GlassmorphicCard variant="dark" hover className="p-4 flex items-center justify-between border-accent-cyan/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                              <Compass className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">PathFinder Guide</h4>
                              <p className="text-text-muted text-xs">AI goal mapper</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </GlassmorphicCard>
                      </button>

                      <button
                        onClick={() => handleSectionChange('gym')}
                        className="w-full text-left group"
                      >
                        <GlassmorphicCard variant="dark" hover className="p-4 flex items-center justify-between border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Brain className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Mental Gym Exercises</h4>
                              <p className="text-text-muted text-xs">Gratitude & breathing</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </GlassmorphicCard>
                      </button>
                    </div>

                    {/* Stats Dashboard Card */}
                    <GlassmorphicCard variant="dark" className="p-5 space-y-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Analytics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-muted">Journal Entries</span>
                          <span className="font-bold text-accent-light">{journalEntries.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-muted">Mood Log Count</span>
                          <span className="font-bold text-accent-cyan">{moodLog.length} days</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-muted">Gratitude Entries</span>
                          <span className="font-bold text-primary">{gratitudeLogs.length} logs</span>
                        </div>
                      </div>
                    </GlassmorphicCard>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- 3.2 CHAT INTERFACE VIEW -------------------- */}
            {activeSection === 'chat' && (
              <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-screen w-full relative">
                {/* Chat History Panel (Sidebar) */}
                <div className="w-full md:w-64 glass-dark border-b md:border-b-0 md:border-r border-white/10 flex flex-col p-4 z-20 pt-16 md:pt-6 h-56 md:h-full">
                  <button
                    onClick={handleNewChat}
                    className="w-full py-3 mb-4 rounded-lg bg-gradient-to-r from-primary to-accent-light text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow hover:shadow-lg transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    <p className="text-xs uppercase tracking-wider text-text-muted font-bold px-2 mb-2">History</p>
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setCurrentSessionId(session.id)}
                        className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                          session.id === currentSessionId
                            ? 'bg-primary/20 border border-primary/40 text-text'
                            : 'text-text-muted hover:bg-white/5 hover:text-text border border-transparent'
                        }`}
                      >
                        <span className="truncate max-w-[130px] font-medium">{session.title}</span>
                        <button
                          onClick={(e) => handleDeleteChatSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity cursor-pointer p-1 rounded hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Chat Board */}
                <div className="flex-1 flex flex-col h-[calc(100vh-14rem)] md:h-full justify-between relative bg-background/20">
                  {/* Messages Scroll Area */}
                  <div 
                    className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124, 92, 255, 0.3) transparent' }}
                  >
                    <div className="max-w-4xl mx-auto space-y-4 h-full flex flex-col">
                      {currentMessages.length === 0 && !chatLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20">
                          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-2xl shadow-[0_0_20px_rgba(124,92,255,0.4)]">
                            V
                          </div>
                          <p className="text-text-muted">Vyoma is listening...</p>
                        </div>
                      ) : (
                        currentMessages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            text={message.text}
                            isUser={message.isUser}
                            timestamp={message.timestamp}
                          />
                        ))
                      )}

                      {chatLoading && (
                        <MessageBubble text="" isUser={false} isTyping={true} />
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input controls box */}
                  <div className="glass-dark border-t border-white/10 px-4 md:px-8 py-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSendMessage()
                        }}
                        className="flex gap-3 items-end"
                      >
                        <textarea
                          disabled={chatLoading}
                          placeholder="Talk to Vyoma..."
                          value={chatInputValue}
                          onChange={(e) => setChatInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={1}
                          className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 resize-none overflow-y-auto max-h-32"
                          style={{ minHeight: '56px' }}
                        />
                        <button
                          type="submit"
                          disabled={!chatInputValue.trim() || chatLoading}
                          className="px-5 py-4 rounded-xl bg-gradient-to-r from-primary to-[#9c83ff] text-white font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,92,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mb-0.5"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                      <p className="text-[10px] text-text-muted mt-3 text-center">
                        Vyoma is here to support you. For emergencies, please contact local professional mental health assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- 3.3 JOURNAL VIEW -------------------- */}
            {activeSection === 'journal' && (
              <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full pt-16 md:pt-8 flex-1">
                <div className="border-b border-white/10 pb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-accent-light" />
                    Reflective Journal
                  </h1>
                  <p className="text-text-muted text-sm">
                    Write down your stream of consciousness. Your private thoughts stay fully local.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Journal Input Field */}
                  <GlassmorphicCard variant="dark" glow="light" className="p-6">
                    <form onSubmit={handleSaveJournal} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-muted">Write your reflection...</label>
                        <textarea
                          rows={6}
                          disabled={journalLoading}
                          placeholder="How are you really doing today? What challenges are you facing, and what are you proud of?"
                          value={journalText}
                          onChange={(e) => setJournalText(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text placeholder-text-muted focus:outline-none focus:border-accent-light/50 transition-colors resize-none disabled:opacity-50"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={journalLoading || !journalText.trim()}
                        className="mt-4 px-6 py-3 rounded-xl font-semibold text-white transition-all bg-gradient-to-r from-[#7C5CFF] to-[#4FC3F7] hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {journalLoading ? (
                          <>
                            <span className="animate-spin">⟳</span>
                            Vyoma is reflecting...
                          </>
                        ) : (
                          <>
                            ✦ Save Reflection
                          </>
                        )}
                      </button>
                    </form>
                  </GlassmorphicCard>

                  {/* Journal History */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Recent Entries</h2>
                    {journalEntries.length === 0 ? (
                      <GlassmorphicCard variant="dark" className="p-6 text-center text-text-muted">
                        No reflections written yet. Start your journey above.
                      </GlassmorphicCard>
                    ) : (
                      <div className="space-y-4">
                        {journalEntries.slice(0, 3).map((entry) => {
                          const isExpanded = expandedJournalId === entry.id
                          return (
                            <GlassmorphicCard
                              key={entry.id}
                              variant="dark"
                              className="p-5 cursor-pointer hover:border-white/20 transition-all"
                              onClick={() => setExpandedJournalId(isExpanded ? null : entry.id)}
                            >
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex items-center gap-2 text-xs text-accent-light font-bold">
                                  <Calendar className="w-4 h-4" />
                                  <span>{entry.date}</span>
                                  <span className="text-text-muted">•</span>
                                  <Clock className="w-4 h-4 text-text-muted" />
                                  <span className="text-text-muted">{entry.timestamp}</span>
                                </div>
                                <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded">
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-text mt-2 whitespace-pre-wrap">
                                {isExpanded ? entry.text : `${entry.text.slice(0, 100)}${entry.text.length > 100 ? '...' : ''}`}
                              </p>
                              {isExpanded && entry.analysis && (
                                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-accent-light bg-white/5 p-3 rounded-lg">
                                  <span className="font-bold block mb-1">Vyoma's Insight:</span>
                                  <p>{entry.analysis}</p>
                                </div>
                              )}
                            </GlassmorphicCard>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- 3.4 PATHFINDER VIEW -------------------- */}
            {activeSection === 'pathfinder' && (
              <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full pt-16 md:pt-8 flex-1">
                <div className="border-b border-white/10 pb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                    <Compass className="w-8 h-8 text-accent-cyan" />
                    PathFinder Roadmap
                  </h1>
                  <p className="text-text-muted text-sm">
                    Enter a long-term goal or transition. Vyoma will map out a customized, structured stage plan.
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Goal Input form */}
                  <GlassmorphicCard variant="dark" glow="cyan" className="p-6">
                    <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-muted">What path would you like to chart?</label>
                        <input
                          type="text"
                          required
                          value={pathfinderGoal}
                          onChange={(e) => setPathfinderGoal(e.target.value)}
                          placeholder="e.g. Navigating career switch to UX design, building better daily sleep patterns..."
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text placeholder-text-muted focus:outline-none focus:border-accent-cyan/50 transition-colors"
                        />
                      </div>
                      {pathfinderError && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                          {pathfinderError}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={pathfinderLoading || !pathfinderGoal.trim()}
                          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent-cyan text-white font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                          {pathfinderLoading ? 'Charting Pathway...' : 'Map Roadmap'}
                        </button>
                      </div>
                    </form>
                  </GlassmorphicCard>

                  {pathfinderLoading ? (
                    <GlassmorphicCard variant="dark" className="p-12 text-center text-text-muted space-y-3">
                      <Compass className="w-12 h-12 mx-auto text-primary animate-pulse" />
                      <p>Vyoma is mapping your path...</p>
                    </GlassmorphicCard>
                  ) : pathfinderRoadmap ? (
                    <div className="space-y-6">
                      {/* Goal Banner */}
                      <GlassmorphicCard variant="dark" className="p-8 text-center border-t-4 border-t-primary">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                          Timeline: {pathfinderRoadmap.timeline}
                        </span>
                        <h2 className="text-2xl font-bold text-white">{pathfinderRoadmap.goal}</h2>
                      </GlassmorphicCard>

                      {/* Stages */}
                      <div className="relative pl-8 space-y-8 border-l-2 border-primary/30 ml-4 py-2">
                        {pathfinderRoadmap.stages.map((stage, idx) => (
                          <div key={idx} className="relative group">
                            {/* Number Circle */}
                            <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(124,92,255,0.5)] transition-all">
                              {stage.stage}
                            </div>
                            <GlassmorphicCard variant="dark" className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                                <span className="text-xs px-2 py-1 bg-white/5 rounded text-text-muted">{stage.duration}</span>
                              </div>
                              <ul className="space-y-2 mb-4">
                                {stage.actions.map((action, aIdx) => (
                                  <li key={aIdx} className="flex items-start gap-2 text-sm text-text-muted">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="text-xs text-accent-cyan font-medium pt-3 border-t border-white/10">
                                Milestone: {stage.milestone}
                              </div>
                            </GlassmorphicCard>
                          </div>
                        ))}
                      </div>

                      {/* First Step */}
                      <GlassmorphicCard variant="dark" glow="primary" className="p-8 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-l-primary">
                        <p className="text-sm font-bold text-primary mb-2">Your first step today:</p>
                        <p className="text-lg text-white font-medium">{pathfinderRoadmap.firstStep}</p>
                      </GlassmorphicCard>
                    </div>
                  ) : (
                    <GlassmorphicCard variant="dark" className="p-12 text-center text-text-muted space-y-3">
                      <Compass className="w-12 h-12 mx-auto text-white/20 animate-spin" style={{ animationDuration: '8s' }} />
                      <p>Enter your dilemma or project roadmap goal above to generate your guide timeline.</p>
                    </GlassmorphicCard>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- 3.5 MENTAL GYM VIEW -------------------- */}
            {activeSection === 'gym' && (
              <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full pt-16 md:pt-8 flex-1">
                <div className="border-b border-white/10 pb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-primary" />
                    Mental Gym
                  </h1>
                  <p className="text-text-muted text-sm">
                    Keep your focus and resilience strong. Switch between active modules below.
                  </p>
                </div>

                {/* Gym navigation tabs */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setActiveGymTab('gratitude')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                      activeGymTab === 'gratitude' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    Gratitude list
                  </button>
                  <button
                    onClick={() => setActiveGymTab('reframe')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                      activeGymTab === 'reframe' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    Cognitive Reframer
                  </button>
                  <button
                    onClick={() => setActiveGymTab('breathing')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                      activeGymTab === 'breathing' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    Box Breathing
                  </button>
                </div>

                {/* Sub Tab contents */}
                <div className="space-y-6">
                  
                  {/* Tab 1: Gratitude List */}
                  {activeGymTab === 'gratitude' && (
                    <div className="space-y-6">
                      <GlassmorphicCard variant="dark" glow="primary" className="p-6 space-y-4">
                        <div>
                          <h2 className="text-xl font-bold">Gratitude Check</h2>
                          <p className="text-text-muted text-xs">Acknowledge three good things in your day, no matter how small.</p>
                        </div>

                        <form onSubmit={handleSaveGratitude} className="space-y-3">
                          <input
                            type="text"
                            placeholder="1. I am grateful for..."
                            value={gratitude1}
                            onChange={(e) => setGratitude1(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="2. I am grateful for..."
                            value={gratitude2}
                            onChange={(e) => setGratitude2(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="3. I am grateful for..."
                            value={gratitude3}
                            onChange={(e) => setGratitude3(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                          />

                          <div className="flex justify-between items-center pt-2">
                            {showGratitudeSuccess ? (
                              <span className="text-xs text-accent-cyan font-bold animate-pulse">Gratitude logged!</span>
                            ) : (
                              <span></span>
                            )}
                            <button
                              type="submit"
                              disabled={!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()}
                              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold transition-all hover:shadow disabled:opacity-50 cursor-pointer"
                            >
                              Log Gratitude
                            </button>
                          </div>
                        </form>
                      </GlassmorphicCard>

                      {/* History Log */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">History</h3>
                        {gratitudeLogs.length === 0 ? (
                          <p className="text-xs text-text-muted pl-1">No gratitude checks logged yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {gratitudeLogs.map((log, idx) => (
                              <GlassmorphicCard key={idx} variant="dark" className="p-4 space-y-2">
                                <span className="text-[10px] text-primary font-bold">{log.date}</span>
                                <ul className="list-disc list-inside text-xs space-y-1 text-text-muted">
                                  {log.items.map((item, id) => (
                                    <li key={id}>{item}</li>
                                  ))}
                                </ul>
                              </GlassmorphicCard>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Cognitive Reframer */}
                  {activeGymTab === 'reframe' && (
                    <GlassmorphicCard variant="dark" glow="primary" className="p-6 space-y-6">
                      <div>
                        <h2 className="text-xl font-bold">Cognitive Reframer</h2>
                        <p className="text-text-muted text-xs">Flip stressful, negative thoughts into balanced, resilient perspectives.</p>
                      </div>

                      <form onSubmit={handleReframeThought} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-text-muted">Write your anxious or negative thought:</label>
                          <textarea
                            rows={3}
                            required
                            value={negativeThought}
                            onChange={(e) => setNegativeThought(e.target.value)}
                            placeholder="e.g. I failed the demo call today. I'm terrible at public presenting and won't get promoted."
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                          ></textarea>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={reframeLoading || !negativeThought.trim()}
                            className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold transition-all hover:shadow disabled:opacity-50 cursor-pointer"
                          >
                            {reframeLoading ? 'Reframing...' : 'Reframe'}
                          </button>
                        </div>
                      </form>

                      {reframedThought && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">Reframed Perspective</span>
                          <GlassmorphicCard variant="dark" className="p-4 border-accent-cyan/20 bg-accent-cyan/5">
                            <p className="text-sm leading-relaxed text-text italic">
                              &ldquo;{reframedThought}&rdquo;
                            </p>
                          </GlassmorphicCard>
                        </div>
                      )}
                    </GlassmorphicCard>
                  )}

                  {/* Tab 3: Box Breathing */}
                  {activeGymTab === 'breathing' && (
                    <GlassmorphicCard variant="dark" glow="primary" className="p-6 flex flex-col items-center text-center space-y-8">
                      <div>
                        <h2 className="text-xl font-bold">Box Breathing Coach</h2>
                        <p className="text-text-muted text-xs">Reset your nervous system with a simple structured 4-4-4-4 cycle.</p>
                      </div>

                      {/* Visual breathing circle container */}
                      <div className="h-60 flex items-center justify-center relative w-full">
                        <div
                          style={getCircleStyle()}
                          className={`w-32 h-32 rounded-full border border-white/20 flex flex-col items-center justify-center bg-white/5 shadow-xl transition-all duration-1000`}
                        >
                          {breathingActive ? (
                            <>
                              <span className="text-xs font-semibold uppercase tracking-wider text-text/80 mb-1">
                                {breathingPhase}
                              </span>
                              <span className="text-3xl font-extrabold">{breathingTimer}s</span>
                            </>
                          ) : (
                            <Brain className="w-8 h-8 text-white/40 animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 w-full max-w-sm">
                        {breathingActive ? (
                          <div className="space-y-3">
                            <p className="text-base text-accent-light font-medium h-6">
                              {getBreathingInstruction()}
                            </p>
                            <p className="text-xs text-text-muted">Cycles Completed: {breathingCount}</p>
                            <button
                              onClick={() => {
                                setBreathingActive(false)
                                setBreathingCount(0)
                              }}
                              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer border border-white/10"
                            >
                              End Session
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setBreathingActive(true)
                              setBreathingPhase('Inhale')
                              setBreathingTimer(4)
                            }}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent-light text-white font-bold transition-all shadow hover:shadow-lg active:scale-95 cursor-pointer"
                          >
                            Begin Breathing Cycle
                          </button>
                        )}
                      </div>
                    </GlassmorphicCard>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  )
}
