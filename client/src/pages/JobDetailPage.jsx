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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
        }
    }

    useEffect(() => {
        if (token) {
            fetchJob()
            fetchTasks()
            fetchNotes()
        }
    }, [token, jobId])

    if (!job) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Edit Job</h1>
            <form onSubmit={updateJob} className="mt-4 flex flex-col gap-4 max-w-md">
                <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 rounded"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>
                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={deleteJob}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="border px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-bold">Tasks</h2>
                <form onSubmit={addTask} className="mt-2 flex gap-2">
                    <input
                        type="text"
                        placeholder="New task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="border p-2 rounded flex-1"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Add
                    </button>
                </form>
                
                <div className="mt-4">
                    {tasks.length === 0 ? (
                        <p className="text-gray-600">No tasks yet.</p>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id, task.completed)}
                                    className="w-4 h-4"
                                />
                                <span className={task.completed ? "line-through text-gray-400" : ""}>
                                    {task.title}
                                </span>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-500 text-sm ml-auto"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>            
            
            <div className="mt-8">
                <h2 className="text-xl font-bold">Interview Notes</h2>
                <form onSubmit={addNote} className="mt-2 flex flex-col gap-2 max-w-md">
                    <textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="border p-2 rounded"
                        rows="3"
                    />
                    <input
                        type="date"
                        value={newNoteDate}
                        onChange={(e) => setNewNoteDate(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Add Note
                    </button>
                </form>
                <div className="mt-4">
                    {notes.length === 0 ? (
                        <p className="text-gray-600">No notes yet.</p>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="border p-4 rounded mb-2">
                                <p>{note.content}</p>
                                {note.interview_date && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Interview: {note.interview_date}
                                    </p>
                                )}
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="text-red-500 text-sm mt-2"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default JobDetailPage