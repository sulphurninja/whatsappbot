// components/RemoveNumberForm.js

import { useState } from 'react';
import axios from 'axios';

const RemoveNumberForm = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/authorized/remove', { phoneNumber });
            alert(response.data.message);
            setPhoneNumber('');
        } catch (error) {
            console.error('Error removing phone number:', error);
            alert('Failed to remove phone number');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex justify-center mt-4'>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
            />
            <button type="submit">Remove Number</button>
        </form>
    );
};

export default RemoveNumberForm;
