// components/AuthorizedNumbersList.js

import { useEffect, useState } from 'react';
import axios from 'axios';

const AuthorizedNumbersList = () => {
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNumbers = async () => {
            try {
                const response = await axios.get('/api/authorized/get');
                setNumbers(response.data.data);
            } catch (error) {
                setError('Failed to fetch authorized numbers');
            } finally {
                setLoading(false);
            }
        };

        fetchNumbers();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className='flex justify-center mt-24  text-white'>
            <div className='w-fit   '>
                <h2 className='text-2xl font-bold mb-4'>Authorized Phone Numbers</h2>
                <div className=''>
                    {numbers.map((number, index) => (
                        <div className='shadow-md shadow-white p-4'>
                            {/* <h1>{index + 1}</h1> */}
                            <h1 className='' key={number._id}>Name  : <span className='font-bold'>
                                {number.Name}
                            </span></h1>
                            <h1 className='' key={number._id}>Mob No : <span className='font-bold'>
                                {number.phoneNumber}
                            </span></h1>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthorizedNumbersList;
