import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { createInquiry } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

function ChatWidget({ propertyId, propertyTitle, agentName }) {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [messages, setMessages] = useState([
        { id: 1, text: `Hello! I'm ${agentName || 'Guri24 Team'}. How can I help you with ${propertyTitle}?`, sender: 'agent', time: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Update contact info if user logs in/out
    useEffect(() => {
        if (user) {
            setContactInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // If not authenticated and we don't have contact info, show form
        if (!isAuthenticated && (!contactInfo.name || !contactInfo.email)) {
            setShowContactForm(true);
            return;
        }

        if (inputValue.trim().length < 10) {
            const warningMsg = {
                id: Date.now() + 1,
                text: "Message is too short. Please type at least 10 characters.",
                sender: 'agent',
                time: new Date(),
                isWarning: true
            };
            setMessages(prev => [...prev, warningMsg]);
            return;
        }

        const userMsg = { id: Date.now(), text: inputValue, sender: 'user', time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsSending(true);

        try {
            await createInquiry({
                property_id: propertyId,
                message: inputValue,
                name: contactInfo.name,
                email: contactInfo.email,
                phone: contactInfo.phone
            });

            setTimeout(() => {
                const replyMsg = {
                    id: Date.now() + 1,
                    text: "Thanks for your message! I've received your inquiry and will get back to you shortly.",
                    sender: 'agent',
                    time: new Date()
                };
                setMessages(prev => [...prev, replyMsg]);
                setIsSending(false);
            }, 1000);

        } catch (error) {
            console.error("Failed to send message", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I couldn't send that right now. Please try again.",
                sender: 'agent',
                time: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
            setIsSending(false);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        if (contactInfo.name && contactInfo.email) {
            setShowContactForm(false);
            // After collecting info, try sending the message if there was one
            if (inputValue) {
                handleSend(e);
            }
        }
    };

    if (!isOpen) {
        return (
            <button className="chat-launcher" onClick={() => setIsOpen(true)}>
                <MessageSquare size={20} />
                <span>Chat</span>
            </button>
        );
    }

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="agent-profile">
                    <div className="agent-avatar-small">
                        <User size={14} />
                    </div>
                    <div>
                        <h4>{agentName || 'Guri24 Agent'}</h4>
                        <span className="status-indicator">Online</span>
                    </div>
                </div>
                <button className="close-chat" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                </button>
            </div>

            {showContactForm ? (
                <div className="chat-contact-form">
                    <h5>Quick Contact</h5>
                    <p>Please provide your details so we can get back to you.</p>
                    <form onSubmit={handleContactSubmit}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={contactInfo.name}
                            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Start Chat</button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="message-time">
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="message agent typing">
                                <div className="typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isSending}
                        />
                        <button type="submit" disabled={!inputValue.trim() || isSending}>
                            <Send size={16} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default ChatWidget;
