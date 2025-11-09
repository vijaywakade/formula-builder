import React from 'react';
import { Layout, Typography, Divider } from 'antd';
import QueryBuilder from './components/QueryBuilder';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const handleQueryChange = (query) => {
    // You can send this to server or store it
    console.log('Query changed:', query);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '12px 24px' }}>
        <Title style={{ color: 'white', margin: 0 }} level={4}>
          React Query Builder — Demo
        </Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <QueryBuilder onQueryChange={handleQueryChange} />
      </Content>
    </Layout>
  );
}
