// components/AddNumberForm.js

import { useState } from 'react';
import axios from 'axios';

const AddNumberForm = () => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        Name: '',
        Designation: '',
        PoliceStation: '',
        email: '',
        district: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/authorized/add', formData);
            alert(response.data.message);
            setFormData({
                phoneNumber: '',
                Name: '',
                Designation: '',
                PoliceStation: '',
                email: '',
                district: '',
            });
        } catch (error) {
            console.error('Error adding phone number:', error);
            alert('Failed to add phone number');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col items-center mt-4 space-y-2'>
            <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter phone number"
                required
            />
            <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter name"
                required
            />
            <input
                type="text"
                name="Designation"
                value={formData.Designation}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter designation"
                required
            />
            <input
                type="text"
                name="PoliceStation"
                value={formData.PoliceStation}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter police station"
                required
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter email"
            />
            <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className='text-black p-2 border border-gray-300 rounded'
                placeholder="Enter district"
            />
            <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Add Number</button>
        </form>
    );
};

export default AddNumberForm;
