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
    const [loading, setLoading] = useState(false)
    const { token } = useOutletContext()
    const navigate = useNavigate()

    const fetchContacts = async () => {
        setLoading(true)
        try {
            let response = await axios.get("http://127.0.0.1:8000/api/v1/contacts/", {
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
            let response = await axios.post("http://127.0.0.1:8000/api/v1/contacts/", {
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
            await axios.delete(`http://127.0.0.1:8000/api/v1/contacts/${contactId}/`, {
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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your networking contacts</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Contact</h2>
                    <form onSubmit={addContact} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Name *</label>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Company</label>
                            <input
                                type="text"
                                placeholder="Google"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Email</label>
                            <input
                                type="email"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Notes</label>
                            <textarea
                                placeholder="Met at FourBlock event..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Add Contact
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700">
                                Your Network{contacts.length > 0 && <span className="text-gray-400 font-normal ml-1">({contacts.length})</span>}
                            </h2>
                        </div>
                        {loading ? (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
                        ) : contacts.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                No contacts yet. Start building your network!
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div key={contact.id} className="flex justify-between items-start px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                                            {contact.company && <p className="text-xs text-gray-500 mt-0.5">{contact.company}</p>}
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="text-xs text-blue-600 hover:underline mt-0.5 block">
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.notes && (
                                                <p className="text-xs text-gray-400 mt-1 max-w-sm">{contact.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteContact(contact.id)}
                                        className="text-red-400 hover:text-red-600 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors flex-shrink-0"
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
    )
}

export default ContactsPage