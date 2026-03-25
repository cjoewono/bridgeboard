import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import axios from "axios"

const ContactsPage = () => {
    const [contacts, setContacts] = useState([])
    const [name, setName] = useState("")
    const [company, setCompany] = useState("")
    const [email, setEmail] = useState("")
    const [notes, setNotes] = useState("")
    const { token } = useOutletContext()

    const fetchContacts = async () => {
        try {
            let response = await axios.get("http://127.0.0.1:8000/api/v1/contacts/", {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setContacts(response.data)
        } catch (err) {
            console.error(err)
        }
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
            console.error(err)
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
            console.error(err)
        }
    }

    useEffect(() => {
        if (token) {
            fetchContacts()
        }
    }, [token])

    return (
        <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-gray-600">Manage your networking contacts</p>

            <form onSubmit={addContact} className="mt-4 flex flex-col gap-2 max-w-md">
                <input
                    type="text"
                    placeholder="Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                />
                <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border p-2 rounded"
                    rows="2"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Add Contact
                </button>
            </form>

            <div className="mt-6">
                {contacts.length === 0 ? (
                    <p className="text-gray-600">No contacts yet. Start building your network!</p>
                ) : (
                    contacts.map((contact) => (
                        <div key={contact.id} className="border p-4 rounded mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold">{contact.name}</h2>
                                    {contact.company && <p className="text-gray-600">{contact.company}</p>}
                                    {contact.email && <p className="text-blue-600">{contact.email}</p>}
                                    {contact.notes && <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>}
                                </div>
                                <button
                                    onClick={() => deleteContact(contact.id)}
                                    className="text-red-500 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ContactsPage