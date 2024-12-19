import React, { Suspense, lazy, useState, useEffect } from 'react';
import axios from 'axios';
import type { Post } from '../types/post';
import { Spin } from 'antd';
import 'antd/dist/reset.css';

// Lazy load the PostsTable component
const PostsTable = lazy(() => import('../components/PostsTable'));

interface HomeProps {
  initialPosts: Post[];
  error?: string;
}

// Since we're using Vite, we'll fetch data in useEffect instead of getServerSideProps
const Home: React.FC = () => {
  const [initialPosts, setInitialPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const response = await axios.get<Post[]>(
          'https://jsonplaceholder.typicode.com/posts',
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.data) {
          throw new Error('No data received');
        }

        setInitialPosts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching initial posts:', error);
        setError('Failed to fetch initial posts');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading posts..." />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" tip="Loading application..." />
        </div>
      }
    >
      <PostsTable 
        initialPosts={initialPosts} 
        initialError={error}
      />
    </Suspense>
  );
};

export default Home; 