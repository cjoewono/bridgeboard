import { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import axios from "axios"

const ContactsPage = () => {
    const [contacts, setContacts] = useState([])
    const [name, setName] = useState("")
    const [company, setCompany] = useState("")
    const [email, setEmail] = useState("")
    const [notes, setNotes] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const { token } = useOutletContext()
    const navigate = useNavigate()

    const fetchContacts = async () => {
        setLoading(true)
        try {
            let response = await axios.get("/api/v1/contacts/", {
                headers: { Authorization: `Token ${token}` }
            })
            setContacts(response.data)
        } catch (err) {
            setError("Failed to load contacts.")
        }
        setLoading(false)
    }

    const addContact = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("/api/v1/contacts/", {
                name: name,
                company: company || null,
                email: email || null,
                notes: notes || null
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setContacts([...contacts, response.data])
            setName("")
            setCompany("")
            setEmail("")
            setNotes("")
        } catch (err) {
            setError("Failed to add contact.")
        }
    }

    const deleteContact = async (contactId) => {
        try {
            await axios.delete(`/api/v1/contacts/${contactId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setContacts(contacts.filter((contact) => contact.id !== contactId))
        } catch (err) {
            setError("Failed to delete contact.")
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/login")
        } else {
            fetchContacts()
        }
    }, [token, navigate])

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
            <div className="mb-10 border-l-4 border-blue-600 pl-5">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Contacts</h1>
                <p className="text-slate-500 text-base max-w-xl leading-relaxed">Manage your professional network and track key connections.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-fit">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">Add Contact</h2>
                    <form onSubmit={addContact} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</label>
                            <input
                                type="text"
                                placeholder="Google"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                            <input
                                type="email"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
                            <textarea
                                placeholder="Met at FourBlock event..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                rows="3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
                        >
                            Add Contact
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Your Network{contacts.length > 0 && <span className="text-slate-400 font-normal ml-1">({contacts.length})</span>}
                            </h2>
                        </div>
                        {loading ? (
                            <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">Loading...</div>
                        ) : contacts.length === 0 ? (
                            <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">
                                No contacts yet. Start building your network!
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div key={contact.id} className="flex justify-between items-start px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">{contact.name}</p>
                                            {contact.company && <p className="text-xs text-slate-500 font-semibold mt-0.5">{contact.company}</p>}
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="text-xs text-blue-600 font-semibold hover:underline mt-0.5 block">
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.notes && (
                                                <p className="text-xs text-slate-400 mt-1 max-w-sm">{contact.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteContact(contact.id)}
                                        className="text-slate-300 hover:text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex-shrink-0 font-bold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default ContactsPage