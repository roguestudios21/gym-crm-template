import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Membership Plans (Products)</h1>
                <Link to="/products/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Plan
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Duration (Days)</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No plans found</td></tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p._id}>
                                        <td className="font-bold">{p.name}</td>
                                        <td>${p.price}</td>
                                        <td>{p.duration}</td>
                                        <td>{p.description}</td>
                                        <td>
                                            <Link to={`/products/edit/${p._id}`} className="btn btn-ghost btn-sm">
                                                <Edit2 size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(p._id)} className="btn btn-ghost btn-sm text-error">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Products;

