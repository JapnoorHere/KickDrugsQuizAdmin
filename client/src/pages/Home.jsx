import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
  const [form, setForm] = useState({});
  const fileInputRef = useRef(null);
  const [quizzes, setQuizzes] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || {};

  const getExcelData = () => {
    axios.get(`${process.env.REACT_APP_API_KEY}/home`).then((res) => {
      console.log(res.data);
      setQuizzes(res.data);
    });
  };

  useEffect(() => {
    getExcelData();
  }, []);

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  if (!username) {
    return null;
  }

  const handleInput = (event) => {
    const file = event.target.files[0];
    setForm({
      ...form,
      [event.target.name]: file,
    });
  };

  const handleGetResult = (id) => {
    axios
      .post(
        `${process.env.REACT_APP_API_KEY}/getResult`,
        {
          quizId: id,
        },
        {
          responseType: 'blob',
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'quiz_results.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error('Error downloading the file:', error);
        alert('Error downloading the file');
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('excel', form.excel);

    axios
      .post(`${process.env.REACT_APP_API_KEY}/home`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        if (res.data.message === 'exists') {
          alert('Quiz Exists');
          fileInputRef.current.value = null;
        } else if (res.data.message === 'done') {
          alert('Quiz Uploaded');
          fileInputRef.current.value = null;
          getExcelData();
        }
      });
  };

  return (
    <div className='overflow-hidden bg-tan-light min-h-screen w-screen flex justify-center p-4'>
      <div className='max-w-2xl w-full flex flex-col gap-6 p-4'>
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4 rounded-lg bg-tan-medium p-4'>
          <h1 className='text-2xl font-semibold'>Upload Quiz Excel File</h1>
          <input
            type='file'
            name='excel'
            accept='.xlsx, .xls'
            onChange={handleInput}
            ref={fileInputRef}
            required
            className='p-2 border border-brown-dark rounded-sm'
          />
          <button
            type='submit'
            className='self-end text-brown-dark w-fit px-6 py-2 bg-tan-dark hover:opacity-90 rounded-sm border border-transparent hover:border-brown-dark'
          >
            Submit
          </button>
        </form>
        <div className='flex flex-col gap-4'>
          <h1 className='text-4xl font-semibold text-brown-dark'>Results</h1>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className='rounded-md w-full p-4 bg-tan-medium flex justify-between items-center'>
              <p className='text-xl font-medium'>{quiz.quiz_name}</p>
              <button
                onClick={() => handleGetResult(quiz._id)}
                className='self-end text-brown-dark w-fit px-6 py-2 bg-tan-dark hover:opacity-90 rounded-sm border border-transparent hover:border-brown-dark'
              >
                Get results
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
