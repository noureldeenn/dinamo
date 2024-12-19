import React from 'react';
import { Form, Input, Button } from 'antd';
import type { Post, PostFormData } from '../types/post';

interface PostFormProps {
  form: any;
  editingPost: Post | null;
  onFinish: (values: PostFormData) => void;
  onCancel: () => void;
  onFinishFailed: ({ errorFields }: any) => void;
}

const PostForm: React.FC<PostFormProps> = ({
  form,
  editingPost,
  onFinish,
  onCancel,
  onFinishFailed,
}) => {
  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input placeholder="Enter post title" />
      </Form.Item>

      <Form.Item
        name="body"
        label="Body"
        rules={[{ required: true, message: "Please enter post content" }]}
      >
        <Input.TextArea placeholder="Enter post content" rows={4} />
      </Form.Item>

      <Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingPost ? "Update" : "Create"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default PostForm; 