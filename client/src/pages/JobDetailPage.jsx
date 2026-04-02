import { useState, useEffect } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import axios from "axios"

const JobDetailPage = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { token } = useOutletContext()
    const [job, setJob] = useState(null)
    const [company, setCompany] = useState("")
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState("")
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState("")
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState("")
    const [newNoteDate, setNewNoteDate] = useState("")
    const [error, setError] = useState("")

    const fetchJob = async () => {
        try {
            let response = await axios.get(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setJob(response.data)
            setCompany(response.data.company)
            setTitle(response.data.title)
            setStatus(response.data.status)
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const fetchTasks = async () => {
        try {
            let response = await axios.get(`http://127.0.0.1:8000/api/v1/tasks/?job_id=${jobId}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setTasks(response.data)
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

        const fetchNotes = async () => {
        try {
            let response = await axios.get(`http://127.0.0.1:8000/api/v1/notes/?job_id=${jobId}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setNotes(response.data)
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const addTask = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/v1/tasks/", {
                job: jobId,
                title: newTask
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setTasks([...tasks, response.data])
            setNewTask("")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const toggleTask = async (taskId, completed) => {
        try {
            let response = await axios.put(`http://127.0.0.1:8000/api/v1/tasks/${taskId}/`, {
                completed: !completed
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setTasks(tasks.map((task) =>
                task.id === taskId ? response.data : task
            ))
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/tasks/${taskId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setTasks(tasks.filter((task) => task.id !== taskId))
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const addNote = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/v1/notes/", {
                job: jobId,
                content: newNote,
                interview_date: newNoteDate || null
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setNotes([...notes, response.data])
            setNewNote("")
            setNewNoteDate("")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const deleteNote = async (noteId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/notes/${noteId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setNotes(notes.filter((note) => note.id !== noteId))
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const updateJob = async (event) => {
        event.preventDefault()
        try {
            await axios.put(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                company: company,
                title: title,
                status: status
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            navigate("/dashboard")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const deleteJob = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            navigate("/dashboard")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/login")
        } else {
            fetchJob()
            fetchTasks()
            fetchNotes()
        }
    }, [token, jobId])

    if (!job) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{company}</h1>
                <span className="text-gray-400 text-sm">{title}</span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Job Details</h2>
                        <form onSubmit={updateJob} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">Job Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={deleteJob}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Delete Job
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks</h2>
                        <form onSubmit={addTask} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Add a task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="border border-gray-300 p-2.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Add
                            </button>
                        </form>
                        {tasks.length === 0 ? (
                            <p className="text-gray-400 text-sm">No tasks yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleTask(task.id, task.completed)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className={`text-sm flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                                            {task.title}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-red-400 hover:text-red-600 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Interview Notes</h2>
                    <form onSubmit={addNote} className="flex flex-col gap-2 mb-4">
                        <textarea
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                        <input
                            type="date"
                            value={newNoteDate}
                            onChange={(e) => setNewNoteDate(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Add Note
                        </button>
                    </form>
                    {notes.length === 0 ? (
                        <p className="text-gray-400 text-sm">No notes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {notes.map((note) => (
                                <div key={note.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                    <p className="text-sm text-gray-700">{note.content}</p>
                                    {note.interview_date && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Interview: {note.interview_date}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="text-red-400 hover:text-red-600 text-xs mt-2 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JobDetailPage