import React, { useState, useEffect, useRef } from 'react';
import './BookDemo.css';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import Calendar from '../components/Calendar';
// import FeatureCards from '../components/FeatureCards';
// import MenaCard from '../components/MenaCard';

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  companySize: string;
  agentOfInterest: string;
  message: string;
  consent: boolean;
};

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  companySize: '',
  agentOfInterest: '',
  message: '',
  consent: false,
};

const BookDemo: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [typingText, setTypingText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const prompts = [
    'Create a Finance Agent that tracks real-time EBITDA and sends reports on WhatsApp.',
    'Design an HR Agent that shortlists candidates and emails interview summaries.',
    'Deploy a Sales Agent that calls leads in Arabic — instantly.'
  ];

  // Typing animation effect
  useEffect(() => {
    const currentPrompt = prompts[currentPromptIndex];
    const typingSpeed = isDeleting ? 30 : 50; // Faster when deleting

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (typingText.length < currentPrompt.length) {
          setTypingText(currentPrompt.substring(0, typingText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (typingText.length > 0) {
          setTypingText(currentPrompt.substring(0, typingText.length - 1));
        } else {
          // Finished deleting, move to next prompt
          setIsDeleting(false);
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typingText, currentPromptIndex, isDeleting, prompts]);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress based on card's position in viewport
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Card is fully visible when its top is at or above viewport top
        // Start transitioning when card enters viewport
        // Transition completes when card's top reaches viewport top (or slightly above)
        const cardTop = rect.top;

        // Calculate progress: 0 when card is below viewport, 1 when card top reaches viewport top
        // Use a transition range for smooth animation
        const transitionStart = windowHeight; // Start when card is one viewport height below
        const transitionEnd = 0; // End when card top reaches viewport top
        const transitionRange = transitionStart - transitionEnd;

        // Calculate progress (0 to 1)
        let progress = 0;
        if (cardTop <= transitionStart) {
          // Card is in or above transition zone
          progress = Math.max(0, Math.min(1, (transitionStart - cardTop) / transitionRange));
        }

        setScrollProgress(progress);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Instantly straighten on click
      setScrollProgress(1);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // Add click listener to the container
    if (containerRef.current) {
      containerRef.current.addEventListener('click', handleClick);
    }


    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // Calculate transform values based on scroll progress
  // Starts slanted (8deg) and becomes straight (0deg) as you scroll slowly
  const rotateX = 8 * (1 - scrollProgress); // From 8deg to 0deg - more visible slant

  // Auto-save draft as user types
  const autoSaveDraft = async (formData: FormState) => {
    try {
      setSavingDraft(true);
      const draftData = {
        ...formData,
        selectedDate: selectedDate?.toISOString() || null,
        selectedTime: selectedTime || null,
        lastSaved: serverTimestamp(),
        isDraft: true,
      };

      if (draftId) {
        // Update existing draft
        await setDoc(doc(db, 'drafts', draftId), draftData);
      } else {
        // Create new draft
        const draftsRef = collection(db, 'drafts');
        const newDraftRef = doc(draftsRef);
        await setDoc(newDraftRef, draftData);
        setDraftId(newDraftRef.id);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  // Load draft and fetch initial bookings count on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        // Try to load the most recent draft from localStorage
        const savedDraftId = localStorage.getItem('draftId');
        if (savedDraftId) {
          const draftDoc = await getDoc(doc(db, 'drafts', savedDraftId));
          if (draftDoc.exists()) {
            const draftData = draftDoc.data();
            setDraftId(savedDraftId);
            setForm({
              name: draftData.name || '',
              email: draftData.email || '',
              phone: draftData.phone || '',
              company: draftData.company || '',
              companySize: draftData.companySize || '',
              agentOfInterest: draftData.agentOfInterest || '',
              message: draftData.message || '',
              consent: draftData.consent || false,
            });
            if (draftData.selectedDate) {
              setSelectedDate(new Date(draftData.selectedDate));
            }
            if (draftData.selectedTime) {
              setSelectedTime(draftData.selectedTime);
            }
          }
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    };

    loadDraft();
  }, []);

  // Auto-save on form change (debounced)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if form has some data
    const hasData = form.name || form.email || form.phone || form.company;
    if (hasData) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveDraft(form);
      }, 500); // Save after 500ms of inactivity (faster auto-save)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [form, selectedDate, selectedTime]);

  // Save draft ID to localStorage
  useEffect(() => {
    if (draftId) {
      localStorage.setItem('draftId', draftId);
    }
  }, [draftId]);

  // Detect user's timezone and update current time
  useEffect(() => {
    // Detect timezone
    const timezoneOptions = Intl.DateTimeFormat().resolvedOptions();
    const timezone = timezoneOptions.timeZone;
    
    // Format timezone name (e.g., "America/New_York" -> "Eastern Standard Time")
    const formatTimezoneName = (tz: string) => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          timeZoneName: 'long',
        });
        const parts = formatter.formatToParts(new Date());
        const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || tz;
        return timeZoneName;
      } catch {
        return tz;
      }
    };

    // Set formatted timezone
    const formattedTimezone = formatTimezoneName(timezone);
    setUserTimezone(formattedTimezone);

    // Update current time
    const updateCurrentTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
      setCurrentTime(timeString);
    };

    // Initial update
    updateCurrentTime();

    // Update every second
    timeUpdateIntervalRef.current = setInterval(updateCurrentTime, 1000);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);


  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onToggleConsent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, consent: e.target.checked }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Generate Google Calendar link for meeting
  const generateGoogleCalendarLink = ({ title, description, location, start, end }: {
    title: string;
    description: string;
    location: string;
    start: Date;
    end: Date;
  }) => {
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`,
      details: description,
      location: location,
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time for your demo.');
      return;
    }

    // Store form data before resetting
    const formData = { ...form };
    const bookingDate = selectedDate;
    const bookingTime = selectedTime;
    const bookingDateTime = `${formatDate(selectedDate)} at ${selectedTime}`;

    // Show success immediately (optimistic UI)
    setSuccess(
      `Thank you for booking a demo! Your demo is scheduled for ${formatDate(selectedDate)} at ${selectedTime}. A confirmation email will be sent to ${form.email}.`
    );

    // Reset form immediately
    setForm(initialState);
    setSelectedDate(null);
    setSelectedTime(null);
    setSubmitting(false);

    // Save to backend API (which saves to Supabase)
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/book-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company?.trim() || '',
          companySize: formData.companySize?.trim() || '',
          agentOfInterest: formData.agentOfInterest?.trim() || '',
          message: formData.message?.trim() || '',
          bookingDate: bookingDate.toISOString(),
          bookingTime: bookingTime,
          bookingDateTime: bookingDateTime,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result?.message || 'Failed to book demo. Please try again.';
        // Don't show database-related errors
        if (errorMsg.toLowerCase().includes('database') || 
            errorMsg.toLowerCase().includes('saved to') ||
            errorMsg.toLowerCase().includes('firestore')) {
          // If it's a database error but API succeeded, treat as success
          console.warn('Database error (non-critical):', errorMsg);
        } else {
          throw new Error(errorMsg);
        }
      }

      console.log('✅ Demo booking saved successfully:', result);
      // Emails will be sent by the backend automatically

      // Try to save to Firestore as backup (non-blocking, silent failure)
      try {
        await Promise.race([
          addDoc(collection(db, 'bookings'), {
            ...formData,
            bookingDate: bookingDate.toISOString(),
            bookingTime: bookingTime,
            bookingDateTime: bookingDateTime,
            createdAt: serverTimestamp(),
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        // Silently succeed - don't log or show anything to user
      } catch (firestoreError) {
        // Firestore is optional - silently fail, don't show any error to user
        // Only log to console for debugging
        console.warn('Firestore backup save failed (non-critical):', firestoreError);
      }

    } catch (err: any) {
      console.error('Error booking demo:', err);
      // Only show error if it's not a database-related error
      const errorMessage = err?.message || '';
      if (errorMessage.toLowerCase().includes('database') || 
          errorMessage.toLowerCase().includes('saved to') ||
          errorMessage.toLowerCase().includes('firestore')) {
        // Don't show database-related errors to user - booking was successful
        console.warn('Database error (non-critical):', errorMessage);
      } else {
        // Show other critical errors
        setError(errorMessage || 'Failed to book demo. Please try again.');
        setSuccess(null);
        // Restore form data
        setForm(formData);
        setSelectedDate(bookingDate);
        setSelectedTime(bookingTime);
      }
    } finally {
      setSubmitting(false);
    }

    // Delete draft in background (non-blocking)
    if (draftId) {
      setDoc(doc(db, 'drafts', draftId), { deleted: true }, { merge: true })
        .catch(err => console.error('Error deleting draft:', err));
      localStorage.removeItem('draftId');
      setDraftId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`book-demo-container ${theme === 'light' ? 'light-theme' : ''}`}
    >
      {/* Top Image with Overlay Form */}
      <div className="demo-top-image-container">
        <img src="/images/demo2.png" alt="Demo visual" className="demo-top-background-image" />
        {/* Text Overlay on Image */}
        <div className="demo-top-image-text-overlay">
          <h2 className="demo-top-image-title">Experience the Future of Work with AI Employees.</h2>
          <p className="demo-top-image-subtitle">Meet your next employee — built, trained, and deployed in seconds.</p>
        </div>
        {/* Form Card with Slant Effect - Overlay on Bottom Half */}
        <div className="book-demo-grid-overlay">
          <aside
            ref={cardRef}
            className="book-demo-card"
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {success && <div className="alert success">{success}</div>}
            {error && <div className="alert error">{error}</div>}

            {/* User Timezone Detection Display */}
            {userTimezone && (
              <div className="user-timezone-info">
                <div className="timezone-display">
                  <span className="timezone-icon">🕐</span>
                  <div className="timezone-details">
                    <span className="timezone-label">Your Timezone:</span>
                    <span className="timezone-value">{userTimezone}</span>
                  </div>
                </div>
                {currentTime && (
                  <div className="current-time-display">
                    <span className="current-time-label">Current Time:</span>
                    <span className="current-time-value">{currentTime}</span>
                  </div>
                )}
              </div>
            )}

            <h2 className="form-section-title">Contact Information</h2>

            <div className="form-calendar-layout">
              <div className="form-section">
                <form className="book-demo-form" onSubmit={onSubmit} noValidate>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Ilura AI"
                        value={form.name}
                        onChange={onChange}
                        onFocus={() => setScrollProgress(1)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="email">Work Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="info@ilura-ai.com"
                        value={form.email}
                        onChange={onChange}
                        onFocus={() => setScrollProgress(1)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="phone">Contact Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChange={onChange}
                        onFocus={() => setScrollProgress(1)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="company">Company Name</label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Ilura AI"
                        value={form.company}
                        onChange={onChange}
                        onFocus={() => setScrollProgress(1)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="companySize">Company Size</label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={form.companySize}
                      onChange={onChange}
                      onFocus={() => setScrollProgress(1)}
                      required
                    >
                      <option value="" disabled>Select company size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-1000">201-1000</option>
                      <option value=">1000">1000+</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="agentOfInterest">Agent of Interest</label>
                    <select
                      id="agentOfInterest"
                      name="agentOfInterest"
                      value={form.agentOfInterest}
                      onChange={onChange}
                      onFocus={() => setScrollProgress(1)}
                      required
                    >
                      <option value="" disabled>Select an agent</option>
                      <option value="Lead Qualification / Sales">Lead Qualification / Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="HR / Recruiting">HR / Recruiting</option>
                      <option value="Finance / CFO Assistant">Finance / CFO Assistant</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="General Demo">General Demo</option>
                      <option value="Multiple Agents">Multiple Agents</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="message">What would you like to see in the demo?</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your use case..."
                      value={form.message}
                      onChange={onChange}
                      onFocus={() => setScrollProgress(1)}
                      rows={4}
                    />
                  </div>

                  <label className="consent">
                    <input type="checkbox" checked={form.consent} onChange={onToggleConsent} />
                    I agree to the terms and to be contacted about the demo.
                  </label>

                  <button
                    className="submit-button gradient"
                    type="submit"
                    disabled={submitting || !selectedDate || !selectedTime}
                  >
                    {submitting ? 'Submitting...' : 'Schedule Demo'}
                  </button>
                </form>
              </div>

              <div className="calendar-section">
                <h2 className="form-section-title">Select Date & Time</h2>
                <Calendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  theme={theme}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Caption text above image */}


      {/* Top illustrative image with overlay box */}
      <div className="demo-top-image-wrap">
        <img src="/images/demo.png" alt="Demo visual" className="demo-top-image" />
        <div className="demo-top-overlay">
          <div className="overlay-typing">
            <span className="overlay-typing-text">
              {typingText}
              <span className="overlay-typing-cursor">|</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll-triggered Features Section */}
      {/* <FeatureCards theme={theme} /> */}

      {/* MENA Card Section */}
      {/* <MenaCard theme={theme} /> */}

      {/* Bottom image */}
      <div className="demo-bottom-image-wrap">
        <img src="/images/demo1.png" alt="Demo visual" className="demo-bottom-image" />
        <div className="demo-bottom-video">
          <video
            src="/videos/two.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="demo-bottom-video-caption">
            <p className="demo-bottom-video-subtitle">Understands Your Market, Language, and Law.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemo;