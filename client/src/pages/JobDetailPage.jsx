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
            let response = await axios.get(`/api/v1/jobs/${jobId}/`, {
                headers: { Authorization: `Token ${token}` }
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
            let response = await axios.get(`/api/v1/tasks/?job_id=${jobId}`, {
                headers: { Authorization: `Token ${token}` }
            })
            setTasks(response.data)
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const fetchNotes = async () => {
        try {
            let response = await axios.get(`/api/v1/notes/?job_id=${jobId}`, {
                headers: { Authorization: `Token ${token}` }
            })
            setNotes(response.data)
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const addTask = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("/api/v1/tasks/", {
                job: jobId,
                title: newTask
            }, {
                headers: { Authorization: `Token ${token}` }
            })
            setTasks([...tasks, response.data])
            setNewTask("")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const toggleTask = async (taskId, completed) => {
        try {
            let response = await axios.put(`/api/v1/tasks/${taskId}/`, {
                completed: !completed
            }, {
                headers: { Authorization: `Token ${token}` }
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
           await axios.delete(`/api/v1/tasks/${taskId}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setTasks(tasks.filter((task) => task.id !== taskId))
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const addNote = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("/api/v1/notes/", {
                job: jobId,
                content: newNote,
                interview_date: newNoteDate || null
            }, {
                headers: { Authorization: `Token ${token}` }
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
            await axios.delete(`/api/v1/notes/${noteId}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setNotes(notes.filter((note) => note.id !== noteId))
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const updateJob = async (event) => {
        event.preventDefault()
        try {
            await axios.put(`/api/v1/jobs/${jobId}/`, {
                company: company,
                title: title,
                status: status
            }, {
                headers: { Authorization: `Token ${token}` }
            })
            navigate("/dashboard")
        } catch (err) {
            setError("Something went wrong. Please try again.")
        }
    }

    const deleteJob = async () => {
        try {
            await axios.delete(`/api/v1/jobs/${jobId}/`, {
                headers: { Authorization: `Token ${token}` }
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
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <p className="text-slate-400 text-sm font-semibold">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-slate-400 hover:text-blue-600 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    ← Back
                </button>
                <span className="text-slate-200">|</span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{company}</h1>
                <span className="text-slate-400 text-sm font-semibold">{title}</span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Job Details */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">Job Details</h2>
                        <form onSubmit={updateJob} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={deleteJob}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Delete Job
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tasks */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">Tasks</h2>
                        <form onSubmit={addTask} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Add a task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="border border-slate-200 px-4 py-3 rounded-xl text-sm flex-1 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                            >
                                Add
                            </button>
                        </form>
                        {tasks.length === 0 ? (
                            <p className="text-slate-400 text-sm font-semibold">No tasks yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleTask(task.id, task.completed)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className={`text-sm flex-1 font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                                            {task.title}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-slate-300 hover:text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-bold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Interview Notes */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-fit">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">Interview Notes</h2>
                    <form onSubmit={addNote} className="flex flex-col gap-3 mb-4">
                        <textarea
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            rows="3"
                        />
                        <input
                            type="date"
                            value={newNoteDate}
                            onChange={(e) => setNewNoteDate(e.target.value)}
                            className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
                        >
                            Add Note
                        </button>
                    </form>
                    {notes.length === 0 ? (
                        <p className="text-slate-400 text-sm font-semibold">No notes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {notes.map((note) => (
                                <div key={note.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                                    <p className="text-sm text-slate-700 font-medium">{note.content}</p>
                                    {note.interview_date && (
                                        <p className="text-xs text-slate-400 font-semibold mt-1.5">
                                            Interview: {note.interview_date}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="text-slate-300 hover:text-red-500 text-xs mt-2 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-bold"
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
        </div>
    )
}

export default JobDetailPage