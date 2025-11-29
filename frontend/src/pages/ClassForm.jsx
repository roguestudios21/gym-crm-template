import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const ClassForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        trainerID: '',
        capacity: 20,
        location: '',
        schedule: {
            isRecurring: true,
            daysOfWeek: [],
            time: '',
            duration: 60
        },
        notes: ''
    });

    useEffect(() => {
        fetchTrainers();
        if (id) {
            fetchClass();
        }
    }, [id]);

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/staff?role=trainer');
            setTrainers(res.data);
        } catch (error) {
            console.error("Failed to fetch trainers", error);
        }
    };

    const fetchClass = async () => {
        try {
            const res = await api.get(`/classes/${id}`);
            const data = res.data;
            setFormData({
                name: data.name,
                type: data.type,
                description: data.description || '',
                trainerID: data.trainerID?._id || data.trainerID || '',
                capacity: data.capacity,
                location: data.location || '',
                schedule: {
                    isRecurring: data.schedule.isRecurring,
                    daysOfWeek: data.schedule.daysOfWeek || [],
                    time: data.schedule.time,
                    duration: data.schedule.duration
                },
                notes: data.notes || ''
            });
        } catch (error) {
            console.error("Failed to fetch class", error);
            alert("Failed to load class");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDayToggle = (dayIndex) => {
        const currentDays = formData.schedule.daysOfWeek;
        const newDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex].sort();

        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                daysOfWeek: newDays
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/classes/${id}`, formData);
            } else {
                await api.post('/classes', formData);
            }
            navigate('/classes');
        } catch (error) {
            console.error("Failed to save class", error);
            alert("Failed to save class");
        } finally {
            setLoading(false);
        }
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/classes')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{isEdit ? 'Edit Class' : 'New Class'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="card bg-base-100 shadow-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Class Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Class Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                                placeholder="e.g. Yoga Morning Flow"
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Type</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="">Select Type</option>
                                <option value="Yoga">Yoga</option>
                                <option value="HIIT">HIIT</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Strength">Strength</option>
                                <option value="Dance">Dance</option>
                                <option value="Pilates">Pilates</option>
                            </select>
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Trainer</span>
                            </label>
                            <select
                                name="trainerID"
                                value={formData.trainerID}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="">Select Trainer</option>
                                {trainers.map(t => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Capacity</span>
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Location</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="e.g. Studio A"
                            />
                        </div>
                        <div className="form-control w-full md:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="textarea textarea-bordered h-24"
                                placeholder="Class description..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="card bg-base-100 shadow-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Time</span>
                            </label>
                            <input
                                type="time"
                                name="schedule.time"
                                value={formData.schedule.time}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Duration (minutes)</span>
                            </label>
                            <input
                                type="number"
                                name="schedule.duration"
                                value={formData.schedule.duration}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div className="form-control w-full md:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">Days of Week</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {days.map((day, index) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`btn btn-circle btn-sm ${formData.schedule.daysOfWeek.includes(index)
                                                ? 'btn-primary'
                                                : 'btn-outline'
                                            }`}
                                        onClick={() => handleDayToggle(index)}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/classes')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : isEdit ? 'Update Class' : 'Create Class'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClassForm;
