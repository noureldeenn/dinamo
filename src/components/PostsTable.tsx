import React, { useState, useEffect, Suspense, lazy } from "react";
import { Table, Form, Button, notification, Modal, Popconfirm, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { NotificationArgsProps } from 'antd/es/notification';
import axios, { AxiosError } from "axios";
import type { Post, PostFormData } from '../types/post';

// Lazy load the PostForm component using React.lazy
const PostForm = lazy(() => import('./PostForm'));

interface PostsTableProps {
  initialPosts: Post[];
  initialError?: string;
}

const PostsTable: React.FC<PostsTableProps> = ({ 
  initialPosts = [], 
  initialError 
}) => {
  const [posts, setPosts] = useState<Post[]>(Array.isArray(initialPosts) ? initialPosts : []);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // If we have an initial error or no posts, try to fetch again
    if (initialError || posts.length === 0) {
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Post[]>(
        'https://jsonplaceholder.typicode.com/posts',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setPosts(response.data);
        if (initialError) {
          showNotification(
            'success',
            'Data Loaded',
            'Successfully retrieved posts'
          );
        }
      }
    } catch (error) {
      handleApiError(error, 'fetching posts');
    } finally {
      setLoading(false);
    }
  };

  // Show initial error if present
  useEffect(() => {
    if (initialError) {
      showNotification(
        'error',
        'Error Loading Data',
        initialError
      );
    }
  }, [initialError]);

  const showNotification = (type: NotificationArgsProps['type'], message: string, description: string) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleApiError = (error: unknown, context: string) => {
    const axiosError = error as AxiosError;
    let errorMessage = 'An unexpected error occurred';
    
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Error: ${axiosError.response.status}`;
      }
    } else if (axiosError.request) {
      errorMessage = 'No response received from server';
    }

    console.error(`${context}:`, error);
    showNotification('error', `Error ${context}`, errorMessage);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue({
      title: post.title,
      body: post.body,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: PostFormData) => {
    try {
      setLoading(true);
      if (editingPost) {
        try {
          const response = await axios.put<Post>(
            `https://jsonplaceholder.typicode.com/posts/${editingPost.id}`,
            {
              ...values,
              id: editingPost.id,
              userId: editingPost.userId,
            }
          );

          const updatedPost = {
            ...editingPost,
            ...values,
          };

          setPosts((prevPosts = []) => 
            Array.isArray(prevPosts) 
              ? prevPosts.map((post) => 
                  post.id === editingPost.id ? updatedPost : post
                )
              : []
          );

          showNotification(
            'success',
            'Post Updated',
            'Your post has been successfully updated (simulated)'
          );
          handleModalCancel();
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 500) {
            const updatedPost = {
              ...editingPost,
              ...values,
            };

            setPosts((prevPosts = []) => 
              Array.isArray(prevPosts) 
                ? prevPosts.map((post) => 
                    post.id === editingPost.id ? updatedPost : post
                  )
                : []
            );

            showNotification(
              'success',
              'Post Updated',
              'Update simulated successfully (JSONPlaceholder API)'
            );
            handleModalCancel();
          } else {
            throw error;
          }
        }
      } else {
        const response = await axios.post<Post>(
          "https://jsonplaceholder.typicode.com/posts",
          {
            ...values,
            userId: 1,
          }
        );

        setPosts((prevPosts = []) => 
          Array.isArray(prevPosts) ? [response.data, ...prevPosts] : [response.data]
        );

        showNotification(
          'success',
          'Post Created',
          'Your new post has been successfully created'
        );
        handleModalCancel();
      }
    } catch (error) {
      handleApiError(error, editingPost ? 'updating post' : 'creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleDelete = async (postId: number) => {
    try {
      setLoading(true);
      try {
        await axios.delete(
          `https://jsonplaceholder.typicode.com/posts/${postId}`
        );
      } catch (error) {
        if (!(error instanceof AxiosError && 
          (error.response?.status === 404 || error.response?.status === 500))) {
          throw error;
        }
      }

      setPosts((prevPosts = []) => 
        Array.isArray(prevPosts) 
          ? prevPosts.filter((post) => post.id !== postId)
          : []
      );

      showNotification(
        'success',
        'Post Deleted',
        'The post has been successfully deleted (simulated)'
      );
    } catch (error) {
      handleApiError(error, 'deleting post');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Post> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: '10%',
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: '25%',
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
      width: '45%',
    },
    {
      title: "Actions",
      key: "actions",
      width: '20%',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
            disabled={loading}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Post"
            description="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              disabled={loading}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      marginTop: "140px" 
    }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "200px",
        }}
      >
        <h1>Posts</h1>
        <Button 
          type="primary" 
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
        >
          Add New Post
        </Button>
      </div>

      <Modal
        title={editingPost ? "Edit Post" : "Create New Post"}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        maskClosable={false}
      >
        <Suspense fallback={<Spin tip="Loading form..." />}>
          <PostForm
            form={form}
            editingPost={editingPost}
            onFinish={handleSubmit}
            onCancel={handleModalCancel}
            onFinishFailed={({ errorFields }) => {
              showNotification(
                'warning',
                'Validation Error',
                'Please check the form fields and try again'
              );
            }}
          />
        </Suspense>
      </Modal>

      <Table<Post>
        dataSource={posts}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PostsTable;
