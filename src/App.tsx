import React from 'react';
import PostsTable from './components/PostsTable';
import 'antd/dist/reset.css'; // For Ant Design v5+

const App: React.FC = () => {
  return (
    <div className="App">
      <PostsTable />
    </div>
  );
};

export default App;
