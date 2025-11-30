import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products", err);
            error(err.response?.data?.error || 'Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/products/${deleteId}`);
            success('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            error(err.response?.data?.error || 'Failed to delete product');
        } finally {
            setDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <ConfirmDialog
                isOpen={deleteConfirm}
                title="Delete Product?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(false)}
                dangerConfirm
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link to="/products/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                {loading ? (
                    <LoadingSpinner message="Loading products..." />
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No products yet"
                        message="Create your first product or membership plan"
                        action={
                            <Link to="/products/new" className="btn btn-primary">
                                <Plus size={18} />
                                Add First Product
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="card bg-base-200 shadow-lg">
                                <div className="card-body">
                                    <h2 className="card-title">{product.name}</h2>
                                    <p className="text-sm opacity-70">{product.category}</p>
                                    <div className="mt-2">
                                        <p className="text-2xl font-bold">${(product.price || 0).toFixed(2)}</p>
                                        {product.duration && (
                                            <p className="text-sm">{product.duration} days</p>
                                        )}
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        <Link to={`/products/edit/${product._id}`} className="btn btn-ghost btn-sm">
                                            <Edit2 size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(product._id)}
                                            className="btn btn-ghost btn-sm text-error"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
