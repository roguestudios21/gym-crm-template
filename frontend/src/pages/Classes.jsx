import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Calendar, Users, Clock, MapPin } from 'lucide-react';

const Classes = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'schedule'

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (dayIndex) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[dayIndex];
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Classes</h1>
                <button
                    onClick={() => navigate('/classes/new')}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Create Class
                </button>
            </div>

            {/* View Toggle */}
            <div className="tabs tabs-boxed mb-6 w-fit">
                <a
                    className={`tab ${viewMode === 'list' ? 'tab-active' : ''}`}
                    onClick={() => setViewMode('list')}
                >
                    List View
                </a>
                <a
                    className={`tab ${viewMode === 'schedule' ? 'tab-active' : ''}`}
                    onClick={() => setViewMode('schedule')}
                >
                    Schedule View
                </a>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => (
                        <div key={cls._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => navigate(`/classes/${cls._id}`)}>
                            <figure className="h-48 bg-base-200 relative">
                                {cls.imageUrl ? (
                                    <img src={cls.imageUrl} alt={cls.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                                        <Users size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 badge badge-primary">{cls.type}</div>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title justify-between">
                                    {cls.name}
                                </h2>
                                <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users size={16} className="opacity-70" />
                                        <span>Trainer: {cls.trainerID?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="opacity-70" />
                                        <span>
                                            {cls.schedule.isRecurring
                                                ? `${cls.schedule.daysOfWeek.map(d => getDayName(d)).join(', ')} at ${cls.schedule.time}`
                                                : 'One-time Event'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} className="opacity-70" />
                                        <span>{cls.location || 'Main Studio'}</span>
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-4">
                                    <div className="badge badge-outline">Capacity: {cls.capacity}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {classes.length === 0 && (
                        <div className="col-span-full text-center py-12 text-base-content/60">
                            <p>No classes found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card bg-base-100 shadow-xl p-6">
                    <div className="alert alert-info">
                        <Calendar size={20} />
                        <span>Schedule view coming soon! Use list view to manage classes.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
