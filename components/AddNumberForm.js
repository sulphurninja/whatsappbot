// components/AddNumberForm.js

import { useState } from 'react';
import axios from 'axios';

const AddNumberForm = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/authorized/add', { phoneNumber });
            alert(response.data.message);
            setPhoneNumber('');
        } catch (error) {
            console.error('Error adding phone number:', error);
            alert('Failed to add phone number');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
            />
            <button type="submit">Add Number</button>
        </form>
    );
};

export default AddNumberForm;
