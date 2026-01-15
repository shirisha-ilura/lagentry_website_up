import React, { useState, useEffect, useRef } from 'react';
import './Waitlist.css';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import emailjs from 'emailjs-com';
// Localized shader imports (no external deps)
import ShaderCanvas from '../community/ShaderCanvas';
import StarsOverlay from '../community/StarsOverlay';

type FormState = {
  name: string;
  email: string;
  company: string;
  designation: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  company: '',
  designation: '',
};

const Waitlist: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState<number>(window.innerHeight);
  const [showInput, setShowInput] = useState(false);
  const [selectedShader, setSelectedShader] = useState(1);

  const activeRemindersExist = false;
  const upcomingRemindersExist = false;
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.scrollY;
        containerRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // No intro video now; ensure any body flags are removed
  useEffect(() => {
    document.body.classList.remove('intro-playing');
    document.body.classList.remove('intro-hide-nav');
  }, []);

  // Adjust canvas size based on window size
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasClick = () => {};
  const handleSelectShader = (id: number) => { setSelectedShader(id); };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      // Store in Firestore
      await addDoc(collection(db, 'waitlist'), {
        ...form,
        createdAt: serverTimestamp(),
      });

      // Send emails via EmailJS (requires env-configured template)
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY as string;
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID as string;
      const templateIdUser = process.env.REACT_APP_EMAILJS_TEMPLATE_USER as string;
      const templateIdAdmin = process.env.REACT_APP_EMAILJS_TEMPLATE_ADMIN as string;

      if (publicKey && serviceId && templateIdUser && templateIdAdmin) {
        emailjs.init(publicKey);
        // User confirmation
        await emailjs.send(serviceId, templateIdUser, {
          to_email: form.email,
          to_name: form.name,
          message: "You've successfully joined the Legentry waitlist! Stay tuned for updates.",
        });
        // Admin notification
        await emailjs.send(serviceId, templateIdAdmin, {
          name: form.name,
          email: form.email,
          company: form.company,
          designation: form.designation,
        });
      }

      setSuccess("You've successfully joined the Legentry waitlist! Stay tuned for updates.");
      setForm(initialState);
    } catch (err: any) {
      setError(err?.message || 'Submission failed, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Animated shader area */}
      <div className="waitlist-shader-wrapper">
        <div className="shader-main-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ShaderCanvas
            width={canvasWidth}
            height={canvasHeight}
            onClick={handleCanvasClick}
            hasActiveReminders={activeRemindersExist}
            hasUpcomingReminders={upcomingRemindersExist}
            shaderId={selectedShader}
          />
        </div>
        {/* Stars overlay */}
        <StarsOverlay starCount={160} />
      </div>
      {/* Center overlay join box */}
      <div className="waitlist-overlay">
        <div className="join-card">
          {/* Top stats pill */}
          <div className="join-stats">
            <div className="join-pill">
              <span className="join-pill-text">Join 5,784 others already on the waitlist</span>
            </div>
          </div>
          <div className="join-header">
            <div className="join-logo">
              <img src="/images/logo.png" alt="Legentry" />
            </div>
          </div>
          <div className="join-content">
            <div className="join-subtitle">Hire AI employees for MENA businesses.</div>
            <div className="join-desc">Launch your custom AI workforce in seconds.</div>

            <form onSubmit={onSubmit} className="join-form">
              <div className="join-input-row">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>
              <button className="join-button" type="submit" disabled={submitting}>
                {submitting ? 'Joining…' : 'Join the waitlist'}
              </button>
            </form>
          </div>

          {success && <div className="alert success" style={{ marginTop: 14 }}>{success}</div>}
          {error && <div className="alert error" style={{ marginTop: 14 }}>{error}</div>}
        </div>
      </div>
      {false && (
        <div className={`waitlist-container intro-done`} ref={containerRef}>
          <div className="animated-background">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
            <div className="diamond-center"></div>
          </div>
          <div className="waitlist-card" ref={cardRef}>
            <h1 className="waitlist-title">Join the Waitlist</h1>
            <p className="waitlist-subtitle">Get early access and product updates.</p>
            {success && <div className="alert success">{success}</div>}
            {error && <div className="alert error">{error}</div>}
            <form className="waitlist-form" onSubmit={onSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" name="name" value={form.name} onChange={onChange} required />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" value={form.company} onChange={onChange} />
                </div>
                <div className="form-field">
                  <label htmlFor="designation">Designation</label>
                  <input id="designation" name="designation" value={form.designation} onChange={onChange} />
                </div>
              </div>
              <button className="submit-button gradient" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Join Waitlist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Waitlist;


