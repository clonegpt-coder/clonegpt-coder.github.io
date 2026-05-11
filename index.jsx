import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ──
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2ZqaF0J5lOQkAcz1gJwNsdTEcdkZefph4L3vNms0IPYRv34nkyH5gup7OBsfR4ACRww/exec";
const AI_SYSTEM = "You are a helpful web development assistant integrated into CloneGPT. You help users learn HTML, CSS, JavaScript and web development concepts. Answer clearly, be friendly, and use simple examples.";
const API_KEY = "YOUR_ANTHROPIC_API_KEY"; // 👈 Apni key yahan daalo

// ── Lesson Data ──
const lessonData = [
  { title: "Introduction to HTML", time: "5 min", content: "Welcome to HTML! HTML (HyperText Markup Language) is the standard language for creating web pages.<br><br><strong>Key Concepts:</strong><ul><li>HTML is a markup language</li><li>HTML documents are plain text files</li><li>HTML tags are not case-sensitive</li></ul><div class='tip-box'><strong>💡 Pro Tip:</strong> Think of HTML as the skeleton of your website!</div>" },
  { title: "Document Structure", time: "5 min", content: "Every HTML document follows a standard structure:<br><br><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang=\"en\"&gt;\n  &lt;head&gt;\n    &lt;meta charset=\"UTF-8\"&gt;\n    &lt;title&gt;Page Title&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Hello World!&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre>" },
  { title: "HTML Headings", time: "4 min", content: "Headings create hierarchy in your content:<br><br><pre><code>&lt;h1&gt;Main Heading&lt;/h1&gt;\n&lt;h2&gt;Section Heading&lt;/h2&gt;\n&lt;h3&gt;Subsection&lt;/h3&gt;</code></pre><div class='tip-box'><strong>💡 SEO Tip:</strong> Use only one &lt;h1&gt; per page!</div>" }
];

const topics = ["Paragraphs","Links","Images","Lists","Tables","Forms","Semantic HTML","Div & Span","Classes & IDs","Iframes","Audio/Video","Responsive Design"];

const htmlLessons = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  if (n <= 3) return { content: `<h2>📚 Lesson ${n}: ${lessonData[n-1].title}</h2><br>${lessonData[n-1].content}`, time: lessonData[n-1].time };
  const topic = topics[(n - 4) % topics.length];
  return { content: `<h2>🚀 Lesson ${n}: ${topic}</h2><br><p>Mastering <strong>${topic}</strong> is essential for professional web development.</p><br><div class='tip-box'><strong>💡 Pro Tip:</strong> Practice makes perfect! Build something with ${topic} today.</div>`, time: "5 min" };
});

const learningTopics = [
  { id: 1, title: "HTML Mastery", icon: "fa-code", desc: "50 comprehensive lessons from basics to advanced", color: "#6366f1", status: "available", isNew: true },
  { id: 2, title: "CSS Wizardry", icon: "fa-palette", desc: "Transform designs into stunning reality", color: "#d946ef", status: "coming-soon", isNew: false },
  { id: 3, title: "JavaScript Alchemy", icon: "fa-bolt", desc: "Bring interactivity and dynamic features", color: "#f59e0b", status: "coming-soon", isNew: false },
  { id: 4, title: "📧 Email Signup", icon: "fa-envelope", desc: "Get daily learning tips and updates", color: "#10b981", status: "available", isNew: true }
];

const websiteClones = [
  { id: 1, name: "X (Twitter)", icon: "fa-brands fa-x-twitter", color: "#ffffff", desc: "Real-time social platform" },
  { id: 2, name: "Instagram Pro", icon: "fa-brands fa-instagram", color: "#E4405F", desc: "Visual storytelling" },
  { id: 3, name: "Spotify Premium", icon: "fa-brands fa-spotify", color: "#1DB954", desc: "Music streaming" },
  { id: 4, name: "YouTube Studio", icon: "fa-brands fa-youtube", color: "#FF0000", desc: "Video platform" },
  { id: 5, name: "Netflix Cinema", icon: "fa-brands fa-netflix", color: "#E50914", desc: "Cinematic experience" },
  { id: 6, name: "Discord Hub", icon: "fa-brands fa-discord", color: "#5865F2", desc: "Community platform" }
];

// ── Helpers ──
function generateCloneCode(clone) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${clone.name}</title><style>body{font-family:system-ui;background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);min-height:100vh;display:flex;justify-content:center;align-items:center;margin:0;padding:20px}.card{background:rgba(255,255,255,0.95);backdrop-filter:blur(30px);border-radius:40px;padding:60px;text-align:center;max-width:500px;box-shadow:0 40px 80px rgba(0,0,0,0.3)}h1{background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:20px;font-size:2.5rem}p{color:#4a5568;margin-bottom:30px;line-height:1.8}.btn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:16px 36px;border-radius:50px;cursor:pointer;font-weight:700;transition:all 0.3s}.btn:hover{transform:translateY(-3px)scale(1.05);box-shadow:0 25px 60px rgba(99,102,241,0.6)}</style></head><body><div class="card"><h1>✨ ${clone.name} ✨</h1><p>${clone.desc}</p><button class="btn" onclick="alert('🚀 Welcome!')">Launch →</button></div></body></html>`;
}

function aiFmt(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#2a2a3a;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.87em;color:#f0abfc">$1</code>')
    .replace(/\n/g, '<br>');
}

function isEmailAlreadyShown() { return localStorage.getItem('clonegpt_email_shown') === 'true'; }
function markEmailAsShown() { localStorage.setItem('clonegpt_email_shown', 'true'); }

// ── Stars Component ──
function Stars() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div className="stars">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          width: s.size, height: s.size,
          left: `${s.left}%`, top: `${s.top}%`,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`
        }} />
      ))}
    </div>
  );
}

// ── AI Bot SVG ──
function BotSVG({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#8b5cf6"/>
      <path d="M8 12.5C8 10 10 8.5 12 8.5C14 8.5 16 10 16 12.5C16 15 14 16.5 12 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.75" fill="white"/>
    </svg>
  );
}

// ══════════════════════════════════
//  ASK AI CHAT COMPONENT
// ══════════════════════════════════
function AskAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamText, isLoading]);

  const handleOpen = () => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 300); };
  const handleClose = () => setOpen(false);

  const handleNewChat = () => {
    if (isLoading || isStreaming) handleStop();
    setMessages([]); setStreamText(""); setInput("");
    historyRef.current = [];
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false); setIsStreaming(false); setStreamText("");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    historyRef.current = [...historyRef.current, { role: "user", content: text }];
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsLoading(true); setStreamText("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: AI_SYSTEM,
          stream: true,
          messages: historyRef.current
        })
      });

      setIsLoading(false); setIsStreaming(true);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6);
          if (d === "[DONE]") continue;
          try {
            const p = JSON.parse(d);
            if (p.type === "content_block_delta" && p.delta?.text) {
              full += p.delta.text;
              setStreamText(full);
            }
          } catch {}
        }
      }

      setIsStreaming(false); setStreamText("");
      historyRef.current = [...historyRef.current, { role: "assistant", content: full }];
      setMessages(prev => [...prev, { role: "assistant", content: full }]);
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages(prev => [...prev, { role: "assistant", content: "Oops! Kuch problem ho gayi. Dobara try karo 🙏" }]);
      }
      setIsLoading(false); setIsStreaming(false); setStreamText("");
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const setChipInput = (text) => { setInput(text); textareaRef.current?.focus(); };
  const isEmpty = messages.length === 0 && !streamText && !isLoading;
  const isActive = isLoading || isStreaming;
  const btnBg = isActive ? "#ef4444" : input.trim() ? "#8b5cf6" : "#2a2a3a";

  return (
    <>
      {/* Backdrop */}
      {open && <div onClick={handleClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:9998,animation:"aiFadeIn 0.2s ease" }} />}

      {/* Modal */}
      {open && (
        <div style={{ position:"fixed",bottom:90,right:24,width:"min(420px, calc(100vw - 32px))",height:"min(580px, calc(100vh - 120px))",background:"#0d0d14",borderRadius:24,border:"1px solid rgba(139,92,246,0.25)",boxShadow:"0 24px 60px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",overflow:"hidden",zIndex:9999,animation:"aiSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

          {/* Header */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(10,10,20,0.98)",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:"50%",background:"#1a1a2e",border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",animation:"aiFloat 3s ease-in-out infinite" }}>
                <BotSVG size={16} />
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:"#fff" }}>AI Assistant</div>
                <div style={{ fontSize:11,color:"#6b7280",marginTop:1 }}>Powered by Claude</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              {[
                { title:"New Chat", icon:"fa-plus", onClick: handleNewChat },
                { title:"Close", icon:"fa-times", onClick: handleClose, hoverRed: true }
              ].map(btn => (
                <button key={btn.title} onClick={btn.onClick} title={btn.title}
                  style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9ca3af",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                  <i className={`fas ${btn.icon}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1,overflowY:"auto",padding:"12px 14px",scrollBehavior:"smooth" }}>
            {isEmpty ? (
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12,textAlign:"center" }}>
                <div style={{ width:52,height:52,borderRadius:"50%",background:"#1a1a2e",border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",animation:"aiFloat 3s ease-in-out infinite" }}>
                  <BotSVG size={26} />
                </div>
                <div style={{ fontSize:16,fontWeight:700,color:"#fff" }}>Kya poochna hai? 🤔</div>
                <div style={{ fontSize:13,color:"#6b7280",lineHeight:1.6 }}>Web dev ke baare mein kuch bhi poochho!</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:4 }}>
                  {["HTML kya hai?","CSS Flexbox","JS Basics"].map(chip => (
                    <button key={chip} onClick={() => setChipInput(chip === "HTML kya hai?" ? "HTML kya hota hai?" : chip === "CSS Flexbox" ? "CSS flexbox samjhao" : "JavaScript basics batao")}
                      style={{ padding:"6px 13px",borderRadius:20,background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.3)",color:"#c7d2fe",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit" }}>
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} style={{ display:"flex",gap:9,marginBottom:14,animation:"aiMsgIn 0.3s ease",flexDirection: m.role==="user" ? "row-reverse" : "row" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,fontSize:11,fontWeight:700,
                      ...(m.role==="user" ? { background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff" } : { background:"#1a1a2e",border:"2px solid #8b5cf6" })
                    }}>
                      {m.role==="user" ? "U" : <BotSVG size={13} />}
                    </div>
                    <div style={{ maxWidth:"78%",padding:"10px 13px",fontSize:13,lineHeight:1.75,color:"#d1d5db",
                      ...(m.role==="user"
                        ? { background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:"14px 14px 4px 14px" }
                        : { background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px 14px 14px 4px" })
                    }} dangerouslySetInnerHTML={{ __html: aiFmt(m.content) }} />
                  </div>
                ))}

                {/* Typing dots */}
                {isLoading && !streamText && (
                  <div style={{ display:"flex",gap:9,marginBottom:14 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:"#1a1a2e",border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <BotSVG size={13} />
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px 14px 14px 4px",padding:"12px 14px",display:"flex",gap:5,alignItems:"center" }}>
                      {[0,0.2,0.4].map((delay,i) => (
                        <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#8b5cf6",animation:`aiDot 1.2s ease ${delay}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Streaming */}
                {isStreaming && streamText && (
                  <div style={{ display:"flex",gap:9,marginBottom:14,animation:"aiMsgIn 0.3s ease" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:"#1a1a2e",border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <BotSVG size={13} />
                    </div>
                    <div style={{ maxWidth:"78%",padding:"10px 13px",fontSize:13,lineHeight:1.75,color:"#d1d5db",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px 14px 14px 4px" }}>
                      <span dangerouslySetInnerHTML={{ __html: aiFmt(streamText) }} />
                      <span style={{ display:"inline-block",width:2,height:13,background:"#8b5cf6",marginLeft:2,verticalAlign:"middle",animation:"aiCursorBlink 1s infinite" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px 14px",borderTop:"1px solid rgba(255,255,255,0.07)",background:"#0d0d14",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"flex-end",gap:8,background:"#1a1a27",borderRadius:14,border:"1px solid rgba(139,92,246,0.15)",padding:"8px 10px 8px 14px" }}>
              <textarea ref={textareaRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
                placeholder="Kuch bhi poochho..." rows={1}
                style={{ flex:1,background:"transparent",border:"none",outline:"none",color:"#e5e7eb",fontSize:14,lineHeight:1.6,fontFamily:"inherit",resize:"none",minHeight:22,maxHeight:120,overflowY:"auto",paddingTop:1 }} />
              <button onClick={isActive ? handleStop : handleSend} disabled={!isActive && !input.trim()}
                style={{ width:34,height:34,borderRadius:10,border:"none",cursor: (isActive||input.trim()) ? "pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",color:"white",background:btnBg,transition:"background 0.2s",flexShrink:0 }}>
                {isActive
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <div style={{ textAlign:"center",fontSize:10,color:"#374151",marginTop:6 }}>Enter = Send · Shift+Enter = New line</div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      {!open && (
        <button onClick={handleOpen}
          style={{ position:"fixed",bottom:24,right:24,display:"flex",alignItems:"center",gap:10,padding:"14px 22px",background:"linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef)",border:"none",borderRadius:50,color:"white",fontSize:15,fontWeight:700,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 8px 30px rgba(99,102,241,0.5)",zIndex:9997,letterSpacing:"0.5px",animation:"aiPulse 2.5s ease infinite, aiBtnFloat 3s ease-in-out infinite" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
          </svg>
          Ask AI
        </button>
      )}
    </>
  );
}

// ══════════════════════════════════
//  MAIN APP
// ══════════════════════════════════
export default function App() {
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('clonegpt_ultimate_logged_in') === 'true' ? 'dashboard' : 'start');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('clonegpt_ultimate_logged_in') === 'true');
  const [activeModule, setActiveModule] = useState('learn');
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentLessonPage, setCurrentLessonPage] = useState(1);
  const [modalClone, setModalClone] = useState(null);
  const [comingSoonItem, setComingSoonItem] = useState(null);
  const [compilerTab, setCompilerTab] = useState('html');
  const [htmlCode, setHtmlCode] = useState('<div class="demo" style="text-align:center;padding:40px;"><h1>✨ Ultimate Compiler</h1><p>Create something extraordinary!</p><button id="demoBtn">Experience Magic</button></div>');
  const [cssCode, setCssCode] = useState('body{font-family:system-ui;background:linear-gradient(135deg,#6366f1,#8b5cf6);min-height:100vh;display:flex;justify-content:center;align-items:center;margin:0}.demo{background:white;border-radius:30px;padding:50px;box-shadow:0 30px 60px rgba(0,0,0,0.3)}button{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:14px 32px;border-radius:50px;cursor:pointer;margin-top:20px;font-weight:700;transition:all 0.3s}button:hover{transform:scale(1.05);box-shadow:0 15px 40px rgba(99,102,241,0.4)}');
  const [jsCode, setJsCode] = useState("document.getElementById('demoBtn').onclick=function(){alert('🚀 Welcome to CloneGPT Ultimate!');};");
  const [previewSrc, setPreviewSrc] = useState('');
  const [modalPreviewSrc, setModalPreviewSrc] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const autoEmailTriggered = useRef(false);

  // Auto email popup
  useEffect(() => {
    if (currentPage === 'dashboard' && isLoggedIn && currentView === 'dashboard' && !isEmailAlreadyShown() && !autoEmailTriggered.current) {
      autoEmailTriggered.current = true;
      const t = setTimeout(() => {
        if (!isEmailAlreadyShown()) setCurrentView('email');
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [currentPage, isLoggedIn, currentView]);

  const handleLogin = () => {
    setIsLoggedIn(true); setCurrentPage('dashboard');
    setCurrentView('dashboard'); setActiveModule('learn');
    autoEmailTriggered.current = false;
    localStorage.setItem('clonegpt_ultimate_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setCurrentPage('start');
    autoEmailTriggered.current = false;
    localStorage.removeItem('clonegpt_ultimate_logged_in');
  };

  const runCompiler = () => {
    setPreviewSrc(`<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`);
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (emailInput && emailInput.includes('@') && emailInput.includes('.')) {
      const fd = new FormData();
      fd.append('email', emailInput); fd.append('timestamp', new Date().toLocaleString()); fd.append('device', navigator.userAgent);
      fetch(GOOGLE_SCRIPT_URL, { method:'POST', mode:'no-cors', body:fd }).catch(()=>{});
      markEmailAsShown();
      alert('✅ Thanks for subscribing! You will receive daily tips.');
      setCurrentView('dashboard');
    } else { alert('⚠️ Please enter a valid email address'); }
  };

  const copyModalCode = async () => {
    const code = generateCloneCode(modalClone);
    try { await navigator.clipboard.writeText(code); alert('✅ Code copied!'); }
    catch { alert('📋 Copy manually (Ctrl+C)'); }
  };

  // ── Navbar ──
  const Navbar = () => (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon"><i className="fas fa-cube" /></div>
        <span className="logo-text">CloneGPT Ultimate</span>
      </div>
      <button className="logout-button" onClick={handleLogout}><i className="fas fa-sign-out-alt" /> Exit</button>
    </nav>
  );

  // ── Start Page ──
  if (currentPage === 'start') return (
    <div>
      <div className="universe"/><Stars/>
      <div className="nebula nebula-1"/><div className="nebula nebula-2"/><div className="nebula nebula-3"/>
      <div className="start-page">
        <div className="hero-content">
          <span className="hero-badge"><i className="fas fa-crown"/> ULTIMATE EDITION • 20+ PREMIUM CLONES <i className="fas fa-crown"/></span>
          <h1 className="hero-title">Master the Art of<br/>Web Development</h1>
          <p className="hero-subtitle">Premium clones • 50 comprehensive lessons • Live compiler<br/>Daily email tips to keep you motivated!</p>
          <div className="stats-row">
            <div className="stat"><span className="stat-number">20+</span><span className="stat-label">Premium Clones</span></div>
            <div className="stat"><span className="stat-number">50</span><span className="stat-label">HD Lessons</span></div>
            <div className="stat"><span className="stat-number">Live</span><span className="stat-label">Compiler</span></div>
          </div>
          <button className="hero-btn" onClick={() => setCurrentPage('login')}>Begin Your Journey <i className="fas fa-arrow-right"/></button>
        </div>
      </div>
      <AskAIChat/>
    </div>
  );

  // ── Login Page ──
  if (currentPage === 'login') return (
    <div>
      <div className="universe"/><Stars/>
      <div className="nebula nebula-1"/><div className="nebula nebula-2"/><div className="nebula nebula-3"/>
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <div className="login-icon"><i className="fas fa-crown"/></div>
            <h2>Welcome Back</h2>
            <p>One-time sign in • Daily learning tips</p>
          </div>
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-field"><i className="fas fa-user"/><input type="text" placeholder="Enter your username" defaultValue="elite_dev"/></div>
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field"><i className="fas fa-lock"/><input type="password" placeholder="Enter your password" defaultValue="ultimate2026"/></div>
          </div>
          <button className="login-submit" onClick={handleLogin}>Access Dashboard →</button>
          <div className="login-footer"><i className="fas fa-envelope"/> We'll send daily motivation to your email</div>
        </div>
      </div>
      <AskAIChat/>
    </div>
  );

  // ── Dashboard ──
  if (currentPage === 'dashboard' && isLoggedIn) {

    // Lesson View
    if (currentView === 'lesson') {
      const lesson = htmlLessons[currentLessonPage - 1];
      return (
        <div>
          <div className="universe"/><Stars/>
          <div className="nebula nebula-1"/><div className="nebula nebula-2"/><div className="nebula nebula-3"/>
          <div className="dashboard">
            <Navbar/>
            <div className="lesson-container">
              <button className="back-to-dashboard" onClick={() => setCurrentView('dashboard')}><i className="fas fa-arrow-left"/> Dashboard</button>
              <div className="lesson-header">
                <div className="lesson-meta">
                  <div className="lesson-progress"><i className="fas fa-graduation-cap"/> Lesson {currentLessonPage} of 50</div>
                  <div className="lesson-time"><i className="far fa-clock"/> ~{lesson.time} read</div>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(currentLessonPage/50)*100}%` }}/></div>
              </div>
              <div className="lesson-content"><div className="lesson-text" dangerouslySetInnerHTML={{ __html: lesson.content }}/></div>
              <div className="lesson-navigation">
                <button className="nav-btn" onClick={() => { setCurrentLessonPage(p=>p-1); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={currentLessonPage===1}><i className="fas fa-chevron-left"/> Previous</button>
                <button className="nav-btn primary" onClick={() => { setCurrentLessonPage(p=>p+1); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={currentLessonPage===50}>Next <i className="fas fa-chevron-right"/></button>
              </div>
            </div>
          </div>
          <AskAIChat/>
        </div>
      );
    }

    // Email View
    if (currentView === 'email') return (
      <div>
        <div className="universe"/><Stars/>
        <div className="nebula nebula-1"/><div className="nebula nebula-2"/><div className="nebula nebula-3"/>
        <div className="dashboard">
          <Navbar/>
          <div className="email-section">
            <div className="email-card">
              <div className="email-icon"><i className="fas fa-paper-plane"/></div>
              <h2>Get Daily Learning Tips!</h2>
              <p>Enter your email to receive web development tips, lesson alerts, and exclusive content directly to your inbox.</p>
              <form onSubmit={handleSaveEmail}>
                <div className="email-input-wrapper"><i className="fas fa-envelope"/><input type="email" value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="your@email.com" required/></div>
                <div className="email-action-buttons">
                  <button type="submit" className="email-done-btn"><i className="fas fa-check"/> Subscribe</button>
                  <button type="button" className="email-skip-btn" onClick={() => { markEmailAsShown(); setCurrentView('dashboard'); }}><i className="fas fa-times"/> Skip Forever</button>
                </div>
              </form>
              <p style={{marginTop:"1.5rem",color:"#71717a",fontSize:"0.85rem"}}><i className="fas fa-shield-alt"/> We respect your privacy. No spam ever!</p>
            </div>
          </div>
        </div>
        <AskAIChat/>
      </div>
    );

    // Main Dashboard
    return (
      <div>
        <div className="universe"/><Stars/>
        <div className="nebula nebula-1"/><div className="nebula nebula-2"/><div className="nebula nebula-3"/>
        <div className="dashboard">
          <Navbar/>

          {/* Tabs */}
          <div className="tabs-wrapper">
            <div className="tabs">
              {[{id:'learn',icon:'fa-graduation-cap',label:'Learning Hub'},{id:'compiler',icon:'fa-code',label:'Live Compiler'},{id:'clones',icon:'fa-clone',label:'Premium Clones'}].map(t => (
                <button key={t.id} className={`tab ${activeModule===t.id?'active':''}`} onClick={() => setActiveModule(t.id)}>
                  <i className={`fas ${t.icon}`}/> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="content-area">

            {/* Learn Section */}
            {activeModule === 'learn' && (
              <div>
                <div className="section-header"><h2><i className="fas fa-graduation-cap"/> Mastery Path</h2><p>Begin with HTML • 50 comprehensive lessons to excellence</p></div>
                <div className="cards-grid">
                  {learningTopics.map(topic => (
                    <div key={topic.id} className={`card ${topic.status==='coming-soon'?'disabled':''}`}
                      onClick={() => {
                        if (topic.status==='coming-soon') setComingSoonItem(topic.title);
                        else if (topic.id===4) { if(!isEmailAlreadyShown()) setCurrentView('email'); else alert('You have already subscribed! Thank you 🙏'); }
                        else { setCurrentLessonPage(1); setCurrentView('lesson'); }
                      }}>
                      {topic.isNew && <div className="new-badge"><i className="fas fa-star"/> {topic.id===1?'JUST RELEASED':'NEW'}</div>}
                      {topic.status==='coming-soon' && <div className="coming-soon-badge"><i className="fas fa-clock"/> Coming Soon</div>}
                      <div className="card-icon"><i className={`fas ${topic.icon}`} style={{color:topic.color}}/></div>
                      <div className="card-content">
                        <h3>{topic.title}</h3><p>{topic.desc}</p>
                        <span className="card-tag">
                          {topic.status==='coming-soon' ? <><i className="fas fa-rocket"/> Coming Q2 2026</> : topic.id===4 ? <><i className="fas fa-envelope"/> Subscribe Now</> : <><i className="fas fa-check-circle" style={{color:'#10b981'}}/> 50 Lessons Ready</>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compiler Section */}
            {activeModule === 'compiler' && (
              <div>
                <div className="section-header"><h2><i className="fas fa-code"/> Ultimate Code Compiler</h2><p>Write • Preview • Perfect</p></div>
                <div className="compiler-container">
                  <div className="compiler-tabs">
                    {['html','css','js'].map(t => (
                      <button key={t} className={`compiler-tab ${compilerTab===t?'active':''}`} onClick={() => setCompilerTab(t)}>{t.toUpperCase()}</button>
                    ))}
                  </div>
                  {compilerTab==='html' && <textarea className="code-textarea" value={htmlCode} onChange={e=>setHtmlCode(e.target.value)} placeholder="Write HTML here..."/>}
                  {compilerTab==='css'  && <textarea className="code-textarea" value={cssCode}  onChange={e=>setCssCode(e.target.value)}  placeholder="Write CSS here..."/>}
                  {compilerTab==='js'   && <textarea className="code-textarea" value={jsCode}   onChange={e=>setJsCode(e.target.value)}   placeholder="Write JavaScript here..."/>}
                  <button className="run-button" onClick={runCompiler}><i className="fas fa-play"/> Run Code</button>
                  {previewSrc && <iframe className="preview-frame" srcDoc={previewSrc} title="preview"/>}
                </div>
              </div>
            )}

            {/* Clones Section */}
            {activeModule === 'clones' && (
              <div>
                <div className="section-header"><h2><i className="fas fa-crown"/> Premium Clone Collection</h2><p>{websiteClones.length} professional-grade clones • Click to explore</p></div>
                <div className="cards-grid">
                  {websiteClones.map(clone => (
                    <div key={clone.id} className="card" onClick={() => setModalClone(clone)}>
                      <div className="card-icon"><i className={clone.icon} style={{color:clone.color}}/></div>
                      <div className="card-content">
                        <h3>{clone.name}</h3><p>{clone.desc}</p>
                        <span className="card-tag"><i className="fas fa-bolt"/> Ready to Deploy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clone Modal */}
        {modalClone && (
          <div className="modal active">
            <div className="modal-window">
              <div className="modal-header">
                <h3><i className={modalClone.icon}/> {modalClone.name} Ultimate</h3>
                <button className="modal-close" onClick={() => { setModalClone(null); setModalPreviewSrc(''); }}><i className="fas fa-times"/></button>
              </div>
              <div className="modal-body">
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-run" onClick={() => setModalPreviewSrc(generateCloneCode(modalClone))}><i className="fas fa-play"/> Live Preview</button>
                  <button className="modal-btn modal-btn-copy" onClick={copyModalCode}><i className="fas fa-copy"/> Copy Code</button>
                </div>
                <pre className="code-block">{generateCloneCode(modalClone)}</pre>
                {modalPreviewSrc && <div className="preview-block"><iframe className="preview-iframe" srcDoc={modalPreviewSrc} title="modal-preview"/></div>}
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Modal */}
        {comingSoonItem && (
          <div className="modal coming-soon-modal active">
            <div className="modal-window">
              <div className="modal-header">
                <h3><i className="fas fa-rocket"/> Coming Soon</h3>
                <button className="modal-close" onClick={() => setComingSoonItem(null)}><i className="fas fa-times"/></button>
              </div>
              <div className="modal-body" style={{textAlign:'center'}}>
                <div className="coming-soon-icon">🚀</div>
                <h2 className="coming-soon-title">✨ {comingSoonItem} ✨</h2>
                <p className="coming-soon-text">We're crafting something extraordinary: <strong>{comingSoonItem}</strong></p>
                <div className="coming-soon-progress"><div className="coming-soon-progress-bar"/></div>
                <p style={{color:'#a1a1aa',marginBottom:'2rem'}}>Launching soon with premium features!</p>
                <button className="notify-btn" onClick={() => { alert("🎉 Thanks! You'll be notified when this launches! 🚀"); setComingSoonItem(null); }}><i className="fas fa-bell"/> Get Early Access</button>
              </div>
            </div>
          </div>
        )}

        <AskAIChat/>
      </div>
    );
  }

  return null;
}

// ── Global CSS (inject once) ──
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans',sans-serif; background:#0a0a0f; color:#fff; overflow-x:hidden; }
::-webkit-scrollbar{width:8px} ::-webkit-scrollbar-track{background:#0a0a0f} ::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);border-radius:20px}
.universe{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-2;background:radial-gradient(ellipse at 30% 40%,#1a1a3e 0%,#0a0a0f 50%,#000 100%)}
.stars{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1}
.star{position:absolute;background:radial-gradient(circle,#fff,rgba(255,255,255,0.3));border-radius:50%;animation:starTwinkle 3s ease-in-out infinite;will-change:opacity,transform}
@keyframes starTwinkle{0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
.nebula{position:fixed;border-radius:50%;filter:blur(80px);opacity:0.3;pointer-events:none;z-index:-1;will-change:transform}
.nebula-1{width:70vw;height:70vw;background:radial-gradient(circle,#6366f1,#8b5cf6);top:-20%;right:-15%;animation:nebulaFloat 20s ease-in-out infinite}
.nebula-2{width:60vw;height:60vw;background:radial-gradient(circle,#d946ef,#f43f5e);bottom:-15%;left:-20%;animation:nebulaFloat 25s ease-in-out infinite reverse}
.nebula-3{width:50vw;height:50vw;background:radial-gradient(circle,#06b6d4,#3b82f6);top:50%;left:40%;animation:nebulaFloat 30s ease-in-out infinite}
@keyframes nebulaFloat{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(3%,4%) scale(1.05)}50%{transform:translate(-2%,6%) scale(0.98)}75%{transform:translate(5%,-3%) scale(1.03)}}
.start-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.hero-content{text-align:center;max-width:1100px;animation:cinematicReveal 1.2s ease}
@keyframes cinematicReveal{0%{opacity:0;transform:translateY(60px) scale(0.9);filter:blur(10px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
.hero-badge{display:inline-flex;align-items:center;gap:.75rem;background:rgba(99,102,241,.08);backdrop-filter:blur(20px);border:1px solid rgba(99,102,241,.25);padding:.7rem 2rem;border-radius:100px;font-size:.9rem;font-weight:600;color:#c7d2fe;margin-bottom:3rem;box-shadow:0 20px 40px rgba(0,0,0,.3)}
.hero-title{font-size:6rem;font-weight:800;line-height:1.15;margin-bottom:2rem;background:linear-gradient(135deg,#fff 0%,#c7d2fe 20%,#a78bfa 40%,#f0abfc 60%,#c7d2fe 80%,#fff 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:titleShine 6s linear infinite;letter-spacing:-1.5px}
@keyframes titleShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.hero-subtitle{font-size:1.35rem;color:#a1a1aa;margin-bottom:3.5rem;line-height:1.8}
.stats-row{display:flex;gap:6rem;justify-content:center;margin-bottom:4rem;flex-wrap:wrap}
.stat{text-align:center;position:relative}
.stat:not(:first-child)::before{content:'';position:absolute;top:50%;left:-3rem;width:1px;height:50px;background:linear-gradient(180deg,transparent,rgba(139,92,246,.4),transparent)}
.stat-number{font-size:3.5rem;font-weight:800;background:linear-gradient(135deg,#a78bfa,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent;display:block;margin-bottom:.5rem}
.stat-label{font-size:.9rem;color:#71717a;text-transform:uppercase;letter-spacing:3px;font-weight:600}
.hero-btn{background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);background-size:200% 200%;color:white;border:none;padding:1.5rem 4rem;font-size:1.2rem;font-weight:700;border-radius:100px;cursor:pointer;transition:transform .3s,box-shadow .3s;display:inline-flex;align-items:center;gap:1.2rem;box-shadow:0 30px 60px rgba(99,102,241,.35);text-transform:uppercase;letter-spacing:1.5px}
.hero-btn:hover{transform:translateY(-8px) scale(1.03);box-shadow:0 40px 100px rgba(99,102,241,.5)}
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.login-container{background:rgba(20,20,35,.35);backdrop-filter:blur(30px);border-radius:3.5rem;padding:4rem;width:100%;max-width:500px;border:1px solid rgba(139,92,246,.2);box-shadow:0 50px 100px rgba(0,0,0,.6);animation:loginReveal .6s ease}
@keyframes loginReveal{0%{opacity:0;transform:scale(.95) translateY(40px)}100%{opacity:1;transform:scale(1) translateY(0)}}
.login-icon{width:80px;height:80px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#6366f1,#d946ef);border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(99,102,241,.3)}
.login-icon i{font-size:2.5rem;color:white}
.login-header h2{font-size:2.5rem;font-weight:700;margin-bottom:.8rem;background:linear-gradient(135deg,#fff,#c7d2fe,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent;text-align:center}
.login-header p{color:#a1a1aa;font-size:1rem;text-align:center;margin-bottom:2rem}
.input-group{margin-bottom:2rem}
.input-label{display:block;margin-bottom:.6rem;color:#c7d2fe;font-size:.9rem;font-weight:500}
.input-field{position:relative}
.input-field i{position:absolute;left:1.5rem;top:50%;transform:translateY(-50%);color:#6366f1;font-size:1.1rem}
.input-field input{width:100%;padding:1.3rem 1.5rem 1.3rem 3.5rem;background:rgba(255,255,255,.03);border:1.5px solid rgba(139,92,246,.15);border-radius:1.5rem;color:white;font-size:1rem;transition:all .3s}
.input-field input:focus{outline:none;border-color:#8b5cf6;box-shadow:0 0 0 4px rgba(139,92,246,.15);background:rgba(255,255,255,.06)}
.login-submit{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);background-size:200% 200%;color:white;border:none;padding:1.4rem;border-radius:1.5rem;font-size:1.1rem;font-weight:700;cursor:pointer;transition:all .3s;text-transform:uppercase;letter-spacing:1.5px;margin-top:1rem}
.login-submit:hover{transform:translateY(-4px);box-shadow:0 25px 60px rgba(139,92,246,.5)}
.login-footer{text-align:center;margin-top:2rem;color:#71717a;font-size:.85rem}
.email-section{padding:3rem;max-width:600px;margin:0 auto}
.email-card{background:rgba(20,20,35,.4);backdrop-filter:blur(30px);border:1.5px solid rgba(139,92,246,.12);border-radius:2.5rem;padding:2.5rem;box-shadow:0 30px 60px rgba(0,0,0,.3);text-align:center}
.email-icon{font-size:4rem;margin-bottom:1.5rem;color:#a78bfa}
.email-card h2{font-size:2.2rem;margin-bottom:1rem;background:linear-gradient(135deg,#fff,#c7d2fe);-webkit-background-clip:text;background-clip:text;color:transparent}
.email-card p{color:#a1a1aa;margin-bottom:2rem;line-height:1.6}
.email-input-wrapper{position:relative;margin-bottom:1.5rem}
.email-input-wrapper i{position:absolute;left:1.2rem;top:50%;transform:translateY(-50%);color:#8b5cf6;font-size:1.2rem}
.email-input-wrapper input{width:100%;padding:1rem 1rem 1rem 3rem;background:rgba(255,255,255,.05);border:1.5px solid rgba(139,92,246,.3);border-radius:1rem;color:white;font-size:1rem;transition:all .3s}
.email-input-wrapper input:focus{outline:none;border-color:#8b5cf6;background:rgba(255,255,255,.08)}
.email-action-buttons{display:flex;gap:1rem;justify-content:center;margin-top:1.5rem}
.email-done-btn{background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;padding:.8rem 2rem;border-radius:50px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:.7rem;transition:all .3s}
.email-done-btn:hover{transform:translateY(-2px);box-shadow:0 15px 30px rgba(16,185,129,.4)}
.email-skip-btn{background:rgba(255,255,255,.03);border:1.5px solid rgba(239,68,68,.3);color:#fca5a5;padding:.8rem 2rem;border-radius:50px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:.7rem;transition:all .3s}
.email-skip-btn:hover{background:rgba(239,68,68,.1);border-color:#ef4444;transform:translateY(-2px)}
.dashboard{min-height:100vh}
.navbar{position:sticky;top:0;background:rgba(10,10,15,.7);backdrop-filter:blur(30px);border-bottom:1px solid rgba(139,92,246,.1);padding:1.2rem 3rem;display:flex;justify-content:space-between;align-items:center;z-index:100}
.logo{display:flex;align-items:center;gap:1rem}
.logo-icon{width:50px;height:50px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 15px 30px rgba(99,102,241,.4)}
.logo-icon i{font-size:1.6rem;color:white}
.logo-text{font-size:1.7rem;font-weight:800;background:linear-gradient(135deg,#fff,#c7d2fe);-webkit-background-clip:text;background-clip:text;color:transparent}
.logout-button{background:rgba(255,255,255,.03);border:1.5px solid rgba(239,68,68,.2);padding:.7rem 1.8rem;border-radius:50px;color:#fca5a5;cursor:pointer;transition:all .3s;font-weight:600;display:flex;align-items:center;gap:.7rem}
.logout-button:hover{background:rgba(239,68,68,.12);border-color:#ef4444;color:#ef4444;transform:translateY(-2px)}
.tabs-wrapper{padding:2rem 3rem 0 3rem;border-bottom:1px solid rgba(139,92,246,.08)}
.tabs{display:flex;gap:1rem;flex-wrap:wrap}
.tab{padding:1rem 2.2rem;background:rgba(139,92,246,.03);border:1.5px solid rgba(139,92,246,.1);color:#a1a1aa;font-size:1rem;font-weight:600;cursor:pointer;border-radius:60px;transition:all .3s;display:inline-flex;align-items:center;gap:.8rem}
.tab:hover{color:#e2e8f0;background:rgba(139,92,246,.08);transform:translateY(-2px)}
.tab.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-color:transparent;box-shadow:0 15px 35px rgba(99,102,241,.4)}
.content-area{padding:3rem;max-width:1600px;margin:0 auto}
.section-header h2{font-size:2.8rem;font-weight:700;margin-bottom:.8rem;background:linear-gradient(135deg,#fff,#c7d2fe);-webkit-background-clip:text;background-clip:text;color:transparent}
.section-header p{color:#a1a1aa;font-size:1.15rem;margin-bottom:2rem}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:2.5rem}
.card{background:rgba(20,20,35,.4);backdrop-filter:blur(25px);border:1.5px solid rgba(139,92,246,.12);border-radius:2.5rem;overflow:hidden;transition:all .4s;cursor:pointer;position:relative;will-change:transform}
.card:hover{transform:translateY(-10px) scale(1.01);border-color:rgba(139,92,246,.4);box-shadow:0 40px 60px rgba(0,0,0,.4)}
.new-badge{position:absolute;top:1.8rem;left:1.8rem;background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:.45rem 1.3rem;border-radius:50px;font-size:.8rem;font-weight:800;z-index:10;letter-spacing:1.5px}
.coming-soon-badge{position:absolute;top:1.8rem;right:1.8rem;background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;padding:.45rem 1.3rem;border-radius:50px;font-size:.8rem;font-weight:700;z-index:10;letter-spacing:1.5px}
.card-icon{height:180px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(216,70,239,.15));font-size:4.5rem}
.card-content{padding:2.2rem}
.card-content h3{font-size:1.7rem;margin-bottom:.9rem;font-weight:700}
.card-content p{color:#a1a1aa;font-size:.98rem;line-height:1.7;margin-bottom:1.8rem}
.card-tag{display:inline-flex;align-items:center;gap:.5rem;padding:.45rem 1.3rem;background:rgba(139,92,246,.08);border-radius:50px;font-size:.8rem;color:#c7d2fe;border:1px solid rgba(139,92,246,.15);font-weight:600}
.card.disabled{opacity:.5;cursor:not-allowed}
.card.disabled:hover{transform:none;box-shadow:none}
.lesson-container{max-width:1200px;margin:0 auto;padding:2rem;animation:slideIn .5s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.back-to-dashboard{background:rgba(139,92,246,.05);border:1.5px solid rgba(139,92,246,.15);color:#c7d2fe;padding:.9rem 2rem;border-radius:60px;cursor:pointer;margin-bottom:2.5rem;display:inline-flex;align-items:center;gap:.8rem;font-weight:600;transition:all .3s}
.back-to-dashboard:hover{background:rgba(139,92,246,.1);color:white;transform:translateX(-6px)}
.lesson-header{margin-bottom:2.5rem}
.lesson-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;flex-wrap:wrap;gap:1rem}
.lesson-progress{color:#c7d2fe;font-size:1.3rem;font-weight:600;display:flex;align-items:center;gap:.7rem}
.lesson-time{color:#a1a1aa;font-size:.95rem;display:flex;align-items:center;gap:.6rem;background:rgba(139,92,246,.05);padding:.5rem 1.2rem;border-radius:50px}
.progress-bar{width:100%;height:8px;background:rgba(139,92,246,.08);border-radius:20px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef);background-size:200% 200%;border-radius:20px;transition:width .5s;box-shadow:0 0 20px rgba(139,92,246,.4)}
.lesson-content{background:rgba(20,20,35,.4);backdrop-filter:blur(30px);border:1.5px solid rgba(139,92,246,.12);border-radius:3rem;padding:3.5rem;margin-bottom:2.5rem;min-height:550px;box-shadow:0 40px 80px rgba(0,0,0,.4)}
.lesson-text{font-size:1.2rem;line-height:2;color:#e2e8f0}
.lesson-text h2{margin-bottom:2rem;font-size:2.8rem;font-weight:700;background:linear-gradient(135deg,#fff,#c7d2fe);-webkit-background-clip:text;background-clip:text;color:transparent}
.lesson-text pre{background:rgba(0,0,0,.5);padding:2rem;border-radius:1.8rem;overflow-x:auto;border:1px solid rgba(139,92,246,.15);margin:2.2rem 0}
.lesson-text code{color:#f0abfc;font-family:'Courier New',monospace;font-size:1rem}
.tip-box{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(216,70,239,.1));border-left:5px solid #8b5cf6;padding:1.8rem;border-radius:1.2rem;margin:2.5rem 0}
.lesson-navigation{display:flex;justify-content:space-between;align-items:center;margin-top:2.5rem;flex-wrap:wrap;gap:1rem}
.nav-btn{background:rgba(139,92,246,.05);border:1.5px solid rgba(139,92,246,.15);color:white;padding:1.1rem 2.8rem;border-radius:60px;cursor:pointer;font-size:1.05rem;font-weight:600;transition:all .3s;display:inline-flex;align-items:center;gap:.9rem}
.nav-btn:hover:not(:disabled){background:rgba(139,92,246,.12);transform:translateX(-5px)}
.nav-btn.primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 15px 40px rgba(99,102,241,.35)}
.nav-btn.primary:hover:not(:disabled){transform:translateX(5px);box-shadow:0 25px 60px rgba(139,92,246,.5)}
.nav-btn:disabled{opacity:.25;cursor:not-allowed}
.compiler-container{background:rgba(20,20,35,.4);backdrop-filter:blur(30px);border:1.5px solid rgba(139,92,246,.12);border-radius:3rem;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.4)}
.compiler-tabs{display:flex;background:rgba(0,0,0,.3);border-bottom:1.5px solid rgba(139,92,246,.15);padding:1.2rem;gap:1rem;flex-wrap:wrap}
.compiler-tab{padding:.9rem 2rem;background:transparent;border:none;color:#a1a1aa;cursor:pointer;border-radius:1.2rem;font-size:1rem;font-weight:600;transition:all .3s}
.compiler-tab:hover{color:#e2e8f0;background:rgba(139,92,246,.08)}
.compiler-tab.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;box-shadow:0 10px 30px rgba(99,102,241,.35)}
.code-textarea{width:100%;min-height:380px;background:rgba(0,0,0,.5);border:none;padding:2rem;color:#e2e8f0;font-family:'Courier New',monospace;font-size:1rem;line-height:1.8;resize:vertical}
.code-textarea:focus{outline:none;background:rgba(0,0,0,.6)}
.run-button{background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;padding:1.1rem 2.8rem;border-radius:1.5rem;cursor:pointer;font-weight:700;margin:2rem;display:inline-flex;align-items:center;gap:1rem;transition:all .3s;box-shadow:0 15px 40px rgba(16,185,129,.35);text-transform:uppercase;letter-spacing:1.5px}
.run-button:hover{transform:translateY(-5px) scale(1.03);box-shadow:0 30px 70px rgba(16,185,129,.5)}
.preview-frame{width:100%;height:550px;border:none;background:white;border-radius:1.8rem}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.95);backdrop-filter:blur(40px);z-index:1000;align-items:center;justify-content:center}
.modal.active{display:flex;animation:modalFade .3s ease}
@keyframes modalFade{from{opacity:0}to{opacity:1}}
.modal-window{background:rgba(20,20,35,.8);backdrop-filter:blur(40px);border-radius:3.5rem;width:90%;max-width:1300px;max-height:90vh;overflow:hidden;border:1.5px solid rgba(139,92,246,.25);box-shadow:0 60px 120px rgba(0,0,0,.8)}
.modal-header{padding:2rem 3rem;background:rgba(0,0,0,.3);border-bottom:1.5px solid rgba(139,92,246,.15);display:flex;justify-content:space-between;align-items:center}
.modal-header h3{font-size:1.6rem;font-weight:700}
.modal-close{background:rgba(139,92,246,.08);border:1.5px solid rgba(139,92,246,.15);color:#a1a1aa;font-size:1.6rem;cursor:pointer;transition:all .3s;width:50px;height:50px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.modal-close:hover{color:#fff;background:rgba(239,68,68,.15);border-color:#ef4444;transform:rotate(90deg)}
.modal-body{padding:3rem;max-height:70vh;overflow-y:auto}
.modal-actions{display:flex;gap:1.5rem;margin-bottom:2.5rem;flex-wrap:wrap}
.modal-btn{padding:1rem 2.5rem;border-radius:60px;border:none;cursor:pointer;font-weight:700;display:inline-flex;align-items:center;gap:.9rem;transition:all .3s;text-transform:uppercase;letter-spacing:1px}
.modal-btn-run{background:linear-gradient(135deg,#10b981,#059669);color:white;box-shadow:0 15px 40px rgba(16,185,129,.3)}
.modal-btn-copy{background:rgba(139,92,246,.08);color:white;border:1.5px solid rgba(139,92,246,.2)}
.code-block{background:rgba(0,0,0,.6);padding:2rem;border-radius:1.8rem;overflow-x:auto;font-family:'Courier New',monospace;font-size:.95rem;line-height:1.8;color:#e2e8f0;border:1px solid rgba(139,92,246,.15)}
.preview-block{margin-top:2.5rem}
.preview-iframe{width:100%;height:500px;border:1.5px solid rgba(139,92,246,.2);border-radius:1.8rem;background:white}
.coming-soon-modal .modal-window{max-width:600px}
.coming-soon-icon{font-size:7rem;margin-bottom:2.5rem;animation:iconFloat 4s ease-in-out infinite}
@keyframes iconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
.coming-soon-title{font-size:3rem;margin-bottom:1.5rem;background:linear-gradient(135deg,#c7d2fe,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
.coming-soon-text{color:#a1a1aa;margin-bottom:3rem;line-height:1.9;font-size:1.2rem}
.coming-soon-progress{width:100%;height:12px;background:rgba(139,92,246,.08);border-radius:20px;overflow:hidden;margin:3rem 0}
.coming-soon-progress-bar{width:70%;height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef);background-size:200% 200%;border-radius:20px}
.notify-btn{background:linear-gradient(135deg,#6366f1,#8b5cf6);background-size:200% 200%;color:white;border:none;padding:1.4rem 3.5rem;border-radius:60px;cursor:pointer;font-weight:700;transition:all .3s;box-shadow:0 20px 50px rgba(99,102,241,.35);text-transform:uppercase;letter-spacing:1.5px}
.notify-btn:hover{transform:translateY(-5px) scale(1.05);box-shadow:0 35px 80px rgba(139,92,246,.5)}
@keyframes aiSlideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes aiFadeIn{from{opacity:0}to{opacity:1}}
@keyframes aiMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes aiCursorBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes aiDot{0%,80%,100%{transform:scale(0.55);opacity:0.3}40%{transform:scale(1);opacity:1}}
@keyframes aiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes aiPulse{0%,100%{box-shadow:0 8px 30px rgba(99,102,241,.5),0 0 0 0 rgba(99,102,241,.35)}50%{box-shadow:0 8px 30px rgba(99,102,241,.5),0 0 0 10px rgba(99,102,241,0)}}
@keyframes aiBtnFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@media(max-width:768px){.hero-title{font-size:3rem}.stats-row{gap:2rem}.stat:not(:first-child)::before{display:none}.cards-grid{grid-template-columns:1fr}.navbar{padding:1rem 1.5rem}.tabs-wrapper{padding:1.2rem 1.5rem 0 1.5rem}.content-area{padding:1.5rem}.lesson-content{padding:1.5rem}.hero-btn{padding:1rem 2rem;font-size:1rem}.login-container{padding:2rem;margin:1rem}}
`;

if (!document.getElementById('clonegpt-styles')) {
  const style = document.createElement('style');
  style.id = 'clonegpt-styles';
  style.textContent = css;
  document.head.appendChild(style);

  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
  document.head.appendChild(faLink);
}
