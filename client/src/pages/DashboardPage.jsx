import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import axios from "axios"

const DashboardPage = () => {
    const [jobs, setJobs] = useState([])
    const [company, setCompany] = useState("")
    const [title, setTitle] = useState("")
    const { token, user } = useOutletContext()

    const fetchJobs = async () => {
        try {
            let response = await axios.get("http://127.0.0.1:8000/api/v1/jobs/", {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setJobs(response.data)
        } catch (err) {
            console.error(err)
        }
    }

    const addJob = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/v1/jobs/", {
                company: company,
                title: title
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setJobs([...jobs, response.data])
            setCompany("")
            setTitle("")
        } catch (err) {
            console.error(err)
        }
    }

    const deleteJob = async(jobId) => {
        try{
            await axios.delete(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setJobs(jobs.filter(job => job.id !== jobId))
        } catch (err) {
            console.error(err)
        }
    }

    const updateStatus = async (jobId, newStatus) => {
        try {
            let response = await axios.put(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                status: newStatus
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            setJobs(jobs.map((job) => 
                job.id === jobId ? response.data : job
            ))
        } catch (err) {
            console.error(err)
        }
    }


    useEffect(() => {
        if (token) {
            fetchJobs()
        }
    }, [token])

    return (
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {user && <p className="text-gray-600">Welcome, {user}</p>}

            <form onSubmit={addJob} className="mt-4 flex gap-2 max-w-lg">
                <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="border p-2 rounded flex-1"
                />
                <input
                    type="text"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 rounded flex-1"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Add Job
                </button>
            </form>

            <div className="mt-6">
                {jobs.length === 0 ? (
                    <p className="text-gray-600">No jobs yet. Start tracking your applications!</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="border p-4 rounded mb-2 flex justify-between items-center">
                            <div>
                                <Link to={`/jobs/${job.id}`} className="font-bold text-blue-600 hover:underline">
                                    {job.company}
                                </Link>
                                <p>{job.title}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <select
                                    value={job.status}
                                    onChange={(e) => updateStatus(job.id, e.target.value)}
                                    className="border p-1 rounded"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button
                                    onClick={() => deleteJob(job.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
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

export default DashboardPage