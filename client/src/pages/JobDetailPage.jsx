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
        </div>
    )
}

export default JobDetailPage